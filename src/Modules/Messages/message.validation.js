import joi from "joi";
import { generalFields } from "../../Middlewares/validation.middleware.js";
import { fileValidation } from "../../Utils/multer/local.multer.js";
export const sendMessageValidation = {
  params: joi
    .object({
      receiverId: generalFields.id.required(),
    })
    .required(),
  body: joi
    .object({
      content: joi.string().min(2).max(200000),
    })
    .required(),
  files: joi
    .array()
    .items(
      joi.object({
        fieldname: generalFields.file.fieldname.valid("attachments").required(),
        originalname: generalFields.file.originalname.required(),
        mimetype: generalFields.file.mimetype
          .valid(...fileValidation.images)
          .required(),
        size: generalFields.file.size.max(5 * 1024 * 1024).required(), // max 5MB
        path: generalFields.file.path.required(),
        destination: generalFields.file.destination.required(),
        filename: generalFields.file.fieldname.required(),
        encoding: generalFields.file.encoding.required(),
      })
    )
    .min(0)
    .max(3),
};

export const getMessagesValidation = {
  params: joi.object({
    userId: generalFields.id.required(),
  }),
};
