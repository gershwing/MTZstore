// server/config/sendEmail.js
import { sendEmail } from "./emailService.js";

const sendEmailFun = async ({ sendTo, to, subject, text, html, from }) => {
  const recipient = sendTo || to;
  if (!recipient) {
    console.warn("[sendEmailFun] Falta 'sendTo'/'to'");
    return false;
  }
  try {
    const result = await sendEmail(recipient, subject, text, html, from);
    // si tu emailService usa objeto, cambia por: await sendEmail({ to: recipient, subject, text, html, from })
    return Boolean(result?.success ?? true);
  } catch (err) {
    console.error("[sendEmailFun] Error:", err?.message || err);
    return false;
  }
};

export default sendEmailFun;
