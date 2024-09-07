import React, { useState, useRef, useEffect } from "react";
import { SketchPicker } from "react-color";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export default function CanvasTool({
  canvasBgColor,
  setCanvasBgColor,
  canvasBgStyle,
  setCanvasBgStyle,
}) {
  const [showCanvasBgPicker, setShowCanvasBgPicker] = useState(false);
  const canvasBgPickerRef = useRef(null);
  const canvasBgBtnRef = useRef(null);

  //畫布背景顏色
  const canvasBgPickerToggle = () => {
    setShowCanvasBgPicker((prev) => !prev);
  };
  const canvasBgColorChange = (newColor) => {
    setCanvasBgColor(newColor.hex);
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        canvasBgPickerRef.current &&
        !canvasBgPickerRef.current.contains(e.target) &&
        !canvasBgBtnRef.current.contains(e.target)
      ) {
        setShowCanvasBgPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //畫布背景樣式
  const canvasBgStyleOpts = [
    {
      value: "bg-grid",
      opt: <div className="w-full h-12 rounded-md bg-grid-sm"></div>,
      icon: <div className="w-full h-full rounded-md bg-grid-sm"></div>,
    },
    {
      value: "bg-dot",
      opt: <div className="w-full h-full rounded-md bg-dot-sm"></div>,
      icon: <div className="w-full h-full rounded-md bg-dot-sm"></div>,
    },
    {
      value: "bg-grid-dark",
      opt: <div className="w-full h-12 rounded-md bg-grid-sm-dark"></div>,
      icon: <div className="w-full h-full rounded-md bg-grid-sm-dark"></div>,
    },
    {
      value: "bg-dot-dark",
      opt: <div className="w-full h-full rounded-md bg-dot-sm-dark"></div>,
      icon: <div className="w-full h-full rounded-md bg-dot-sm-dark"></div>,
    },
    {
      value: "none",
      opt: (
        <p className="w-full h-12 rounded-md flex items-center justify-center">
          無
        </p>
      ),
      icon: "無",
    },
  ];
  const canvasBgStyleChange = (style) => {
    setCanvasBgStyle(style);
    const darkStyles = ["bg-grid-dark", "bg-dot-dark"];
    if (darkStyles.includes(style)) {
      setCanvasBgColor("#1a1a1a");
    } else {
      setCanvasBgColor("#fff");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center relative mb-4">
        <p>畫布背景顏色</p>
        <div
          ref={canvasBgBtnRef}
          className="w-12 h-6 ml-2 rounded-md border border-gray-300 "
          style={{ backgroundColor: canvasBgColor }}
          onClick={canvasBgPickerToggle}
        ></div>
        {showCanvasBgPicker && (
          <div className="absolute z-10 top-0 right-10" ref={canvasBgPickerRef}>
            <SketchPicker
              color={canvasBgColor}
              onChangeComplete={canvasBgColorChange}
              disableAlpha={true}
              presetColors={["#000000", "#FFFFFF"]}
            />
          </div>
        )}
      </div>
      <div className="sm:flex justify-between">
        <p>畫布背景樣式</p>
        <Menu as="div" className="relative inline-block mt-2 sm:mt-0">
          <MenuButton className="flex items-center justify-between gap-2 rounded-md border shadow py-2 px-3 w-36 h-12 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-white ">
            {canvasBgStyleOpts.find((opt) => opt.value === canvasBgStyle)?.icon}
            <ChevronDownIcon className="size-4" />
          </MenuButton>

          <MenuItems
            transition
            className="absolute z-10 grid grid-cols-2 gap-2 origin-top-right rounded-md border shadow-lg bg-white p-4 w-36 text-sm transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            {canvasBgStyleOpts.map((opt) => (
              <MenuItem key={opt.value}>
                <button
                  onClick={() => canvasBgStyleChange(opt.value)}
                  className="group rounded-md outline outline-2 outline-transparent border shadow data-[focus]:outline-primary data-[focus]:border-primary"
                >
                  {opt.opt}
                </button>
              </MenuItem>
            ))}
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
}
