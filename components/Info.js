import React, { useState } from "react";
import { FiHelpCircle } from "react-icons/fi";
import { Button } from "@headlessui/react";

export default function Info() {
  const [showInfo, setShowInfo] = useState(false);

  const toggleInfo = () => {
    setShowInfo((prev) => !prev);
  };

  return (
    <>
      <div className="btns-group bottom-10 left-5 fixed z-20 h-12">
        <Button className="btn px-2" onClick={toggleInfo}>
          <FiHelpCircle
            className={`text-2xl ${showInfo ? "text-primary" : ""}`}
          />
        </Button>
      </div>

      {showInfo && (
        <div className="info">
          <ul className="space-y-2">
            <li>Enter - Add Sibling Node</li>
            <li>Tab - Add Child Node</li>
            <li>Alt + R - Create Relationship</li>
            <li>Alt + S - Add Summary</li>
            <li>Del - Delete Node</li>
            <li>Ctrl + S - Save File</li>
            <li>Space - Pan Mode</li>
            <li>F1 - Center the Map</li>
            <li>F2/Esc - Full screen</li>
            <li>"+" - Zoom In</li>
            <li>"-" - Zoom Out</li>
            <li>"0" - Zoom to 100%</li>
          </ul>
        </div>
      )}
    </>
  );
}
