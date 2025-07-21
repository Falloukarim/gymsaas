import Header from "@/components/Home/Header";
import HeroSection from "@/components/Home/HeroSection";
import FeaturesSection from "@/components/Home/FeaturesSection";
import PreviewSection from "@/components/Home/PreviewSection";
import CTASection from "@/components/Home/CTASection";
import Footer from "@/components/Home/Footer";

export default function HomePage() {
  return (
<main className="relative min-h-screen bg-gradient-to-br from-[#01012b] to-[#02125e] text-white overflow-x-hidden">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <PreviewSection />
      <CTASection />
      <Footer />
    </main>
  );
}
