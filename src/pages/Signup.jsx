import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            return toast.error("Please enter your full name.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return toast.error("Please enter a valid email address.");
        }

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match.");
        }

        if (password.length < 6) {
            return toast.error("Password does not meet the required requirements.");
        }

        setLoading(true);
        try {
            const { user } = await signup(name.trim(), email.trim(), password);
            toast.success("A verification code has been sent to your email.");
            navigate('/verify-otp', {
                state: {
                    uid: user.uid,
                    email: user.email,
                    name: name.trim()
                }
            });
        } catch (error) {
            console.error(error);
            let msg = "Failed to create account.";
            if (error.code === 'auth/email-already-in-use') msg = "This email is already registered. Please login.";
            if (error.code === 'auth/invalid-email') msg = "Please enter a valid email address.";
            if (error.code === 'auth/weak-password') msg = "Password does not meet the required requirements.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
            <Helmet>
                <title>Sign Up | N-FASHIONS</title>
            </Helmet>

            <div className="bg-white p-12 md:p-16 border border-primary/10 w-full max-w-xl shadow-xl rounded-3xl">
                <h2 className="text-2xl font-bold mb-6 text-center text-primary">Sign Up</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-primary mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary mb-1">Password</label>
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary mb-1">Confirm Password</label>
                        <input
                            type="password"
                            required
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium"
                        />
                    </div>

                    <p className="text-xs text-center text-primary/60 mt-2">
                        A 4-digit verification code will be sent to your email address.
                    </p>

                    <Button
                        type="submit"
                        className="w-full bg-primary text-secondary hover:bg-accent py-3 rounded-none font-bold text-sm mt-4"
                        isLoading={loading}
                    >
                        Sign Up & Continue with Email OTP
                    </Button>
                </form>

                <div className="mt-8 text-center border-t border-primary/5 pt-6 space-y-2">
                    <p className="text-sm text-primary/60">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-bold hover:underline">
                            Login
                        </Link>
                    </p>
                    <p className="text-xs text-primary/60">
                        Already signed up?{' '}
                        <Link to="/verify-otp" className="text-primary font-bold hover:underline">
                            Continue with Email Verification
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
