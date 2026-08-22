import React, { useState, useEffect } from 'react'
import { LockKeyhole, Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../../../api/auth.api";
import { useNavigate, useParams } from 'react-router-dom';
const ResetPassword = () => {

    const { token } = useParams();
    const navigate = useNavigate()
    // state for pass hide and show 
    const [show, setShow] = useState({ new: false, retype: false });

    // state for value
    const [values, setValues] = useState({ new: '', retype: '' });

    // state for error
    const [error, setError] = useState({ new: '', retype: '' });

    // state for loading

    const [loading, setLoading] = useState(false)

    // UseEffect for the clear the error

    useEffect(() => {
        if (!error.new && !error.retype) return

        const timer = setTimeout(() => {
            setError({ new: '', retype: '' })
        }, 3000)

        return () => clearTimeout(timer)
    }, [error])

    // Validation function

    const validation = () => {
        const newErrors = { new: '', retype: '' }

        if (!values.new) {
            newErrors.new = "New Password is required"
        }

        else if (values.new.length < 8) {
            newErrors.new = "Password must be at least 8 characters"
        }

        else if (!/[A-Z]/.test(values.new)) {
            newErrors.new = "Password must contain 1 uppercase letter"
        }
        else if (!/[a-z]/.test(values.new)) {
            newErrors.new = "Password must contain 1 lowercase letter"
        }

        else if (!/[0-9!@#$%^&*]/.test(values.new)) {
            newErrors.new = "Password must contain 1  number & special symbol"
        }

        if (values.retype !== values.new) {
            newErrors.retype = "Passwords do not match"
        }

        setError(newErrors)

        return Object.values(newErrors).every(msg => msg === '')
    }

    // Handles the Submit

    const handleSubmit = async () => {
        if (!validation()) {
            return
        }

        setLoading(true);
        try {
            const res = await resetPassword(token, {
                password: values.new,
                confirmPassword: values.retype
            });
            console.log(res.data)
            alert("Password reset successfully");
            navigate('/login')

            setValues({ new: '', retype: '' })
        } catch (error) {
            alert(error.response?.data?.message || "Password reset failed")
        }

        finally {
            setLoading(false)
        }
    }


    return (
        <>
            <div className='min-h-screen bg-gray-200 flex justify-center items-center px-4'>
                <div className='w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 flex flex-col gap-6'>
                    <div className="flex flex-col items-center text-center gap-3">
                        <span className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                            <LockKeyhole size={36} className="text-white" />
                        </span>
                        <h1 className="text-xl font-serif font-semibold">Create a new password for your account.</h1>
                    </div>

                    {/* New  Password and eye show and hide password */}

                    <div className='flex flex-col w-full gap-1.5'>
                        <label htmlFor="new-password" className="text-sm font-medium font-serif">New Password:</label>
                        <div className="relative">
                            <input
                                type={show.new ? "text" : "password"}
                                id='new-password'
                                placeholder="••••••••"
                                value={values.new}
                                onChange={(e) => setValues(v => ({ ...v, new: e.target.value }))}
                                className='w-full px-3.5 py-2.5 pr-10 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                            <button
                                type="button"
                                onClick={() => setShow(s => ({ ...s, new: !s.new }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400"
                            >
                                {show.new ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                        {error.new && <p className="text-red-500 text-xs mt-1">{error.new}</p>}
                    </div>


                    {/* Re-type Password and eye show and hide password */}

                    <div className='flex flex-col w-full gap-1.5'>
                        <label htmlFor="retype-password" className="text-sm font-medium font-serif">Re-type Password:</label>
                        <div className="relative">
                            <input
                                type={show.retype ? "text" : "password"}
                                id='retype-password'
                                placeholder="••••••••"
                                value={values.retype}
                                onChange={(e) => setValues(v => ({ ...v, retype: e.target.value }))}
                                className='w-full px-3.5 py-2.5 pr-10 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                            <button
                                type="button"
                                onClick={() => setShow(s => ({ ...s, retype: !s.retype }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400"
                            >
                                {show.retype ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                        {error.retype && <p className="text-red-500 text-xs mt-1">{error.retype}</p>}
                    </div>

                    {/*  Requirment for Password */}

                    <div className="bg-zinc-50 p-4 rounded-lg">
                        <h1 className="text-sm font-semibold mb-2">Password must contain:</h1>
                        <ul className="space-y-1 text-sm text-zinc-600 list-disc list-inside">
                            <li>8+ characters</li>
                            <li>1 uppercase letter</li>
                            <li>1 number or symbol</li>
                        </ul>
                    </div>

                    {/* Reset Password button */}

                    <button
                        type='button'
                        onClick={handleSubmit}
                        disabled={loading}
                        className='w-full px-4 py-2 bg-blue-500 hover:bg-blue-700 cursor-pointer text-lg font-serif disabled:opacity-50 disabled:cursor-not-allowed'
                    >{loading ? "Resetting..." : "Reset Password"}</button>
                </div>
            </div>

        </>
    )
}

export default ResetPassword