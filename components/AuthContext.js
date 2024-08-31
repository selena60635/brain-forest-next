"use client";
import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import Loading from "../components/Loading";

export const Context = createContext();

function AuthContext({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const values = {
    user,
    setUser,
    loading,
    setLoading,
  };

  return (
    <Context.Provider value={values}>
      {loading ? <Loading /> : children}
    </Context.Provider>
  );
}
export { AuthContext };
