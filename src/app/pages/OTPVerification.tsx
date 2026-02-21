import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, role } = location.state || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpValue
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Success - redirect to login
        setTimeout(() => {
          navigate('/login', { state: { verified: true, email, role } });
        }, 1000);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setOtp(['', '', '', '', '', '']);
        setResendTimer(30);
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-purple-600" />
            </div>
            <h1 className="text-3xl mb-2 text-gray-900">Verify OTP</h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to<br />
              <strong>{email}</strong>
            </p>
          </div>

          <div className="mb-6">
            <label className="block mb-3 text-center text-gray-700">Enter OTP</label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-sm text-center mt-3">{error}</p>}
          </div>

          <button
            onClick={handleVerify}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors mb-4 disabled:bg-purple-400"
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>

          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={resendTimer > 0 || isLoading}
              className={`text-sm ${
                resendTimer > 0 || isLoading
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-purple-600 hover:underline'
              }`}
            >
              {resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
