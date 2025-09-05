import HeroSection from "./components/home-page/hero-section";
import WhyChooseSection from "./components/home-page/why-choose-section";
import StatsSection from "./components/home-page/stats-section";
import UsersCommentsSection from "./components/home-page/users-comments-section";
import ServicesSection from "./components/home-page/services/services-section";
import FaqSection from "./components/home-page/faq/faq-section";

export default function Home() {
  return (
    <div className="mt-[-100px] flex flex-col gap-y-[150px] pb-[150px] items-center">
      <div id="hero" className="w-full">
        <HeroSection />
      </div>

      <div className="max-w-[1140px] w-full flex flex-col gap-y-[100px] sm:gap-y-[150px] px-4">
        <ServicesSection />

        <div id="whychoose" className="scroll-mt-[180px]">
          <WhyChooseSection />
        </div>
      </div>

      <StatsSection />

      <div className="max-w-[1140px] w-full flex flex-col gap-y-[100px] sm:gap-y-[150px] px-4">
        <div id="usercomments" className="scroll-mt-[180px]">
          <UsersCommentsSection />
        </div>

        <div id="faq" className="scroll-mt-[180px]">
          <FaqSection />
        </div>
      </div>
    </div>
  );
}
