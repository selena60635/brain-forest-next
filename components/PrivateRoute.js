import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Context } from "./AuthContext";

function PrivateRoute({ children }) {
  const { user } = useContext(Context);
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return children;
}
export { PrivateRoute };
