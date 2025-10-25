import React from "react";
import shopImg from "../../assets/images/shop.png";

export default function OurStory() {
    return (
        <section
            className="bg-[#edf1f0] "
            aria-label="Our story"
        >
            <div className="container mx-auto px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left Block */}
                    <div className="lg:col-span-3 text-center lg:text-left">
                        <div className="text-sm uppercase tracking-wide text-gray-600 mb-2">
                            How Did We Become Your Go-To Store?
                        </div>
                        <h3 className="text-[#161616] font-heading font-medium text-[46px] leading-[44px] tracking-tight md:text-[48px] lg:text-[50px] md:leading-[44px] max-w-[600px]">
                            How It All Began
                        </h3>
                    </div>

                    {/* Image Middle */}
                    <div className="lg:col-span-5 flex items-center justify-center">
                            <img
                                src={shopImg}
                                alt="Decor"
                                className="w-full max-w-[520px] h-auto object-cover border-l-3 border-r-3 border-black"
                                width={499}
                                height={370}
                                loading="lazy"
                            />
                    </div>

                    {/* Right Block */}
                    <div className="lg:col-span-4 flex flex-col justify-center text-center lg:text-left">
                        <div className="mb-3 text-[#161616] font-medium font-heading text-xl">
                            Our Journey
                        </div>
                        <p className="text-[#828282] text-[15px] md:text-[16px] leading-[28px]">
                            Vidara Trade Center began as a small family-run store with a vision to be a one-stop destination for household needs. By focusing on affordable, reliable, and quality products, we have grown into a trusted hub for homeware, kitchenware, cleaning essentials, plastics, and electrical items.
                        </p>

                        <p className="text-[#828282] text-[15px] md:text-[16px] leading-[28px] mt-4">
                            Our mission is simple — to make life easier for families, students, and businesses by providing household solutions under one roof. What started as a small dream is now a name our community relies on for value and trust.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
