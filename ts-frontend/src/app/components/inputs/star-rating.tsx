import { BsStarFill } from "react-icons/bs";
import React, { useState } from "react";

export default function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = hover !== null ? star <= hover : star <= value;
        return (
          <BsStarFill
            key={star}
            className={`${
              onChange && "cursor-pointer"
            } transition-colors text-[18px] ${
              isFilled ? "text-amber-400" : "text-gray-300"
            }`}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => onChange && setHover(star)}
            onMouseLeave={() => onChange && setHover(null)}
          />
        );
      })}
    </div>
  );
}
