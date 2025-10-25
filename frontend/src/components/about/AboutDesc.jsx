import React from "react";
import vtcBag from "../../assets/images/vtc_bag.png";

export default function AboutDesc() {
  return (
    <section className="bg-transparent py-10">
      <div className="container mx-auto px-4 lg:px-0">
        {/* Center the whole card and add subtle bg/rounded container for visual focus */}
        <div className="max-w-7xl mx-auto bg-white/0 lg:bg-white/0 rounded-lg flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-10 p-6 lg:p-12">
          {/* Left Image */}
          <div className="lg:w-6/12 flex justify-center lg:justify-start self-start">
            <img
              src={vtcBag}
              alt="VTC bag"
              className="w-full max-w-[520px] h-auto object-cover"
              loading="lazy"
            />
          </div>

          {/* Right Content */}
          <div className="lg:w-9/12 text-center lg:text-left px-2 lg:pl-8 self-start">
            {/* Subheading */}
            <span className="block text-sm leading-6 tracking-wide text-[#262626] font-medium uppercase mb-3">
              Welcome to Vidara Trade Center
            </span>

            {/* Heading */}
            <h3 className="text-[#161616] font-heading font-medium text-[34px] leading-[34px] md:text-[46px] md:leading-[44px] lg:text-[50px] lg:leading-[48px] tracking-tight max-w-[700px] mb-4">
              More Than a Store – Your Home Partner
            </h3>

            {/* Paragraph */}
            <p className="text-base md:text-[16px] leading-7 text-[#6b7280] mb-6">
              At Vidara Trade Center, we believe that a well-equipped home makes life easier and more enjoyable. That’s why we bring together a wide selection of cleaning products, kitchenware, plastic solutions, homeware, and electrical items – all carefully chosen to meet your everyday household needs.
              <span className="block pt-3">For years, we’ve been more than just a retail shop — we’ve been a reliable partner for families, 
                students, and businesses looking for affordable, long-lasting household products. 
                Whether you’re upgrading your kitchen, organizing your home, or searching for practical lifestyle items, 
                Vidara Trade Center is here to help you find exactly what you need — all in one place.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
