// server/controllers/user.controller.js
import UserModel from '../models/user.model.js';
import mongoose from "mongoose";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmailFun from '../config/sendEmail.js';
import VerificationEmail from '../utils/verifyEmailTemplate.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import generatedRefreshToken from '../utils/generatedRefreshToken.js';
import { ERR } from '../utils/httpError.js';


import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ReviewModel from '../models/reviews.model.js';
import ProductModel from '../models/product.model.js';
import buildPublicUser from '../utils/buildPublicUser.js';
import { buildSessionCookie, cookieConfig, cookiesOption, buildCookieClearOptions } from '../config/cookies.js';
import { pickStatus } from '../utils/status.js';
import { makeSessionValue } from "../utils/session.js";


cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

function getCookieClearOpts(req) {
    // Usa EXACTAMENTE los mismos valores que al setear
    const sameSite = process.env.COOKIE_SAMESITE || "lax"; // "lax" | "none" | "strict"
    const secure = process.env.NODE_ENV === "production" || sameSite === "none";
    const domain = process.env.COOKIE_DOMAIN || undefined;
    const path = process.env.COOKIE_PATH || "/";

    return {
        httpOnly: true,
        secure,
        sameSite,        // si usas "none", recuerda HTTPS
        domain,          // define si lo usaste al setear
        path,            // mismo path
        expires: new Date(0), // vencida
    };
}

/** ========== Registro con OTP ========== */
export async function registerUserController(req, res, next) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            throw ERR.VALIDATION('provide email, name, password');
        }

        const normEmail = String(email).trim().toLowerCase();
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail);
        if (!isEmailValid) throw ERR.VALIDATION('Invalid email format');
        if (String(password).length < 8) throw ERR.VALIDATION('Password must be at least 8 characters');

        const exists = await UserModel.findOne({ email: normEmail }).select("+password +verify_email");

        const hashPassword = await bcryptjs.hash(password, 10);
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        let user;

        if (exists && exists.verify_email === true && exists.signUpWithGoogle === true) {
            // Cuenta Google-only: permitir agregar contraseña local (requiere OTP)
            exists.password = hashPassword;
            exists.otp = verifyCode;
            exists.otpExpires = Date.now() + 600_000;
            exists.verify_email = false; // requiere re-verificar para confirmar que es el dueño
            await exists.save();
            user = exists;
        } else if (exists && exists.verify_email === true) {
            throw ERR.VALIDATION('User already registered with this email');
        } else if (exists && !exists.verify_email) {
            // Usuario existe pero no verificó — regenerar OTP y reenviar
            exists.password = hashPassword;
            exists.name = String(name).trim();
            exists.otp = verifyCode;
            exists.otpExpires = Date.now() + 600_000;
            await exists.save();
            user = exists;
        } else {
            // Nuevo usuario
            user = await UserModel.create({
                email: normEmail,
                password: hashPassword,
                name: String(name).trim(),
                otp: verifyCode,
                otpExpires: Date.now() + 600_000,
                verify_email: false,
                signUpWithGoogle: false,
                status: 'active',
            });
        }

        // Fire-and-forget: no bloquear la respuesta esperando el SMTP
        sendEmailFun({
            sendTo: normEmail,
            subject: 'Verify email from Ecommerce App',
            text: '',
            html: VerificationEmail(user.name, verifyCode),
        }).catch(err => console.error('OTP email failed:', err));

        const token = jwt.sign(
            { id: user._id.toString(), email: user.email },
            process.env.JSON_WEB_TOKEN_SECRET_KEY,
            { expiresIn: '15m' }
        );

        return res.created({
            message: 'User registered successfully! Check your email for the OTP.',
            token,
        });
    } catch (error) {
        return next(error);
    }
}

/** ========== Verificación de email por OTP ========== */
export async function verifyEmailController(req, res, next) {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) throw ERR.VALIDATION("Provide email and otp");

        const normEmail = String(email).trim().toLowerCase();
        const user = await UserModel
            .findOne({ email: normEmail })
            .select("+password +otp +otpExpires +verify_email +status");

        if (!user) throw ERR.NOT_FOUND("User not found");

        // valida OTP
        const isCodeValid = String(user.otp || "") === String(otp);

        // soporta otpExpires como Number (ms) o Date
        const exp = user.otpExpires;
        const expMs =
            typeof exp === "number" ? exp :
                exp instanceof Date ? exp.getTime() :
                    0;
        const isNotExpired = expMs > Date.now();

        if (!isCodeValid) throw ERR.VALIDATION("Invalid OTP");
        if (!isNotExpired) throw ERR.VALIDATION("OTP expired");

        // marca verificación
        user.verify_email = true;
        user.otp = null;
        user.otpExpires = null;
        user.verifiedAt = new Date();

        // normaliza estado a activo si fuera necesario (para que login no bloquee)
        if (String(user.status || "").toLowerCase() !== "active") {
            user.status = "active";
        }

        await user.save();

        // ✅ (UX) crea sesión inmediatamente tras verificar
        //   - no invalida otras sesiones
        const accessToken = await generatedAccessToken(user._id || user.id);
        const refreshToken = await generatedRefreshToken(user._id || user.id);

        // 🍪 httpOnly refresh_token, alineado con /api/user/refresh
        const isProd = process.env.NODE_ENV === "production";
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: isProd,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
            path: "/api/user",
        });

        // perfil público + (opcional) cookie de sesión "sid"
        const me = await buildPublicUser(user._id || user.id);
        try {
            if (cookieConfig?.name && buildSessionCookie && makeSessionValue) {
                const sessionValue = makeSessionValue(user, { name: me?.name });
                res.cookie(cookieConfig.name /* "sid" */, sessionValue, buildSessionCookie(req));
            }
        } catch { }

        return res.ok?.({
            message: "Email verified successfully",
            ok: true,
            accessToken,
            refreshToken,
            user: me,
        }) || res.status(200).json({
            message: "Email verified successfully",
            ok: true,
            accessToken,
            refreshToken,
            user: me,
        });

    } catch (error) {
        return next(error);
    }
}

