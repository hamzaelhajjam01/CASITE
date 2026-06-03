import Navbar from '../sections/Navbar';
import Hero from '../sections/Hero';
import VINQuoteSystem from '../sections/VINQuoteSystem';
import Features from '../sections/Features';
import WhoWeServe from '../sections/WhoWeServe';
import WhyChoose from '../sections/WhyChoose';
import CoveragePlans from '../sections/CoveragePlans';
import SavingsCalculator from '../sections/SavingsCalculator';
import ComprehensiveExplained from '../sections/ComprehensiveExplained';
import TrustSocialProof from '../sections/TrustSocialProof';
import Comparison from '../sections/Comparison';
import HowItWorks from '../sections/HowItWorks';

import FAQEnhanced from '../sections/FAQEnhanced';
import CTABanner from '../sections/CTABanner';
import Footer from '../sections/Footer';
import StickyMobileCTA from '../sections/StickyMobileCTA';

export default function Home() {
  return (
    <div className="min-h-screen bg-pg-bg">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <VINQuoteSystem />
        <Features />
        <WhoWeServe />
        <WhyChoose />
        <CoveragePlans />
        <SavingsCalculator />
        <ComprehensiveExplained />
        <TrustSocialProof />
        <Comparison />
        <FAQEnhanced />
        <CTABanner />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
