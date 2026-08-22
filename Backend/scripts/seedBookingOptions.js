require("dotenv").config();
const mongoose = require("mongoose");
const BookingOption = require("../models/BookingOption");

// Initial records only. The application reads and validates options from MongoDB.
const options = [
  {
    name: "Personal Training",
    price: 1500,
    timeSlots: [
      { label: "06:00 AM - 07:00 AM", startHour: 6 },
      { label: "07:00 AM - 08:00 AM", startHour: 7 },
      { label: "08:00 AM - 09:00 AM", startHour: 8 },
      { label: "05:00 PM - 06:00 PM", startHour: 17 },
      { label: "06:00 PM - 07:00 PM", startHour: 18 },
      { label: "07:00 PM - 08:00 PM", startHour: 19 },
    ],
  },
  {
    name: "Group Training",
    price: 800,
    timeSlots: [
      { label: "09:00 AM - 10:00 AM", startHour: 9 },
      { label: "10:00 AM - 11:00 AM", startHour: 10 },
      { label: "04:00 PM - 05:00 PM", startHour: 16 },
      { label: "05:00 PM - 06:00 PM", startHour: 17 },
    ],
  },
  {
    name: "Diet Consultation",
    price: 1000,
    timeSlots: [
      { label: "11:00 AM - 12:00 PM", startHour: 11 },
      { label: "12:00 PM - 01:00 PM", startHour: 12 },
      { label: "02:00 PM - 03:00 PM", startHour: 14 },
    ],
  },
  {
    name: "Fitness Assessment",
    price: 500,
    timeSlots: [
      { label: "08:00 AM - 09:00 AM", startHour: 8 },
      { label: "09:00 AM - 10:00 AM", startHour: 9 },
      { label: "03:00 PM - 04:00 PM", startHour: 15 },
    ],
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGOOSE_URL);

  for (const option of options) {
    await BookingOption.findOneAndUpdate(
      { name: option.name },
      { $set: option },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  }

  console.log("Booking options seeded successfully.");
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error("Booking option seed failed:", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