/** ========== Login / Signup con Google ========== */
export async function authWithGoogle(req, res, next) {
    try {
        const { name, email, avatar, mobile } = req.body;
        const normEmail = String(email || "").trim().toLowerCase();
        if (!normEmail) throw ERR.VALIDATION("Email is required");

        let user = await UserModel.findOne({ email: normEmail });

        if (!user) {
            user = await UserModel.create({
                name: String(name || "").trim(),
                mobile: mobile || "",
                email: normEmail,
                // si tu schema exige password, puedes dejar un flag reconocible
                password: "null",
                avatar: avatar || "",
                verify_email: true,
                signUpWithGoogle: true,
                status: "active", // opcional: asegura estado inicial activo si aplica a tu negocio
            });
        } else {
            // valida estado (no permitas login si está suspendido)
            if (String(user.status).toLowerCase() !== "active") {
                throw ERR.FORBIDDEN("Account is suspended");
            }
            // asegura flags y actualiza avatar si faltaba
            let touched = false;
            if (user.verify_email !== true) { user.verify_email = true; touched = true; }
            if (user.signUpWithGoogle !== true) { user.signUpWithGoogle = true; touched = true; }
            if (avatar && !user.avatar) { user.avatar = avatar; touched = true; }
            if (touched) await user.save();
        }

        // 🔐 Tokens (NO invalidamos otras sesiones)
        const accessToken = await generatedAccessToken(user._id || user.id);
        const refreshToken = await generatedRefreshToken(user._id || user.id);

        // marca último login; evita guardar refresh global en el user
        await UserModel.findByIdAndUpdate(
            user._id,
            { last_login_date: new Date() },
            { new: false }
        );

        // 🍪 SOLO refresh en cookie httpOnly (alineado con /api/user/refresh)
        const isProd = process.env.NODE_ENV === "production";
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: isProd,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
            path: "/api/user",
        });

        // Perfil público
        const me = await buildPublicUser(user._id || user.id);

        // (opcional) cookie de sesión "sid" para UI
        try {
            if (cookieConfig?.name && buildSessionCookie && makeSessionValue) {
                const sessionValue = makeSessionValue(user, { name: me?.name });
                res.cookie(cookieConfig.name /* "sid" */, sessionValue, buildSessionCookie(req));
            }
        } catch { }

        // ➕ Devolver tokens en el body (el front toma access para Authorization)
        return res.ok?.({
            message: "Login successfully",
            ok: true,
            accessToken,
            refreshToken, // el front puede guardarlo en LS si usa fallback /user/refresh-token
            user: me,
        }) || res.status(200).json({
            message: "Login successfully",
            ok: true,
            accessToken,
            refreshToken,
            user: me,
        });

    } catch (error) {
        return next(error);
    }
}

