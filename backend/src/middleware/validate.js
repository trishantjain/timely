import { validationResult } from "express-validator";

// Generic validation-result handler. Place this after a chain of
// express-validator rules on any route:
//
//   router.post("/login", loginRules, validate, login);
//
// Keeps controllers free of manual field-checking so validation rules
// live in one place (src/validations/*) instead of scattered inline ifs.
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((e) => ({
                field: e.path,
                message: e.msg
            }))
        });
    }

    next();
};

export default validate;
