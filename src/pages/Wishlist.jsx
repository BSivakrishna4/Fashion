import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { HeartCrack } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Wishlist() {
    const { wishlist } = useWishlist();

    return (
        <div className="min-h-screen pt-24 pb-16 bg-secondary">
            <Helmet>
                <title>My Wishlist | N-FASHIONS</title>
            </Helmet>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-10">My Wishlist</h1>

                {wishlist.length === 0 ? (
                    <div className="text-center py-20 border border-primary/10 bg-white">
                        <HeartCrack className="w-16 h-16 mx-auto mb-4 text-primary/20" />
                        <h2 className="text-2xl font-bold text-primary mb-4 uppercase tracking-widest">Wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't added any items to your wishlist yet. Explore our collection and add your favorites here.</p>
                        <Link to="/shop">
                            <Button size="lg" className="rounded-none uppercase tracking-widest font-bold">Discover Products</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {wishlist.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
