import { MessageModel } from "../../DB/Models/message.model.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import * as dbService from "../../DB/dbService.js";
import { UserModel } from "../../DB/Models/user.model.js";
import { cloudinaryConfig } from "../../Utils/multer/cloudinary.js";

export const sendMessage = async (req, res, next) => {
  const { receiverId } = req.params;
  const { content } = req.body;

  if (
    !(await dbService.findOne({
      model: UserModel,
      filter: {
        _id: receiverId,
        deletedAt: { $exists: false },
        confirmEmail: { $exists: true },
      },
    }))
  )
    return next(new Error("Invalid Recipient Account", { cause: 404 }));

  const attachments = [];
  if (req.files) {
    for (const file of req.files) {
      const { secure_url, public_id } =
        await cloudinaryConfig().uploader.upload(file.path, {
          folder: `Sara7aApp/Messages/${receiverId}`,
        });
      attachments.push({ secure_url, public_id });
    }
  }

  const message = await dbService.create({
    model: MessageModel,
    data: [
      {
        content,
        attachments,
        receiverId,
        senderId: req.user?._id,
      },
    ],
  });

  return successResponse({
    res,
    statusCode: 201,
    message: "Message sent successfully",
    data: message,
  });
};

export const getMessages = async (req, res, next) => {
  const { userId } = req.params;
  const messages = await dbService.find({
    model: MessageModel,
    filter: {
      receiverId: userId,
    },
    populate: [
      { path: "receiverId", select: "firstName lastName email gender" },
    ],
  });
  return successResponse({
    res,
    statusCode: 200,
    message: "Messages fetched successfully",
    data: { messages },
  });
};
