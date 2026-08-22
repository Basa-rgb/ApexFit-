require("dotenv").config();
const mongoose = require("mongoose");
const BookingOption = require("../models/BookingOption");

const migrate = async () => {
  await mongoose.connect(process.env.MONGOOSE_URL);

  try {
    await BookingOption.collection.dropIndex("name_1");
    console.log("Removed the old unique name index.");
  } catch (error) {
    if (error.codeName === "IndexNotFound") {
      console.log("Old unique name index was already removed.");
    } else {
      throw error;
    }
  }

  await BookingOption.syncIndexes();
  console.log("Booking option indexes are ready.");
  await mongoose.disconnect();
};

migrate().catch(async (error) => {
  console.error("Booking option index migration failed:", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
