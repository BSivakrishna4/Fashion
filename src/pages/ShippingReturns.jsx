import React from 'react';
import { motion } from 'framer-motion';
import { Truck, RotateCcw, Box, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

const ShippingReturns = () => {
    const sections = [
        {
            title: "Shipping Policy",
            icon: <Truck size={24} />,
            content: "We provide secure shipping on all orders. Standard delivery time is 3-5 business days depending on your location."
        },
        {
            title: "Easy Returns",
            icon: <RotateCcw size={24} />,
            content: [
                "We offer a 7-day hassle-free return policy.",
                "Items must be unworn, unwashed and in their original packaging with tags intact.",
                "Reverse pickup will be arranged by us within 48 hours of your return request.",
                "Refunds are processed within 5-7 working days after quality check."
            ]
        },
        {
            title: "Exchanges",
            icon: <Box size={24} />,
            content: [
                "Size exchange is subject to availability of the same product.",
                "Exchange request must be placed within 7 days of delivery.",
                "First exchange is free of cost. Subsequent exchanges might incur shipping charges."
            ]
        },
        {
            title: "Damaged Items",
            icon: <ShieldCheck size={24} />,
            content: [
                "If you receive a damaged or wrong product, please contact us immediately at 8919554973.",
                "An unboxing video is highly recommended for faster resolution of transit damage claims."
            ]
        }
    ];

    return (
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping & Returns</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Everything you need to know about how we get your items to you and what happens if you need to send them back.
                </p>
            </motion.div>

            <div className="space-y-8">
                {sections.map((section, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-gray-50 rounded-xl text-black">
                                {section.icon}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                        </div>
                        {Array.isArray(section.content) ? (
                            <ul className="space-y-4">
                                {section.content.map((item, i) => (
                                    <li key={i} className="flex gap-4 text-gray-600">
                                        <span className="w-1.5 h-1.5 bg-black rounded-full mt-2.5 shrink-0"></span>
                                        <p>{item}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-600 leading-relaxed">{section.content}</p>
                        )}
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-16 bg-black text-white rounded-3xl p-8 text-center"
            >
                <HelpCircle size={40} className="mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
                <p className="text-gray-400 mb-6">Our support team is just a call away.</p>
                <a href="tel:8919554973" className="inline-block px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors">
                    Contact Support
                </a>
            </motion.div>
        </div>
    );
};

export default ShippingReturns;
