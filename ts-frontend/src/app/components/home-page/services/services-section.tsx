import ServicesClient from "./services-client";

export default async function ServicesSection() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/front/categories?page=1&limit=4`,
    {
      cache: "no-store",
    }
  );
  const categories = await res.json();

  return <ServicesClient categories={categories} />;
}
