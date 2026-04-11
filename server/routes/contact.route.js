import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import Contact from "../models/contact.model.js";
import User from "../models/user.model.js";
import { ERR } from "../utils/httpError.js";

const router = Router();

router.use(auth, withTenant({ required: true }));

/**
 * GET /api/contacts/search?q=...
 * Búsqueda unificada en Users + Contacts
 */
router.get("/search", requirePermission("product:read"), async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.status(200).json({ success: true, results: [] });

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    // Buscar en Users (mobile es Number, no se puede usar regex)
    const userQuery = [{ name: regex }, { email: regex }];
    const numericQuery = q.replace(/\D/g, "");
    if (numericQuery.length >= 3) {
      userQuery.push({ mobile: Number(numericQuery) });
    }
    const users = await User.find({ $or: userQuery })
      .select("name email mobile role")
      .limit(5)
      .lean();

    // Buscar en Contacts
    const contacts = await Contact.find({
      $or: [{ nombre: regex }, { email: regex }, { document: regex }, { phone: regex }],
    })
      .select("nombre email document phone type company")
      .limit(5)
      .lean();

    // Combinar, evitar duplicados (Contact con userId que ya salió como User)
    const userIds = new Set(users.map((u) => String(u._id)));

    const results = [
      ...users.map((u) => ({
        _id: u._id,
        source: "USER",
        nombre: u.name,
        email: u.email,
        phone: String(u.mobile || ""),
        document: "",
        badge: u.role || "CUSTOMER",
      })),
      ...contacts
        .filter((c) => !c.userId || !userIds.has(String(c.userId)))
        .map((c) => ({
          _id: c._id,
          source: "CONTACT",
          nombre: c.nombre,
          email: c.email || "",
          phone: c.phone || "",
          document: c.document || "",
          company: c.company || "",
          badge: "Cliente",
        })),
    ];

    return res.status(200).json({ success: true, results });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/contacts
 * Crear contacto nuevo
 */
router.post("/", requirePermission("product:read"), async (req, res, next) => {
  try {
    const { nombre, email, phone, document, company } = req.body;
    if (!nombre?.trim()) throw ERR.VALIDATION("Nombre es obligatorio");

    const contact = await Contact.create({
      nombre: nombre.trim(),
      email: email?.trim() || "",
      phone: phone?.trim() || "",
      document: document?.trim() || "",
      company: company?.trim() || "",
      type: company ? "BUSINESS" : "INDIVIDUAL",
    });

    return res.status(201).json({ success: true, contact });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/contacts/resolve
 * Dado un User o Contact, retorna un contactId garantizado
 */
router.post("/resolve", requirePermission("product:read"), async (req, res, next) => {
  try {
    const { id, source } = req.body;

    if (source === "CONTACT") {
      return res.status(200).json({ success: true, contactId: id });
    }

    if (source === "USER") {
      // Ver si ya tiene Contact asociado
      let contact = await Contact.findOne({ userId: id }).lean();
      if (contact) {
        return res.status(200).json({ success: true, contactId: contact._id, userId: id });
      }

      // Crear Contact desde User
      const user = await User.findById(id).select("name email mobile").lean();
      if (!user) throw ERR.VALIDATION("Usuario no encontrado");

      contact = await Contact.create({
        nombre: user.name,
        email: user.email,
        phone: String(user.mobile || ""),
        userId: id,
      });

      return res.status(200).json({ success: true, contactId: contact._id, userId: id });
    }

    throw ERR.VALIDATION("source inválido");
  } catch (e) {
    next(e);
  }
});

export default router;
