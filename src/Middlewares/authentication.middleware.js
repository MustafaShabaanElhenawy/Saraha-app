import * as dbService from "../DB/dbService.js";
import { UserModel } from "../DB/Models/user.model.js";
import { TokenModel } from "../DB/Models/token.model.js";

import { getSignature, verifyToken } from "../Utils/token/token.utils.js";

export const tokenTypeEnum = {
  access: "access",
  refresh: "refresh",
};

const decodedToken = async ({
  authorization,
  tokenType = tokenTypeEnum.access,
  next,
} = {}) => {
  const [Bearer, token] = authorization.split(" ") || [];

  if (!Bearer || !token)
    return next(new Error("Invalid Token", { cause: 400 }));

  let signature = await getSignature({ signatureLevel: Bearer });

  const decoded = verifyToken({
    token,
    signtature:
      tokenType === tokenTypeEnum.access
        ? signature.accessSignature
        : signature.refreshSignature,
  });

  if (
    decoded.jti &&
    (await dbService.findOne({
      model: TokenModel,
      filter: { jti: decoded.jti },
    }))
  )
    return next(new Error("Token is revoked", { cause: 401 }));

  const user = await dbService.findById({
    model: UserModel,
    id: decoded._id,
  });
  if (!user) return next(new Error("Not Registered Account", { cause: 404 }));

  if (user.changeCredentialTime?.getTime() > decoded.iat * 1000)
    return next(new Error("Token is expired", { cause: 401 }));

  return { user, decoded };
};

export const authentication = ({ tokenType = tokenTypeEnum.access } = {}) => {
  return async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
        next,
      })) || {};
    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

export const authorization = ({ accessRoles = [] } = {}) => {
  return async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("Unauthorized Access", { cause: 403 }));
    }
    return next();
  };
};
