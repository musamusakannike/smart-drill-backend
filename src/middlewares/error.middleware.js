const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Set status code based on the response status
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    status: "error",
    message: err.message || err || "Internal Server Error",
    data: null,
  });
};

module.exports = errorHandler;
