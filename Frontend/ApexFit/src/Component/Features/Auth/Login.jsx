import React, { useState } from 'react';
import loginImg from "../../../assets/images/login.png";
import { login, googleAuth } from "../../../api/auth.api";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from 'react-router-dom';
export default function LoginForm() {
   const [isVisible, setIsVisible] = useState(false);

   const [isSubmitting, setIsSubmitting] = useState(false);
   const [formData, setFormData] = useState({
      email: "",
      password: "",
   })

   const navigate = useNavigate()
   const toggleVisibility = () => {
      setIsVisible((prevState) => !prevState);
   };

   const handleGoogleSuccess = async (credentialResponse) => {
      setIsSubmitting(true);
      try {
         const response = await googleAuth({ credential: credentialResponse.credential });
         localStorage.setItem("token", response.data.token);
         localStorage.setItem("user", JSON.stringify(response.data.user));
         navigate(response.data.user?.role === "admin" ? "/admin/dashboard" : "/dashboard");
      } catch (error) {
         console.log(error);
         alert(error.response?.data?.message || "Google login failed");
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      // email validation

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
         return alert("Please enter a valid email")
      }

      if (formData.password.length < 8) {
         return alert("Password must be at least 8 characters.")
      }

      setIsSubmitting(true)


      try {
         const response = await login(formData);
         console.log(response.data);
         localStorage.setItem("token", response.data.token);
         localStorage.setItem("user", JSON.stringify(response.data.user));
         navigate(response.data.user?.role === "admin" ? "/admin/dashboard" : "/dashboard");
      } catch (error) {
         console.log(error);
         alert(error.response?.data?.message || "Login failed");
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <main className="md:min-h-screen flex items-center justify-center py-4 px-4 md:px-8">
         <div
            className="w-full max-w-5xl bg-white [box-shadow:0_2px_10px_-3px_rgba(14,14,14,0.3)] rounded-2xl overflow-hidden dark:bg-neutral-800">
            <div className="grid items-center w-full gap-4 lg:grid-cols-2">
               <div
                  className=" hidden lg:block lg:aspect-[8/10] bg-gray-50 relative before:absolute before:inset-0 before:bg-black/40 overflow-hidden w-full h-full">
                  <img src={loginImg} className="w-full h-full object-cover" alt="login img" />
                  <div className="absolute inset-0 flex items-end justify-center">
                     <div
                        className="w-full bg-gradient-to-t from-black/50 via-black/50 to-transparent absolute bottom-0 p-6 max-md:hidden">
                        <h2 className="text-white text-2xl font-semibold font-serif">Welcome Back</h2>
                        <p className="text-slate-300 text-base font-medium mt-4 leading-relaxed font-serif">Log in to continue your fitness journey and achieve your goals with ApexFit.</p>
                     </div>
                  </div>
               </div>

               <div className="py-6 px-6 lg:px-8 max-lg:-order-1">
                  <div className="max-w-md mx-auto w-full">
                     <h1 className="text-slate-900 text-3xl font-bold mb-8 dark:text-slate-50 flex justify-center items-center font-serif">
                        Login / Sign in
                     </h1>

                     <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                           <label htmlFor="email"
                              className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Email</label>
                           <input type="email" id="email" name="email" placeholder="basanta@gmail.com" required
                              value={formData.email}
                              onChange={(e) => setFormData({
                                 ...formData,
                                 email: e.target.value
                              })}
                              className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600" />
                        </div>

                        <div>
                           <label htmlFor="password"
                              className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Password</label>

                           <div className="relative">
                              <input
                                 type={isVisible ? "text" : "password"}
                                 id="password"
                                 name="password"
                                 placeholder="••••••••"
                                 value={formData.password}
                                 onChange={(e) => setFormData({
                                    ...formData,
                                    password: e.target.value
                                 })}
                                 className="px-3 py-2.5 pr-10 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600"
                                 required
                              />

                              <button
                                 type="button"
                                 id="togglePassword"
                                 onClick={toggleVisibility}
                                 aria-label={isVisible ? "Hide password" : "Show password"}
                                 aria-pressed={isVisible}
                                 className="absolute inset-y-0 right-2 flex items-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">
                                 <svg xmlns="http://www.w3.org/2000/svg"
                                    className="size-[18px] fill-slate-400 text-slate-400 overflow-visible" viewBox="0 0 128 128">
                                    <path
                                       d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z">
                                    </path>
                                    {!isVisible && (
                                       <path
                                          d="M15 15l98 98"
                                          stroke="currentColor"
                                          strokeWidth="10"
                                          strokeLinecap="round"
                                          className="stroke-slate-400"
                                       />
                                    )}
                                 </svg>
                              </button>
                           </div>
                        </div>

                        <div className="flex items-start flex-wrap gap-2">
                           <label className="flex items-center group has-[input:checked]:text-slate-900">
                              <input id="remember" name="remember" type="checkbox"  className="sr-only" required />
                              {/* Custom box */}
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded outline-1 outline-slate-300 dark:outline-neutral-600
                           bg-white dark:bg-neutral-700
                           group-has-[input:checked]:bg-blue-600
                           group-has-[input:checked]:outline-blue-600
                           group-focus-within:outline-2
                           group-focus-within:outline-blue-600" aria-hidden="true">
                                 {/* Checkmark */}
                                 <svg className="size-3 text-white opacity-0 group-has-[input:checked]:opacity-100"
                                    viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 5l3 3 7-7" />
                                 </svg>
                              </span>
                              <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                                 Remember me
                              </span>
                           </label>

                           <a href="/forgot-password"
                              className="ml-auto text-sm font-medium text-blue-700 dark:text-blue-500 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                              Forgot password?
                           </a>
                        </div>
                        <button type="submit"
                           disabled={isSubmitting || !formData.email.trim() || !formData.password.trim()}
                           className="w-full py-2 px-3.5 text-sm rounded-md font-semibold  text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-mono cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                           {isSubmitting ? "Redirecting" : "Sign in"}</button>
                     </form>

                     <div className="my-8 flex items-center gap-4">
                        <hr className="w-full border-slate-300 dark:border-neutral-700" />
                        <p className="text-sm text-slate-700 text-center dark:text-slate-300">or</p>
                        <hr className="w-full border-slate-300 dark:border-neutral-700" />
                     </div>

                     <div className="flex justify-center bg-white dark:bg-neutral-800">
                        <GoogleLogin
                           onSuccess={handleGoogleSuccess}
                           onError={() => {
                              console.log("Google Login Failed");
                           }}
                        />
                     </div>

                     <div className="mt-6 text-slate-900 text-sm text-center dark:text-slate-50">Don't have an account? <a href="/register"
                        className="text-blue-700 hover:underline ml-1 font-medium dark:text-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Sign
                        up</a>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </main>
   );
}