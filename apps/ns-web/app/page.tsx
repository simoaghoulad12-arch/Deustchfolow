import { IntroExperience } from '@/components/intro/IntroExperience';
import { Navigation } from '@/components/navigation/Navigation';
import { Hero } from '@/components/sections/Hero';
import { BrandStatement } from '@/components/sections/BrandStatement';
import { FloatingGarment } from '@/components/sections/FloatingGarment';
import { LightScanReveal } from '@/components/sections/LightScanReveal';
import { HorizontalRunway } from '@/components/sections/HorizontalRunway';
import { Lookbook } from '@/components/sections/Lookbook';
import { Journal } from '@/components/sections/Journal';
import { BrandPillars } from '@/components/sections/BrandPillars';
import { Footer } from '@/components/sections/Footer';

export default function HomePage() {
  return (
    <>
      <IntroExperience />
      <Navigation />
      <main>
        <Hero />
        <BrandStatement />
        <FloatingGarment />
        <LightScanReveal />
        <HorizontalRunway />
        <Lookbook />
        <Journal />
        <BrandPillars />
      </main>
      <Footer />
    </>
  );
}
