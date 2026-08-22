import React, { useRef, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { resendRegistrationOtp, verifyOtp } from "../../../api/auth.api";
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
 const email = location.state?.email || localStorage.getItem("pendingEmail");
  console.log("email",email)
  const handleChange = (value, index) => {
    // allow only number
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp]
    newOtp[index] = value;
    setOtp(newOtp);

    // move to next input box

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // move to previous input while backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();

    }
  }


  // handle the verify function

  const handleVerify = async () => {
    const code = otp.join("");
    if (!email) {
      alert("Your registration session has expired. Please register again.");
      navigate("/register", { replace: true });
      return;
    }

    setIsVerifying(true)
    try {
      const res = await verifyOtp({ email, otp: code });
      localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.removeItem("pendingEmail");
      alert(res.data.message || "Account verified successfully.");
      navigate("/", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "OTP verification failed");
    } finally {
      setIsVerifying(false)
    }
  }

  // resend the OTP

  const handleResendOtp = async () => {
    if (!email) {
      alert("Your registration session has expired. Please register again.");
      navigate("/register", { replace: true });
      return;
    }

    setIsResending(true);
    try {
      const res = await resendRegistrationOtp({ email });
      alert(res.data.message || "A new OTP has been sent.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  }
  return (
    <>
      <div className='min-h-screen bg-gray-100 flex items-center justify-center px-4 '>
        <div className='w-full max-w-md bg-white rounded-2xl shadow-2xl p-8'>

          {/* shield icon and Otp  heading */}
          <div className=' flex flex-col justify-center items-center gap-y-4'>
            <span> <ShieldCheck size={46} className="text-blue-600" /></span>
            <h1 className=' font-bold font-serif text-2xl'>OTP VERIFICATION</h1>
            <p> We've sent a verification code
              to your email address.</p>
          </div>

          {/* six input box */}

          <div className='flex justify-center gap-3 mt-6'>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type='text'
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-14 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            ))}
          </div>

          <div className=' flex flex-col justify-center items-center gap-3 mt-6'>
            <p>I Didn't Receive a Code!</p>
            <button className='text-blue-600 underline cursor-pointer disabled:opacity-50'
              onClick={handleResendOtp}
              disabled={isResending}>{isResending ? "Sending..." : "Resend Code"}</button>
          </div>

          <div className=' flex justify-center items-center gap-3 mt-6'>
            <button className='bg-[#18C0D2] text-white px-7 py-3 rounded-md text-xl font-serif hover:bg-[#15a5b5] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleVerify}
              disabled={otp.some((d) => d === "" || isVerifying)}>  
              {isVerifying ? "Verifying..." : "Verify"}
              </button>
          </div>

        </div>
      </div>
    </>
  )
}

export default VerifyOtp
