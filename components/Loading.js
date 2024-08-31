import dynamic from "next/dynamic";

const DynamicGridLoader = dynamic(
  () => import("react-spinners").then((mod) => mod.GridLoader),
  { ssr: false }
);
export default function Loading() {
  return (
    <div>
      <div className="fixed inset-0 flex justify-center items-center bg-light z-50">
        <DynamicGridLoader
          color="#3AB795"
          size={50}
          margin={15}
          speedMultiplier={0.8}
        />
      </div>
    </div>
  );
}
