"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";

const WHATSAPP_NUMBER = "27694644663";

export default function WhatsAppCTA() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Onea%20Africa%2C%20I%27d%20like%20to%20get%20connected.`;

  return (
    <>
      {/* Section */}
      <section
        id="contact"
        className="py-20 bg-[#8CC444] relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
              Chat with our team on WhatsApp — we&apos;ll get you sorted fast.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-white text-[#8CC444] font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:-translate-y-0.5 transition-all"
              >
                <MessageCircle size={22} />
                Chat on WhatsApp
              </a>
              <a
                href="mailto:connect@onea.co.za"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 hover:-translate-y-0.5 transition-all"
              >
                Send us an email
                <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating WhatsApp button */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-0 hover:gap-3 bg-[#25D366] text-white px-4 hover:px-5 py-4 rounded-full shadow-2xl hover:shadow-[#25D366]/40 hover:-translate-y-1 transition-all overflow-hidden group"
      >
        <MessageCircle size={26} className="flex-shrink-0" />
        <span className="text-sm font-semibold max-w-0 group-hover:max-w-xs whitespace-nowrap overflow-hidden transition-all duration-300">
          Chat with us
        </span>
      </a>
    </>
  );
}
