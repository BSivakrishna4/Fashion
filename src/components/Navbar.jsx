import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { currentUser, userData, logout } = useAuth();
    const { cart } = useCart();
    const { wishlist } = useWishlist();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setIsOpen(false);
            setSearchQuery("");
        }
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="fixed top-0 w-full h-20 bg-secondary/95 backdrop-blur-lg border-b border-primary/5 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex items-center justify-between h-full">
                    {/* Logo */}
                    <Link to="/" className="text-3xl font-black text-primary tracking-tighter hover:opacity-80 transition-opacity uppercase">
                        N-FASHIONS
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-12">
                        <Link to="/" className="text-[13px] text-primary hover:opacity-100 opacity-60 font-black uppercase tracking-[0.2em] transition-all">Home</Link>
                        <Link to="/shop" className="text-[13px] text-primary hover:opacity-100 opacity-60 font-black uppercase tracking-[0.2em] transition-all">Shop All</Link>
                        <Link to="/shop?category=tshirts" className="text-[13px] text-primary hover:opacity-100 opacity-60 font-black uppercase tracking-[0.2em] transition-all">T-Shirts</Link>
                        <Link to="/shop?category=hoodies" className="text-[13px] text-primary hover:opacity-100 opacity-60 font-black uppercase tracking-[0.2em] transition-all">Hoodies</Link>
                    </div>

                    {/* Right Section: Icons & Mobile Menu */}
                    <div className="flex items-center space-x-4 md:space-x-8">
                        {/* Desktop Only Icons */}
                        <div className="hidden md:flex items-center space-x-8">
                        <div className="relative">
                            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-primary hover:scale-110 transition-transform">
                                <Search className="w-5 h-5" />
                            </button>
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute right-0 top-12 bg-white shadow-2xl p-4 border border-primary/5 w-72 rounded-sm"
                                    >
                                        <form onSubmit={handleSearch} className="flex flex-col gap-3">
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full text-sm border-b border-primary/20 bg-transparent px-2 py-2 focus:outline-none focus:border-primary transition-colors"
                                                autoFocus
                                            />
                                            <Button size="sm" type="submit" className="w-full uppercase tracking-widest text-[10px] font-bold rounded-none">Search</Button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <Link to="/wishlist" className="text-primary hover:scale-110 transition-transform relative">
                            <Heart className="w-5 h-5" />
                            {wishlist.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-primary text-secondary text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-secondary">
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>

                        {currentUser ? (
                            <div className="relative group">
                                <button className="text-primary hover:scale-110 transition-transform">
                                    <User className="w-5 h-5" />
                                </button>
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-primary/5 shadow-2xl py-2 opacity-0 group-hover:opacity-100 transition-all invisible group-hover:visible translate-y-2 group-hover:translate-y-0 duration-300">
                                    <div className="px-4 py-3 border-b border-primary/5 mb-2">
                                        <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Signed in as</p>
                                        <p className="text-sm font-bold text-primary truncate">{currentUser.displayName || currentUser.email}</p>
                                    </div>
                                    <Link to="/orders" className="block px-4 py-2 text-xs font-bold text-primary hover:bg-secondary uppercase tracking-widest">My Orders</Link>
                                    <Link to="/account" className="block px-4 py-2 text-xs font-bold text-primary hover:bg-secondary uppercase tracking-widest">Account Settings</Link>
                                    {(userData?.role === 'admin') && (
                                        <Link to="/admin" className="block px-4 py-2 text-xs font-bold text-primary hover:bg-secondary uppercase tracking-widest">Admin Panel</Link>
                                    )}
                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 uppercase tracking-widest mt-2 border-t border-primary/5">
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login">
                                <Button size="sm" className="bg-primary text-secondary px-8 rounded-none font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:scale-105 transition-transform">Entry</Button>
                            </Link>
                        )}
                        </div>

                        <Link to="/cart" className="text-primary hover:scale-110 transition-transform relative">
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-primary text-secondary text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-secondary">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Mobile Menu Button */}
                        <button onClick={() => setIsOpen(!isOpen)} className="text-primary hover:opacity-70 p-2 md:hidden">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden bg-secondary border-b border-primary/10 shadow-2xl overflow-y-auto max-h-[calc(100vh-5rem)]"
                    >
                        <div className="px-6 pt-8 pb-12 space-y-6">
                            <Link to="/" onClick={() => setIsOpen(false)} className="block text-2xl font-black text-primary uppercase tracking-tighter">Home</Link>
                            <Link to="/shop" onClick={() => setIsOpen(false)} className="block text-2xl font-black text-primary uppercase tracking-tighter">Shop All</Link>
                            <Link to="/shop?category=tshirts" onClick={() => setIsOpen(false)} className="block text-2xl font-black text-primary uppercase tracking-tighter">T-Shirts</Link>
                            <Link to="/shop?category=hoodies" onClick={() => setIsOpen(false)} className="block text-2xl font-black text-primary uppercase tracking-tighter">Hoodies</Link>
                            <form onSubmit={handleSearch} className="flex items-center gap-2 border-b border-primary/20 pb-2">
                                <Search className="w-6 h-6 text-primary/50" />
                                <input
                                    type="text"
                                    placeholder="SEARCH..."
                                    className="w-full bg-transparent border-none focus:outline-none text-xl font-bold uppercase placeholder:text-primary/30"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </form>
                            <Link to="/wishlist" onClick={() => setIsOpen(false)} className="w-full text-left text-2xl font-black text-primary uppercase tracking-tighter flex items-center justify-between">
                                Wishlist
                                <div className="relative">
                                    <Heart className="w-6 h-6" />
                                    {wishlist.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-primary text-secondary text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border border-secondary">
                                            {wishlist.length}
                                        </span>
                                    )}
                                </div>
                            </Link>
                            <Link to="/cart" onClick={() => setIsOpen(false)} className="block text-2xl font-black text-primary uppercase tracking-tighter flex items-center justify-between">
                                Bag
                                {cartCount > 0 && <span className="bg-primary text-secondary text-xs px-3 py-1 rounded-full">{cartCount}</span>}
                            </Link>

                            <div className="pt-8 border-t border-primary/5">
                                {currentUser ? (
                                    <div className="space-y-6">
                                        <Link to="/orders" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-primary/60 uppercase tracking-widest">My Orders</Link>
                                        <Link to="/account" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-primary/60 uppercase tracking-widest">Account Settings</Link>
                                        {(userData?.role === 'admin') && (
                                            <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-primary/60 uppercase tracking-widest">Admin Panel</Link>
                                        )}
                                        <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left text-lg font-bold text-red-500 uppercase tracking-widest">Sign Out</button>
                                    </div>
                                ) : (
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="block text-2xl font-black text-primary uppercase tracking-tighter">Sign In</Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
