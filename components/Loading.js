import { PacmanLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-light z-50">
      <PacmanLoader color="#3AB795" size={50} />
    </div>
  );
}
