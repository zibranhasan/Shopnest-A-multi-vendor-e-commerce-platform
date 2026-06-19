import { useEffect, useRef, useState } from "react";
import HeroSection from "@/components/modules/home/HeroSection";
import CategorySection from "@/components/modules/home/CategorySection";
import FeaturedProducts from "@/components/modules/home/FeaturedProducts";
import PromoBanner from "@/components/modules/home/PromoBanner";
import TopShops from "@/components/modules/home/TopShops";
import WhyShopnest from "@/components/modules/home/WhyShopnest";
import Newsletter from "@/components/modules/home/Newsletter";

// Custom IntersectionObserver wrapper for scroll-reveal animations
interface ScrollRevealProps {
    children: React.ReactNode;
    delay?: number;
}

const ScrollReveal = ({ children, delay = 0 }: ScrollRevealProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const currentRef = ref.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (currentRef) {
                        observer.unobserve(currentRef);
                    }
                }
            },
            {
                threshold: 0.05, // trigger when 5% of the element is visible
                rootMargin: "0px 0px -50px 0px" // trigger slightly before entering viewport
            }
        );

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ease-out-quad transform ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
        >
            {children}
        </div>
    );
};

const Home = () => {
    return (
        <div className="space-y-4 pb-16 overflow-x-hidden">
            {/* Hero Section */}
            <ScrollReveal>
                <HeroSection />
            </ScrollReveal>

            {/* Categories Section */}
            <ScrollReveal delay={100}>
                <CategorySection />
            </ScrollReveal>

            {/* Featured Products Section */}
            <ScrollReveal delay={150}>
                <FeaturedProducts />
            </ScrollReveal>

            {/* Promo Banner Section */}
            <ScrollReveal delay={150}>
                <PromoBanner />
            </ScrollReveal>

            {/* Top Shops Section */}
            <ScrollReveal delay={150}>
                <TopShops />
            </ScrollReveal>

            {/* Why Shopnest Section */}
            <ScrollReveal delay={150}>
                <WhyShopnest />
            </ScrollReveal>

            {/* Newsletter Section */}
            <ScrollReveal delay={150}>
                <Newsletter />
            </ScrollReveal>
        </div>
    );
};

export default Home;