/** ========== Login con contraseña ========== */
export async function loginUserController(req, res, next) {
    try {
        const email = String(req.body?.email || "").trim().toLowerCase();
        const password = String(req.body?.password || "");

        if (!email || !password) throw ERR.VALIDATION("provide email and password");

        // incluye password si en el schema está select:false
        const user = await UserModel
            .findOne({ email })
            .select("+password +status +verify_email +signUpWithGoogle");

        if (!user) throw ERR.UNAUTHORIZED("Invalid credentials");

        // estado de la cuenta
        if (String(user.status).toLowerCase() !== "active") {
            throw ERR.FORBIDDEN("Account is suspended");
        }

        // verificación de email
        if (user.verify_email !== true) {
            throw ERR.VALIDATION("Your email is not verified yet. Please verify your email first.");
        }

        // cuenta creada con Google y sin password local
        if (user.signUpWithGoogle === true && !user.password) {
            throw ERR.VALIDATION("This account was created with Google. Please sign in with Google or set a password.");
        }

        // password check
        const ok = await bcryptjs.compare(password, user.password || "");
        if (!ok) throw ERR.UNAUTHORIZED("Invalid credentials");

        // 🔐 tokens (NO invalidamos sesiones previas)
        const accessToken = await generatedAccessToken(user._id || user.id);
        const refreshToken = await generatedRefreshToken(user._id || user.id);

        // último login (no sobreescribas refresh global en el user)
        await UserModel.findByIdAndUpdate(
            user._id,
            { last_login_date: new Date() },
            { new: false }
        );

        // 🍪 cookie httpOnly SOLO para refresh (compatible con /api/user/refresh)
        const isProd = process.env.NODE_ENV === "production";
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: isProd,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
            path: "/api/user",
        });

        // perfil público para respuesta
        const me = await buildPublicUser(user._id || user.id);

        // (opcional) cookie de sesión "sid" si tu UI la usa
        try {
            if (cookieConfig?.name && buildSessionCookie && makeSessionValue) {
                const sessionValue = makeSessionValue(user, { name: me?.name });
                res.cookie(cookieConfig.name /* p.ej. "sid" */, sessionValue, buildSessionCookie(req));
            }
        } catch { }

        // ➕ devolvemos tokens también en el body
        return res.ok?.({
            message: "Login successfully",
            ok: true,
            accessToken,
            refreshToken,
            user: me,
        }) || res.status(200).json({
            message: "Login successfully",
            ok: true,
            accessToken,
            refreshToken,
            user: me,
        });

    } catch (error) {
        return next(error);
    }
}


export async function meController(req, res) {
    const user = await buildPublicUser(req.user._id); // como ya tienes
    // evita que Express agregue ETag
    res.set('Cache-Control', 'no-store');
    res.removeHeader('ETag');
    return res.status(200).json({ user });
}

// logout controller
export async function logoutController(req, res, next) {
    try {
        // Puede no venir si el access expiró:
        const userId = req.userId || req.user?._id || null;

        // 1) Detectar el refresh a revocar (cookie/body/Authorization)
        const incomingRefresh =
            req.cookies?.refresh_token ||                         // cookie nueva
            req.body?.refreshToken ||
            String(req.get("authorization") || "").replace(/^Bearer\s+/i, "") ||
            null;

        // 2) clearCookie con misma política; fuerza path del refresh
        const baseClear = { ...(buildCookieClearOptions?.(req) || {}) };

        // cookies antiguas (por compat — no hace daño si no existen)
        try { res.clearCookie("accessToken", baseClear); } catch { }
        try { res.clearCookie("refreshToken", baseClear); } catch { }

        // cookie de sesión (sid u otro nombre)
        try { res.clearCookie(cookieConfig.name, baseClear); } catch { }
        if (process.env.SESSION_COOKIE_NAME && process.env.SESSION_COOKIE_NAME !== cookieConfig.name) {
            try { res.clearCookie(process.env.SESSION_COOKIE_NAME, baseClear); } catch { }
        }

        // cookie NUEVA de refresh (clave: path=/api/user)
        try {
            const isProd = process.env.NODE_ENV === "production";
            res.clearCookie("refresh_token", {
                ...baseClear,
                httpOnly: true,
                sameSite: "lax",
                secure: isProd,
                path: "/api/user",
            });
        } catch { }

        // 3) Revocar SOLO ese refresh en tu store (si lo tienes)
        try {
            if (incomingRefresh && typeof Tokens?.deleteOne === "function") {
                await Tokens.deleteOne({ refreshToken: incomingRefresh });
            } else if (incomingRefresh && typeof Token?.revokeOne === "function") {
                await Token.revokeOne(incomingRefresh);
            }
        } catch { }

        // (ya no hacemos $unset del refresh en el user; no lo almacenamos globalmente)

        // 4) Señal opcional; si te parece muy agresivo, quítalo:
        res.set("Clear-Site-Data", '"cookies","storage"');

        // 5) Respuesta idempotente
        return typeof res.ok === "function"
            ? res.ok({ message: "Logout successfully" })
            : res.status(200).json({ ok: true });
    } catch (error) {
        return next(error);
    }
}

export async function refreshController(req, res, next) {
    try {
        // 👇 la cookie que seteaste en login es "refresh_token"
        const refresh = req.cookies?.refresh_token;
        if (!refresh) return res.status(401).json({ error: "missing_refresh" });

        // valida refresh (ajusta tu secreto/claims)
        const refreshSecret = process.env.SECRET_KEY_REFRESH_TOKEN || process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
        const payload = jwt.verify(refresh, refreshSecret);
        const userId = payload?.sub || payload?.id || payload?._id;

        const user = await UserModel.findById(userId).lean();
        if (!user) return res.status(401).json({ error: "invalid_user" });

        const accessToken = await generatedAccessToken(userId);
        const refreshToken = await generatedRefreshToken(userId);

        // (opcional) volver a setear cookie de refresh; lo importante es devolver en body
        // Usa misma clave y path que en login para consistencia:
        res.cookie("refresh_token", refreshToken, {
            ...cookiesOption,           // ← ya lo importas de config/cookies.js
            httpOnly: true,
            sameSite: "lax",
            path: process.env.COOKIE_PATH || "/api/user",
        });

        return res.status(200).json({ ok: true, accessToken, refreshToken });
    } catch (e) {
        const clearOpts = buildCookieClearOptions(req);
        // limpia ambas variantes por compatibilidad
        try { res.clearCookie("accessToken", clearOpts); } catch { }
        try { res.clearCookie("refreshToken", clearOpts); } catch { }
        try { res.clearCookie("refresh_token", { ...clearOpts, path: "/api/user" }); } catch { }
        return res.status(401).json({ error: "refresh_failed" });
    }
}

