"use client";
import React from "react";
import MindMap from "../../components/MindMap";

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export default function WorkArea() {
  return (
    <>
      <div className="">
        <h2>WorkArea</h2>
        <MindMap />
      </div>
    </>
  );
}
