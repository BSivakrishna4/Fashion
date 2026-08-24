import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

export default function ProductCard({ product, showInspect = false }) {

    const displayImage = product.image && product.image !== "undefined" && product.image.trim() !== ""
        ? product.image
        : "https://placehold.co/400x500?text=Product";

    return (
        <div className="group relative bg-white border border-primary/5 rounded-none overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="aspect-[3/4] bg-secondary/20 relative overflow-hidden">
                {/* Make the entire image a clickable link */}
                <Link to={`/product.html?id=${product.id}`} className="block w-full h-full text-transparent">
                    <img
                        src={displayImage}
                        alt={product.title || product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://placehold.co/400x500?text=Image+Unavailable";
                        }}
                    />
                </Link>

                {showInspect && (
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <Link
                            to={`/product.html?id=${product.id}`}
                            className="pointer-events-auto flex items-center justify-center rounded-full bg-secondary text-primary hover:bg-secondary/90 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 h-10 w-10"
                        >
                            <Eye className="w-5 h-5" />
                        </Link>
                    </div>
                )}
            </div>

            <div className="p-4 bg-white">
                <h3 className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">{product.collection || product.category}</h3>
                <Link to={`/product.html?id=${product.id}`}>
                    <h2 className="text-base font-bold text-primary mb-2 truncate group-hover:text-primary/70 transition-colors uppercase tracking-wide">{product.title || product.name}</h2>
                </Link>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">₹{product.price}</span>
                </div>
            </div>
        </div>
    );
}
