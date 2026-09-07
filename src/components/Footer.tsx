/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer-main" className="py-6 mt-10 border-t border-white/8 text-slate-500 font-medium select-none font-sans flex flex-col md:flex-row justify-between items-center text-xs gap-4">
      <div>
        <a
          href="https://chenyulu.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-300 hover:text-indigo-200 hover:underline font-semibold transition-colors"
        >
          Visit my website
        </a>
      </div>
      <div className="font-sans tracking-wide">
        <span className="opacity-60">Designed by</span>{' '}
        <span className="text-indigo-300 font-semibold">Chenyu Studios</span>{' '}
        <span className="mx-2 opacity-40">|</span> © {currentYear} IB CAS Project
      </div>
    </footer>
  );
}
