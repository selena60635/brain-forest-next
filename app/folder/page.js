"use client";
import React from "react";
import { MdAdd } from "react-icons/md";
import { PrivateRoute } from "../../components/PrivateRoute";

export default function Folder() {
  return (
    <PrivateRoute>
      <section
        className="bg-light/50 h-[calc(100vh-65px)] flex item-start justify-center px-8 pt-20 pb-32"
        style={{
          background: "url(/BG-01.jpg) center no-repeat",
        }}
      >
        <div className="max-w-6xl w-full mx-auto bg-white/80 shadow-xl rounded-xl p-10 flex flex-col justify-between">
          <>
            <div className="grid grid-cols-4 gap-8">
              <button className="min-h-24  p-2 rounded-lg flex items-center justify-center border border-gray-400 hover:border-gray-700 hover:bg-primary/10 group transition-all duration-200">
                <MdAdd
                  size={24}
                  className="text-gray-400 text-3xl group-hover:text-gray-700 transition-all duration-200"
                />
              </button>
            </div>
          </>
        </div>
      </section>
    </PrivateRoute>
  );
}
