'use client';
import React from 'react';

const ANNOUNCEMENT_TEXT =
  '✦ Free Shipping Pan-India on orders above ₹999 ✦ 100% Handcrafted Crochet ✦ Custom Orders Welcome ✦ Follow us @loopsoflove_co';

export function AnnouncementBar() {
  return (
    <div className="bg-[#1A1A1A] text-[#DAAF87] text-xs py-2.5 overflow-hidden">
      <div className="flex whitespace-nowrap">
        {/* Duplicate the text so the marquee loops seamlessly */}
        <span className="animate-marquee inline-block pr-8 font-medium tracking-wide">
          {ANNOUNCEMENT_TEXT}&nbsp;&nbsp;&nbsp;&nbsp;{ANNOUNCEMENT_TEXT}
        </span>
        <span className="animate-marquee inline-block pr-8 font-medium tracking-wide" aria-hidden="true">
          {ANNOUNCEMENT_TEXT}&nbsp;&nbsp;&nbsp;&nbsp;{ANNOUNCEMENT_TEXT}
        </span>
      </div>
    </div>
  );
}
