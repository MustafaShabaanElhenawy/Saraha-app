import { Router } from "express";
import * as messageService from "./message.service.js";
import { uploadToCloud } from "../../Utils/multer/cloud.multer.js";
import { fileValidation } from "../../Utils/multer/local.multer.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import {
  getMessagesValidation,
  sendMessageValidation,
} from "./message.validation.js";
import {
  authentication,
  tokenTypeEnum,
} from "../../Middlewares/authentication.middleware.js";
const router = Router({
  caseSensitive: true,
});

router.post(
  "/:receiverId/send-message",
  uploadToCloud({ validation: fileValidation.images }).array("attachments", 3),
  validation(sendMessageValidation),
  messageService.sendMessage
);

router.post(
  "/:receiverId/sender",
  authentication({ tokenType: tokenTypeEnum.access }),
  uploadToCloud({ validation: fileValidation.images }).array("attachments", 3),
  validation(sendMessageValidation),
  messageService.sendMessage
);

// Not Logic
router.get(
  "/:userId/get-messages",
  validation(getMessagesValidation),
  messageService.getMessages
);

export default router;
