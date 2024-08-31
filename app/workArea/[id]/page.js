import WorkArea from "../page";
import "../../../lib/setupConsole";
import { PrivateRoute } from "../../../components/PrivateRoute";

export default function WorkAreaPage({ params }) {
  return (
    <>
      <PrivateRoute>
        <WorkArea id={params.id} />
      </PrivateRoute>
    </>
  );
}
