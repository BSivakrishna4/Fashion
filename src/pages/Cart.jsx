import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-secondary pt-24 pb-16 flex flex-col items-center justify-center px-4">
                <div className="text-center space-y-6">
                    <h2 className="text-5xl font-black text-primary tracking-tighter uppercase">Your Bag is Empty</h2>
                    <p className="text-primary/60 max-w-sm mx-auto">Elevate your wardrobe with our premium minimalist essentials. Start exploring today.</p>
                    <Link to="/shop" className="block">
                        <Button size="lg" className="px-12 py-8 rounded-none font-black uppercase tracking-widest shadow-xl">Start Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary pt-28 pb-16">
            <Helmet>
                <title>Shopping Bag | N-FASHIONS</title>
                <meta name="description" content="Review your selected premium minimalist pieces before checkout." />
            </Helmet>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-primary tracking-tighter uppercase">Shopping Bag</h1>
                    <div className="h-1 w-12 bg-primary mt-2"></div>
                </div>

                <div className="flex flex-col lg:flex-row gap-16">

                    {/* Cart Items */}
                    <div className="flex-1 space-y-6">
                        <AnimatePresence mode='popLayout'>
                            {cart.map((item) => (
                                <motion.div
                                    key={`${item.productId || item.id}-${item.size}`}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white p-6 border border-primary/5 shadow-sm flex flex-col sm:flex-row gap-8 group"
                                >
                                    <div className="w-full sm:w-32 h-44 bg-secondary flex-shrink-0 overflow-hidden shadow-inner">
                                        <img
                                            src={item.image || "https://placehold.co/200x300?text=Product"}
                                            alt={item.title || item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-1 block">{item.collection || item.category || 'T-SHIRTS'}</span>
                                                <h3 className="text-2xl font-black text-primary tracking-tighter uppercase leading-tight">{item.title || item.name}</h3>
                                                <p className="text-sm font-bold text-primary/50 mt-1 uppercase tracking-widest">Size: {item.size}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.productId || item.id, item.size)}
                                                className="text-primary/20 hover:text-red-500 transition-colors p-2"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end mt-auto pt-6">
                                            <div className="flex items-center border border-primary/20 bg-secondary/20">
                                                <button
                                                    onClick={() => updateQuantity(item.productId || item.id, item.size, item.quantity - 1)}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-white transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-10 text-center font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => {
                                                        const availableStock = typeof item.sizes === 'object' && item.sizes !== null && !Array.isArray(item.sizes) ? (item.sizes[item.size] || 0) : (item.inventory || item.stock || 0);
                                                        if (item.quantity < availableStock) {
                                                            updateQuantity(item.productId || item.id, item.size, item.quantity + 1);
                                                        }
                                                    }}
                                                    disabled={item.quantity >= (typeof item.sizes === 'object' && item.sizes !== null && !Array.isArray(item.sizes) ? (item.sizes[item.size] || 0) : (item.inventory || item.stock || 0))}
                                                    className={`w-10 h-10 flex items-center justify-center transition-colors ${item.quantity >= (typeof item.sizes === 'object' && item.sizes !== null && !Array.isArray(item.sizes) ? (item.sizes[item.size] || 0) : (item.inventory || item.stock || 0)) ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white'}`}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-primary tracking-tighter inline-block mb-1">₹{item.price * item.quantity}</span>
                                                <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">₹{item.price} per unit</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary */}
                    <div className="lg:w-[400px]">
                        <div className="bg-white p-10 border border-primary/5 shadow-2xl sticky top-28">
                            <h2 className="text-2xl font-black text-primary tracking-tighter uppercase mb-8 border-b border-primary/10 pb-4">Estimate</h2>

                            <div className="space-y-5 mb-10 text-sm font-bold uppercase tracking-widest">
                                <div className="flex justify-between text-primary/50">
                                    <span>Subtotal</span>
                                    <span>₹{getCartTotal()}</span>
                                </div>
                            </div>

                            <div className="flex justify-between font-black text-3xl text-primary tracking-tighter mb-10">
                                <span>Total</span>
                                <span>₹{getCartTotal()}</span>
                            </div>

                            <Button size="lg" className="w-full py-8 text-lg font-black uppercase tracking-widest rounded-none shadow-xl hover:scale-[1.02] transition-transform" onClick={() => navigate('/checkout')}>
                                Checkout <ArrowRight className="w-5 h-5 ml-3" />
                            </Button>

                            <p className="mt-8 text-[10px] text-center text-primary/30 font-bold uppercase tracking-[0.2em] leading-relaxed">
                                Secure checkout by N-FASHIONS.<br />Cash on delivery available.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
