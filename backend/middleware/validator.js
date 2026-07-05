const { body, validationResult } = require("express-validator");

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      message: "Validation error",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  };
};

const authValidations = {
  register: [
    body("username")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores",
      ),
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  login: [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  workspace: [
    body("name")
      .notEmpty()
      .withMessage("Workspace name is required")
      .isLength({ max: 100 })
      .withMessage("Workspace name must be less than 100 characters"),
  ],
  folder: [
    body("name")
      .notEmpty()
      .withMessage("Folder name is required")
      .isLength({ max: 100 })
      .withMessage("Folder name must be less than 100 characters")
      .matches(/^[^\\/:"*?<>|]+$/)
      .withMessage("Folder name contains invalid characters"),
  ],
  file: [
    body("name")
      .notEmpty()
      .withMessage("File name is required")
      .isLength({ max: 100 })
      .withMessage("File name must be less than 100 characters")
      .matches(/^[^\\/:"*?<>|]+$/)
      .withMessage("File name contains invalid characters"),
  ],
};

module.exports = { validate, authValidations };
