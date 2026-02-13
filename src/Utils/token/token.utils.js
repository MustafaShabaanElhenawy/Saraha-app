import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { roleEnum } from "../../DB/Models/user.model.js";

export const signatureEnum = {
  admin: "Admin",
  user: "Bearer",
};

export const signoutEnums = {
  signoutFromAll: "signoutFromAllDevices",
  signout: "signout",
  stayLoggedIn: "stayLoggedIn",
};
export const signToken = ({
  payload = {},
  signtature,
  options = { expiresIn: 30 * 60 },
} = {}) => {
  return jwt.sign(payload, signtature, options);
};

export const verifyToken = ({ token = "", signtature } = {}) => {
  return jwt.verify(token, signtature);
};

export const getSignature = async ({
  signatureLevel = signatureEnum.user,
} = {}) => {
  let signatures = { accessSignature: undefined, refreshSignature: undefined };

  switch (signatureLevel) {
    case signatureEnum.admin:
      signatures.accessSignature = process.env.ACCESS_JWT_ADMIN_SIGNATURE;
      signatures.refreshSignature = process.env.REFERESH_JWT_ADMIN_SIGNATURE;
      break;
    default:
      signatures.accessSignature = process.env.ACCESS_JWT_USER_SIGNATURE;
      signatures.refreshSignature = process.env.REFERESH_JWT_USER_SIGNATURE;
      break;
  }

  return signatures;
};

export const getNewLoginCredentials = async (user) => {
  const signatures = await getSignature({
    signatureLevel:
      user.role != roleEnum.user ? signatureEnum.admin : signatureEnum.user,
  });

  const jwtid = nanoid();

  const accessToken = signToken({
    payload: { _id: user._id },
    signtature: signatures.accessSignature,
    options: { jwtid, expiresIn: 30 * 60 }, // 30 Min
  });
  const refreshToken = signToken({
    payload: { _id: user._id },
    signtature: signatures.refreshSignature,
    options: { jwtid, expiresIn: 60 * 60 * 24 * 7 }, // 7 days
  });

  return {
    accessToken,
    refreshToken,
  };
};
