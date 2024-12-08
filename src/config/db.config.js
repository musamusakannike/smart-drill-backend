const mongoose = require("mongoose");

const connectDB = async () => {
  const clientOptions = {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
  };
  try {
    await mongoose.connect(process.env.MONGO_URI, clientOptions);
    console.log("Connected to database");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
