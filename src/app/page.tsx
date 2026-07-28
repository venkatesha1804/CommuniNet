import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero";
import { EmergencyAlerts } from "@/components/home/emergency-alerts";
import { FeaturesSection } from "@/components/landing/features";
import { AchievementsCarousel } from "@/components/home/achievements-carousel";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar />
      <HeroSection />
      <EmergencyAlerts />
      <FeaturesSection />
      <AchievementsCarousel />
      <Footer />
    </main>
  );
}
