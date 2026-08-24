import { useShop } from '../context/ShopContext';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';

export default function FeaturedProducts() {
    const { products } = useShop();

    const displayProducts = products.length > 0 ? products.slice(0, 4) : [];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.4em] mb-2 block">Our Favorites</span>
                        <h2 className="text-4xl font-black text-primary tracking-tighter uppercase leading-tight">New Arrivals</h2>
                        <div className="h-1.5 w-16 bg-primary mt-2"></div>
                    </div>
                    <Link to="/shop" className="text-primary font-black uppercase tracking-widest text-xs hover:opacity-100 opacity-60 transition-all border-b-2 border-primary/10 hover:border-primary pb-2">View Catalog</Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {displayProducts.map((product) => (
                        <ProductCard key={product.id} product={product} showInspect={true} />
                    ))}
                </div>
            </div>
        </section>
    );
}
