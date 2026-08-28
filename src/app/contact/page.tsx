'use client';

import React, { useState } from 'react';
import { Mail, Phone, Instagram, Send } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const { settings, addToast } = useAppStore();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Message sent! We will respond shortly.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="py-12 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">Get in Touch</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Have questions about an existing order or need help picking a gift? We are here for you!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Contact Channels</h3>

            <div className="space-y-4 text-xs text-gray-600">
              <a
                href={`https://wa.me/${settings.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-[#25D366]/10 text-emerald-800 rounded-2xl border border-emerald-200 hover:bg-[#25D366]/20 transition-colors"
              >
                <Phone className="w-5 h-5 text-[#25D366]" />
                <div>
                  <span className="block font-bold text-sm">WhatsApp Studio Support</span>
                  <span>Direct chat: +{settings.whatsapp_number}</span>
                </div>
              </a>

              <a
                href={`https://instagram.com/${settings.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <Instagram className="w-5 h-5 text-[#C86D51]" />
                <div>
                  <span className="block font-bold text-sm">Instagram DM</span>
                  <span>@{settings.instagram_handle}</span>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="block font-bold text-sm">Email Support</span>
                  <span>{settings.contact_email}</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Send a Message</h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
              />
            </div>

            <Button type="submit" className="w-full py-3 text-xs font-semibold flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
