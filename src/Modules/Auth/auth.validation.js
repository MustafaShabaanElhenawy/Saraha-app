import joi from "joi";
import { generalFields } from "../../Middlewares/validation.middleware.js";
import { signoutEnums } from "../../Utils/token/token.utils.js";

export const signupValidation = {
  body: joi
    .object({
      firstName: generalFields.firstName.required(),
      lastName: generalFields.lastName.required(),
      email: generalFields.email.required().required(),
      phone: generalFields.phone,
      password: generalFields.password.required(),
      confirmPassword: generalFields.confirmPassword.required(),
      gender: generalFields.gender,
      role: generalFields.role.required(),
    })
    .required(),
};

export const loginValidation = {
  body: joi
    .object({
      email: generalFields.email.required(),
      password: generalFields.password.required(),
    })
    .required(),
};

export const confirmEmailValidation = {
  body: joi
    .object({
      email: generalFields.email.required(),
      otp: generalFields.otp.required(),
    })
    .required(),
};

export const loginWithGmailValidation = {
  body: joi
    .object({
      idToken: joi.string().required(),
    })
    .required(),
};

export const forgetPasaswordValidation = {
  body: joi
    .object({
      email: generalFields.email.required(),
    })
    .required(),
};

export const resetPasswordValidation = {
  body: joi
    .object({
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      confirmPassword: generalFields.confirmPassword,
    })
    .required(),
};

export const logoutValidation = {
  body: joi
    .object({
      flag: joi
        .string()
        .valid(...Object.values(signoutEnums))
        .default(signoutEnums.stayLoggedIn),
    })
    .required(),
};
