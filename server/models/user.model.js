// server/models/user.model.js
import mongoose from "mongoose";
import { ALL_ROLES } from "../config/roles.js";

const { Schema } = mongoose;

/* ========== Helpers de normalización ========== */
function normalizeStatus(v) {
    const x = String(v || "").trim().toLowerCase();
    if (["disabled", "deactive", "inactive"].includes(x)) return "suspended";
    if (x === "active") return "active";
    if (x === "suspended") return "suspended";
    return "active";
}

const MembershipSchema = new Schema(
    {
        storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
        role: { type: String, enum: ALL_ROLES, required: true },
        status: {
            type: String,
            enum: ["active", "suspended"],
            default: "active",
            set: normalizeStatus,
        },
        assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
        assignedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const userSchema = new Schema(
    {
        name: { type: String, required: [true, "Provide name"] },
        email: { type: String, required: [true, "Provide email"] },

        // ⬇️ password requerido solo si NO es Google
        password: {
            type: String,
            required: function () {
                return !this.signUpWithGoogle;
            },
            select: false,
        },

        avatar: { type: String, default: "" },
        avatarPublicId: { type: String, default: "" },

        mobile: { type: String, default: "" },
        birthDate: { type: Date, default: null },
        gender: {
            type: String,
            enum: ["male", "female", "other", "prefer_not_to_say", ""],
            default: "",
        },
        verify_email: { type: Boolean, default: false },
        access_token: { type: String, default: "" },
        refresh_token: { type: String, default: "" },
        last_login_date: { type: Date, default: "" },

        status: {
            type: String,
            default: "active",
            set: (v) => {
                const x = String(v || "").trim().toLowerCase();
                if (x === "disabled") return "suspended";
                return ["active", "suspended"].includes(x) ? x : "active";
            },
        },

        address_details: [{ type: Schema.Types.ObjectId, ref: "address" }],
        orderHistory: [{ type: Schema.Types.ObjectId, ref: "order" }],
        otp: { type: String },
        otpExpires: { type: Number },

        // Rol de negocio por defecto
        role: { type: String, enum: ALL_ROLES, default: "CUSTOMER" },

        // Rol de plataforma
        platformRole: { type: String, enum: ALL_ROLES, default: "CUSTOMER" },

        signUpWithGoogle: { type: Boolean, default: false },

        // 🔹 Tenant por defecto y activo (para UI/Sidebar)
        defaultStoreId: { type: Schema.Types.ObjectId, ref: "Store" },
        activeStoreId: { type: Schema.Types.ObjectId, ref: "Store" },

        // 🔹 Membresías (scoped por store)
        memberships: { type: [MembershipSchema], default: [] },
    },
    { timestamps: true }
);

/* Normalizaciones suaves */
userSchema.pre("validate", function (next) {
    // email en minúsculas
    if (typeof this.email === "string") this.email = this.email.trim().toLowerCase();

    // mapear roles legacy → nuevos (ajusta si aplica)
    if (this.role === "USER") this.role = "CUSTOMER";
    if (this.role === "ADMIN") this.role = "SUPER_ADMIN";

    // Asegura platformRole consistente
    if (!this.platformRole && this.role) this.platformRole = this.role;
    if (!this.role && this.platformRole) this.role = this.platformRole;

    // Normaliza estados en memberships
    if (Array.isArray(this.memberships)) {
        this.memberships = this.memberships.map((m) => ({
            ...m,
            status: normalizeStatus(m?.status),
        }));
    }

    // ---- Autocompletar defaultStoreId / activeStoreId ----
    const hasObjectId = (v) => !!(v && mongoose.Types.ObjectId.isValid(v));

    // Si falta defaultStoreId, intenta desde memberships (prioriza STORE_OWNER active)
    if (!hasObjectId(this.defaultStoreId) && Array.isArray(this.memberships) && this.memberships.length) {
        const byOwnerActive = this.memberships.find(
            (m) => String(m?.status) === "active" && String(m?.role || "").toUpperCase() === "STORE_OWNER"
        );
        const byAnyActive = this.memberships.find((m) => String(m?.status) === "active");

        this.defaultStoreId =
            (byOwnerActive && byOwnerActive.storeId) ||
            (byAnyActive && byAnyActive.storeId) ||
            this.defaultStoreId;
    }

    // Si falta activeStoreId pero existe defaultStoreId, úsalo
    if (!hasObjectId(this.activeStoreId) && hasObjectId(this.defaultStoreId)) {
        this.activeStoreId = this.defaultStoreId;
    }

    next();
});

/* ===== Índices ===== */
// Único por email
userSchema.index({ email: 1 }, { unique: true, name: "uniq_user_email" });

// Para búsquedas por tienda en memberships
userSchema.index({ "memberships.storeId": 1, _id: 1 }, { name: "idx_user_membership_store" });

// 🔹 Búsquedas rápidas por tenant activo / por defecto
userSchema.index({ activeStoreId: 1 }, { name: "idx_user_active_store" });
userSchema.index({ defaultStoreId: 1 }, { name: "idx_user_default_store" });

// 🔹 (OPCIONAL) Compuesto name+email (ayuda en algunos planes y queries no-regex)
userSchema.index({ name: 1, email: 1 }, { name: "idx_user_name_email" });

// 🔹 Filtros frecuentes y orden por fecha (mejora listados y count)
userSchema.index({ status: 1, platformRole: 1, role: 1, createdAt: -1 }, { name: "idx_user_filters_sort" });

// 🔹 Búsqueda por móvil si lo usas en q
userSchema.index({ mobile: 1 }, { name: "idx_user_mobile" });

// 🔹 (OPCIONAL) Índice de texto para futuras búsquedas con $text
// userSchema.index(
//   { name: "text", email: "text"/*, mobile: "text"*/ },
//   { name: "text_user_name_email", weights: { name: 3, email: 2 } }
// );

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export default UserModel;
export { UserModel as User };
