import WorkArea from "../page";
import "../../../lib/setupConsole";

export default function WorkAreaPage({ params }) {
  return (
    <>
      <WorkArea id={params.id} />
    </>
  );
}
