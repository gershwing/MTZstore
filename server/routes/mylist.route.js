// server/routes/myList.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import {
  addToMyListController,
  deleteToMyListController,
  getMyListController,
} from "../controllers/mylist.controller.js";

const myListRouter = Router();

/**
 * 📌 My List
 * - Multiusuario (auth) + multitienda opcional (withTenant { required:false }).
 * - Compatibilidad: mantenemos /add y añadimos POST /.
 */

// ➕ Añadir a la lista
myListRouter.post(
  "/add", // legacy
  auth,
  withTenant({ required: false }),
  addToMyListController
);
myListRouter.post(
  "/", // REST alias
  auth,
  withTenant({ required: false }),
  addToMyListController
);

// 📋 Obtener lista del usuario (acepta ?currency=USD|BOB)
myListRouter.get(
  "/",
  auth,
  withTenant({ required: false }),
  getMyListController
);

// 🗑️ Eliminar item de la lista por _id
myListRouter.delete(
  "/:id",
  auth,
  withTenant({ required: false }),
  deleteToMyListController
);

export default myListRouter;
