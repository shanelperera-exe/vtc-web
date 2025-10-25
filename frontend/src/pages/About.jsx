import React from 'react';
import Navbar from '../components/layout/Navbar';
import AboutHeroSection from '../components/about/AboutHero';
import AboutDesc from '../components/about/AboutDesc';
import StatsSection from '../components/about/Stats';
import OurStory from '../components/about/OurStory';
import Brands from '../components/about/Brands';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <AboutHeroSection />
      <AboutDesc />
      <StatsSection />
      <OurStory />
      <Brands />
    </div>
  );
}
