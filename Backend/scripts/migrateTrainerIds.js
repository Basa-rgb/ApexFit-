require("dotenv").config();
const mongoose = require("mongoose");

const migrate = async () => {
  await mongoose.connect(process.env.MONGOOSE_URL);
  const db = mongoose.connection.db;
  const trainers = db.collection("trainers");
  const bookingOptions = db.collection("bookingoptions");
  const bookings = db.collection("bookings");

  const stringIdTrainers = await trainers
    .find({ _id: { $type: "string" } })
    .toArray();

  for (const trainer of stringIdTrainers) {
    if (!mongoose.Types.ObjectId.isValid(trainer._id)) {
      console.warn(`Skipping invalid trainer ID: ${trainer._id}`);
      continue;
    }

    const oldId = trainer._id;
    const newId = new mongoose.Types.ObjectId(oldId);
    const migratedTrainer = { ...trainer, _id: newId };
    delete migratedTrainer._id;
    migratedTrainer._id = newId;

    const existingObjectIdTrainer = await trainers.findOne({ _id: newId });
    const existingEmailTrainer = await trainers.findOne({
      email: trainer.email,
      _id: { $ne: oldId },
    });
    const targetId = existingObjectIdTrainer?._id || existingEmailTrainer?._id || newId;

    if (!existingObjectIdTrainer && !existingEmailTrainer) {
      // Free the unique email index while replacing the string _id document.
      await trainers.updateOne(
        { _id: oldId },
        { $set: { email: `migrating-${oldId}@invalid.local` } },
      );
      await trainers.insertOne(migratedTrainer);
    }

    await bookingOptions.updateMany(
      { trainerId: oldId },
      { $set: { trainerId: targetId } },
    );
    await bookings.updateMany(
      { trainerId: oldId },
      { $set: { trainerId: targetId } },
    );
    await trainers.deleteOne({ _id: oldId });

    console.log(`Migrated trainer ${oldId} -> ${targetId}`);
  }

  await mongoose.disconnect();
  console.log("Trainer ID migration completed.");
};

migrate().catch(async (error) => {
  console.error("Trainer ID migration failed:", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
