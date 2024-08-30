"use client";
import React, { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Context } from "./AuthContext";
import Login from "../app/login/page";

function PrivateRoute({ children }) {
  const { user } = useContext(Context);
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);
  if (!user) {
    return <Login />;
  }
  return children;
}
export { PrivateRoute };
