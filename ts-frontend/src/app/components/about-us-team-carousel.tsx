"use client";

export default function AboutUsTeamCarousel() {
  const gallery = Array(10).fill("/images/1.webp");

  return (
    <div className="overflow-hidden w-full">
      <div className="flex animate-slide">
        {gallery.map((item, index) => (
          <img
            key={index}
            src={item}
            alt={`Slide ${index}`}
            className="h-32 w-auto object-cover"
          />
        ))}
      </div>
    </div>
  );
}
