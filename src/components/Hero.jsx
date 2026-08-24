import { Link } from 'react-router-dom';
import { motion as M } from 'framer-motion';
import { Button } from './ui/Button';

export default function Hero() {
    return (
        <div className="relative bg-secondary min-h-[90vh] flex items-center overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-5">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>
            </div>

            <div className="container mx-auto px-4 z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <M.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8"
                >
                    <h1 className="text-5xl md:text-7xl font-black text-primary leading-[1.1] tracking-tighter mb-4">
                        REDEFINE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                            STREETWEAR
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-primary/70 max-w-2xl leading-relaxed font-medium">
                        Premium heavyweight hoodies and oversized tees. Crafted for those who appreciate minimalism and quality.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/shop">
                            <Button size="lg" className="bg-primary text-secondary hover:bg-primary/90 px-8 py-6 text-lg rounded-none uppercase tracking-widest w-full sm:w-auto">
                                Shop Collection
                            </Button>
                        </Link>
                        <Link to="/shop?category=hoodies">
                            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-secondary px-8 py-6 text-lg rounded-none uppercase tracking-widest w-full sm:w-auto">
                                View Hoodies
                            </Button>
                        </Link>
                    </div>
                </M.div>

                <M.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="relative"
                >
                    <div className="relative z-10 aspect-[4/5] md:aspect-square lg:aspect-[4/5] max-h-[80vh] overflow-hidden rounded-none shadow-2xl border-8 border-primary">
                        <img
                            src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2864&auto=format&fit=crop"
                            alt="Premium Streetwear Apparel"
                            className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-primary/20 z-0 hidden md:block"></div>
                </M.div>
            </div>
        </div>
    );
}
