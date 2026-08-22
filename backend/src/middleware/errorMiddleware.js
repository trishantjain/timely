// Centralized error handling.
//
// notFound: catches any request that didn't match a route.
// errorHandler: catches anything passed to next(err), or thrown inside a
// controller wrapped in asyncHandler. Must be registered LAST in app.js,
// after all routes.

export const notFound = (req, res, next) => {
    res.status(404);
    next(new Error(`Route not found - ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
    // If a controller already set a status code, keep it; otherwise default to 500.
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    // Common Mongoose error shapes get friendlier messages.
    let message = err.message || "Server error";

    if (err.name === "CastError") {
        message = `Invalid ${err.path}: ${err.value}`;
        return res.status(400).json({ success: false, message });
    }

    if (err.name === "ValidationError") {
        message = Object.values(err.errors).map((e) => e.message).join(", ");
        return res.status(400).json({ success: false, message });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        return res.status(409).json({ success: false, message: `Duplicate value for ${field}` });
    }

    if (process.env.NODE_ENV !== "production") {
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    });
};