// image upload (avatar)
export async function userAvatarController(req, res, next) {
    try {
        const userId = req.userId;
        const files = req.files;

        const user = await UserModel.findById(userId);
        if (!user) throw ERR.NOT_FOUND('User not found');

        // 1) Borrar avatar anterior si existía
        if (user.avatar || user.avatarPublicId) {
            try {
                if (user.avatarPublicId) {
                    await cloudinary.uploader.destroy(user.avatarPublicId);
                } else if (user.avatar) {
                    const urlArr = user.avatar.split('/');
                    const imageName = urlArr[urlArr.length - 1]?.split('.')[0];
                    if (imageName) await cloudinary.uploader.destroy(imageName);
                }
            } catch (e) {
                console.warn('Cloudinary delete error:', e.message);
            }
        }

        // 2) Subir nuevas imágenes
        const options = { use_filename: true, unique_filename: false, overwrite: false };

        const uploaded = [];
        for (const file of files || []) {
            const result = await cloudinary.uploader.upload(file.path, options);
            uploaded.push({ url: result.secure_url, public_id: result.public_id });

            try {
                fs.unlinkSync(file.path);
            } catch (e) {
                console.warn('Temp file cleanup error:', e.message);
            }
        }

        if (uploaded.length === 0) throw ERR.VALIDATION('No images uploaded');

        // 3) Guardar nuevo avatar
        user.avatar = uploaded[0].url;
        user.avatarPublicId = uploaded[0].public_id || '';
        await user.save();

        return res.ok({ _id: userId, avatar: user.avatar });
    } catch (error) {
        return next(error);
    }
}

// remove image in Cloudinary (by publicId or URL)
export async function removeImageFromCloudinary(req, res, next) {
    try {
        const { img: imgUrl, publicId } = req.query;

        let targetId = null;
        if (publicId && typeof publicId === 'string') {
            targetId = publicId;
        } else if (imgUrl && typeof imgUrl === 'string') {
            const urlArr = imgUrl.split('/');
            const lastPart = urlArr[urlArr.length - 1] || '';
            targetId = lastPart.split('.').slice(0, -1).join('.');
        }

        if (!targetId) throw ERR.VALIDATION('publicId or valid image URL is required');

        const result = await cloudinary.uploader.destroy(targetId);

        if (result?.result === 'ok') {
            return res.ok({ message: 'Image removed successfully', result });
        } else {
            // mantenemos semántica de "no encontrado"
            return next(ERR.NOT_FOUND('Image not found or already deleted'));
        }
    } catch (error) {
        return next(error);
    }
}

// update user details
export async function updateUserDetails(req, res, next) {
    try {
        const userId = req.userId;
        const { name, email, mobile } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) throw ERR.VALIDATION('The user cannot be Updated!');

        // 1) Construir $set solo con campos válidos
        const $set = {};
        if (typeof name === 'string' && name.trim()) $set.name = name.trim();
        if (typeof mobile === 'string') $set.mobile = mobile.trim();

        // 2) Cambio de email (opcional, con verificación)
        if (typeof email === 'string' && email.trim()) {
            const normEmail = email.trim().toLowerCase();

            if (normEmail !== user.email) {
                const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail);
                if (!isEmailValid) throw ERR.VALIDATION('Invalid email format');

                const emailTaken = await UserModel.findOne({ _id: { $ne: userId }, email: normEmail });
                if (emailTaken) {
                    // mantenemos 409 explícito para no romper semántica anterior
                    return res.err(409, 'CONFLICT', 'Email already in use');
                }

                $set.email = normEmail;
                $set.verify_email = false;

                const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
                $set.otp = verifyCode;
                $set.otpExpires = Date.now() + 600_000; // 10 min

                try {
                    await sendEmailFun({
                        sendTo: normEmail,
                        subject: 'Verify your new email',
                        text: '',
                        html: VerificationEmail($set.name ?? user.name, verifyCode),
                    });
                } catch (e) {
                    console.warn('Email verify send error:', e.message);
                }
            }
        }

        if (Object.keys($set).length === 0) {
            // nada que actualizar
            return res.ok({
                message: 'No changes detected',
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    avatar: user.avatar,
                    verify_email: user.verify_email,
                },
            });
        }

        const updated = await UserModel.findByIdAndUpdate(
            userId,
            { $set },
            { new: true, projection: '-password -refresh_token' }
        );

        return res.ok({
            message:
                $set.email && $set.email !== user.email
                    ? 'User updated. Please verify your new email.'
                    : 'User Updated successfully',
            user: {
                _id: updated?._id,
                name: updated?.name,
                email: updated?.email,
                mobile: updated?.mobile,
                avatar: updated?.avatar,
                verify_email: updated?.verify_email,
            },
        });
    } catch (error) {
        return next(error);
    }
}

