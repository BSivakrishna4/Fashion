import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CategorySection() {
    return (
        <section className="py-24 bg-secondary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter mb-4 uppercase">The Essentials</h2>
                    <div className="h-1.5 w-24 bg-primary mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                    {/* T-Shirts Category */}
                    <Link to="/shop?category=tshirts" className="block group relative overflow-hidden h-[300px] md:h-[400px] shadow-2xl">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full h-full"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Premium T-Shirts"
                                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-700 flex items-end p-12">
                                <div className="text-left">
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mb-2 block transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Premium Cotton</span>
                                    <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">T-Shirts</h3>
                                    <div className="w-12 h-1 bg-white mb-6 group-hover:w-full transition-all duration-700 ease-out"></div>
                                    <span className="text-white text-xs font-black uppercase tracking-widest border border-white/30 px-6 py-3 hover:bg-white hover:text-black transition-all">Explore Collection</span>
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Hoodies Category */}
                    <Link to="/shop?category=hoodies" className="block group relative overflow-hidden h-[300px] md:h-[400px] shadow-2xl">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full h-full"
                        >
                            <img
                                src="/grey-hoodie.png"
                                alt="Premium Hoodies"
                                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-700 flex items-end p-12">
                                <div className="text-left">
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mb-2 block transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Heavyweight Fleece</span>
                                    <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">Hoodies</h3>
                                    <div className="w-12 h-1 bg-white mb-6 group-hover:w-full transition-all duration-700 ease-out"></div>
                                    <span className="text-white text-xs font-black uppercase tracking-widest border border-white/30 px-6 py-3 hover:bg-white hover:text-black transition-all">Explore Collection</span>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
