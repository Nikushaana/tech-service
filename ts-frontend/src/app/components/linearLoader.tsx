export default function LinearLoader({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="w-full h-0.5 relative overflow-hidden">
      <div
        className={`absolute top-0 -left-1/2 h-1 bg-blue-500 ${isLoading ? "animate-linear-loading" : ""} w-1/2`}
      ></div>
    </div>
  );
}
