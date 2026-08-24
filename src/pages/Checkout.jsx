import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export default function Checkout() {
    const { cart, getCartTotal, clearCart } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: currentUser?.displayName || '',
        phone: '',
        address: '',
        landmark: '',
        city: '',
        state: '',
        zip: ''
    });

    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const fullAddress = `${formData.address}${formData.landmark ? `, Near ${formData.landmark}` : ''}, ${formData.city}, ${formData.state} - ${formData.zip}`;
            const orderData = {
                id: `NF-${Date.now()}`,
                userEmail: currentUser ? currentUser.email : 'guest',
                userId: currentUser ? currentUser.uid : 'guest',
                customerName: formData.name,
                phone: formData.phone,
                address: fullAddress,
                items: cart.map(item => ({
                    id: item.id || item.productId || '',
                    name: item.name || '',
                    price: Number(item.price) || 0,
                    quantity: Number(item.quantity) || 1,
                    size: item.size || '',
                    image: typeof item.image === 'string' && !item.image.startsWith('data:image/') ? item.image : ''
                })),
                total: getCartTotal(),
                status: 'Pending',
                paymentMethod: 'WhatsApp Order',
                createdAt: new Date().toISOString()
            };

            // Save to Firestore
            await setDoc(doc(db, "orders", orderData.id), orderData);

            // Deduct inventory for each item mathematically
            for (const item of cart) {
                try {
                    const productRef = doc(db, "products", item.id);
                    const productSnap = await getDoc(productRef);

                    if (productSnap.exists()) {
                        const productData = productSnap.data();

                        // Handle both old 'stock' and new 'inventory' fields seamlessly
                        const currentInventory = productData.inventory !== undefined ? productData.inventory : (productData.stock || 0);

                        let updatePayload = {};

                        if (typeof productData.sizes === 'object' && productData.sizes !== null && !Array.isArray(productData.sizes)) {
                            // Size-specific inventory mode
                            const currentSizeQty = productData.sizes[item.size] || 0;
                            const newSizeQty = Math.max(0, currentSizeQty - item.quantity);

                            const updatedSizes = { ...productData.sizes, [item.size]: newSizeQty };
                            const recalculatedTotal = Object.values(updatedSizes).reduce((sum, qty) => sum + (Number(qty) || 0), 0);

                            updatePayload = {
                                inventory: recalculatedTotal,
                                stock: recalculatedTotal,
                                sizes: updatedSizes
                            };
                        } else {
                            // Legacy global inventory mode
                            const newInventory = Math.max(0, currentInventory - item.quantity);
                            updatePayload = {
                                inventory: newInventory,
                                stock: newInventory
                            };
                        }

                        await updateDoc(productRef, updatePayload);
                    }
                } catch (err) {
                    console.error("Failed to update stock for item", item.id, err);
                }
            }

            clearCart();
            toast.success("Order placed successfully!");

            // Redirect after a short delay
            setTimeout(() => {
                if (currentUser) {
                    navigate('/orders');
                } else {
                    navigate('/');
                }
            }, 1000);

        } catch (error) {
            console.error("Error placing order:", error);
            toast.error("Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary pt-28 pb-16">
            <Helmet>
                <title>Checkout | N-FASHIONS</title>
                <meta name="description" content="Finalize your order and join the N-FASHIONS community." />
            </Helmet>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-primary tracking-tighter uppercase">Checkout</h1>
                    <div className="h-1 w-12 bg-primary mt-2"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Shipping Form */}
                    <div className="bg-white p-10 border border-primary/5 shadow-xl">
                        <h2 className="text-2xl font-black mb-8 uppercase tracking-widest text-primary border-b border-primary/10 pb-4">Shipping Details</h2>
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2 block">Full Name</label>
                                <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2 block">Phone Number</label>
                                <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2 block">Address</label>
                                <textarea required name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium"></textarea>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2 block">Landmark (Optional)</label>
                                <input name="landmark" value={formData.landmark} onChange={handleChange} type="text" placeholder="e.g. Near City Center Mall" className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2 block">City</label>
                                    <input required name="city" value={formData.city} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2 block">State</label>
                                    <input required name="state" value={formData.state} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2 block">ZIP Code</label>
                                <input required name="zip" value={formData.zip} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" />
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="bg-white p-10 border border-primary/5 shadow-2xl sticky top-28">
                            <h2 className="text-2xl font-black mb-8 uppercase tracking-widest text-primary border-b border-primary/10 pb-4">Your Selection</h2>
                            <div className="space-y-6 mb-10 max-h-80 overflow-y-auto pr-2">
                                {cart.map(item => (
                                    <div key={`${item.id}-${item.size}`} className="flex gap-6 items-center group">
                                        <div className="w-20 h-24 bg-secondary flex-shrink-0 overflow-hidden shadow-inner">
                                            <img src={item.image || "https://placehold.co/100x150?text=Product"} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-primary uppercase tracking-tight line-clamp-1">{item.name}</h4>
                                            <p className="text-xs font-bold text-primary/40 mt-1 uppercase tracking-widest">Qty: {item.quantity} · Size: {item.size}</p>
                                        </div>
                                        <span className="font-black text-primary tracking-tighter">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-primary/10 pt-6 space-y-4 mb-10 text-sm font-bold uppercase tracking-widest">
                                <div className="flex justify-between items-center">
                                    <span className="text-primary/40">Total Amount</span>
                                    <span className="font-black text-3xl text-primary tracking-tighter">₹{getCartTotal()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-primary/30 tracking-[0.2em]">
                                    <span>Method</span>
                                    <span>WhatsApp Order</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                form="checkout-form"
                                className="w-full py-8 text-lg font-black uppercase tracking-widest rounded-none shadow-xl hover:scale-[1.02] transition-transform"
                                isLoading={loading}
                            >
                                Confirm Order
                            </Button>

                            <p className="mt-8 text-[10px] text-center text-primary/30 font-bold uppercase tracking-[0.2em] leading-relaxed">
                                By placing an order, you agree to our<br />Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
