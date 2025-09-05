import React from "react";
import FaqClient from "./faq-client";

export default async function FaqSection() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/front/faqs`,
    {
      cache: "no-store",
    }
  );
  const faqs = await res.json();

  return <FaqClient faqs={faqs} />;
}
