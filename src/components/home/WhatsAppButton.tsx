'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function WhatsAppButton() {
  const { settings } = useAppStore();

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent(
      'Hi Loops of Love! 🌸 I would like to inquire about your handmade crochet products.'
    );
    window.open(`https://wa.me/${settings.whatsapp_number}?text=${text}`, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />
      {/* Button */}
      <span className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] rounded-full shadow-xl text-white transition-colors duration-300">
        <MessageCircle className="w-6 h-6" />
      </span>
    </button>
  );
}
