import jwt from "jsonwebtoken";

// Centralized JWT configuration.
// Previously this file was empty and token signing/verification logic
// was duplicated ad-hoc in controllers/middleware. Consolidating it here
// makes it a single place to change algorithm, expiry, or claims.

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

export const signToken = (payload, options = {}) => {
    if (!process.env.JWT_SECRET) {
        throw new Error(
            "JWT_SECRET is not set. Add it to your .env file before starting the server."
        );
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        ...options
    });
};

export const verifyToken = (token) => {
    if (!process.env.JWT_SECRET) {
        throw new Error(
            "JWT_SECRET is not set. Add it to your .env file before starting the server."
        );
    }

    return jwt.verify(token, process.env.JWT_SECRET);
};

export default { signToken, verifyToken };
