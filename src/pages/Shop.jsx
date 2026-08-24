import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { Filter, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Shop() {
    const { products: allProducts } = useShop();
    const [searchParams] = useSearchParams();

    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
    const [selectedSize, setSelectedSize] = useState('All');
    const [priceRange, setPriceRange] = useState(2000);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        let isSubscribed = true;
        const cat = searchParams.get('category');
        if (cat) {
            let targetCategory = 'All';
            if (cat.toLowerCase().includes('shirt')) targetCategory = 'T-Shirts';
            else if (cat.toLowerCase().includes('hoodie')) targetCategory = 'Hoodies';
            
            Promise.resolve().then(() => {
                if (isSubscribed) setSelectedCategory(targetCategory);
            });
        }
        return () => { isSubscribed = false; };
    }, [searchParams]);

    const searchQuery = searchParams.get('search') || '';

    const filteredProducts = allProducts.filter(product => {
        const matchCategory = selectedCategory === 'All' ||
            product.category.toLowerCase() === selectedCategory.toLowerCase();
            
        let matchSize = selectedSize === 'All';
        if (!matchSize && product.sizes) {
            if (Array.isArray(product.sizes)) {
                matchSize = product.sizes.includes(selectedSize);
            } else if (typeof product.sizes === 'object' && product.sizes !== null) {
                matchSize = product.sizes[selectedSize] > 0;
            }
        }

        const matchPrice = product.price <= priceRange;
        const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchCategory && matchSize && matchPrice && matchSearch;
    });

    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const mainCategories = ["All", "T-Shirts", "Hoodies"];

    return (
        <div className="min-h-screen bg-secondary pt-24 pb-16">
            <Helmet>
                <title>Shop Collection | N-FASHIONS</title>
                <meta name="description" content="Shop our premium collection of T-Shirts and Hoodies. Minimalist designs, high-quality fabrics." />
            </Helmet>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-primary tracking-tighter uppercase">Shop Collection</h1>
                        {searchQuery && <p className="text-primary/60 mt-2 font-medium">Showing results for: "{searchQuery}"</p>}
                    </div>
                    <Button variant="outline" className="md:hidden border-primary text-primary" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                        <Filter className="w-4 h-4 mr-2" /> Filters
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-12">

                    {/* Filters Sidebar */}
                    <aside className={`md:w-64 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden'} md:block`}>
                        <div className="sticky top-24 space-y-8">
                            <div className="flex justify-between items-center md:hidden mb-4">
                                <h2 className="text-xl font-bold text-primary uppercase">Filters</h2>
                                <Button variant="ghost" size="sm" onClick={() => setIsFilterOpen(false)}><X className="w-4 h-4 text-primary" /></Button>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <h3 className="font-bold mb-4 text-primary uppercase tracking-wider text-sm border-b border-primary/10 pb-2">Categories</h3>
                                <div className="space-y-3">
                                    {mainCategories.map(cat => (
                                        <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                                            <div className={`w-4 h-4 border transition-colors flex items-center justify-center ${selectedCategory === cat ? 'bg-primary border-primary' : 'border-primary/40 group-hover:border-primary'}`}>
                                                {selectedCategory === cat && <div className="w-2 h-2 bg-secondary"></div>}
                                            </div>
                                            <input
                                                type="radio"
                                                name="category"
                                                className="hidden"
                                                checked={selectedCategory === cat}
                                                onChange={() => setSelectedCategory(cat)}
                                            />
                                            <span className={`text-sm uppercase tracking-wide transition-colors ${selectedCategory === cat ? 'text-primary font-bold' : 'text-primary/70 group-hover:text-primary'}`}>{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div>
                                <h3 className="font-bold mb-4 text-primary uppercase tracking-wider text-sm border-b border-primary/10 pb-2">Max Price: ₹{priceRange}</h3>
                                <input
                                    type="range"
                                    min="500"
                                    max="2000"
                                    step="100"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(Number(e.target.value))}
                                    className="w-full h-1 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-xs text-primary/50 mt-2 font-medium">
                                    <span>₹500</span>
                                    <span>₹2000+</span>
                                </div>
                            </div>

                            {/* Size Filter */}
                            <div>
                                <h3 className="font-bold mb-4 text-primary uppercase tracking-wider text-sm border-b border-primary/10 pb-2">Sizes</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedSize('All')}
                                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${selectedSize === 'All' ? 'bg-primary text-secondary border-primary' : 'bg-transparent text-primary border-primary/20 hover:border-primary'}`}
                                    >
                                        All
                                    </button>
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`w-10 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider border transition-all ${selectedSize === size ? 'bg-primary text-secondary border-primary' : 'bg-transparent text-primary border-primary/20 hover:border-primary'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <main className="flex-1">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-32 border border-dashed border-primary/20">
                                <h3 className="text-xl font-bold text-primary mb-2">No products available</h3>
                                <p className="text-primary/60 mb-6">Try adjusting your filters to find what you're looking for.</p>
                                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-secondary" onClick={() => { setSelectedCategory('All'); setSelectedSize('All'); setPriceRange(2000); }}>
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </main>

                </div>
            </div>
        </div>
    );
}
