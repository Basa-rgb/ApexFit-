import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTrainerById } from "../../api/trainer.api";
import Loader from "../../Component/Common/Loader";
import EmptyState from "../../Component/Common/EmptyState";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

const TrainerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        setLoading(true);
        setError("");

        const [response] = await Promise.all([
          getTrainerById(id),
          new Promise((resolve) => setTimeout(resolve, 3000)),
        ]);

        console.log("Trainer:", response.data);

        setTrainer(response.data.trainer);
      } catch (error) {
        console.error("Get Trainer Error:", error);

        setError(error.response?.data?.message || "Failed to load trainer");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTrainer();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (error || !trainer) {
    return (
      <div className="min-h-screen pt-24"><EmptyState message={error || "Trainer not found."} /></div>
    );
  }

  return (
    <section className="min-h-screen py-20 bg-gray-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10 p-4">
        {/* Trainer Image */}
        <div className="max-w-md w-full mx-auto rounded-2xl overflow-hidden shadow-lg shadow-red-500">
          {trainer.profileImage ? (
            <img
              src={trainer.profileImage}
              alt={trainer.fullName}
              className="w-full h-[550px] object-cover object-top rounded-2xl"
            />
          ) : (
            <div className="w-full h-[550px] flex items-center justify-center bg-gray-300 rounded-2xl">
              <p className="text-gray-500">No profile image</p>
            </div>
          )}
        </div>

        {/* Trainer Information */}
        <div className="max-w-xl mx-auto px-6 py-8">
          {/* Name */}
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900">
            {trainer.fullName}
          </h1>

          {/* Specialization */}
          <p className="mt-3 text-xl font-medium text-red-600">
            {trainer.specialization || "Fitness Trainer"}
          </p>

          {/* Bio */}
          <p className="mt-5 text-gray-600 leading-relaxed">
            {trainer.bio || "No biography available."}
          </p>

          {/* Trainer Stats */}
          <div className="grid grid-cols-2 gap-4 mt-7">
            <div className="bg-gray-100 rounded-xl p-4 shadow-lg shadow-red-500/20">
              <p className="text-2xl font-bold">{trainer.experience}</p>
              <p className="text-sm text-gray-500 mt-1">Years Experience</p>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 shadow-lg shadow-red-500/20">
              <p className="text-2xl font-bold">{trainer.totalReviews}</p>
              <p className="text-sm text-gray-500 mt-1">Reviews</p>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 shadow-lg shadow-red-500/20">
              <p className="text-2xl font-bold">Rs. {trainer.monthlyFee}</p>
              <p className="text-sm text-gray-500 mt-1">Monthly Fee</p>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 shadow-lg shadow-red-500/20">
              <p className="text-2xl font-bold">⭐ {trainer.rating}</p>
              <p className="text-sm text-gray-500 mt-1">Rating</p>
            </div>
          </div>

          {/* Certifications */}
          {trainer.certifications?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold font-serif text-gray-900">
                Certifications
              </h2>

              <div className="flex flex-wrap gap-2 mt-4">
                {trainer.certifications.map((item, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available Days */}
          {trainer.availableDays?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold font-serif text-gray-900">
                Available Days
              </h2>

              <div className="flex flex-wrap gap-2 mt-4">
                {trainer.availableDays.map((day, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available Time */}
          {trainer.availableTime?.start && trainer.availableTime?.end && (
            <div className="mt-6">
              <h2 className="text-xl font-bold font-serif text-gray-900">
                Available Time
              </h2>

              <p className="mt-2 text-gray-600">
                {trainer.availableTime.start} - {trainer.availableTime.end}
              </p>
            </div>
          )}

          {/* Social Links */}
          {trainer.socialLinks && (
            <div className="mt-8">
              <h2 className="text-xl font-bold font-serif text-gray-900">
                Connect With Trainer
              </h2>

              <div className="flex gap-10 space-x-6 mt-4">
                {trainer.socialLinks.facebook && (
                  <a
                    href={trainer.socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="relative flex flex-col items-center text-blue-600 hover:underline"
                  >
                    <FaFacebook
                      size={36}
                      className="hover:scale-110 transition-all duration-300"
                    />

                    <span className="absolute top-10 ">Facebook</span>
                  </a>
                )}

                {trainer.socialLinks.instagram && (
                  <a
                    href={trainer.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-600 relative flex flex-col items-center  hover:underline"
                  >
                    <FaInstagram
                      size={36}
                      className="hover:scale-110 transition-all duration-300"
                    />
                    <span className="absolute top-10 ">Instagram</span>
                  </a>
                )}

                {trainer.socialLinks.linkedin && (
                  <a
                    href={trainer.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 relative flex flex-col items-center  hover:underline"
                  >
                    <FaLinkedin
                      size={36}
                      className="hover:scale-110 transition-all duration-300"
                    />
                    <span className="absolute top-10 ">Linkedin</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Book Training */}
          <button
            className="mt-8 w-full bg-black border-2 border-black text-white py-3.5 rounded-xl text-lg font-semibold hover:bg-transparent hover:text-black transition duration-300 cursor-pointer"
            onClick={() => navigate(`/booking?trainer=${trainer._id}`)}
          >
            Book a Training Session
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrainerProfile;
