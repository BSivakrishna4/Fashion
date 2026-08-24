import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Search } from 'lucide-react';

const FAQ = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            question: "How do I track my order?",
            answer: "Once your order is shipped, you will receive a tracking ID via SMS and email. You can enter this ID on our logistics partner's website or click the link in the message to see real-time updates."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We currently accept Cash on Delivery (COD) for all orders. This ensures you can pay when you receive your stylish new outfits."
        },
        {
            question: "Can I cancel my order?",
            answer: "Yes, you can cancel your order within 2 hours of placing it. Go to 'My Orders' in your profile or call us at 8919554973 for immediate cancellation."
        },
        {
            question: "Do you deliver to my city?",
            answer: "We deliver to most major cities and towns across India. You can check the availability of delivery for your pincode at the checkout page."
        },
        {
            question: "What if the size doesn't fit?",
            answer: "No worries! We offer a 7-day exchange policy. If the size isn't right, you can request an exchange through the support team by calling 8919554973."
        }
    ];

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
                <p className="text-gray-600">Find quick answers to your questions about our services and products.</p>
            </motion.div>

            <div className="relative mb-12 max-w-xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent sm:text-sm transition-all shadow-sm"
                    placeholder="Search for questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-lg font-bold text-gray-900">{faq.question}</span>
                                <div className="shrink-0 ml-4 p-1 bg-gray-100 rounded-full">
                                    {openIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No questions found matching your search.</p>
                    </div>
                )}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-16 text-center"
            >
                <p className="text-gray-600 mb-4">Didn't find what you were looking for?</p>
                <a href="tel:8919554973" className="text-black font-bold text-lg hover:underline decoration-2 underline-offset-4">
                    Call us at 8919554973
                </a>
            </motion.div>
        </div>
    );
};

export default FAQ;
