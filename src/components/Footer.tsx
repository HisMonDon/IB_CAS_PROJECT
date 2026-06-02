/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer id="footer-main" className="py-6 mt-12 border-t border-slate-100 text-slate-400 font-medium select-none font-sans flex flex-col md:flex-row justify-between items-center text-xs gap-4">
      <div>
        <a 
          href="https://chenyulu.dev" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-indigo-600 hover:text-indigo-500 hover:underline font-bold transition-all"
        >
          Visit my website
        </a>
      </div>
      <div className="font-sans tracking-wide">
        <span className="opacity-70">DESIGNED BY</span>{' '}
        <span className="text-indigo-600 font-bold uppercase">Chenyu Studios</span>{' '}
        <span className="mx-2">|</span> © {currentYear} IB CAS PROJECT
      </div>
    </footer>
  );
}
