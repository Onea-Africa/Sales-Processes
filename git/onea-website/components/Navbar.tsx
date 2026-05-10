"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Connect", href: "#connect" },
  { label: "Communicate", href: "#communicate" },
  { label: "Converse", href: "#converse" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-sm" : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <span className="text-2xl font-black text-gray-900 tracking-tight">
            onea<span className="text-[#8CC444]">.</span>africa
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-[#8CC444] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <a
            href="tel:+27694644663"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Call Us
          </a>
          <a
            href="#contact"
            className="bg-[#8CC444] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#7ab33a] transition-all hover:shadow-lg hover:shadow-[#8CC444]/25"
          >
            Get Connected
          </a>
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pb-5 pt-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-sm font-medium text-gray-700 hover:text-[#8CC444] border-b border-gray-50 last:border-0 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contact"
                className="mt-4 block w-full bg-[#8CC444] text-white text-sm font-semibold px-5 py-3.5 rounded-full text-center hover:bg-[#7ab33a] transition-colors"
              >
                Get Connected
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
