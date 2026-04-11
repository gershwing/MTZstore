// server/utils/generatedAccessToken.js
import jwt from "jsonwebtoken";

export default function generatedAccessToken(userId) {
    const secret =
        process.env.SECRET_KEY_ACCESS_TOKEN
        || process.env.JWT_ACCESS_SECRET
        || process.env.JWT_SECRET
        || process.env.JSON_WEB_TOKEN_SECRET_KEY;

    const expiresIn = process.env.JWT_ACCESS_EXPIRES || "1h";

    // Claims tolerantes para middlewares antiguos/nuevos
    const payload = {
        id: String(userId),
        sub: String(userId),
    };

    return jwt.sign(payload, secret, { expiresIn });
}
