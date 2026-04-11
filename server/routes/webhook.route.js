// server/routes/webhook.route.js
import { Router } from "express";
import { paypalWebhookController, cryptixWebhookController } from "../controllers/webhook.controller.js";

const webhookRouter = Router();

// IMPORTANTE: estas rutas NO llevan auth; confía en la verificación de firma
webhookRouter.post("/paypal/:storeId", paypalWebhookController);
webhookRouter.post("/cryptix/:storeId", cryptixWebhookController);

export default webhookRouter;