// ========== Forgot password (envío de OTP) ==========
export async function forgotPasswordController(req, res, next) {
    try {
        const { email } = req.body;
        if (!email) throw ERR.VALIDATION('Email is required');

        const normEmail = String(email).trim().toLowerCase();
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail);
        if (!isEmailValid) throw ERR.VALIDATION('Invalid email format');

        const user = await UserModel.findOne({ email: normEmail });
        if (!user) throw ERR.VALIDATION('Email not available');

        // Anti-spam: cooldown (60s) usando otpExpires - TTL (10min)
        const OTP_TTL_MS = 600_000;       // 10 minutos
        const RESEND_COOLDOWN_MS = 60_000; // 60 segundos
        const lastSentAt = user.otp && user.otpExpires ? (user.otpExpires - OTP_TTL_MS) : 0;
        if (lastSentAt && Date.now() - lastSentAt < RESEND_COOLDOWN_MS) {
            const waitMs = RESEND_COOLDOWN_MS - (Date.now() - lastSentAt);
            return res.err(429, 'TOO_MANY_REQUESTS', `Please wait ${Math.ceil(waitMs / 1000)}s before requesting another code`);
        }

        // Generar y persistir OTP
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = verifyCode;
        user.otpExpires = Date.now() + OTP_TTL_MS;
        await user.save();

        // Enviar email
        await sendEmailFun({
            sendTo: normEmail,
            subject: 'Código para cambiar contraseña - MTZstore',
            text: '',
            html: VerificationEmail(user.name, verifyCode, "password"),
        });

        return res.ok({ message: 'Check your email' });
    } catch (error) {
        return next(error);
    }
}

// ========== Verificar OTP de forgot password ==========
export async function verifyForgotPasswordOtp(req, res, next) {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) throw ERR.VALIDATION('Provide required field email, otp.');

        const normEmail = String(email).trim().toLowerCase();
        const user = await UserModel.findOne({ email: normEmail });
        if (!user) throw ERR.VALIDATION('Email not available');

        const isCodeValid = String(user.otp || '') === String(otp);
        if (!isCodeValid) throw ERR.VALIDATION('Invalid OTP');

        const now = Date.now();
        const notExpired = typeof user.otpExpires === 'number' && user.otpExpires > now;
        if (!notExpired) throw ERR.VALIDATION('Otp is expired');

        // Limpiar OTP
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        return res.ok({ message: 'Verify OTP successfully' });
    } catch (error) {
        return next(error);
    }
}

// server/controllers/user.controller.js
export async function setDefaultStoreId(req, res, next) {
    try {
        const userId = req.user?._id || req.userId;
        const { storeId } = req.body || {};

        if (!userId) return res.status(401).json({ error: true, message: "No autenticado" });
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(422).json({ error: true, message: "storeId inválido" });
        }

        // ownerId (con fallback a owner por compat)
        const store = await StoreModel.findById(storeId).select("_id ownerId owner").lean();
        if (!store) return res.status(404).json({ error: true, message: "Tienda no encontrada" });

        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ error: true, message: "Usuario no encontrado" });

        const isMember = (user.memberships || []).some(
            m => String(m.storeId) === String(storeId) && String(m.status).toLowerCase() === "active"
        );

        const isOwner =
            String(store.ownerId || "") === String(userId) ||
            String(store.owner || "") === String(userId); // compat legacy

        if (!isOwner && !isMember) {
            return res.status(403).json({ error: true, message: "No autorizado" });
        }

        user.defaultStoreId = storeId;
        if (!user.activeStoreId) user.activeStoreId = storeId;
        await user.save();

        const me = await buildPublicUser(user._id);
        return res.json({ ok: true, user: me });
    } catch (e) {
        return next(e);
    }
}

// ========== Reset password (con oldPassword si no es cuenta Google) ==========
export async function resetpassword(req, res, next) {
    try {
        const { email, oldPassword, newPassword, confirmPassword } = req.body;

        if (!email || !newPassword || !confirmPassword) {
            throw ERR.VALIDATION('provide required fields email, newPassword, confirmPassword');
        }

        const normEmail = String(email).trim().toLowerCase();
        const user = await UserModel.findOne({ email: normEmail }).select("+password +signUpWithGoogle");
        if (!user) throw ERR.VALIDATION('Email is not available');

        if (String(newPassword).length < 8) throw ERR.VALIDATION('Password must be at least 8 characters');
        if (newPassword !== confirmPassword) throw ERR.VALIDATION('newPassword and confirmPassword must be same.');

        // Si NO es cuenta Google, exigir oldPassword válido
        if (user?.signUpWithGoogle === false) {
            if (!oldPassword) throw ERR.VALIDATION('oldPassword is required');
            const ok = await bcryptjs.compare(String(oldPassword), user.password);
            if (!ok) throw ERR.VALIDATION('your old password is wrong');
        }

        // Hashear y guardar
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(String(confirmPassword), salt);

        user.password = hashPassword;
        user.signUpWithGoogle = false; // ya tiene pass local
        user.refresh_token = '';       // revocar sesiones activas
        await user.save();

        return res.ok({ message: 'Password updated successfully.' });
    } catch (error) {
        return next(error);
    }
}

