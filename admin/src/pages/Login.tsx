import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { phone, purpose: 'login' });
      if (response.data.success) {
        setOtpSent(true);
        toast.success('OTP sent successfully');
        // Show OTP in dev mode
        if (response.data.otp) {
          toast.success(`Dev OTP: ${response.data.otp}`, { duration: 10000 });
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await login(phone, otp);
      toast.success('Login successful');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-saffron-400 to-saffron-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">J</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">JainSetu Admin</h1>
            <p className="text-gray-500 mt-1">Sign in to manage your community</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="label">Phone Number</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter phone number"
                  className="input flex-1"
                  disabled={otpSent}
                  maxLength={10}
                />
                {!otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || phone.length < 10}
                    className="btn-primary whitespace-nowrap"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                )}
              </div>
            </div>

            {otpSent && (
              <>
                <div>
                  <label className="label">OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="input"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="text-sm text-saffron-600 hover:underline mt-2"
                  >
                    Change phone number
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full py-3"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Admin access only. Contact support if you need access.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
