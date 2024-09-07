import React, { useState, useEffect, useRef } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { SketchPicker } from "react-color";
import { updateSelectedNodes } from "./ToolBox";

export default function ShapeTool({
  rootNode,
  setRootNode,
  nodes,
  setNodes,
  selectedNodes,
  currentColorStyle,
  findNode,
  colorStyleEnabled,
  colorStyleopts,
}) {
  const [bgColor, setBgColor] = useState("#1A227E");
  const [borderColor, setBorderColor] = useState("#1A227E");
  const [borderStyle, setBorderStyle] = useState("none");
  const [borderWidth, setBorderWidth] = useState("3");
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showBorderPicker, setShowBorderPicker] = useState(false);
  const bgPickerRef = useRef(null);
  const bgBtnRef = useRef(null);
  const borderPickerRef = useRef(null);
  const borderBtnRef = useRef(null);

  const borderStyleOpts = [
    {
      value: "solid",
      icon: (
        <div className="w-8 h-4 border-2 border-secondary rounded-md"></div>
      ),
    },
    {
      value: "dashed",
      icon: (
        <div className="w-8 h-4 border-dashed border-2 border-secondary rounded-md"></div>
      ),
    },
    {
      value: "dotted",
      icon: (
        <div className="w-8 h-4 border-dotted border-2 border-secondary rounded-md"></div>
      ),
    },
    {
      value: "double",
      icon: (
        <div className="w-8 h-4 border-double border-4 border-secondary rounded-md"></div>
      ),
    },
    {
      value: "none",
      icon: "無邊框",
    },
  ];
  const borderWidthOpts = [
    {
      value: "1",
      icon: "極細",
    },
    {
      value: "2",
      icon: "細",
    },
    {
      value: "3",
      icon: "適中",
    },
    {
      value: "4",
      icon: "粗",
    },
    {
      value: "5",
      icon: "極粗",
    },
  ];

  const bgColorChange = (newColor) => {
    setBgColor(newColor.hex);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          bkColor: newColor.hex,
        }));
      }
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, () => ({
          bkColor: newColor.hex,
        }))
      );
    }
  };

  const borderColorChange = (newColor) => {
    setBorderColor(newColor.hex);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          outline: { ...prev.outline, color: newColor.hex },
        }));
      }
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, (node) => ({
          outline: { ...node.outline, color: newColor.hex },
        }))
      );
    }
  };

  const borderStyleChange = (style) => {
    setBorderStyle(style);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          outline: { ...prev.outline, style: style },
        }));
      }
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, (node) => ({
          outline: { ...node.outline, style: style },
        }))
      );
    }
  };
  const borderWidthChange = (width) => {
    setBorderWidth(width);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          outline: { ...prev.outline, width: width + "px" },
        }));
      }
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, (node) => ({
          outline: { ...node.outline, width: width + "px" },
        }))
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        bgPickerRef.current &&
        !bgPickerRef.current.contains(e.target) &&
        !bgBtnRef.current.contains(e.target)
      ) {
        setShowBgPicker(false);
      }
      if (
        borderPickerRef.current &&
        !borderPickerRef.current.contains(e.target) &&
        !borderBtnRef.current.contains(e.target)
      ) {
        setShowBorderPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedNodes.length > 0) {
      const selectedNode = findNode([rootNode, ...nodes], selectedNodes[0]);

      if (selectedNode) {
        setBgColor(selectedNode.bkColor || "#FFFFFF");
        setBorderColor(selectedNode.outline?.color || "#000000");
        setBorderStyle(selectedNode.outline?.style || "none");
        setBorderWidth(
          selectedNode.outline?.width
            ? selectedNode.outline.width.replace("px", "")
            : "3"
        );
      }
    }
  }, [selectedNodes, rootNode, nodes, findNode]);

  const bgPickerToggle = () => {
    setShowBgPicker((prev) => !prev);
  };
  const borderPickerToggle = () => {
    setShowBorderPicker((prev) => !prev);
  };

  return (
    <>
      <Disclosure as="div" className="p-4 border-t" defaultOpen={true}>
        <DisclosureButton className="group flex w-full items-center">
          <ChevronDownIcon className="-rotate-90 size-5 fill-gray-400 group-data-[hover]:fill-gray-700 group-data-[open]:rotate-0" />
          <span className="font-medium">形狀</span>
        </DisclosureButton>
        <DisclosurePanel className="mt-2 space-y-2">
          <div className="flex justify-between items-center relative">
            <span>底色</span>
            <div
              ref={bgBtnRef}
              className="w-12 h-6 ml-2 rounded-md border border-gray-300 "
              style={{ backgroundColor: bgColor }}
              onClick={bgPickerToggle}
            ></div>
            {showBgPicker && (
              <div
                className="absolute z-10 top-0 right-10 react-color-sketch"
                ref={bgPickerRef}
              >
                <SketchPicker
                  color={bgColor}
                  onChangeComplete={bgColorChange}
                  presetColors={[]}
                  className="!shadow-none"
                  disableAlpha={true}
                />
                {colorStyleEnabled && (
                  <div className="bg-white w-full rounded-b border-t text-xs p-2.5">
                    目前風格
                    <div className="flex justify-between mt-2">
                      {colorStyleopts[currentColorStyle - 1]?.colors.map(
                        (styleColor, index) => (
                          <div
                            key={index}
                            className="w-5 h-5 cursor-pointer"
                            style={{ backgroundColor: styleColor }}
                            onClick={() => bgColorChange({ hex: styleColor })}
                          ></div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="sm:flex flex-wrap justify-between items-center relative">
            <span>邊框</span>
            <div className="flex justify-between mt-1 sm:mt-0">
              <Menu as="div" className="relative inline-block">
                <MenuButton className="flex items-center justify-between gap-2 rounded-md border shadow w-20 h-6 px-1 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-white ">
                  {
                    borderStyleOpts.find((opt) => opt.value === borderStyle)
                      ?.icon
                  }
                  <ChevronDownIcon className="size-4" />
                </MenuButton>

                <MenuItems
                  transition
                  className="absolute z-10 left-0 right-0 w-20 origin-top-right rounded-xl border shadow-lg bg-white p-1 text-sm transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
                >
                  {borderStyleOpts.map((opt) => (
                    <MenuItem key={opt.value}>
                      <button
                        onClick={() => borderStyleChange(opt.value)}
                        className="group flex items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-gray-100"
                      >
                        {opt.icon}
                      </button>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
              <div
                ref={borderBtnRef}
                className="w-12 h-6 ml-2 rounded-md border border-gray-300"
                style={{ backgroundColor: borderColor }}
                onClick={borderPickerToggle}
              />
              {showBorderPicker && (
                <div
                  className="absolute z-10 right-10 react-color-sketch"
                  ref={borderPickerRef}
                >
                  <SketchPicker
                    color={borderColor}
                    onChangeComplete={borderColorChange}
                    presetColors={[]}
                    className="!shadow-none"
                    disableAlpha={true}
                  />
                  {colorStyleEnabled && (
                    <div className="bg-white w-full rounded-b border-t text-xs p-2.5">
                      目前風格
                      <div className="flex justify-between mt-2">
                        {colorStyleopts[currentColorStyle - 1]?.colors.map(
                          (styleColor, index) => (
                            <div
                              key={index}
                              className="w-5 h-5 cursor-pointer"
                              style={{ backgroundColor: styleColor }}
                              onClick={() =>
                                borderColorChange({ hex: styleColor })
                              }
                            ></div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Menu as="div" className="relative inline-block w-full mt-4 mb-1">
              <MenuButton className="flex items-center justify-between gap-2 rounded-md border shadow w-full h-6 px-2 py-1 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-white">
                {borderWidthOpts.find((opt) => opt.value === borderWidth)
                  ?.icon || "適中"}
                <ChevronDownIcon className="size-4 " />
              </MenuButton>

              <MenuItems
                transition
                className="absolute z-10 left-0 right-0 origin-top-right rounded-md border shadow-lg bg-white py-1 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
              >
                {borderWidthOpts.map((opt) => (
                  <MenuItem key={opt.value}>
                    <button
                      onClick={() => borderWidthChange(opt.value)}
                      className="group flex items-center gap-2 px-2 py-1 w-full data-[focus]:bg-gray-100"
                    >
                      {opt.icon}
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>
        </DisclosurePanel>
      </Disclosure>
    </>
  );
}
