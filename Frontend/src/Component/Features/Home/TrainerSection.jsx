import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { getAllTrainers } from "../../../api/trainer.api";
import Loader from "../../Common/Loader";
import EmptyState from "../../Common/EmptyState";

const TrainerSection = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrainers = async () => {
      try {

        const [response] = await Promise.all([
          getAllTrainers(),
          new Promise((resolve) => setTimeout(resolve, 3000)),
        ]);

        console.log("Trainers:", response.data);

        setTrainers(response.data.trainer || []);
      } catch (error) {
        console.error("Get Trainers Error:", error);

        setError(error.response?.data?.message || "Failed to load trainers");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">
          <Loader />
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4 text-center">
        <EmptyState message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] py-20">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 font-serif">
          MEET OUR TRAINERS
        </h1>

        <p className="mt-4 text-lg text-gray-500">
          Train with the best in the game
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-14 px-6">
        {trainers.map((trainer, index) => (
          <motion.div
            key={trainer._id}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
            }}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
          >
            {/* Image */}
            <div className="h-80 overflow-hidden">
              {trainer.profileImage ? (
                <img
                  src={trainer.profileImage}
                  alt={trainer.fullName}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <p>No Image</p>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold font-serif">
                {trainer.fullName}
              </h2>

              <p className="mt-2 text-zinc-500 font-medium">
                {trainer.specialization?.join(", ") || "Fitness Trainer"}
              </p>

              <p className="mt-2 text-gray-500">
                {trainer.experience} Years Experience
              </p>

              <Link to={`/trainers/${trainer._id}`}>
                <button className="mt-5 w-full bg-black border-3 text-xl border-black text-white py-3 rounded-lg hover:bg-white hover:text-black hover:font-semibold transition cursor-pointer">
                  View Profile
                </button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrainerSection;
