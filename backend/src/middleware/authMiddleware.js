import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    // FETCHING TOKEN
    const token = req.headers.authorization?.split(" ")[1]

    // ERROR IF TOKEN NOT FOUND
    if (!token) {
        return res.status(401).json({ message: "Not authorized" })
    }

    try {
        // DECODING TOKEN TO CHECK IF LOGIN IS BY 'ADMIN'
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()

    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// CHECKING 'ADMIN' LOGIN
export const adminOnly = (req, res, next) => {

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin only" })
    }

    next()
}