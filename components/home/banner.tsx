"use client";

import { useState, useEffect, useCallback } from "react";

const slides = [
  {
    gradient: "linear-gradient(135deg, #C8102E 0%, #E84444 100%)",
    text: "家家乐超市",
    subtext: "新鲜食材 · 地道中国味",
  },
  {
    gradient: "linear-gradient(135deg, #E87A20 0%, #F5A623 100%)",
    text: "新货到店",
    subtext: "每周进口，第一时间上架",
  },
  {
    gradient: "linear-gradient(135deg, #1B8A3D 0%, #4CAF50 100%)",
    text: "特惠促销",
    subtext: "会员专享折扣价",
  },
];

export function Banner() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [next]);

  const goTo = (index: number) => setCurrent(index);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* 滑动容器 */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="flex h-[180px] min-w-full flex-col items-center justify-center text-white"
            style={{ background: slide.gradient }}
          >
            <p className="text-2xl font-bold tracking-wide">{slide.text}</p>
            <p className="mt-2 text-sm opacity-90">{slide.subtext}</p>
          </div>
        ))}
      </div>

      {/* 小圆点指示器 */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all ${
              i === current
                ? "w-6 bg-white"
                : "w-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
