import { verifyToken } from "../config/jwt.js";

export const protect = (req, res, next) => {
    // FETCHING TOKEN
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized" });
    }

    try {
        // DECODING TOKEN TO CHECK IF LOGIN IS BY 'ADMIN'
        const decoded = verifyToken(token);

        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

// CHECKING 'ADMIN' LOGIN
export const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Admin only" });
    }

    next();
};
