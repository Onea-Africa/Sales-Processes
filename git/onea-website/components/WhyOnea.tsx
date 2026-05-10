"use client";

import { motion } from "framer-motion";
import { Award, Shield, MapPin, Wrench } from "lucide-react";

const reasons = [
  {
    icon: Award,
    title: "Openserve Certified Partner",
    desc: "Official accredited partner of Openserve, South Africa's leading fibre network provider.",
  },
  {
    icon: Shield,
    title: "B-BBEE Level 1 Contributor",
    desc: "Fully compliant and preferential procurement certified — the highest B-BBEE contributor status.",
  },
  {
    icon: MapPin,
    title: "National Coverage & Support",
    desc: "Operating across South Africa with dedicated field teams and 24/7 remote support.",
  },
  {
    icon: Wrench,
    title: "Professional Installations",
    desc: "Certified technicians for every job — from home fibre to enterprise network setups.",
  },
];

export default function WhyOnea() {
  return (
    <section id="about" className="py-24 bg-[#F8FBF2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#8CC444] font-semibold text-sm uppercase tracking-widest mb-3"
          >
            Why Choose Us
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-black text-gray-900 mb-4"
          >
            Trusted Across South Africa
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-500 max-w-md mx-auto"
          >
            We bring the credentials, the team, and the track record to back it up.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-white hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-[#8CC444]/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-[#8CC444]" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2">
                  {r.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{r.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Client logo strip placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 pt-10 border-t border-gray-200/60"
        >
          <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-8 font-semibold">
            Trusted by businesses across South Africa
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
            {["Openserve", "Telkom", "Supersonic", "Home Connect"].map(
              (name) => (
                <span
                  key={name}
                  className="text-sm font-bold text-gray-500 tracking-wide"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
