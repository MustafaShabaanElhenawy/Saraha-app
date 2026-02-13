import joi from "joi";
import { generalFields } from "../../Middlewares/validation.middleware.js";
import { signoutEnums } from "../../Utils/token/token.utils.js";
import { fileValidation } from "../../Utils/multer/local.multer.js";

export const shareProfileValidation = {
  params: joi.object({
    userId: generalFields.id.required(),
  }),
};

export const updateProfileValidation = {
  body: joi.object({
    firstName: generalFields.firstName,
    lastName: generalFields.lastName,
    phone: generalFields.phone,
    gender: generalFields.gender,
  }),
};

export const freezeAccountValidation = {
  params: joi.object({
    userId: generalFields.id,
  }),
};

export const restoreAccountValidation = {
  params: joi.object({
    userId: generalFields.id.required(),
  }),
};

export const hardDeletedValidation = {
  params: joi.object({
    userId: generalFields.id.required(),
  }),
};

export const updatePasswordValidation = {
  body: joi.object({
    flag: joi
      .string()
      .valid(...Object.values(signoutEnums))
      .default(signoutEnums.stayLoggedIn),
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(joi.ref("oldPassword")).required(),
    confirmPassword: generalFields.confirmPassword.required(),
  }),
};

export const profileImageValidation = {
  file: joi
    .object({
      fieldname: generalFields.file.fieldname.valid("image").required(),
      originalname: generalFields.file.originalname.required(),
      mimetype: generalFields.file.mimetype
        .valid(...fileValidation.images)
        .required(),
      size: generalFields.file.size.max(5 * 1024 * 1024).required(), // max 5MB
      path: generalFields.file.path.required(),
      destination: generalFields.file.destination.required(),
      filename: generalFields.file.fieldname.required(),
      encoding: generalFields.file.encoding.required(),
      finalPath: generalFields.file.finalPath.required(),
    })
    .required(),
};

export const coverImagesValidation = {
  files: joi
    .object({
      fieldname: generalFields.file.fieldname.valid("images").required(),
      originalname: generalFields.file.originalname.required(),
      mimetype: generalFields.file.mimetype
        .valid(...fileValidation.images)
        .required(),
      size: generalFields.file.size.max(5 * 1024 * 1024).required(), // max 5MB
      path: generalFields.file.path.required(),
      destination: generalFields.file.destination.required(),
      filename: generalFields.file.fieldname.required(),
      encoding: generalFields.file.encoding.required(),
      finalPath: generalFields.file.finalPath.required(),
    })
    .required(),
};
