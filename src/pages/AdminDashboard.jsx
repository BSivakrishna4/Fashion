import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package, ShoppingBag, Users, Mail, Clock, Shield, Settings } from 'lucide-react';
import { getSettings, updateSettings } from '../lib/settings';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export default function AdminDashboard() {
    const { currentUser, userData, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Product Form State
    const [isEditing, setIsEditing] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        price: '',
        category: 'T-Shirts',
        description: '',
        image: '',
        sizes: { S: 0, M: 0, L: 0, XL: 0 }
    });

    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Global Settings State
    const [appSettings, setAppSettings] = useState({
        adminPhone: '',
        adminEmail: '',
        supportEmail: '',
        businessHours: '',
        location: '',
        whatsappLink: ''
    });
    const [savingSettings, setSavingSettings] = useState(false);

    // Fetch Data
    useEffect(() => {
        if (userData?.role === 'admin') {
            fetchProducts();
            fetchOrders();
            fetchUsers();
            fetchMessages();
            fetchAppSettings();
        } else if (userData) {
            setLoading(false);
        }
    }, [userData]);

    const fetchAppSettings = async () => {
        const settings = await getSettings();
        setAppSettings(settings);
    };

    const fetchProducts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productsList);
        } catch (e) {
            console.error("Error fetching products:", e);
        }
    };

    const fetchOrders = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "orders"));
            let parsed = querySnapshot.docs.map(doc => doc.data());
            parsed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(parsed);
        } catch (e) {
            console.warn("Orders fetch failed:", e.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            let parsed = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            parsed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setUsers(parsed);
        } catch (e) {
            console.error("Error fetching users:", e);
        }
    };

    const fetchMessages = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "messages"));
            let parsed = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Handle different timestamp types (Firestore timestamp vs ISO string)
            parsed.sort((a, b) => {
                const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || a.displayDate).getTime();
                const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || b.displayDate).getTime();
                return dateB - dateA;
            });

            setMessages(parsed);
        } catch (e) {
            console.error("Error fetching messages:", e);
        }
    };

    // Base64 helper
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.onerror = (error) => reject(error);
        });
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const finalImage = imageFile ? await convertToBase64(imageFile) : productForm.image;
            const totalStock = Object.values(productForm.sizes).reduce((sum, qty) => sum + (Number(qty) || 0), 0);

            const data = {
                id: isEditing ? isEditing : `prod_${Date.now()}`,
                title: productForm.name,
                price: Number(productForm.price),
                inventory: totalStock,
                collection: productForm.category.toUpperCase(), // "T-SHIRTS" or "HOODIES"
                image: finalImage,
                details: productForm.description,

                // Fallbacks so existing UI doesn't crash prior to updates
                name: productForm.name,
                category: productForm.category,
                description: productForm.description,
                stock: totalStock,
                sizes: productForm.sizes
            };

            const productDocRef = doc(db, "products", data.id);
            await setDoc(productDocRef, data);

            if (isEditing) {
                toast.success("Product updated");
            } else {
                toast.success("Product added");
            }

            window.dispatchEvent(new Event('products_updated'));

            setProductForm({ name: '', price: '', category: 'T-Shirts', description: '', image: '', sizes: { S: 0, M: 0, L: 0, XL: 0 } });
            setImageFile(null);
            setIsEditing(null);

            // Force reset the file input visually
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';

            fetchProducts();
        } catch (error) {
            toast.error("Error saving product: " + error.message);
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (confirm("Are you sure?")) {
            await deleteDoc(doc(db, "products", id));
            window.dispatchEvent(new Event('products_updated'));
            fetchProducts();
            toast.success("Product deleted");
        }
    };

    const handleEditProduct = (product) => {
        let parsedSizes = { S: 0, M: 0, L: 0, XL: 0 };
        if (Array.isArray(product.sizes)) {
            // Backward compatibility
            product.sizes.forEach(s => {
                parsedSizes[s] = Math.max(1, Math.floor((product.inventory || product.stock || 1) / product.sizes.length));
            });
        } else if (typeof product.sizes === 'object' && product.sizes !== null) {
            parsedSizes = { ...parsedSizes, ...product.sizes };
        }

        setProductForm({
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description || '',
            image: product.image || '',
            sizes: parsedSizes
        });
        setIsEditing(product.id);
        setActiveTab('products');
        window.scrollTo(0, 0);
    };

    // Helper: format customer phone for WhatsApp (handles 10-digit vs 12-digit with country code)
    const getCleanPhone = (phoneStr) => {
        if (!phoneStr) return '';
        const digits = phoneStr.replace(/\D/g, '');
        if (digits.length === 10) return `91${digits}`;
        return digits;
    };

    // Order Handlers
    const handleAcceptOrder = async (order) => {
        try {
            await updateDoc(doc(db, "orders", order.id), { status: 'Confirmed' });

            // Generate WhatsApp confirmation message to customer
            const itemsList = order.items.map(item => `${item.quantity}x ${item.name} (${item.size})`).join(', ');
            const rawMessage = `Hello ${order.customerName},\nYour N-FASHIONS order (${order.id}) has been CONFIRMED.\n\nItems: ${itemsList}\n\nTotal: ₹${order.total}\n\nThank you for shopping with N-FASHIONS.`;
            const message = encodeURIComponent(rawMessage);

            // Open WhatsApp to customer's number
            const customerPhone = getCleanPhone(order.phone);
            const whatsappUrl = `https://wa.me/${customerPhone}?text=${message}`;

            const confirmOpen = confirm(`Opening WhatsApp to send confirmation to customer:\n\nName: ${order.customerName}\nPhone: ${customerPhone}\n\nClick OK to continue.`);

            if (confirmOpen) {
                window.open(whatsappUrl, '_blank');
                toast.success(`Order accepted! WhatsApp opened for ${customerPhone}`);
            } else {
                toast.info("WhatsApp confirmation cancelled");
            }

            fetchOrders();
        } catch (error) {
            console.error("Error accepting order:", error);
            toast.error("Failed to accept order");
        }
    };

    const handleRejectOrder = async (order) => {
        try {
            await updateDoc(doc(db, "orders", order.id), { status: 'Rejected' });

            const rawMessage = `Hello ${order.customerName},\nUnfortunately, your N-FASHIONS order (${order.id}) has been REJECTED.\n\nThis usually occurs due to items going out of stock. Please reply to this message for continued support.`;
            const message = encodeURIComponent(rawMessage);
            const customerPhone = getCleanPhone(order.phone);
            const whatsappUrl = `https://wa.me/${customerPhone}?text=${message}`;

            const confirmOpen = confirm(`Opening WhatsApp to send rejection to customer:\n\nName: ${order.customerName}\nPhone: ${customerPhone}\n\nClick OK to continue.`);

            if (confirmOpen) {
                window.open(whatsappUrl, '_blank');
                toast.success(`Order rejected! WhatsApp opened for ${customerPhone}`);
            }

            fetchOrders();
        } catch (error) {
            console.error("Error rejecting order:", error);
            toast.error("Failed to reject order");
        }
    };

    const handleMessageCustomer = async (order) => {
        try {
            const customerPhone = getCleanPhone(order.phone);
            const whatsappUrl = `https://wa.me/${customerPhone}`;
            window.open(whatsappUrl, '_blank');
        } catch (_) {
            toast.error("Failed to open WhatsApp window.");
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await updateDoc(doc(db, "orders", orderId), { status: newStatus });

            toast.success(`Order marked as ${newStatus}`);
            fetchOrders();
        } catch (error) {
            console.error("Error updating order:", error);
            toast.error("Failed to update order status");
        }
    };

    const deleteMessage = async (id) => {
        if (confirm("Delete this message?")) {
            try {
                await deleteDoc(doc(db, "messages", id));
                fetchMessages();
                toast.success("Message deleted");
            } catch (error) {
                console.error("Error deleting message:", error);
                toast.error("Failed to delete message");
            }
        }
    };

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await updateSettings(appSettings);
            toast.success("Settings updated successfully");
        } catch (_) {
            toast.error("Failed to update settings");
        } finally {
            setSavingSettings(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary pt-40 flex justify-center">
                <div className="animate-pulse font-black text-primary uppercase tracking-[0.3em]">Accessing Control Center...</div>
            </div>
        );
    }

    if (userData?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-secondary pt-40 flex flex-col items-center px-4">
                <Shield className="w-16 h-16 text-red-500 mb-6" />
                <h1 className="text-4xl font-black text-primary tracking-tighter uppercase mb-4">Access Denied</h1>
                <p className="text-primary/60 font-bold uppercase tracking-widest text-center max-w-md">
                    You do not have administrative privileges. Logged in as: <span className="text-primary italic">{currentUser?.email}</span>
                </p>
                <div className="mt-8 flex gap-4">
                    <Button onClick={() => window.location.href = '/'} variant="outline" className="rounded-none border-primary text-primary font-black uppercase tracking-widest px-8">Home</Button>
                    <Button onClick={async () => { await logout(); window.location.href = '/login'; }} className="rounded-none bg-primary text-secondary font-black uppercase tracking-widest px-8">Sign Out</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary pt-28 pb-16 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-primary tracking-tighter uppercase">Admin Control</h1>
                        <div className="h-1 w-12 bg-primary"></div>
                    </div>
                    <div className="flex bg-white shadow-sm border border-primary/5 p-1 overflow-x-auto max-w-full">
                        <Button
                            variant={activeTab === 'products' ? 'default' : 'ghost'}
                            className={`rounded-none px-6 uppercase tracking-wider text-[10px] font-bold ${activeTab === 'products' ? 'bg-primary text-secondary' : 'text-primary'}`}
                            onClick={() => setActiveTab('products')}
                        >
                            <Package className="w-4 h-4 mr-2" /> Catalog
                        </Button>
                        <Button
                            variant={activeTab === 'orders' ? 'default' : 'ghost'}
                            className={`rounded-none px-6 uppercase tracking-wider text-[10px] font-bold ${activeTab === 'orders' ? 'bg-primary text-secondary' : 'text-primary'}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <ShoppingBag className="w-4 h-4 mr-2" /> Orders
                        </Button>
                        <Button
                            variant={activeTab === 'users' ? 'default' : 'ghost'}
                            className={`rounded-none px-6 uppercase tracking-wider text-[10px] font-bold ${activeTab === 'users' ? 'bg-primary text-secondary' : 'text-primary'}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <Users className="w-4 h-4 mr-2" /> Users
                        </Button>
                        <Button
                            variant={activeTab === 'messages' ? 'default' : 'ghost'}
                            className={`rounded-none px-6 uppercase tracking-wider text-[10px] font-bold ${activeTab === 'messages' ? 'bg-primary text-secondary' : 'text-primary'}`}
                            onClick={() => setActiveTab('messages')}
                        >
                            <Mail className="w-4 h-4 mr-2" /> Inbox
                        </Button>
                        <Button
                            variant={activeTab === 'settings' ? 'default' : 'ghost'}
                            className={`rounded-none px-6 uppercase tracking-wider text-[10px] font-bold ${activeTab === 'settings' ? 'bg-primary text-secondary' : 'text-primary'}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings className="w-4 h-4 mr-2" /> Settings
                        </Button>
                    </div>
                </div>

                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Product Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 border border-primary/5 shadow-xl sticky top-28">
                                <h2 className="text-xl font-black mb-6 uppercase tracking-widest text-primary border-b border-primary/10 pb-4">
                                    {isEditing ? 'Edit Item' : 'Create Item'}
                                </h2>
                                <form onSubmit={handleProductSubmit} className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1 block">Title</label>
                                        <input required placeholder="Minimalist Tee..." value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1 block">Price (₹)</label>
                                            <input required type="number" placeholder="1299" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1 block">Collection</label>
                                        <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold uppercase tracking-widest">
                                            <option value="T-Shirts">T-Shirts</option>
                                            <option value="Hoodies">Hoodies</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-2 block">Size Quantities</label>
                                        <div className="grid grid-cols-4 gap-4">
                                            {['S', 'M', 'L', 'XL'].map(size => (
                                                <div key={size}>
                                                    <label className="text-[10px] font-bold uppercase text-primary mb-1 block">{size}</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={productForm.sizes[size] === undefined ? '' : productForm.sizes[size]}
                                                        onChange={(e) => {
                                                            setProductForm({
                                                                ...productForm,
                                                                sizes: {
                                                                    ...productForm.sizes,
                                                                    [size]: e.target.value === '' ? '' : Number(e.target.value)
                                                                }
                                                            });
                                                        }}
                                                        className="w-full px-3 py-2 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold text-center"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1 block">Details</label>
                                        <textarea placeholder="Description of the fabric, cut..." value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium h-32"></textarea>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1 block">Image URL (Optional)</label>
                                            <input placeholder="https://..." value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-px bg-primary/10 flex-1"></div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">OR UPLOAD</span>
                                            <div className="h-px bg-primary/10 flex-1"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1 block">Media Upload</label>
                                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full text-xs text-primary file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-primary file:text-secondary file:font-bold file:uppercase file:tracking-widest cursor-pointer" />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button type="submit" className="flex-1 rounded-none py-6 font-black uppercase tracking-widest" isLoading={uploading}>{isEditing ? 'Save Changes' : 'Publish Item'}</Button>
                                        {isEditing && <Button type="button" variant="outline" className="rounded-none px-6 border-primary/20 text-primary uppercase text-xs font-bold" onClick={() => { setIsEditing(null); setProductForm({ name: '', price: '', category: 'T-Shirts', description: '', image: '', sizes: { S: 0, M: 0, L: 0, XL: 0 } }); setImageFile(null); }}>Discard</Button>}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="lg:col-span-2 space-y-6">
                            {products.length === 0 ? (
                                <div className="text-center py-24 border-2 border-dashed border-primary/10 text-primary/30 uppercase font-black tracking-widest">
                                    Catalog is empty
                                </div>
                            ) : (
                                products.map(product => (
                                    <div key={product.id} className="bg-white p-6 border border-primary/5 shadow-sm hover:shadow-xl transition-all duration-300 flex justify-between items-center group">
                                        <div className="flex gap-6 items-center">
                                            <div className="w-20 h-24 bg-secondary flex-shrink-0 overflow-hidden shadow-inner">
                                                <img src={product.image || "https://placehold.co/100"} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-1 block">{product.category}</span>
                                                <h3 className="font-black text-primary text-xl tracking-tighter uppercase">{product.name}</h3>
                                                <p className="text-sm font-medium text-primary/60 mt-1">₹{product.price} · <span className={product.stock < 10 ? 'text-orange-600 font-bold' : ''}>Stock: {product.stock} units</span></p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button size="icon" variant="outline" className="border-primary/10 text-primary hover:border-primary rounded-none h-12 w-12" onClick={() => handleEditProduct(product)}><Edit className="w-4 h-4" /></Button>
                                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-none h-12 w-12" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-8 max-w-5xl mx-auto">
                        {orders.length === 0 ? (
                            <div className="text-center py-24 border-2 border-dashed border-primary/10 text-primary/30 uppercase font-black tracking-widest">
                                No orders yet
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="bg-white p-8 border border-primary/5 shadow-lg relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${order.status === 'Delivered' ? 'bg-green-500' : order.status === 'Cancelled' ? 'bg-red-500' : order.status === 'Confirmed' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>

                                    <div className="flex justify-between flex-wrap gap-6 mb-6">
                                        <div className="flex-1">
                                            <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-2 block">Order #{order.id.slice(0, 8)}</span>
                                            <h3 className="font-black text-primary text-2xl tracking-tighter uppercase mb-2">{order.customerName}</h3>
                                            <a href={`tel:${order.phone}`} className="text-sm text-blue-600 hover:text-blue-800 font-bold flex items-center gap-2 mb-2">
                                                📞 {order.phone}
                                            </a>
                                            <p className="text-xs text-primary/60 font-medium max-w-md">{order.address}</p>
                                            <p className="text-[10px] text-primary/30 font-bold uppercase tracking-widest mt-2">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Just now'}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-4">
                                            <span className="text-3xl font-black text-primary tracking-tighter">₹{order.total}</span>

                                            {order.status === 'Pending' ? (
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleAcceptOrder(order)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-none font-black uppercase tracking-widest text-xs"
                                                    >
                                                        ACCEPT
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleRejectOrder(order)}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-none font-black uppercase tracking-widest text-xs"
                                                    >
                                                        REJECT
                                                    </Button>
                                                </div>
                                            ) : (
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className={`text-xs font-black uppercase tracking-widest border-2 rounded-none px-4 py-3 outline-none cursor-pointer focus:border-primary transition-colors ${order.status === 'Pending' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                                                        order.status === 'Confirmed' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                                                            order.status === 'Shipped' ? 'text-purple-600 bg-purple-50 border-purple-200' :
                                                                order.status === 'Delivered' ? 'text-green-600 bg-green-50 border-green-200' :
                                                                    'text-red-600 bg-red-50 border-red-200'
                                                        }`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            )}

                                            <Button
                                                onClick={() => handleMessageCustomer(order)}
                                                variant="outline"
                                                className="border-primary/20 text-primary w-full py-2 rounded-none font-black uppercase tracking-widest text-[10px]"
                                            >
                                                💬 MESSAGE
                                            </Button>

                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">
                                                {order.paymentMethod || 'WhatsApp Order'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-secondary/30 p-6 border border-primary/5 rounded-sm">
                                        <h4 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mb-4">Order Items</h4>
                                        <div className="space-y-3">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-primary">
                                                        {item.quantity}x <span className="uppercase tracking-wide">{item.name}</span>
                                                        <span className="text-primary/40 font-medium ml-2">({item.size})</span>
                                                    </span>
                                                    <span className="font-black text-primary">₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6 max-w-5xl mx-auto">
                        <div className="flex justify-between items-end border-b border-primary/10 pb-4">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-widest text-primary">Registered Users</h2>
                                <p className="text-sm text-primary/60 font-medium">Manage all accounts registered on your platform.</p>
                            </div>
                            <div className="bg-primary text-secondary px-6 py-3 rounded-none font-black uppercase tracking-widest flex items-center gap-3 shadow-lg">
                                <Users className="w-5 h-5" />
                                <span>Total Users : {users.length}</span>
                            </div>
                        </div>

                        <div className="bg-white border border-primary/5 shadow-xl overflow-hidden mt-6">
                            <table className="w-full text-left">
                                <thead className="bg-primary text-secondary text-[10px] uppercase tracking-widest font-black">
                                    <tr>
                                        <th className="px-8 py-5">User</th>
                                        <th className="px-8 py-5">Login ID</th>
                                        <th className="px-8 py-5">Role</th>
                                        <th className="px-8 py-5">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center text-primary/30 uppercase font-black tracking-widest italic">No users found</td>
                                        </tr>
                                    ) : (
                                        users.map(u => (
                                            <tr key={u.id || u.uid} className="hover:bg-secondary/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="font-black text-primary uppercase tracking-tight">{u.name}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-xs font-medium text-primary/60 italic">{u.email}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 ${u.role === 'admin' ? 'bg-black text-white' : 'bg-secondary text-primary'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center text-xs text-primary/40 font-bold">
                                                        <Clock className="w-3 h-3 mr-2" />
                                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'New'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {messages.length === 0 ? (
                            <div className="col-span-full text-center py-24 border-2 border-dashed border-primary/10 text-primary/30 uppercase font-black tracking-widestitalic">
                                Inbox is empty
                            </div>
                        ) : (
                            messages.map(msg => (
                                <div key={msg.id} className="bg-white p-8 border border-primary/5 shadow-lg group relative">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="font-black text-primary text-xl tracking-tighter uppercase">{msg.fullName}</h3>
                                            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mt-1">{msg.email}</p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600 rounded-none opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteMessage(msg.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="border-l-4 border-primary pl-6 py-2 mb-6">
                                        <h4 className="text-xs font-black uppercase text-primary/30 mb-2">Subject: {msg.subject}</h4>
                                        <p className="text-sm font-medium text-primary/80 leading-relaxed italic">"{msg.message}"</p>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">
                                        <span>Status: {msg.status}</span>
                                        <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Just now'}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white p-10 border border-primary/5 shadow-xl">
                            <h2 className="text-2xl font-black mb-8 uppercase tracking-widest text-primary border-b border-primary/10 pb-4">Configuration Central</h2>
                            <form onSubmit={handleSettingsSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black uppercase text-primary/30 tracking-[0.2em] border-l-2 border-primary pl-4">Contact Channels</h3>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1 block">Admin Phone</label>
                                            <input value={appSettings.adminPhone} onChange={e => setAppSettings({ ...appSettings, adminPhone: e.target.value })} className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1 block">Admin Email</label>
                                            <input type="email" value={appSettings.adminEmail} onChange={e => setAppSettings({ ...appSettings, adminEmail: e.target.value })} className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1 block">Support Email</label>
                                            <input type="email" value={appSettings.supportEmail} onChange={e => setAppSettings({ ...appSettings, supportEmail: e.target.value })} className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black uppercase text-primary/30 tracking-[0.2em] border-l-2 border-primary pl-4">Business Details</h3>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1 block">Operational Hours</label>
                                            <input value={appSettings.businessHours} onChange={e => setAppSettings({ ...appSettings, businessHours: e.target.value })} className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1 block">Flagship Location</label>
                                            <input value={appSettings.location} onChange={e => setAppSettings({ ...appSettings, location: e.target.value })} className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1 block">WhatsApp Redirect URL</label>
                                            <input value={appSettings.whatsappLink} onChange={e => setAppSettings({ ...appSettings, whatsappLink: e.target.value })} className="w-full px-4 py-3 border border-primary/10 bg-secondary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium" placeholder="https://wa.me/91..." />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-primary/10">
                                    <Button type="submit" className="w-full py-6 font-black uppercase tracking-widest rounded-none shadow-lg" isLoading={savingSettings}>Deploy New Configuration</Button>
                                    <p className="mt-4 text-[10px] text-center text-primary/30 uppercase tracking-[0.2em]">Changes will reflect immediately across all connected channels</p>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
