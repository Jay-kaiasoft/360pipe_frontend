import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

import BrandSection from './brandSecrion'
import CaseStudy from './caseStudy'
import ComparisonSection from './comparisonSection'
import CTABanner from './CTABanner'
import FAQSection from './faqSection'
import FeaturesSection from './featuresSection'
import Footer from './footer'
import Header from './header'
import Industries from './industries'
import SalesWorkflowSection from './salesWorkflowSection'
import TestimonialSlider from './testimonialSlider'
import ValuesSection from './valuesSection'
import WorkingProcess from './workingProcess'
import CustomIcons from "../../components/common/icons/CustomIcons";

const Main = () => {
    const navigate = useNavigate();

    const [showScrollBtn, setShowScrollBtn] = useState(false);

    useEffect(() => {
        if (Cookies.get('authToken')) {
            navigate("/dashboard");
        }
        const handleScroll = () => {
            // Find BrandSection position
            const brandSection = document.getElementById("brand-section");
            if (brandSection) {
                const top = brandSection.getBoundingClientRect().top;
                // Show button when BrandSection enters viewport
                setShowScrollBtn(top <= window.innerHeight * 0.8);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <>
            {/* ===== Hero + Header Section ===== */}
            <div className='bg-gradient-to-tr from-[#f7f5e8] via-[#e6eafc] to-[#f7f5e8]'>
                {/* Header */}
                <div className='absolute z-50 w-full px-5 lg:px-20 border-b border-gray-200 shadow-sm'>
                    <Header />
                </div>

                {/* Hero Section */}
                <div className='px-5 lg:px-20 pt-10'>
                    <SalesWorkflowSection />
                </div>
            </div>

            {/* ===== Brand Section ===== */}
            <div id="brand-section" className='px-5 lg:px-20 py-10'>
                <BrandSection />
                <div className='4k:flex 4k:justify-center'>
                    <ValuesSection />
                </div>
                <FeaturesSection />
            </div>

            {/* ===== Case Study Section ===== */}
            <div>
                <CaseStudy />
            </div>

            {/* ===== Working Process Section ===== */}
            <div className='relative'>
                <WorkingProcess />
            </div>

            {/* ===== Industries Section ===== */}
            <div className='px-5 lg:px-20 py-10'>
                <div className='4k:flex 4k:justify-center'>
                    <Industries />
                </div>
            </div>

            {/* ===== Testimonials Section ===== */}
            <div>
                <TestimonialSlider />
            </div>

            {/* ===== Comparison Section ===== */}
            <div className='4k:flex 4k:justify-center'>
                <div className='bg-gradient-to-r from-yellow-50 to-purple-50'>
                    <ComparisonSection />
                </div>
            </div>

            {/* ===== FAQ + CTA Section ===== */}
            <div className='px-5 lg:px-20 py-10 relative'>
                <div className='4k:flex 4k:justify-center'>
                    <FAQSection />
                </div>
                <div className='md:absolute md:inset-x-0 md:top-3/4 lg:px-20 py-10'>
                    <div className='4k:flex 4k:justify-center'>
                        <CTABanner />
                    </div>
                </div>
            </div>

            {/* ===== Footer Section ===== */}
            <div>
                <Footer />
            </div>

            {/* ===== Scroll to Top Button ===== */}
            {showScrollBtn && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg flex justify-center items-center 
                               transition transform hover:scale-110 hover:bg-blue-700 duration-300 animate-bounce"
                >
                    <CustomIcons iconName="fa-solid fa-arrow-up" css="text-white w-5 h-5" />
                </button>
            )}
        </>
    )
}

export default Main
