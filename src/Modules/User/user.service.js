import { decrypt, encrypt } from "../../Utils/encryption/encryption.utils.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import * as dbService from "../../DB/dbService.js";
import { roleEnum, UserModel } from "../../DB/Models/user.model.js";
import { compare, hash } from "../../Utils/hashing/hash.utils.js";
import { signoutEnums } from "../../Utils/token/token.utils.js";
import { TokenModel } from "../../DB/Models/token.model.js";
import { cloudinaryConfig } from "../../Utils/multer/cloudinary.js";
export const getProfile = async (req, res, next) => {
  req.user.phone = decrypt(req.user.phone);

  const user = await dbService.findById({
    model: UserModel,
    id: req.user._id,
    populate: [{ path: "messages" }],
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Profile fetched successfully",
    data: { user },
  });
};

export const shareProfile = async (req, res, next) => {
  const { userId } = req.params;

  const user = await dbService.findOne({
    model: UserModel,

    filter: { _id: userId, confirmEmail: { $exists: true } },
  });

  return user
    ? successResponse({
        res,
        statusCode: 200,
        message: "Profile fetched successfully",
        data: { user },
      })
    : next(new Error("Invalid or not verfied account", { cause: 404 }));
};

export const updateProfile = async (req, res, next) => {
  if (req.body.phone) {
    req.body.phone = await encrypt(req.body.phone);
  }

  const updatedUser = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    data: req.body,
  });

  return updatedUser
    ? successResponse({
        res,
        statusCode: 200,
        message: "Profile updated successfully",
        data: { user: updatedUser },
      })
    : next(new Error("Invalid Account", { cause: 404 }));
};

export const freezeAccount = async (req, res, next) => {
  const { userId } = req.params;

  if (userId && req.user.role !== roleEnum.admin)
    return next(
      new Error("You are not authorized to freeze this account", { cause: 403 })
    );

  const updatedUser = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: userId || req.user._id, deletedAt: { $exists: false } },
    data: {
      deletedAt: Date.now(),
      deletedBy: req.user._id,
      $unset: {
        restoredAt: true,
        restoredBy: true,
      },
    },
  });

  return updatedUser
    ? successResponse({
        res,
        statusCode: 200,
        message: "Profile Freezed successfully",
        data: { user: updatedUser },
      })
    : next(new Error("Invalid Account", { cause: 404 }));
};

export const restoreAccount = async (req, res, next) => {
  const { userId } = req.params;

  const updatedUser = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: userId,
      deletedAt: { $exists: true },
      deletedBy: { $ne: userId },
    },
    data: {
      $unset: {
        deletedAt: true,
        deletedBy: true,
      },
      restoredAt: Date.now(),
      restoredBy: req.user._id,
    },
  });

  return updatedUser
    ? successResponse({
        res,
        statusCode: 200,
        message: "Profile Freezed successfully",
        data: { user: updatedUser },
      })
    : next(new Error("Invalid Account", { cause: 404 }));
};

export const hardDelete = async (req, res, next) => {
  const { userId } = req.params;

  const user = await dbService.deleteOne({
    model: UserModel,
    filter: { _id: userId, deletedAt: { $exists: true } },
  });

  return user.deletedCount
    ? successResponse({
        res,
        statusCode: 200,
        message: "Profile Deleted successfully",
        data: { user },
      })
    : next(new Error("Invalid Account", { cause: 404 }));
};

export const updatePassword = async (req, res, next) => {
  const { oldPassword, password, flag } = req.body;

  if (!(await compare({ plainText: oldPassword, hash: req.user.password })))
    return next(new Error("Old password is incorrect", { cause: 400 }));

  let updatedData = {};
  switch (flag) {
    case signoutEnums.signoutFromAll:
      updatedData.changeCredentialTime = Date.now();
      break;
    case signoutEnums.signout:
      await dbService.create({
        model: TokenModel,
        data: [
          {
            jti: req.decoded.jti,
            userId: req.user._id,
            expiresIn: Date.now() - req.decoded.exp,
          },
        ],
      });
    default:
      break;
  }
  const updatedPass = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    data: {
      password: await hash({ plainText: password }),
      ...updatedData,
    },
  });

  return updatedPass
    ? successResponse({
        res,
        statusCode: 200,
        message: "Password Updated successfully",
        data: { user: updatedPass },
      })
    : next(new Error("Invalid Account", { cause: 404 }));
};

export const profileImage = async (req, res, next) => {
  // const user = await dbService.findOneAndUpdate({
  //   model: UserModel,
  //   filter: { _id: req.user._id },
  //   data: { profileImage: req.file.finalPath },
  // });
  const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
    req.file.path,
    {
      folder: `Sara7aApp/User/${req.user._id}`,
    }
  );

  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    data: { profileCloudImage: { secure_url, public_id } },
  });

  // to destroy the previous image from cloudinary
  if (req.user.profileCloudImage?.public_id) {
    await cloudinaryConfig().uploader.destroy(
      req.user.profileCloudImage.public_id
    );
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Profile image updated successfully",
    data: { user },
  });
};

export const coverImages = async (req, res, next) => {
  // const user = await dbService.findOneAndUpdate({
  //   model: UserModel,
  //   filter: { _id: req.user._id },
  //   data: { coverImages: req.files?.map((file) => file.finalPath) },
  // });

  const attachments = [];
  for (const file of req.files) {
    const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
      file.path,
      {
        folder: `Sara7aApp/User/${req.user._id}`,
      }
    );
    attachments.push({ secure_url, public_id });
  }

  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    data: { coverCloudImages: attachments },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Profile image updated successfully",
    data: { user },
  });
};
