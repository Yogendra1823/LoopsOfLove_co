'use client';

import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings } from '@/lib/data-service';
import { SiteSettings } from '@/types';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Settings, Save, Sparkles, Phone, Instagram, Truck } from 'lucide-react';

export default function AdminSettingsPage() {
  const { addToast } = useAppStore();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await updateSiteSettings(settings);
      addToast('success', 'Studio & Storefront settings saved successfully!');
    } catch (err) {
      addToast('error', 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-16 text-center text-xs text-gray-500 bg-[#FAF4E8] min-h-screen">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="py-8 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E8DEC9] shadow-sm flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Storefront Settings</h1>
            <p className="text-xs text-gray-500">Configure announcement marquee banner, WhatsApp contact, Instagram, and shipping fee thresholds</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#C86D51]/10 text-[#C86D51] flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-5 text-xs">
          <div>
            <label className="flex items-center gap-1.5 font-semibold text-gray-700 mb-1">
              <Sparkles className="w-4 h-4 text-[#C86D51]" /> Announcement Bar Marquee Text
            </label>
            <input
              type="text"
              value={settings.announcement_text}
              onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">Displays on the animated marquee banner across all customer pages.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 font-semibold text-gray-700 mb-1">
                <Instagram className="w-4 h-4 text-[#C86D51]" /> Instagram Handle
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">@</span>
                <input
                  type="text"
                  value={settings.instagram_handle}
                  onChange={(e) => setSettings({ ...settings, instagram_handle: e.target.value.replace('@', '') })}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 font-semibold text-gray-700 mb-1">
                <Phone className="w-4 h-4 text-[#25D366]" /> WhatsApp Contact Number
              </label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                placeholder="e.g. 919876543210"
                className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F4EFE6]">
            <div>
              <label className="flex items-center gap-1.5 font-semibold text-gray-700 mb-1">
                <Truck className="w-4 h-4 text-[#C86D51]" /> Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                min={0}
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Orders above this amount get free pan-India shipping.</span>
            </div>

            <div>
              <label className="flex items-center gap-1.5 font-semibold text-gray-700 mb-1">
                Flat Courier Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={settings.flat_shipping_fee}
                onChange={(e) => setSettings({ ...settings, flat_shipping_fee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Standard courier rate when under free shipping threshold.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F4EFE6] flex justify-end">
            <Button type="submit" isLoading={saving} className="px-6 py-2.5 text-xs font-semibold flex items-center gap-1.5">
              <Save className="w-4 h-4" /> Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
