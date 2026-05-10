import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PillarsSection from "@/components/PillarsSection";
import WhyOnea from "@/components/WhyOnea";
import FeaturedSolutions from "@/components/FeaturedSolutions";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <PillarsSection />
      <WhyOnea />
      <FeaturedSolutions />
      <WhatsAppCTA />
      <Footer />
    </main>
  );
}
