import fs from "fs";
import path from "path";
import morgan from "morgan";

const __dirname = path.resolve();

/**
 * Attach router with its own log file
 * @param {object} app
 * @param {string} routePath
 * @param {object} router
 * @param {string} logFileName
 */
export function attachRouterWithLogger(app, routePath, router, logFileName) {
  const logStream = fs.createWriteStream(
    path.join(__dirname, "./src/logs", logFileName),
    { flags: "a" }
  );

  app.use(routePath, morgan("combined", { stream: logStream }), router);

  app.use(routePath, morgan("dev"), router);
}