// ========== Change password (evita reutilización) ==========
export async function changePasswordController(req, res, next) {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        if (!email || !newPassword || !confirmPassword) {
            throw ERR.VALIDATION('provide required fields email, newPassword, confirmPassword');
        }

        const normEmail = String(email).trim().toLowerCase();
        const user = await UserModel.findOne({ email: normEmail }).select('+password');
        if (!user) throw ERR.VALIDATION('Email is not available');

        if (String(newPassword).length < 8) throw ERR.VALIDATION('Password must be at least 8 characters');
        if (newPassword !== confirmPassword) throw ERR.VALIDATION('newPassword and confirmPassword must be same.');

        // evitar reutilizar la misma contraseña
        if (user.password && user.password !== 'null') {
            const same = await bcryptjs.compare(String(newPassword), user.password);
            if (same) throw ERR.VALIDATION('New password must be different from the current password');
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(String(confirmPassword), salt);

        user.password = hashPassword;
        user.signUpWithGoogle = false; // ya tiene pass local
        user.refresh_token = '';       // revocar sesiones
        await user.save();

        return res.ok({ message: 'Password updated successfully.' });
    } catch (error) {
        return next(error);
    }
}

export async function setActiveStoreId(req, res, next) {
    try {
        const userId = req.user?._id || req.userId;
        const { storeId } = req.body || {};
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(422).json({ error: true, message: "storeId inválido" });
        }
        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ error: true, message: "Usuario no encontrado" });
        const isMember = user?.memberships?.some(m => String(m.storeId) === String(storeId) && m.status === "active");
        if (!isMember) return res.status(403).json({ error: true, message: "No autorizado" });

        user.activeStoreId = storeId;
        await user.save();

        const me = await buildPublicUser(user._id);
        return res.json({ ok: true, user: me });
    } catch (e) { next(e); }
}

// ========== Refresh token ==========
export async function refreshToken(req, res, next) {
    try {
        // 1) tomar el refresh token de cookie o Authorization: Bearer
        const headerToken = req?.headers?.authorization?.split(' ')[1];
        const token = req.cookies?.refreshToken || req.cookies?.refresh_token || headerToken;

        if (!token) {
            return res.err(401, 'UNAUTHORIZED', 'Invalid token');
        }

        // 2) verificar firma/exp
        let payload;
        try {
            const refreshSecret = process.env.SECRET_KEY_REFRESH_TOKEN || process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
            payload = jwt.verify(token, refreshSecret);
        } catch {
            return res.err(401, 'UNAUTHORIZED', 'token is expired');
        }

        // 3) tolerante a distintos nombres de claim
        const userId = payload?.id || payload?._id || payload?.userId;
        if (!userId) {
            return res.err(401, 'UNAUTHORIZED', 'Invalid token payload');
        }

        // 4) validar contra DB si guardas refresh_token
        const user = await UserModel.findById(userId).select('refresh_token');
        if (!user) return res.err(401, 'UNAUTHORIZED', 'User not found');
        if (user.refresh_token && user.refresh_token !== token) {
            return res.err(401, 'UNAUTHORIZED', 'Refresh token revoked');
        }

        // 5) emitir nuevo access token
        const newAccessToken = await generatedAccessToken(userId);

        // 6) setear cookie del access token con cookiesOption centralizado
        res.cookie('accessToken', newAccessToken, cookiesOption);

        return res.ok({
            message: 'Nuevo token de acceso generado',
            accessToken: newAccessToken,
        });
    } catch (error) {
        return next(error);
    }
}

export async function me(req, res) {
    try {
        const userId = req.userId || req.user?._id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });


        const payload = await buildPublicUser(userId);
        if (!payload) return res.status(401).json({ message: "Unauthorized" });

        return res.json({ data: payload });
    } catch (e) {
        return res.status(500).json({ message: "Internal error", error: String(e?.message || e) });
    }
}

// ========== Detalles del usuario logueado ==========
export async function userDetails(req, res, next) {
    try {
        const userId = req.userId;

        const user = await UserModel
            .findById(userId)
            .select('-password -refresh_token')
            .populate('address_details');

        if (!user) throw ERR.NOT_FOUND('User not found');

        // membership activa por tienda (si hay tenant)
        const storeId = req?.tenant?.storeId || null;
        const activeMembership = storeId
            ? (user.memberships || []).find(m => String(m.storeId) === String(storeId))
            : null;

        return res.ok({
            message: 'user details',
            data: { user: user.toObject(), activeMembership },
        });
    } catch (error) {
        return next(error);
    }
}

