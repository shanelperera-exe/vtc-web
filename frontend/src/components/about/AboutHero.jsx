import React from "react";
import hero from "../../assets/images/hero.png";

export default function AboutHeroSection() {
  return (
    <section
      className="relative bg-center bg-cover bg-no-repeat rounded-b-3xl -mt-1"
      style={{ backgroundImage: `url(${hero})` }}
    >
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <div className="flex flex-col justify-start text-left min-h-[30rem] md:min-h-[48rem] lg:min-h-[80vh] pt-24 md:pt-40 lg:pt-44 z-10">
          {/* Small Text */}
          <span className="text-[#161616] text-lg md:text-xl font-medium mb-4">
            About Us
          </span>

          {/* Title */}
          <h2 className="text-[#161616] font-heading font-medium text-[46px] leading-[44px] tracking-tight md:text-[80px] md:leading-[75px] max-w-[600px]">
            Your Trusted Partner for Everyday Essentials
          </h2>

          {/* Spacer for mobile (to match Shopify layout) */}
          <div className="h-[200px] md:h-0"></div>

          {/* Buttons Example */}
          <div className="flex gap-4 mt-6 pb-16">
            <a
              href="#shop"
              className="px-6 py-3 rounded-[36px] text-[#161616] border border-[#161616] bg-[rgba(248,247,246,0.9)] hover:bg-[#161616] hover:text-[#f8f7f6] transition"
            >
              Shop Now
            </a>
            <a
              href="#learn"
              className="px-6 py-3 rounded-[36px] border border-[#161616] text-[#161616] hover:bg-black hover:text-white transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
