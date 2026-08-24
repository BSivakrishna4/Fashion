import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import { getSettings } from '../lib/settings';
import { useState, useEffect } from 'react';

const Support = () => {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        getSettings().then(setSettings);
    }, []);

    return (
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Customer Support</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    We're here to help you with anything you need. Our team is available to assist you with your orders, products, and more.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center"
                >
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                        <Phone size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Call Us</h3>
                    <p className="text-gray-600 mb-4">Available {settings?.businessHours || 'Mon-Sat, 9AM-8PM'}</p>
                    <a href={`tel:${settings?.adminPhone || '8919554973'}`} className="text-2xl font-bold text-black hover:underline tracking-wider">
                        {settings?.adminPhone || '8919554973'}
                    </a>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center"
                >
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Email Us</h3>
                    <p className="text-gray-600 mb-4">We'll respond within 24 hours</p>
                    <a href={`mailto:${settings?.supportEmail || 'support@n-fashions.com'}`} className="text-lg font-semibold text-black hover:underline">
                        {settings?.supportEmail || 'support@n-fashions.com'}
                    </a>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center"
                >
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Business Hours</h3>
                    <p className="text-gray-600 mb-1">Standard Operations</p>
                    <p className="text-lg font-semibold text-black">{settings?.businessHours || '9:00 AM - 8:00 PM'}</p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between"
            >
                <div className="mb-8 md:mb-0 md:mr-8 text-center md:text-left">
                    <h2 className="text-3xl font-bold mb-4">Need immediate help?</h2>
                    <p className="text-gray-600 text-lg">
                        Our experts are ready to assist you. Get in touch directly for any urgent queries.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <motion.a
                        whileTap={{ scale: 0.95 }}
                        href={`tel:${settings?.adminPhone || '8919554973'}`}
                        className="px-8 py-4 bg-black text-white rounded-full font-bold text-center hover:bg-gray-800 transition-colors"
                    >
                        Call Support
                    </motion.a>
                    <motion.a
                        whileTap={{ scale: 0.95 }}
                        href={settings?.whatsappLink || 'https://wa.me/918919554973'}
                        className="px-8 py-4 bg-green-600 text-white rounded-full font-bold text-center hover:bg-green-700 transition-colors"
                    >
                        WhatsApp Us
                    </motion.a>
                </div>
            </motion.div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <ShieldCheck className="text-black" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold mb-1">Safe & Secure</h4>
                        <p className="text-gray-600 text-sm">Every interaction you have with us is encrypted and monitored for your safety.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <Clock className="text-black" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold mb-1">Fast Response</h4>
                        <p className="text-gray-600 text-sm">We value your time. Most queries are resolved within hours of contact.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
