import React from "react";
import InterviewHero from "../../components/landingPage/HeroSection/HeroSection";
import WhyUseSection from "../../components/landingPage/WhyUseSection/WhyUseSection";
import HowItWorksSection from "../../components/landingPage/HowItWorksSection/HowItWorksSection";
import ReadyToAceSection from "@/app/components/landingPage/ReadyToAceSection/ReadyToAceSection";
import ContactUs from "@/app/components/landingPage/ContactUs/ContactUs";

const LandingPage = () => {
  return (
    <div>
      <InterviewHero />
      <WhyUseSection />
      <HowItWorksSection />
      <ReadyToAceSection />
      <ContactUs />
    </div>
  );
};

export default LandingPage;
