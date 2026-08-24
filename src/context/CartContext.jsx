import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const { currentUser } = useAuth();

    const [cartLoaded, setCartLoaded] = useState(false);

    useEffect(() => {
        let mounted = true;

        const loadCart = async () => {
            setCartLoaded(false);
            let fetchedCart = [];

            if (currentUser) {
                try {
                    const docRef = doc(db, "carts", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().items) {
                        fetchedCart = docSnap.data().items;
                    } else {
                        // Attempt to migrate guest cart on first login if empty remote cart
                        const localGuest = localStorage.getItem("nf_cart_guest");
                        if (localGuest) {
                            fetchedCart = JSON.parse(localGuest);
                            localStorage.removeItem("nf_cart_guest"); // Clear it out
                        }
                    }
                } catch (e) {
                    console.error("Failed to load Firebase cart", e);
                }
            } else {
                const localCart = localStorage.getItem("nf_cart_guest");
                if (localCart) {
                    try {
                        fetchedCart = JSON.parse(localCart);
                    } catch (e) {
                        console.error("Failed to parse local cart", e);
                    }
                }
            }

            if (mounted) {
                setCart(fetchedCart);
                setCartLoaded(true);
            }
        };

        loadCart();

        // Used by other parts to force sync across tabs if needed
        window.addEventListener('cart_updated', loadCart);
        return () => {
            mounted = false;
            window.removeEventListener('cart_updated', loadCart);
        };
    }, [currentUser]);

    useEffect(() => {
        if (!cartLoaded) return;

        const saveCart = async () => {
            if (currentUser) {
                try {
                    await setDoc(doc(db, "carts", currentUser.uid), {
                        userId: currentUser.uid,
                        userEmail: currentUser.email || '',
                        userName: currentUser.displayName || 'User',
                        items: cart.map(item => ({
                            id: item.id || item.productId || '',
                            name: item.name || '',
                            title: item.title || item.name || '',
                            price: Number(item.price) || 0,
                            quantity: Number(item.quantity) || 1,
                            size: item.size || '',
                            sizes: item.sizes || [],
                            image: item.image || '',
                            collection: item.collection || item.category || '',
                            details: item.details || item.description || ''
                        })),
                        updatedAt: new Date().toISOString()
                    }, { merge: true });
                } catch (error) {
                    console.error("Error saving cart to Firebase", error);
                }
            } else {
                localStorage.setItem("nf_cart_guest", JSON.stringify(cart));
            }
        };

        saveCart();
    }, [cart, currentUser, cartLoaded]);

    const addToCart = (product, size, quantity = 1) => {
        const prodId = product.id || product.productId;
        const availableStock = typeof product.sizes === 'object' && product.sizes !== null && !Array.isArray(product.sizes)
            ? (product.sizes[size] || 0)
            : (product.inventory !== undefined ? product.inventory : (product.stock || 0));

        if (availableStock <= 0) return;

        setCart(prev => {
            const existing = prev.find(item => (item.id === prodId || item.productId === prodId) && item.size === size);
            if (existing) {
                const newQty = Math.min(existing.quantity + quantity, availableStock);
                return prev.map(item =>
                    ((item.id === prodId || item.productId === prodId) && item.size === size)
                        ? { ...item, quantity: newQty }
                        : item
                );
            }
            const initialQty = Math.min(quantity, availableStock);
            return [...prev, { ...product, id: prodId, size, quantity: initialQty }];
        });
    };

    const removeFromCart = (productId, size) => {
        setCart(prev => prev.filter(item => {
            const itemId = item.productId || item.id;
            return !(itemId == productId && item.size === size);
        }));
    };

    const updateQuantity = (productId, size, quantity) => {
        setCart(prev => prev.map(item => {
            const itemId = item.productId || item.id;
            if (itemId == productId && item.size === size) {
                const availableStock = typeof item.sizes === 'object' && item.sizes !== null && !Array.isArray(item.sizes)
                    ? (item.sizes[size] || 0)
                    : (item.inventory !== undefined ? item.inventory : (item.stock || 0));
                const targetQty = availableStock > 0 ? Math.min(Math.max(1, quantity), availableStock) : 1;
                return { ...item, quantity: targetQty };
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
