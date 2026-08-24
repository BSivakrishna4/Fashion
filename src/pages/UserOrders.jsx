import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function UserOrders() {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const fetchOrders = async () => {
            const ordersMap = new Map();

            try {
                if (currentUser.uid) {
                    try {
                        const qUid = query(
                            collection(db, "orders"),
                            where("userId", "==", currentUser.uid)
                        );
                        const snapUid = await getDocs(qUid);
                        snapUid.docs.forEach(d => {
                            const data = d.data();
                            const docId = data.id || d.id;
                            ordersMap.set(docId, { id: docId, ...data });
                        });
                    } catch (eUid) {
                        console.warn("UID order fetch notice:", eUid.message);
                    }
                }

                if (currentUser.email) {
                    try {
                        const qEmail = query(
                            collection(db, "orders"),
                            where("userEmail", "==", currentUser.email)
                        );
                        const snapEmail = await getDocs(qEmail);
                        snapEmail.docs.forEach(d => {
                            const data = d.data();
                            const docId = data.id || d.id;
                            ordersMap.set(docId, { id: docId, ...data });
                        });
                    } catch (eEmail) {
                        console.warn("Email order fetch notice:", eEmail.message);
                    }
                }

                const userOrders = Array.from(ordersMap.values());

                // Sort by date desc
                userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setOrders(userOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentUser]);

    if (!currentUser) return (
        <div className="min-h-screen pt-40 px-4 text-center bg-secondary">
            <h2 className="text-3xl font-black text-primary uppercase tracking-tighter mb-6">Unauthorized</h2>
            <p className="text-primary/60 mb-8 max-w-sm mx-auto font-medium">Please login to view your order history and track your premium items.</p>
            <Link to="/login"><Button className="px-10 py-6 uppercase font-bold tracking-widest rounded-none">Login Now</Button></Link>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen pt-40 text-center bg-secondary">
            <div className="animate-pulse space-y-4">
                <div className="text-primary/20 text-4xl font-black uppercase tracking-widest">Loading Bag history</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-secondary pt-28 pb-16">
            <Helmet>
                <title>My Orders | N-FASHIONS</title>
                <meta name="description" content="Track your orders and view your purchase history with N-FASHIONS." />
            </Helmet>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-primary tracking-tighter uppercase">Order History</h1>
                    <div className="h-1 w-12 bg-primary mt-2"></div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white p-16 border border-primary/5 shadow-xl text-center space-y-6">
                        <p className="text-primary/40 font-bold uppercase tracking-widest">You haven't placed any orders yet.</p>
                        <Link to="/shop" className="inline-block"><Button className="px-10 py-6 rounded-none font-black uppercase tracking-widest shadow-xl">Start Your Collection</Button></Link>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white p-8 border border-primary/5 shadow-sm relative group overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-500 group-hover:w-2 ${order.status === 'Delivered' ? 'bg-green-500' :
                                    order.status === 'Cancelled' ? 'bg-red-500' : 'bg-primary'
                                    }`}></div>

                                <div className="flex flex-col md:flex-row justify-between mb-8 border-b border-primary/5 pb-6 gap-6">
                                    <div>
                                        <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.3em] block mb-2">Reference #{order.id}</span>
                                        <span className="text-sm font-bold text-primary/60 block uppercase tracking-widest">Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Just now'}</span>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <span className={`px-4 py-1.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] border ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                            order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-secondary text-primary border-primary/10'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <span className="font-black text-2xl text-primary tracking-tighter">₹{order.total}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Items</h4>
                                        <div className="space-y-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-primary/70 font-bold uppercase tracking-tight">{item.quantity}x {item.name} <span className="text-primary/30 text-xs">({item.size})</span></span>
                                                    <span className="text-primary font-black">₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="md:border-l md:pl-8 space-y-4">
                                        <h4 className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Shipment Info</h4>
                                        <p className="text-xs font-medium text-primary/60 leading-relaxed uppercase tracking-wider">{order.address}</p>
                                        <div className="pt-4 text-[10px] font-black uppercase tracking-widest text-primary/30">
                                            Payment Method: <span className="text-primary/60">{order.paymentMethod}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
