// Wraps an async controller so thrown errors / rejected promises are
// forwarded to Express's error-handling middleware instead of needing a
// try/catch in every controller function.
//
// Usage:
//   export const getThing = asyncHandler(async (req, res) => { ... });
//
// Existing controllers with their own try/catch are left as-is (they
// already handle their own errors) — use this for new controllers, and
// migrate old ones opportunistically when you're already editing them.
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
