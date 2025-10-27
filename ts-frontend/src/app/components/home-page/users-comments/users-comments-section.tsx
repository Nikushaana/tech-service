import UsersCommentsClient from "./users-comments-client";

export default async function UsersCommentsSection() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/front/reviews`,
    {
      cache: "no-store",
    }
  );
  const reviews = await res.json();

  return <UsersCommentsClient reviews={reviews} />;
}
