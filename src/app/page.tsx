"use client";
import { HeroSection } from "@/components/mine/landing-page/herosection";
import { Sec1 } from "@/components/mine/landing-page/sec1";
import { LandingPageGrid } from "@/components/mine/landing-page/landing-page-grid";
import { VideoShowcaseGrid } from "@/components/mine/landing-page/video-showcase-grid";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { FloatingTemplatesBadge } from "@/components/mine/landing-page/floating-templates-badge";

const Page = () => {
    return (
        <>
            <SmoothScroll>
                <div className="overflow-hidden noScrollbar">
                    <HeroSection />

                    {/* Featured Video Demos - New Section with Video Previews */}
                    <VideoShowcaseGrid />

                    {/* Component Preview Grid Section - Shows actual UI components */}
                    <LandingPageGrid
                        centerText="Components"
                        className="mt-[-5vh]"
                    />

                    <Sec1 />
                    <FloatingTemplatesBadge />
                </div>
            </SmoothScroll>
        </>
    );
};

export default Page;
