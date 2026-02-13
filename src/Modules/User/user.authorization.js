import { roleEnum } from "../../DB/Models/user.model.js";

export const endPoint = {
  profile: [roleEnum.user, roleEnum.admin],
  freezeAccount: [roleEnum.admin, roleEnum.user],
  updateProfile: [roleEnum.user, roleEnum.admin],
  restoreAccount: [roleEnum.admin],
  hardDelete: [roleEnum.admin],
};
