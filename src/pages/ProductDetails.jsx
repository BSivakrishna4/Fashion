import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from '../components/ui/Button';
import { Minus, Plus, ShoppingBag, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export default function ProductDetails() {
    const location = useLocation();
    const { id: paramId } = useParams();
    const { products: contextProducts } = useShop();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isSubscribed = true;
        const params = new URLSearchParams(location.search);
        const productId = params.get("id") || paramId;

        const localProducts = JSON.parse(localStorage.getItem("nf_products")) || [];
        let found = localProducts.find(p => p.id == productId);

        if (!found && contextProducts) {
            found = contextProducts.find(p => p.id == productId);
        }

        Promise.resolve().then(() => {
            if (isSubscribed) {
                setProduct(found);
                setLoading(false);
            }
        });

        return () => { isSubscribed = false; };
    }, [location.search, paramId, contextProducts]);

    const getAvailableStock = (sizeToVerify) => {
        if (!product) return 0;
        if (typeof product.sizes === 'object' && product.sizes !== null && !Array.isArray(product.sizes)) {
            if (!sizeToVerify) return product.inventory || product.stock || 0; // fallback if no size selected
            return product.sizes[sizeToVerify] || 0;
        }
        // Backward compatibility
        if (sizeToVerify && Array.isArray(product.sizes) && !product.sizes.includes(sizeToVerify)) return 0;
        return product.inventory || product.stock || 0;
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error("Please select a size");
            return;
        }

        const availableStock = getAvailableStock(selectedSize);
        if (quantity > availableStock) {
            toast.error(`Only ${availableStock} items available in stock.`);
            return;
        }

        addToCart(product, selectedSize, quantity);
        toast.success("Added to cart");
    };

    const handleWishlistToggle = () => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
            toast.success("Removed from wishlist");
        } else {
            addToWishlist(product);
            toast.success("Added to wishlist");
        }
    };

    const displayImage = product?.image && product.image !== "undefined" && product.image.trim() !== ""
        ? product.image
        : "https://placehold.co/600x800?text=Product+Image";

    if (loading) return <div className="min-h-screen pt-24 text-center bg-secondary">Loading...</div>;

    if (!product) return (
        <div className="min-h-screen pt-24 text-center bg-secondary flex items-center justify-center">
            <h2 className="text-2xl font-bold text-primary">Product not available</h2>
        </div>
    );

    return (
        <div className="min-h-screen bg-secondary pt-24 pb-16">
            <Helmet>
                <title>{product.title || product.name} | N-FASHIONS</title>
                <meta name="description" content={(product.details || product.description || "Premium fashion apparel").substring(0, 160)} />
            </Helmet>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">

                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-[4/5] md:aspect-square bg-white border border-primary/5 rounded-none overflow-hidden shadow-xl max-h-[500px] md:max-h-[600px] mx-auto">
                            <img
                                src={displayImage}
                                alt={product.title || product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "https://placehold.co/600x800?text=Image+Unavailable";
                                }}
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center">
                        <div className="mb-4">
                            <span className="inline-block px-4 py-1 text-xs font-bold text-secondary bg-primary rounded-none uppercase tracking-widest">
                                {product.collection || product.category}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-primary mb-6 tracking-tighter uppercase leading-tight">{product.title || product.name}</h1>
                        <div className="mb-8">
                            <span className="text-3xl font-bold text-primary mr-6">₹{product.price || 0}</span>
                            <span className="text-xl text-primary/40 line-through">₹{(product.price || 0) + 700}</span>
                        </div>

                        <div className="mb-10">
                            <h3 className="font-bold text-primary mb-4 uppercase tracking-wider text-[11px] flex justify-between items-center">
                                <span>Select Size</span>
                                <span className="text-primary/40 text-[10px] cursor-pointer hover:underline">Size Guide</span>
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {(['S', 'M', 'L', 'XL']).map(size => {
                                    const isAvailable = getAvailableStock(size) > 0;

                                    return (
                                        <button
                                            key={size}
                                            disabled={!isAvailable}
                                            onClick={() => setSelectedSize(size)}
                                            className={`w-11 h-11 flex items-center justify-center text-xs font-bold transition-all border ${!isAvailable ? 'opacity-30 cursor-not-allowed bg-transparent text-primary/50 border-primary/10' : selectedSize === size ? 'bg-primary text-secondary border-primary shadow-lg scale-110' : 'bg-transparent text-primary border-primary/20 hover:border-primary'}`}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mb-8 p-6 bg-white border border-primary/5 shadow-sm">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="flex items-center border border-primary/20">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"><Minus className="w-3 h-3" /></button>
                                    <span className="w-10 text-center font-bold text-base">{quantity}</span>
                                    <button
                                        onClick={() => {
                                            const availableStock = getAvailableStock(selectedSize);
                                            if (quantity < availableStock) {
                                                setQuantity(quantity + 1);
                                            }
                                        }}
                                        disabled={quantity >= getAvailableStock(selectedSize) || getAvailableStock(selectedSize) <= 0}
                                        className={`w-10 h-10 flex items-center justify-center transition-colors ${quantity >= getAvailableStock(selectedSize) || getAvailableStock(selectedSize) <= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-secondary'}`}
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                <span className="text-[10px] font-bold text-primary/50 uppercase tracking-widest">
                                    {getAvailableStock(selectedSize) > 0 ? `${getAvailableStock(selectedSize)} items left${selectedSize ? ` in ${selectedSize}` : ''}` : 'Out of Stock'}
                                </span>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    size="lg"
                                    className={`flex-1 gap-3 py-6 text-sm md:text-base font-black uppercase tracking-widest rounded-none shadow-xl transition-transform ${getAvailableStock(selectedSize) <= 0 ? 'opacity-50 cursor-not-allowed bg-primary/80' : 'hover:scale-[1.02]'}`}
                                    onClick={handleAddToCart}
                                    disabled={getAvailableStock(selectedSize) <= 0}
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    {getAvailableStock(selectedSize) > 0 ? 'Add to Shopping Bag' : 'Out of Stock'}
                                </Button>
                                <Button
                                    size="icon"
                                    variant={isInWishlist(product.id) ? "default" : "outline"}
                                    className={`h-14 w-14 md:h-16 md:w-16 border-primary/20 text-primary rounded-none transition-colors ${isInWishlist(product.id) ? 'bg-primary text-secondary border-primary' : 'hover:border-primary text-primary bg-transparent'}`}
                                    onClick={handleWishlistToggle}
                                >
                                    <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                                </Button>
                            </div>
                        </div>

                        <div className="text-primary/70 leading-relaxed border-t border-primary/10 pt-8">
                            <h3 className="font-black text-primary mb-4 uppercase tracking-widest text-sm">Description</h3>
                            <p className="text-base">{product.details || product.description || "Crafted with premium materials for the ultimate comfort and aesthetic."}</p>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li className="flex items-center gap-2">• 100% Premium Material</li>
                                <li className="flex items-center gap-2">• Built for extra comfort</li>
                                <li className="flex items-center gap-2">• Sustainable fabric</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
