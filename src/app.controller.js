import connectDB from "./DB/connection.js";
import authRouter from "./Modules/Auth/auth.controller.js";
import userRouter from "./Modules/User/user.controller.js";
import messageRouter from "./Modules/Messages/message.controller.js";
import { globalError } from "./Utils/globalErorr.utils.js";
import cors from "cors";
import path from "node:path";
import { attachRouterWithLogger } from "./Utils/logging/logger.js";
import { corsOptions } from "./Utils/cors/cors.utils.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
const bootstrap = async (app, express) => {
  app.use(express.json());

  app.use(cors(corsOptions()));
  app.use(helmet());
  await connectDB();

  attachRouterWithLogger(app, "/api/user", userRouter, "users.log");
  attachRouterWithLogger(app, "/api/auth", userRouter, "auth.log");

  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    limit: 3,
    message: {
      statusCode: 429,
      message: "Too many requests, please try again later.",
    },
    // handler: (req, res, next, options) => {
    //   res.status(options.statusCode).json(options.message);
    // },
    legacyHeaders: false,
    standardHeaders: "draft-8",
    skip: (req, res) => req.path === "/api/auth/login",
  });
  app.use(limiter);

  app.get("/", (req, res) => {
    res.json("Welcome to Sara7a App 😘");
  });

  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/message", messageRouter);

  app.all("{/*dummy}", (req, res, next) => {
    const dummy = req.params.dummy;
    return next(
      new Error(`Not Found Handler with: ${dummy}!!`, { cause: 404 })
    );
  });

  app.use(globalError);
};

export default bootstrap;
