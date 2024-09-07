"use client";
import React, { useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  //當路由變化，自動關閉
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="bg-light text-secondary relative">
      <nav className="w-full bg-light border-b border-secondary relative z-40">
        <div className="flex justify-between items-center container mx-auto px-4">
          <div className="flex space-x-3 items-center my-4">
            <Link className="text-2xl font-bold " href="/">
              <h1>Brain Forest</h1>
            </Link>
          </div>
          <ul className="sm:flex items-center space-x-8 hidden">
            <li>
              <Link
                href="/folder"
                className="px-3 py-2 font-medium hover:text-primary"
              >
                Folder
              </Link>
            </li>
            <li>
              <Link
                href="/workArea"
                className="px-3 py-2 font-medium hover:text-primary"
              >
                Workarea
              </Link>
            </li>
            <li>
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
          <div
            className={`${
              isOpen ? "menu-btn" : ""
            } sm:hidden flex flex-col justify-center items-center cursor-pointer w-10 h-10  transition-all duration-300`}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <div className="w-8 h-0.5 bg-secondary rounded transition duration-300"></div>
            <div className="w-8 h-0.5 bg-secondary my-1.5 rounded transition duration-300"></div>
            <div className="w-8 h-0.5 bg-secondary rounded transition duration-300"></div>
          </div>
        </div>
      </nav>
      <ul
        className={`${
          isOpen ? "translate-y-0" : "-translate-y-full"
        } sm:hidden transition-all duration-300 space-y-12 px-4 py-8 bg-light w-full border-b border-secondary text-secondary absolute z-30 top-[65px]  w-full h-[calc(100vh-65px)]`}
      >
        <li>
          <Link
            href="/folder"
            className="px-3 py-2 font-medium hover:text-primary"
          >
            Folder
          </Link>
        </li>
        <li>
          <Link
            href="/workArea"
            className="px-3 py-2 font-medium  hover:text-primary"
          >
            Workarea
          </Link>
        </li>
        <li>
          {user ? (
            <Link
              href="/login"
              className="px-3 py-2 font-medium  hover:text-primary"
              onClick={handleSignOut}
            >
              Sign Out
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-3 py-2 font-medium  hover:text-primary"
            >
              Sign In
            </Link>
          )}
        </li>
      </ul>
    </header>
  );
}
