export const globalError = (err, req, res, next) => {
  const status = err.cause || 500;
  return res.status(status).json({
    message: "Somthing went wrong",
    error: err.message,
    stack: err.stack,
  });
};
