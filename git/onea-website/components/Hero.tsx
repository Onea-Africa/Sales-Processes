"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Wifi, Globe, Megaphone } from "lucide-react";

const pillars = [
  {
    icon: Wifi,
    label: "Connect",
    desc: "Fibre & IT Infrastructure",
    colour: "#8CC444",
    lightBg: "#F3FBE8",
  },
  {
    icon: Globe,
    label: "Communicate",
    desc: "Digital Marketing",
    colour: "#B8880A",
    lightBg: "#FFFBEB",
  },
  {
    icon: Megaphone,
    label: "Converse",
    desc: "PR & Communications",
    colour: "#D6139F",
    lightBg: "#FDF3FB",
  },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16 bg-gradient-to-br from-[#F8FBF2] via-white to-[#FEF9F0]">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[580px] h-[580px] bg-[#8CC444]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-[#F4D350]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-[250px] h-[250px] bg-[#D6139F]/5 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-[#8CC444]/10 text-[#5a8828] text-xs font-semibold px-4 py-2 rounded-full mb-6"
        >
          <span className="w-2 h-2 bg-[#8CC444] rounded-full animate-pulse" />
          Openserve Certified Partner · B-BBEE Level 1 Contributor
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-gray-900 leading-[1.1] mb-6 max-w-3xl"
        >
          One Partner For{" "}
          <span className="text-[#8CC444]">Connectivity</span>,{" "}
          <span className="text-[#D6139F]">Digital Growth</span>{" "}
          &amp; Communications.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl"
        >
          From fibre internet and CCTV to website design and corporate PR —
          Onea Africa is South Africa&apos;s single trusted partner for
          everything that keeps your business connected and growing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-4 mb-16"
        >
          <a
            href="#connect"
            className="group inline-flex items-center gap-2 bg-[#8CC444] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#7ab33a] transition-all hover:shadow-xl hover:shadow-[#8CC444]/30 hover:-translate-y-0.5"
          >
            Get Connected
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>
          <a
            href="https://wa.me/27000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-full hover:border-[#8CC444] hover:text-[#8CC444] transition-all hover:-translate-y-0.5 bg-white"
          >
            <MessageCircle size={18} />
            Talk To Us
          </a>
        </motion.div>

        {/* Pillar preview cards */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-xl">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.a
                key={p.label}
                href={`#${p.label.toLowerCase()}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer block"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: p.lightBg }}
                >
                  <Icon size={20} style={{ color: p.colour }} />
                </div>
                <p className="font-bold text-gray-900 text-sm">{p.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
              </motion.a>
            );
          })}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-14 pt-8 border-t border-gray-200/60 grid grid-cols-3 gap-6 max-w-sm"
        >
          {[
            { value: "500+", label: "Active Clients" },
            { value: "8+", label: "Years in SA" },
            { value: "24/7", label: "Support" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
