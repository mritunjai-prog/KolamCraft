import NavigationBar from "@/components/NavigationBar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import StylesSection from "@/components/StylesSection";
import MathSection from "@/components/MathSection";
import CanvasPreview from "@/components/CanvasPreview";
import FestivalsSection from "@/components/FestivalsSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <NavigationBar />
      <HeroSection />
      <FeaturesSection />
      <StylesSection />
      <MathSection />
      <FestivalsSection />
      <CanvasPreview />
      <FooterSection />
    </div>
  );
};

export default Index;
