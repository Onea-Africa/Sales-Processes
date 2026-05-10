"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const solutions = [
  {
    emoji: "🏠",
    title: "Smart Home WiFi",
    desc: "Full-home WiFi coverage with professional installation. No dead zones, no configuration headaches.",
    colour: "#8CC444",
    tag: "Residential",
    href: "#connect",
  },
  {
    emoji: "🏢",
    title: "Fibre for Business",
    desc: "Dedicated business-grade fibre with uptime guarantees, SLA, and priority support.",
    colour: "#8CC444",
    tag: "Business",
    href: "#connect",
  },
  {
    emoji: "📷",
    title: "CCTV & Security",
    desc: "End-to-end CCTV systems integrated with your network. Remote monitoring ready.",
    colour: "#8CC444",
    tag: "Security",
    href: "#connect",
  },
  {
    emoji: "🌐",
    title: "Website Packages",
    desc: "Professional websites built for conversion. From clean landing pages to full e-commerce.",
    colour: "#D6139F",
    tag: "Digital",
    href: "#communicate",
  },
];

export default function FeaturedSolutions() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-[#8CC444] font-semibold text-sm uppercase tracking-widest mb-3">
              Popular Solutions
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              Built For How You Work
            </h2>
          </div>
          <a
            href="#services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8CC444] hover:text-[#7ab33a] transition-colors shrink-0"
          >
            View all services <ArrowRight size={16} />
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {solutions.map((s, i) => (
            <motion.a
              key={s.title}
              href={s.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-transparent hover:bg-white hover:shadow-xl transition-all cursor-pointer block"
            >
              <span className="text-3xl block mb-4">{s.emoji}</span>
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4 inline-block"
                style={{ background: s.colour + "18", color: s.colour }}
              >
                {s.tag}
              </span>
              <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              <div
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0"
                style={{ color: s.colour }}
              >
                Enquire now <ArrowRight size={14} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
