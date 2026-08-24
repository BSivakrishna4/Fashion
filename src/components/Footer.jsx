import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSettings } from '../lib/settings';

export default function Footer() {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        getSettings().then(setSettings);
    }, []);

    const address = settings?.location || '123 Fashion Street, Style City';

    return (
        <footer className="w-full bg-primary text-secondary pt-16 pb-8 border-t border-secondary/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="text-2xl font-bold tracking-tighter mb-4">N-FASHIONS</h3>
                        <p className="text-secondary/60 text-sm leading-relaxed">
                            Elevating everyday essentials. Premium t-shirts and hoodies designed for the modern individual.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold uppercase tracking-widest text-sm mb-6">Shop</h4>
                        <ul className="space-y-3 text-secondary/70">
                            <li><Link to="/shop" className="hover:text-secondary transition-colors">All Products</Link></li>
                            <li><Link to="/shop?category=tshirts" className="hover:text-secondary transition-colors">T-Shirts</Link></li>
                            <li><Link to="/shop?category=hoodies" className="hover:text-secondary transition-colors">Hoodies</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold uppercase tracking-widest text-sm mb-6">Support</h4>
                        <ul className="space-y-3 text-secondary/70">
                            <li><Link to="/support" className="hover:text-secondary transition-colors">Support</Link></li>
                            <li><Link to="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
                            <li><Link to="/shipping-returns" className="hover:text-secondary transition-colors">Shipping & Returns</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold uppercase tracking-widest text-sm mb-6">Address</h4>
                        <p className="text-secondary/60 text-sm leading-relaxed whitespace-pre-line">
                            {address}
                        </p>
                    </div>
                </div>
                <div className="border-t border-secondary/10 pt-8 flex flex-col md:flex-row justify-between items-center text-secondary/40 text-sm">
                    <p>&copy; 2026 N-FASHIONS. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
