import { MessageCircle, Mail, Phone } from "lucide-react";

const footerLinks: Record<string, string[]> = {
  Connect: [
    "Fibre Internet",
    "WiFi Solutions",
    "CCTV & Security",
    "Managed IT",
    "Network Setup",
  ],
  Communicate: [
    "Website Design",
    "Brand Identity",
    "Social Media",
    "Paid Ads",
    "Content Creation",
  ],
  Converse: [
    "Public Relations",
    "Corporate Comms",
    "Media Strategy",
    "Events",
    "Crisis Comms",
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="text-2xl font-black mb-4 tracking-tight">
              onea<span className="text-[#8CC444]">.</span>africa
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              One partner for connectivity, digital growth, and communications
              across South Africa.
            </p>
            <div className="space-y-2.5">
              <a
                href="tel:+27694644663"
                className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#8CC444] transition-colors"
              >
                <Phone size={14} />
                +27 69 464 4663
              </a>
              <a
                href="mailto:connect@onea.co.za"
                className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#8CC444] transition-colors"
              >
                <Mail size={14} />
                connect@onea.co.za
              </a>
              <a
                href="https://wa.me/27694644663"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#25D366] transition-colors"
              >
                <MessageCircle size={14} />
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Service link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold text-white text-sm mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-[#8CC444] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {year} Onea Africa. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="bg-[#8CC444]/15 text-[#8CC444] text-xs font-bold px-3 py-1 rounded-full">
              B-BBEE Level 1
            </span>
            <span className="text-xs text-gray-500">
              Openserve Certified Partner
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
