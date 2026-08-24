import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import CategorySection from '../components/CategorySection';
import FeaturedProducts from '../components/FeaturedProducts';
import { Truck, ShieldCheck, Tag } from 'lucide-react';

export default function Home() {
    return (
        <div className="bg-secondary min-h-screen pt-20">
            <Helmet>
                <title>N-FASHIONS | Premium Bio-Wash T-Shirts & Heavyweight Hoodies</title>
                <meta name="description" content="Shop premium T-Shirts and Hoodies at N-FASHIONS. Minimalist streetwear designed for comfort and style." />
            </Helmet>
            <Hero />
            <CategorySection />
            <FeaturedProducts />

            {/* Why Choose Us */}
            <section className="py-24 bg-white border-t border-primary/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-primary tracking-tighter mb-4 uppercase">Why Choose Us</h2>
                        <div className="h-1 w-20 bg-primary mx-auto"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center p-8 bg-secondary/30 border border-primary/5 hover:border-primary/20 transition-colors duration-300">
                            <div className="bg-primary text-secondary w-16 h-16 flex items-center justify-center mx-auto mb-6 rounded-none shadow-lg">
                                <Tag className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-primary uppercase tracking-wide">Premium Quality</h3>
                            <p className="text-primary/70 leading-relaxed">
                                Curated fabrics that stand the test of time. 100% Bio-wash cotton for ultimate comfort.
                            </p>
                        </div>
                        <div className="text-center p-8 bg-secondary/30 border border-primary/5 hover:border-primary/20 transition-colors duration-300">
                            <div className="bg-primary text-secondary w-16 h-16 flex items-center justify-center mx-auto mb-6 rounded-none shadow-lg">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-primary uppercase tracking-wide">Minimalist Design</h3>
                            <p className="text-primary/70 leading-relaxed">
                                Clean lines and essential colors. Fashion that speaks for itself without being loud.
                            </p>
                        </div>
                        <div className="text-center p-8 bg-secondary/30 border border-primary/5 hover:border-primary/20 transition-colors duration-300">
                            <div className="bg-primary text-secondary w-16 h-16 flex items-center justify-center mx-auto mb-6 rounded-none shadow-lg">
                                <Truck className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-primary uppercase tracking-wide">Fast Delivery</h3>
                            <p className="text-primary/70 leading-relaxed">
                                From our warehouse to your wardrobe in record time. Free shipping on orders over ₹999.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
