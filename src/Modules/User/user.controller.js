import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authentication,
  authorization,
  tokenTypeEnum,
} from "../../Middlewares/authentication.middleware.js";
import { endPoint } from "./user.authorization.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import {
  coverImagesValidation,
  freezeAccountValidation,
  hardDeletedValidation,
  profileImageValidation,
  restoreAccountValidation,
  shareProfileValidation,
  updatePasswordValidation,
  updateProfileValidation,
} from "./user.validation.js";
import {
  fileValidation,
  localFileUpload,
} from "../../Utils/multer/local.multer.js";
import { uploadToCloud } from "../../Utils/multer/cloud.multer.js";
const router = Router({
  caseSensitive: true,
  strict: true,
});

router.get(
  "/getProfile",
  authentication({ tokenType: tokenTypeEnum.access }),
  authorization({ accessRoles: endPoint.profile }),
  userService.getProfile
);

router.patch(
  "/update-profile",
  authentication({ tokenType: tokenTypeEnum.access }),
  authorization({ accessRoles: endPoint.updateProfile }),
  validation(updateProfileValidation),
  userService.updateProfile
);

router.delete(
  "{/:userId}/freeze-account", // optional userId for specific account freeze
  authentication({ tokenType: tokenTypeEnum.access }),
  authorization({ accessRoles: endPoint.freezeAccount }),
  validation(freezeAccountValidation),
  userService.freezeAccount
);

router.patch(
  "/:userId/restore-account",
  authentication({ tokenType: tokenTypeEnum.access }),
  authorization({ accessRoles: endPoint.restoreAccount }),
  validation(restoreAccountValidation),
  userService.restoreAccount
);

router.delete(
  "/:userId/hard-delete",
  authentication({ tokenType: tokenTypeEnum.access }),
  authorization({ accessRoles: endPoint.hardDelete }),
  validation(hardDeletedValidation),
  userService.hardDelete
);

router.patch(
  "/update-pasword",
  validation(updatePasswordValidation),
  authentication({ tokenType: tokenTypeEnum.access }),
  userService.updatePassword
);

router.get(
  "/share-profile/:userId",
  validation(shareProfileValidation),
  userService.shareProfile
);

router.patch(
  "/profile-image",
  authentication({ tokenType: tokenTypeEnum.access }),
  // localFileUpload({
  //   customPath: "User",
  //   validation: [...fileValidation.images],
  // }).single("image"),
  uploadToCloud({
    validation: [...fileValidation.images],
  }).single("image"),
  // validation(profileImageValidation),
  userService.profileImage
);

router.patch(
  "/cover-image",
  authentication({ tokenType: tokenTypeEnum.access }),
  // localFileUpload({
  //   customPath: "User",
  //   validation: [...fileValidation.images],
  // }).array("images", 5), // max 5 images
  // validation(coverImagesValidation),
  uploadToCloud({
    validation: [...fileValidation.images],
  }).array("images"),
  userService.coverImages
);
export default router;
