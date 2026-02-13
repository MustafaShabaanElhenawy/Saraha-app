import {
  create,
  findOne,
  findOneAndUpdate,
  updateOne,
} from "../../DB/dbService.js";
import { UserModel, providers } from "../../DB/Models/user.model.js";
import { encrypt } from "../../Utils/encryption/encryption.utils.js";
import { hash, compare } from "../../Utils/hashing/hash.utils.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import { getNewLoginCredentials } from "../../Utils/token/token.utils.js";
import { OAuth2Client } from "google-auth-library";
import { emailEvent } from "../../Utils/events/email.event.js";
import { customAlphabet } from "nanoid";
import { TokenModel } from "../../DB/Models/token.model.js";

export const signup = async (req, res, next) => {
  const { firstName, lastName, email, password, phone, gender, role } =
    req.body;

  if (await findOne({ model: UserModel, filter: { email } }))
    return next(new Error("Email already exists", { cause: 409 }));

  const hashedPassword = await hash({ plainText: password });
  const encryptedPhone = encrypt(phone);
  const otp = customAlphabet("0123456789", 6)();
  const hashOTP = await hash({ plainText: otp });
  const user = await create({
    model: UserModel,
    data: [
      {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone: encryptedPhone,
        gender,
        role,
        confirmEmailOTP: hashOTP,
      },
    ],
  });

  emailEvent.emit("confirmEmail", {
    to: email,
    firstName,
    otp,
  });

  return successResponse({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: { user },
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await findOne({
    model: UserModel,
    filter: { email, provider: providers.system },
  });
  if (!user) return next(new Error("Invalid credentials", { cause: 401 }));

  if (!(await compare({ plainText: password, hash: user.password })))
    return next(new Error("Invalid credentials", { cause: 401 }));

  if (!user.confirmEmail)
    return next(new Error("Email not confirmed", { cause: 401 }));

  const getNewCredentials = await getNewLoginCredentials(user);

  return successResponse({
    res,
    statusCode: 200,
    message: "Login successfully",
    data: { getNewCredentials },
  });
};

export const logout = async (req, res, next) => {
  const { flag } = req.body;

  let status = 200;
  switch (flag) {
    case signoutEnums.signoutFromAll:
      await updateOne({
        model: UserModel,
        filters: { _id: req.user._id },
        data: {
          changeCredentialTime: Date.now(),
        },
      });
      break;
    default:
      await create({
        model: TokenModel,
        data: [
          {
            jti: req.decoded.jti,
            userId: req.user._id,
            expiresIn: Date.now() - req.decoded.exp,
          },
        ],
      });
      status = 201;
  }

  return successResponse({
    res,
    statusCode: status,
    message: "Logout successfully",
  });
};

export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOTP: { $exists: true },
    },
  });
  if (!user)
    return next(
      new Error("User not found or email already confirmed", { cause: 404 })
    );

  if (!(await compare({ plainText: otp, hash: user.confirmEmailOTP }))) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  await updateOne({
    model: UserModel,
    filters: { email },
    data: {
      confirmEmail: Date.now(),
      $unset: { confirmEmailOTP: true },
      $inc: { __v: 1 },
    },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Email confirmed successfully",
  });
};

export const refreshToken = async (req, res, next) => {
  const user = req.user;

  const getNewCredentials = await getNewLoginCredentials(user);
  return successResponse({
    res,
    statusCode: 200,
    message: "New Credentials",
    data: { getNewCredentials },
  });
};

async function verifyGoogleAccount({ idToken }) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.WEB_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  return payload;
}

export const loginWithGmail = async (req, res, next) => {
  const { idToken } = req.body;
  const { email, email_verified, given_name, family_name, picture } =
    await verifyGoogleAccount({
      idToken,
    });

  if (!email_verified)
    return next(new Error("Email not verified", { cause: 401 }));

  const user = await findOne({
    model: UserModel,
    filter: { email },
  });
  if (user) {
    if (user.provider === providers.google) {
      const getNewCredentials = await getNewLoginCredentials(user);
      return successResponse({
        res,
        statusCode: 200,
        message: "Login successful",
        data: { getNewCredentials },
      });
    }
  }

  const newUser = await create({
    model: UserModel,
    data: [
      {
        firstName: given_name,
        lastName: family_name,
        email,
        confirmEmail: Date.now(),
        provider: providers.google,
        photo: picture,
      },
    ],
  });

  const getNewCredentials = await getNewLoginCredentials(user);
  return successResponse({
    res,
    statusCode: 201,
    message: "Login successful",
    data: { getNewCredentials },
  });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const otp = await customAlphabet("0123456789", 6)();
  const hashOTP = await hash({ plainText: otp });
  const user = await findOneAndUpdate({
    model: UserModel,
    filter: {
      email,
      provider: providers.system,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
    },
    data: {
      forgetPasswordOTP: hashOTP,
    },
  });

  if (!user)
    return next(
      new Error("User not found or email not confirmed", { cause: 404 })
    );

  emailEvent.emit("forgetPassword", {
    to: email,
    firstName: user.firstName,
    otp,
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "OTP sent to your email",
  });
};

export const resetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await findOne({
    model: UserModel,
    filter: {
      email,
      provider: providers.system,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
      forgetPasswordOTP: { $exists: true },
    },
  });

  if (!user) return next(new Error("In-valid Account", { cause: 404 }));

  if (!(await compare({ plainText: otp, hash: user.forgetPasswordOTP }))) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  const hashedPassword = await hash({ plainText: password });

  await updateOne({
    model: UserModel,
    filters: { email },
    data: {
      password: hashedPassword,
      $unset: { forgetPasswordOTP: true },
      $inc: { __v: 1 },
    },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Password reset successfully",
  });
};
