import joi from "joi";
import { Types } from "mongoose";
import { genderEnum, roleEnum } from "../DB/Models/user.model.js";

export const generalFields = {
  firstName: joi.string().min(2).max(20).messages({
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name must be at most 20 characters long",
    "any.required": "First name is mandatory",
  }),
  lastName: joi.string().min(2).max(20).messages({
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name must be at most 20 characters long",
    "any.required": "First name is mandatory",
  }),
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 3,
    tlds: { allow: ["com", "net", "org", "edu", "io"] },
  }),
  phone: joi.string().pattern(new RegExp(/^(\+002|\+2)?01[0125][0-9]{8}$/)),
  password: joi.string().pattern(new RegExp(/^[A-Za-z\d@$!%*?&]{8,20}$/)),
  confirmPassword: joi.string().valid(joi.ref("password")),
  gender: joi
    .string()
    .valid(...Object.values(genderEnum))
    .default("male"),
  role: joi
    .string()
    .valid(...Object.values(roleEnum))
    .default("user"),
  otp: joi.string().pattern(new RegExp(/^\d{6}$/)),
  id: joi.string().custom((value, helper) => {
    return (
      Types.ObjectId.isValid(value) || helper.message("Invalid ObjectId format")
    );
  }),
  file: {
    fieldname: joi.string(),
    originalname: joi.string(),
    mimetype: joi.string(),
    size: joi.number().positive(),
    path: joi.string(),
    destination: joi.string(),
    filename: joi.string(),
    encoding: joi.string(),
    finalPath: joi.string(),
  },
};

export const validation = (schema) => {
  return (req, res, next) => {
    const validationError = [];
    for (const key of Object.keys(schema)) {
      const validationResult = schema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validationResult.error) {
        validationError.push({ key, details: validationResult.error.details });
      }
    }
    if (validationError.length)
      return res
        .status(400)
        .json({ error: "Validation Error", details: validationError });

    return next();
  };
};
