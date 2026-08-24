import { createContext, useContext, useState, useEffect } from "react";
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const ShopContext = createContext();

export function useShop() {
    return useContext(ShopContext);
}

export function ShopProvider({ children }) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        let unsubscribe = null;

        const setupRealtimeListener = () => {
            const initialProducts = [];

            try {
                unsubscribe = onSnapshot(collection(db, "products"), (querySnapshot) => {
                    const firebaseProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    const formattedDbProducts = firebaseProducts.map(p => ({
                        ...p,
                        name: p.title || p.name,
                        category: p.collection || p.category,
                        description: p.details || p.description,
                        stock: p.inventory || p.stock,
                        collection: (p.collection || p.category || '').toUpperCase()
                    }));

                    const combined = [...initialProducts, ...formattedDbProducts.filter(p => !initialProducts.some(ip => String(ip.id) === String(p.id)))];
                    setProducts(combined);

                    // Keep localStorage synced tightly for any local-first reads dynamically doing hard lookups
                    localStorage.setItem("nf_products", JSON.stringify(combined));
                }, (error) => {
                    console.error("Firebase real-time listen failed:", error);
                    setProducts(initialProducts);
                });
            } catch (err) {
                console.error("Failed setting up real-time products", err);
                setProducts(initialProducts);
            }
        };

        setupRealtimeListener();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const loading = false;

    // Hardcoded categories as per requirements
    const categories = {
        tshirts: ["Printed", "Plain", "Oversized", "Polo"],
        hoodies: ["Zip-up", "Pullover", "Printed", "Plain"]
    };

    const getMainCategories = () => ["T-Shirts", "Hoodies"];

    const value = {
        products,
        categories,
        getMainCategories,
        loading
    };

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
}
