// server/utils/generatedRefreshToken.js
import jwt from "jsonwebtoken";

export default function generatedRefreshToken(userId) {
    const secret =
        process.env.SECRET_KEY_REFRESH_TOKEN
        || process.env.JWT_REFRESH_SECRET
        || process.env.JWT_SECRET;

    const expiresIn = process.env.JWT_REFRESH_EXPIRES || "30d";

    const payload = {
        id: String(userId),
        sub: String(userId),
    };

    return jwt.sign(payload, secret, { expiresIn });
}
