require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User");

const isPlaceholder = (value) => !value || /<[^>]+>/.test(value);

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (isPlaceholder(process.env.MONGOOSE_URL)) {
    throw new Error("Set MONGOOSE_URL in Backend/.env before seeding an admin.");
  }

  if (isPlaceholder(email) || isPlaceholder(password)) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in Backend/.env before seeding an admin.",
    );
  }

  await mongoose.connect(process.env.MONGOOSE_URL, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  const passwordHash = await bcrypt.hash(password, 12);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    existingUser.role = "admin";
    existingUser.isVerified = true;
    existingUser.isActive = true;
    existingUser.password = passwordHash;
    await existingUser.save();
    console.log(`Admin account updated for ${email}.`);
  } else {
    await User.create({
      name: "ApexFit Administrator",
      email,
      password: passwordHash,
      role: "admin",
      isVerified: true,
      isActive: true,
    });
    console.log(`Admin account created for ${email}.`);
  }
};

seedAdmin()
  .catch((error) => {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
