import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiArrowLeft, FiCheckCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  
  const { verifyOTP, resendOTP, pendingEmail, user } = useAuth();
  const navigate = useNavigate();

  const email = pendingEmail || user?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      // Focus last input
      inputRefs.current[5].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    const result = await verifyOTP(email, otpCode);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResendLoading(true);
    const result = await resendOTP(email);
    setResendLoading(false);

    if (result.success) {
      setCanResend(false);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
      toast.success('New OTP sent to your email');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-gray-200 dark:border-slate-700 shadow-xl dark:shadow-black/30 transition-colors duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900/60">
            <FiMail className="text-3xl text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Email</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            We sent a 6-digit code to
          </p>
          <p className="text-gray-700 dark:text-gray-300 font-medium text-sm mt-1 break-all">
            {email}
          </p>
        </div>

        {/* OTP Input */}
        <form onSubmit={handleVerify}>
          <div className="mb-6">
            <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-4 text-center">
              Enter Verification Code
            </label>
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 text-center text-2xl font-bold border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    digit
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white'
                  } focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-500/30`}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Error/Success Messages */}
          {user?.isVerified === false && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50 text-yellow-700 dark:text-yellow-400 text-sm flex items-center gap-2 rounded-lg">
              <FiClock className="text-yellow-500" />
              <span>Please verify your email to continue</span>
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <FiCheckCircle size={18} />
                Verify Email
              </>
            )}
          </button>
        </form>

        {/* Resend Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resendLoading || !canResend}
              className={`font-medium transition ${
                resendLoading || !canResend
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline'
              }`}
            >
              {resendLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-1" />
                  Sending...
                </>
              ) : !canResend ? (
                `Resend in ${countdown}s`
              ) : (
                'Resend OTP'
              )}
            </button>
          </p>
        </div>

        {/* Back to Login */}
        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition flex items-center justify-center gap-1 group"
          >
            <FiArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-100 dark:border-slate-800">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
            💡 Check your spam folder if you don't see the email within 2 minutes.
            <br />
            The OTP expires in 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;