// ========== Agregar review ==========
export async function addReview(req, res, next) {
    try {
        const authUserId = req.userId;                // auth middleware
        const storeId = req?.tenant?.storeId || null; // withTenant()
        const { image, userName, review, rating, productId } = req.body;

        if (!productId) throw ERR.VALIDATION('productId is required');

        const numRating = Number(rating);
        if (!Number.isFinite(numRating) || numRating < 1 || numRating > 5) {
            throw ERR.VALIDATION('rating must be a number between 1 and 5');
        }
        if (!authUserId) throw ERR.UNAUTHORIZED('Unauthorized');

        // Validar producto y pertenencia a la tienda activa si aplica
        const product = await ProductModel.findById(productId).select('storeId');
        if (!product) throw ERR.NOT_FOUND('Product not found');
        if (storeId && String(product.storeId) !== String(storeId)) {
            throw ERR.FORBIDDEN('You cannot review a product from another store');
        }

        // Evitar duplicados: un review por usuario y producto (y tienda si aplica)
        const exists = await ReviewModel.findOne({
            userId: authUserId,
            productId,
            ...(storeId ? { storeId } : {}),
        });
        if (exists) return res.err(409, 'CONFLICT', 'You have already reviewed this product');

        // Obtener nombre del usuario si no viene
        let finalUserName = userName;
        if (!finalUserName) {
            const user = await UserModel.findById(authUserId).select('name');
            finalUserName = user?.name || 'Anonymous';
        }

        const reviewDoc = await ReviewModel.create({
            image: image || '',
            userName: finalUserName,
            review: String(review || '').trim(),
            rating: numRating,
            userId: authUserId,
            productId,
            ...(storeId ? { storeId } : {}),
        });

        return res.created({
            message: 'Review added successfully',
            review: reviewDoc,
        });
    } catch (error) {
        return next(error);
    }
}

// ========== Obtener reviews ==========
export async function getReviews(req, res, next) {
    try {
        const productId = req.query.productId;
        const storeId = req?.tenant?.storeId || null;

        if (!productId) throw ERR.VALIDATION('productId is required');

        const filter = { productId };
        if (storeId) filter.storeId = storeId;

        const reviews = await ReviewModel.find(filter).lean();

        return res.ok({ reviews });
    } catch (error) {
        return next(error);
    }
}

// ========== get all reviews ==========
export async function getAllReviews(req, res, next) {
    try {
        // paginación
        const page = Math.max(1, parseInt(req.query.page ?? '1', 10));
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? '20', 10)));
        const skip = (page - 1) * limit;

        // filtros
        const { productId, q, minRating, maxRating } = req.query;
        const storeId = req?.tenant?.storeId || null;

        const filter = {};
        if (storeId) filter.storeId = storeId;
        if (productId) filter.productId = productId;

        // rango de rating
        const minR = Number.isFinite(Number(minRating)) ? Number(minRating) : undefined;
        const maxR = Number.isFinite(Number(maxRating)) ? Number(maxRating) : undefined;
        if (minR !== undefined || maxR !== undefined) {
            filter.rating = {};
            if (minR !== undefined) filter.rating.$gte = minR;
            if (maxR !== undefined) filter.rating.$lte = maxR;
        }

        // búsqueda simple
        if (q && typeof q === 'string') {
            filter.$or = [
                { userName: { $regex: q, $options: 'i' } },
                { review: { $regex: q, $options: 'i' } },
            ];
        }

        // orden
        const sortKey = (req.query.sort || '-createdAt').toString();
        const allowedSort = new Set(['createdAt', '-createdAt', 'rating', '-rating']);
        const sort = allowedSort.has(sortKey) ? sortKey : '-createdAt';

        const projection = '';

        const [reviews, total] = await Promise.all([
            ReviewModel.find(filter).sort(sort).skip(skip).limit(limit).select(projection).lean(),
            ReviewModel.countDocuments(filter),
        ]);

        return res.ok({
            reviews,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
        });
    } catch (error) {
        return next(error);
    }
}

/** ========== GET /api/admin/users  (listar usuarios)
 * - SUPER_ADMIN: puede consultar sin scope de tienda (sin X-Store-Id)
 * - Con storeId (tenant): filtra por membresía en esa tienda
 * - role/status/q/sort/paginación soportados
 * - status tolerante a "Active"/"ACTIVE"/"disabled" via pickStatus + regex
 ========== */
