import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

export default function VerifyOtp() {
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyOtp, sendOtp, currentUser } = useAuth();

    const [email, setEmail] = useState(() => location.state?.email || currentUser?.email || '');
    const name = location.state?.name || currentUser?.displayName || 'Customer';
    const uid = location.state?.uid || currentUser?.uid || '';

    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleChange = (index, value) => {
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{4}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtp(digits);
            inputRefs[3].current?.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !emailRegex.test(email.trim())) {
            return toast.error("Please enter a valid email address.");
        }

        const fullOtp = otp.join('');
        if (fullOtp.length < 4) {
            return toast.error("Please enter a valid 4-digit code.");
        }

        setLoading(true);
        try {
            await verifyOtp(uid, email.trim(), fullOtp);
            toast.success("Email verified successfully. Welcome to N-FASHIONS!");
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Incorrect verification code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !emailRegex.test(email.trim())) {
            return toast.error("Please enter a valid email address.");
        }

        if (cooldown > 0 || resending) return;

        setResending(true);
        try {
            await sendOtp(uid, email.trim(), name);
            toast.success("A verification code has been sent to your email.");
            setCooldown(30);
            setOtp(['', '', '', '']);
            inputRefs[0].current?.focus();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to send verification code.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
            <Helmet>
                <title>Verify OTP | N-FASHIONS</title>
            </Helmet>

            <div className="bg-white p-12 md:p-16 border border-primary/10 w-full max-w-xl shadow-xl rounded-3xl text-center">
                <h2 className="text-2xl font-bold mb-3 text-primary">Email Verification</h2>
                <p className="text-sm text-primary/70 mb-6">
                    Enter your email address and the 4-digit OTP sent to your inbox.
                </p>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="text-left">
                        <label className="block text-sm font-medium text-primary mb-1">Email Address</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                required
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium rounded-none"
                            />
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={cooldown > 0 || resending}
                                className="px-4 py-3 bg-secondary border border-primary/20 text-primary font-bold text-xs hover:bg-primary hover:text-secondary transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resending ? 'Sending...' : cooldown > 0 ? `${cooldown}s` : 'Send Code'}
                            </button>
                        </div>
                    </div>

                    <div className="py-2">
                        <label className="block text-sm font-medium text-primary mb-3 text-center">
                            Enter 4-Digit Verification Code
                        </label>
                        <div className="flex justify-center gap-3 sm:gap-4">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={inputRefs[index]}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-14 h-16 sm:w-16 sm:h-20 text-2xl font-bold text-center border-2 border-primary/20 bg-secondary/20 rounded-xl focus:bg-white focus:border-primary transition-all outline-none text-primary"
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary text-secondary hover:bg-accent py-3.5 rounded-none font-bold text-sm"
                        isLoading={loading}
                    >
                        VERIFY OTP
                    </Button>
                </form>

                <div className="mt-8 border-t border-primary/5 pt-6 flex flex-col items-center gap-3">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={cooldown > 0 || resending}
                        className={`text-sm font-bold transition-colors ${
                            cooldown > 0 || resending
                                ? 'text-primary/40 cursor-not-allowed'
                                : 'text-primary hover:underline cursor-pointer'
                        }`}
                    >
                        {resending
                            ? 'Sending...'
                            : cooldown > 0
                            ? `Resend available in ${cooldown} seconds`
                            : 'RESEND OTP'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-xs font-medium text-primary/60 hover:text-primary transition-colors mt-2"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
