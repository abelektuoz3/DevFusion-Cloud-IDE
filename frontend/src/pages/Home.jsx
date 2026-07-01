import React from "react";
import Navbar from "../components/layout/Navbar";
import Hero from "../components/layout/Hero";
import Features from "../components/layout/Features";
import HowItWorks from "../components/layout/HowItWorks";
import Footer from "../components/layout/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </>
  );
}

export default Home;
