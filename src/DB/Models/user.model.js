import mongoose, { Schema } from "mongoose";

// must be geneiric to type check
export const genderEnum = {
  male: "male",
  female: "female",
};

export const roleEnum = {
  user: "user",
  admin: "admin",
};

export const providers = {
  system: "system",
  google: "google",
};

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: [2, "First name must be at least 2 characters long"],
      maxLength: [20, "First name must not exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: [2, "Last name must be at least 2 characters long"],
      maxLength: [20, "Last name must not exceed 50 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === providers.system ? true : false;
      },
    },
    gender: {
      type: String,
      enum: {
        values: Object.values(genderEnum),
        message: "{VALUE} is not a valid gender",
      },
      default: genderEnum.male,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(roleEnum),
        message: "{VALUE} is not a valid role",
      },
      default: roleEnum.user,
    },
    phone: String,
    confirmEmail: Date,
    profileImage: String,
    profileCloudImage: { secure_url: String, public_id: String },
    coverImages: [String],
    coverCloudImages: [{ secure_url: String, public_id: String }],
    confirmEmailOTP: String,
    deletedAt: Date,
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restoredAt: Date,
    destoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    forgetPasswordOTP: String,
    changeCredentialTime: Date,
    provider: {
      type: String,
      enum: {
        values: Object.values(providers),
        message: "{VALUE} is not a valid provider",
      },
      default: providers.system,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("messages", {
  localField: "_id",
  foreignField: "receiverId",
  ref: "Message",
});

export const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);
