"use client";
import React, { useContext } from "react";
import { Context } from "./AuthContext";
import Link from "next/link";
import SweetAlert from "./SweetAlert";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";

export async function handleSignOut() {
  const logoutAlert = await SweetAlert({
    type: "alert",
    title: "Confirm sign out?",
    icon: "warning",
    confirmButtonText: "Yes, sign out",
    showCancelButton: true,
    cancelButtonText: "No, cancel",
  });
  if (logoutAlert.isConfirmed) {
    try {
      await signOut(auth);
    } catch (err) {
      SweetAlert({
        type: "toast",
        title: "Signed out failed!",
        icon: "error",
      });
    }
  }
}

export default function Header() {
  const { user } = useContext(Context);

  return (
    <header className="bg-light border-b border-secondary text-secondary">
      <nav className="flex justify-between items-center container mx-auto px-4">
        <div className="flex space-x-3 items-center my-4">
          <Link className="text-2xl font-bold " href="/">
            <h1>Brain Forest</h1>
          </Link>
        </div>
        <ul className="flex items-center space-x-8">
          <li className="">
            <Link
              href="/folder"
              className="px-3 py-2 font-medium hover:text-primary"
            >
              Folder
            </Link>
          </li>
          <li className="">
            <Link
              href="/workArea"
              className="px-3 py-2 font-medium  hover:text-primary"
            >
              Workarea
            </Link>
          </li>
          <li className="">
            {user ? (
              <button
                onClick={handleSignOut}
                className="rounded-md px-3 py-2 font-medium text-white bg-secondary hover:bg-primary"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-md px-3 py-2 font-medium text-white bg-secondary hover:bg-primary"
              >
                Sign In
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