// server/controllers/user.controller.js
export async function getAllUsers(req, res, next) {
    try {
        // --- Scope y rol ---
        const storeId =
            req.tenantId ||
            (req.tenant && req.tenant.storeId) ||
            null;

        const isPlatformSuper =
            req.isPlatformSuperAdmin === true ||
            req.user?.isPlatformSuperAdmin === true;

        const requesterRole =
            req.userRole || req.user?.role || req.auth?.role;

        const isSuper =
            isPlatformSuper || requesterRole === "SUPER_ADMIN";

        // Solo SUPER_ADMIN puede consultar sin scope de tienda
        if (!storeId && !isSuper) {
            return res.err(
                403,
                "FORBIDDEN",
                "Forbidden: only SUPER_ADMIN can query users without a store scope"
            );
        }

        // --- Paginación ---
        const page = Math.max(1, Number.parseInt(req.query.page ?? "1", 10) || 1);
        const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit ?? "20", 10) || 20));
        const skip = (page - 1) * limit;

        // --- Filtros ---
        const { q = "", role = "", status: rawStatus } = req.query;

        // normaliza status: "disabled" -> "suspended"; sólo "active" | "suspended" válidos
        const normStatus = pickStatus(rawStatus);

        const filter = {};

        /**
         * 🔒 Reglas de alcance:
         * - SUPER_ADMIN => sin filtro por tienda (global).
         * - No SUPER + hay storeId => limitar por membresía ACTIVA en esa tienda.
         *   (y si además viene `role`, filtrar ese rol dentro de la tienda).
         */
        if (!isSuper && storeId) {
            // No SUPER => forzamos membresía activa en la tienda
            if (role) {
                filter.memberships = { $elemMatch: { storeId, role, status: "active" } };
            } else {
                filter.memberships = { $elemMatch: { storeId, status: "active" } };
            }
        } else if (storeId && isSuper) {
            // SUPER con storeId presente: por consistencia del requerimiento, dejamos GLOBAL (sin limitar por tienda)
            // Si prefieres limitar cuando se pase storeId explícito, cambia por:
            //   filter["memberships.storeId"] = storeId;
            //   y opcionalmente filter["memberships.status"] = "active";
        } else if (!storeId && role) {
            // Global + role: buscar en memberships.role Y en platformRole
            filter.$or = [
                { "memberships.role": role },
                { platformRole: role },
            ];
        }

        if (q) {
            // Si ya hay $or por role, combinarlo con $and
            const textOr = [
                { name: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
            ];
            if (filter.$or) {
                const roleOr = filter.$or;
                delete filter.$or;
                filter.$and = [{ $or: roleOr }, { $or: textOr }];
            } else {
                filter.$or = textOr;
            }
        }

        // Compatibilidad con datos previos ("Active", "ACTIVE", etc.)
        if (normStatus) {
            filter.status = { $regex: `^${normStatus}$`, $options: "i" };
        }

        // --- Orden ---
        const sortParam = String(req.query.sort || "-createdAt");
        const allowed = new Set(["createdAt", "-createdAt", "name", "-name", "email", "-email"]);
        const sortKey = allowed.has(sortParam) ? sortParam : "-createdAt";
        const sort = {};
        if (sortKey.startsWith("-")) sort[sortKey.slice(1)] = -1;
        else sort[sortKey] = 1;

        // --- Proyección y consulta ---
        const projection = "-password -refresh_token";

        const [users, total] = await Promise.all([
            UserModel.find(filter).sort(sort).skip(skip).limit(limit).select(projection).lean(),
            UserModel.countDocuments(filter),
        ]);

        return res.ok({
            users,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
        });
    } catch (error) {
        return next(error);
    }
}


// export auxiliar si lo quieres reutilizar en PATCH/BULK
export { pickStatus };

// ========== delete user ==========
export async function deleteUser(req, res, next) {
    try {
        const targetId = req.params.id;
        const storeId = req?.tenant?.storeId || null;

        if (!targetId) throw ERR.VALIDATION('User id is required');

        // evitar borrarse a sí mismo
        if (String(targetId) === String(req.userId)) {
            throw ERR.FORBIDDEN('You cannot delete your own account');
        }

        // filtro multi-tenant: solo si pertenece a la tienda activa
        const filter = { _id: targetId };
        if (storeId) filter['memberships.storeId'] = storeId;

        const deletedUser = await UserModel.findOneAndDelete(filter);
        if (!deletedUser) {
            throw ERR.NOT_FOUND('User not found or not authorized to delete');
        }

        return res.ok({ message: 'User Deleted!' });
    } catch (error) {
        return next(error);
    }
}

// ========== delete multiple users ==========
export async function deleteMultiple(req, res, next) {
    try {
        const { ids } = req.body;
        const storeId = req?.tenant?.storeId || null;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw ERR.VALIDATION('Invalid input: ids must be a non-empty array');
        }

        // prevenir auto-borrado
        const filteredIds = ids.filter((id) => String(id) !== String(req.userId));
        if (filteredIds.length === 0) {
            return res.err(400, 'BAD_REQUEST', 'No valid ids to delete (cannot delete yourself)');
        }

        // filtro multi-tenant
        const filter = { _id: { $in: filteredIds } };
        if (storeId) filter['memberships.storeId'] = storeId;

        const result = await UserModel.deleteMany(filter);

        return res.ok({
            message: `Users deleted successfully (${result.deletedCount} removed)`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        return next(error);
    }
}
