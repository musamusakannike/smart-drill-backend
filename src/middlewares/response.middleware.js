const responseHandler = (req, res, next) => {
  res.success = (data, message) => {
    res.status(200).json({
      status: "success",
      message,
      data,
    });
  };
  next();
};

module.exports = responseHandler;
