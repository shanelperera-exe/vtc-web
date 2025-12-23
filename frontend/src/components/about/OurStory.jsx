import React from "react";
import shopImg from "../../assets/images/shop.png";

export default function OurStory() {
    return (
        <section
            className="bg-[#edf1f0] rounded-2xl"
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
                                className="w-full max-w-[520px] h-auto object-cover rounded-3xl"
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
                        <p className="text-[#828282] text-sm md:text-[15px] lg:text-[16px] leading-6 md:leading-[28px]">
                            At Vidara Trade Center, we believe that a well-equipped home makes life easier and more enjoyable. That’s why we bring together a wide selection of cleaning products, kitchenware, plastic solutions, homeware, and electrical items – all carefully chosen to meet your everyday household needs.
                        </p>

                        <p className="text-[#828282] text-sm md:text-[15px] lg:text-[16px] leading-6 md:leading-[28px] mt-4">
                            For years, we’ve been more than just a retail shop — we’ve been a reliable partner for families, students, and businesses looking for affordable, long-lasting household products. Whether you’re upgrading your kitchen, organizing your home, or searching for practical lifestyle items, Vidara Trade Center is here to help you find exactly what you need — all in one place.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
