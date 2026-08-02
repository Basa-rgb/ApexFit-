const mongoose = require("mongoose");

const connectedDb = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URL);

    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectedDb;