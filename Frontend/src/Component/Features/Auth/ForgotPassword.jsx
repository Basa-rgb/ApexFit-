import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, LockKeyhole, MailCheck } from "lucide-react";
import { forgotPassword } from "../../../api/auth.api";

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false); // NEW

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);
            await forgotPassword({ email: email.trim() });
            setSubmitted(true); // switch to success view
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                {submitted ? (
                    // ---- Success state ----
                    <>
                        <div className="flex justify-center mb-5">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                                <MailCheck size={32} />
                            </div>
                        </div>

                        <div className="text-center mb-7">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Check Your Email
                            </h1>
                            <p className="text-gray-500 text-sm mt-2">
                                We've sent a password reset link to{" "}
                                <span className="font-medium text-gray-700">{email}</span>.
                                Click the link in the email to reset your password.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="flex items-center justify-center gap-2 w-full text-sm text-gray-600 hover:text-blue-600 transition"
                        >
                            <ArrowLeft size={18} />
                            Back to Login
                        </button>
                    </>
                ) : (
                    // ---- Form state ----
                    <>
                        <div className="flex justify-center mb-5">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <LockKeyhole size={32} />
                            </div>
                        </div>

                        <div className="text-center mb-7">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Forgot Password?
                            </h1>
                            <p className="text-gray-500 text-sm mt-2">
                                Enter your registered email address and we'll send you
                                a reset link.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={20}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="flex items-center justify-center gap-2 w-full mt-6 text-sm text-gray-600 hover:text-blue-600 transition"
                        >
                            <ArrowLeft size={18} />
                            Back to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;