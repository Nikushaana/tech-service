import HeroSection from "./components/home-page/hero-section";
import WhyChooseSection from "./components/home-page/why-choose-section";
import StatsSection from "./components/home-page/stats-section";
import ServicesSection from "./components/home-page/services/services-section";
import FaqSection from "./components/home-page/faq/faq-section";
import UsersCommentsSection from "./components/home-page/users-comments/users-comments-section";

export default function Home() {
  return (
    <div className="flex flex-col gap-y-20 sm:gap-y-36 pb-[70px] sm:pb-[150px] md:px-4 items-center">
      <div id="hero" className="w-full px-2 md:px-0 ">
        <HeroSection />
      </div>

      <div className="max-w-[1140px] w-full flex flex-col gap-y-24 sm:gap-y-36 px-4 md:px-0">
        <ServicesSection />

        <div id="whychoose" className="scroll-mt-[180px] ">
          <WhyChooseSection />
        </div>
      </div>

      <StatsSection />

      <div
        id="usercomments"
        className="scroll-mt-[180px] max-w-[1140px] w-full"
      >
        <UsersCommentsSection />
      </div>

      <div
        id="faq"
        className="scroll-mt-[180px] w-full  flex justify-center bg-gray-100 md:rounded-[30px] px-4"
      >
        <FaqSection />
      </div>
    </div>
  );
}
