import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Lock, User, Mail, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function AccountSettings() {
    const { currentUser, userData, changePassword } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            toast.success('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.message || 'Failed to change password. Please check your current password.');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-secondary pt-28 pb-16">
            <Helmet>
                <title>Account Settings | N-FASHIONS</title>
                <meta name="description" content="Manage your account settings and security preferences." />
            </Helmet>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-primary tracking-tighter uppercase">Account Settings</h1>
                    <div className="h-1 w-12 bg-primary mt-2"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-1 bg-white p-8 border border-primary/5 shadow-sm h-fit"
                    >
                        <div className="text-center">
                            <div className="w-20 h-20 bg-primary text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-10 h-10" />
                            </div>
                            <h2 className="text-xl font-bold text-primary mb-1">
                                {currentUser.displayName || currentUser.email?.split('@')[0]}
                            </h2>
                            <p className="text-sm text-primary/60 mb-4">{currentUser.email}</p>
                            {userData?.role === 'admin' && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
                                    <Shield className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Admin</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Password Change Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 bg-white p-8 border border-primary/5 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-primary/5">
                            <div className="p-2 bg-primary/5 rounded-lg">
                                <Lock className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-primary uppercase tracking-tight">Change Password</h3>
                                <p className="text-sm text-primary/60">Update your password to keep your account secure</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-primary mb-2 uppercase tracking-wide">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-3 border border-primary/10 focus:border-primary focus:outline-none transition-colors bg-secondary/30"
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-primary mb-2 uppercase tracking-wide">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-3 border border-primary/10 focus:border-primary focus:outline-none transition-colors bg-secondary/30"
                                    placeholder="Enter new password"
                                />
                                <p className="text-xs text-primary/40 mt-1">Must be at least 6 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-primary mb-2 uppercase tracking-wide">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-3 border border-primary/10 focus:border-primary focus:outline-none transition-colors bg-secondary/30"
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-primary text-secondary py-4 font-black uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
