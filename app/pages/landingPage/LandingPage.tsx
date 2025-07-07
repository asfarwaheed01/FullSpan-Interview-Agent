import React from "react";
import InterviewHero from "../../components/landingPage/HeroSection/HeroSection";
import WhyUseSection from "../../components/landingPage/WhyUseSection/WhyUseSection";
import HowItWorksSection from "../../components/landingPage/HowItWorksSection/HowItWorksSection";
import ReadyToAceSection from "@/app/components/landingPage/ReadyToAceSection/ReadyToAceSection";

const LandingPage = () => {
  return (
    <div>
      <InterviewHero />
      <WhyUseSection />
      <HowItWorksSection />
      <ReadyToAceSection />
    </div>
  );
};

export default LandingPage;
