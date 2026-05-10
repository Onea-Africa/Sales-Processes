"use client";

import { motion } from "framer-motion";
import { Wifi, Globe, Megaphone, Check, ArrowRight } from "lucide-react";

const pillars = [
  {
    id: "connect",
    icon: Wifi,
    colour: "#8CC444",
    lightBg: "#F3FBE8",
    label: "Connect",
    tagline: "Fibre, WiFi & IT Infrastructure",
    desc: "Get your home or business online with fast, reliable fibre internet, professional installations, and ongoing managed IT support.",
    services: [
      "Fibre Internet",
      "WiFi Extension & Mesh",
      "CCTV & Security Cameras",
      "Structured Cabling",
      "Managed IT Support",
      "Network Setup & Config",
    ],
  },
  {
    id: "communicate",
    icon: Globe,
    colour: "#B8880A",
    lightBg: "#FFFBEB",
    label: "Communicate",
    tagline: "Digital Marketing & Web Solutions",
    desc: "Build your brand, grow your audience, and convert online. From stunning websites to targeted ads and social media management.",
    services: [
      "Website Design & Dev",
      "Brand Identity & Logos",
      "Social Media Management",
      "Graphic Design",
      "Paid Advertising (Meta/Google)",
      "Content Creation",
    ],
  },
  {
    id: "converse",
    icon: Megaphone,
    colour: "#D6139F",
    lightBg: "#FDF3FB",
    label: "Converse",
    tagline: "Communications, PR & Media",
    desc: "Shape your narrative and build lasting relationships. Expert PR, media strategy, and stakeholder engagement for organisations that matter.",
    services: [
      "Public Relations",
      "Corporate Communications",
      "Media Strategy & Liaison",
      "Stakeholder Engagement",
      "Event Management",
      "Crisis Communications",
    ],
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function PillarsSection() {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#8CC444] font-semibold text-sm uppercase tracking-widest mb-3"
          >
            What We Do
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-black text-gray-900 mb-4"
          >
            Everything Your Business Needs
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-500 max-w-lg mx-auto"
          >
            Three integrated service pillars. One partner. Covering every
            dimension of your business presence.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                id={pillar.id}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                className="rounded-3xl border border-gray-100 p-8 hover:shadow-xl transition-all"
                style={{ background: pillar.lightBg }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: pillar.colour + "20" }}
                >
                  <Icon size={28} style={{ color: pillar.colour }} />
                </div>

                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: pillar.colour }}
                >
                  {pillar.label}
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-1 mb-3">
                  {pillar.tagline}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {pillar.desc}
                </p>

                <ul className="space-y-2.5">
                  {pillar.services.map((service) => (
                    <li
                      key={service}
                      className="flex items-center gap-2.5 text-sm text-gray-700"
                    >
                      <Check
                        size={14}
                        style={{ color: pillar.colour }}
                        className="flex-shrink-0"
                      />
                      {service}
                    </li>
                  ))}
                </ul>

                <a
                  href={`#${pillar.id}-enquiry`}
                  className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:gap-3"
                  style={{ color: pillar.colour }}
                >
                  Get a quote <ArrowRight size={14} />
                </a>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
