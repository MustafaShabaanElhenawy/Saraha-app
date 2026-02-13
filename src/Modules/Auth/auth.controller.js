import { Router } from "express";
import * as authService from "./auth.service.js";
import {
  authentication,
  tokenTypeEnum,
} from "../../Middlewares/authentication.middleware.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import {
  confirmEmailValidation,
  forgetPasaswordValidation,
  loginValidation,
  loginWithGmailValidation,
  logoutValidation,
  resetPasswordValidation,
  signupValidation,
} from "./auth.validation.js";
const router = Router();

router.post("/signup", validation(signupValidation), authService.signup);

router.post("/login", validation(loginValidation), authService.login);

router.post(
  "/logout",
  validation(logoutValidation),
  authentication({ tokenType: tokenTypeEnum.access }),
  authService.logout
);

router.patch(
  "/confirm-email",
  validation(confirmEmailValidation),
  authService.confirmEmail
);

router.get(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.refresh }),
  authService.refreshToken
);

router.post(
  "/social-login",
  validation(loginWithGmailValidation),
  authService.loginWithGmail
);

router.patch(
  "/forget-password",
  validation(forgetPasaswordValidation),
  authService.forgetPassword
);

router.patch(
  "/reset-password",
  validation(resetPasswordValidation),
  authService.resetPassword
);
export default router;
