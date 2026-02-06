"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";

const SLIDES = [
  { src: "/restaurant.jpg", title: "Our Restaurant" },
  { src: "/floormap.jpg", title: "Floormap management" },
  { src: "/staff.png", title: "Staff management" },
  { src: "/payment.png", title: "Payment Processing" },
];

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(goToNext, 4000);
    return () => clearInterval(interval);
  }, [goToNext]);

  const displayIndex = currentSlide;

  return (
    <div className="flex h-full flex-col lg:flex-row bg-[rgb(36,49,52)] text-white">
      {/* Image slideshow - left side, large screens only */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-4">
        <div className="w-full max-w-2xl overflow-visible rounded-lg p-6">
          <h2 className=" font-semibold text-2xl text-white text-center ">
            {SLIDES[displayIndex].title}
          </h2>
          <div className="relative flex items-center justify-center min-h-[360px]pb-4">
            {/* Left - previous image in background */}
            <div className="absolute left-0 w-44 aspect-[4/3] opacity-50 brightness-75 -translate-x-4 z-0 transition-all duration-500 rounded-md overflow-hidden">
              <Image
                src={
                  SLIDES[(currentSlide - 1 + SLIDES.length) % SLIDES.length].src
                }
                alt={
                  SLIDES[(currentSlide - 1 + SLIDES.length) % SLIDES.length]
                    .title
                }
                fill
                className="object-contain"
              />
            </div>
            {/* Center - current image in front */}
            <div className="relative w-96 min-w-[480px] aspect-[4/3] z-20 transition-all duration-500 rounded-md overflow-hidden">
              <Image
                src={SLIDES[currentSlide].src}
                alt={SLIDES[currentSlide].title}
                fill
                className="object-contain"
                priority
              />
            </div>
            {/* Right - next image in background */}
            <div className="absolute right-0 w-44 aspect-[4/3] opacity-50 brightness-75 translate-x-4 z-0 transition-all duration-500 rounded-md overflow-hidden">
              <Image
                src={SLIDES[(currentSlide + 1) % SLIDES.length].src}
                alt={SLIDES[(currentSlide + 1) % SLIDES.length].title}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Vertical divider - large screens only */}
      <div className="hidden lg:block w-px h-[80%] min-h-[400px] bg-white/30 flex-shrink-0 self-center" />
      {/* Right side - content */}
      <div className="flex flex-1 flex-col items-center justify-center py-12 lg:py-0">
        <div className="flex flex-col items-center justify-center gap-4 mb-24">
          <Image
            src="/favicon.ico"
            alt="logo"
            width={240}
            height={192}
            className="w-56 h-auto sm:w-64"
          />
        </div>
        <div className="flex flex-col gap-4 justify-center w-[90%] max-w-md mx-auto">
          <Button
            variant="outline"
            className="hover:bg-[rgba(175,176,136,0.9)] hover:text-black hover:border-[rgba(175,176,136,1)]"
            onClick={() => router.push("/auth/login")}
          >
            Login
          </Button>
          <Button
            variant="outline"
            className="hover:bg-[rgba(175,176,136,0.9)] hover:text-black hover:border-[rgba(175,176,136,1)]"
            onClick={() => router.push("/auth/register")}
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
}
