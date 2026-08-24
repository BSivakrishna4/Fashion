import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);
    const { login, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (isResetMode) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                toast.error("Please enter a valid email address.");
                setLoading(false);
                return;
            }

            try {
                await resetPassword(email.trim());
                toast.success("Password reset link sent to your email.");
                setIsResetMode(false);
            } catch (error) {
                console.error(error);
                let msg = "Failed to send reset email";
                if (error.code === 'auth/user-not-found') msg = "No account found with this email.";
                if (error.code === 'auth/invalid-email') msg = "Please enter a valid email address.";
                toast.error(msg);
            } finally {
                setLoading(false);
            }
            return;
        }

        try {
            await login(email.trim(), password);
            toast.success("Login successful");
            navigate('/');
        } catch (error) {
            console.error(error);
            let msg = "Invalid username or password";
            if (error.code === 'auth/user-not-found') msg = "User not found. Please sign up first.";
            if (error.code === 'auth/wrong-password') msg = "Incorrect password. Please try again.";
            if (error.code === 'auth/invalid-credential') msg = "Invalid login credentials.";
            if (error.code === 'auth/invalid-email') msg = "Please enter a valid email address.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
            <Helmet>
                <title>Login | N-FASHIONS</title>
            </Helmet>

            <div className="bg-white p-12 md:p-16 border border-primary/10 w-full max-w-xl shadow-xl rounded-3xl">
                <h2 className="text-2xl font-bold mb-6 text-center text-primary">
                    {isResetMode ? 'Reset Password' : 'Login'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                    {!isResetMode && (
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    type="button"
                                    className="text-xs font-bold text-primary/60 hover:text-primary transition-colors"
                                    onClick={() => setIsResetMode(true)}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-primary text-secondary hover:bg-accent py-3 rounded-none font-bold text-sm"
                        isLoading={loading}
                    >
                        {isResetMode ? 'Send Password Reset Email' : 'Login'}
                    </Button>

                    {isResetMode && (
                        <div className="text-center mt-4 border-t border-primary/5 pt-4">
                            <button
                                type="button"
                                className="text-sm font-bold text-primary/60 hover:text-primary transition-colors"
                                onClick={() => setIsResetMode(false)}
                            >
                                Back to Login
                            </button>
                        </div>
                    )}
                </form>

                <div className="mt-8 text-center border-t border-primary/5 pt-6">
                    <p className="text-sm text-primary/60">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary font-bold hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
