import React, { useState, useEffect, useRef } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Button,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { SketchPicker } from "react-color";
import { FaStrikethrough, FaItalic, FaBold } from "react-icons/fa";
import { updateSelectedNodes } from "./ToolBox";
import FontFamilyTool from "./FontFamilyTool";

export default function TextTool({
  rootNode,
  setRootNode,
  nodes,
  setNodes,
  selectedNodes,
  findNode,
  fontSize,
  setFontSize,
  rels,
  setRels,
  selectedRelId,
  fontFamily,
  setFontFamily,
}) {
  const [sizeQuery, setSizeQuery] = useState("");
  const [fontWeight, setFontWeight] = useState("400");
  const [isItalic, setIsItalic] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [textColor, setTextColor] = useState("white");
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  const btnRef = useRef(null);

  //fontSize
  const fontSizeOpts = ["8", "10", "12", "14", "16", "24", "36", "48", "60"];
  const fontSizeChange = (size) => {
    setFontSize(size);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          font: { ...prev.font, size: size + "px" },
        }));
      }
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, (node) => ({
          font: { ...node.font, size: size + "px" },
        }))
      );
    } else if (selectedRelId) {
      setRels((prev) =>
        prev.map((rel) =>
          rel.id === selectedRelId
            ? {
                ...rel,
                font: { ...rel.font, size: size + "px" },
              }
            : rel
        )
      );
    }
  };
  const handleSizeInputChange = (e) => {
    const value = e.target.value;
    setSizeQuery(value);
    setFontSize(value);
  };

  const handleSizeInputBlur = () => {
    if (sizeQuery.trim() !== "" && !isNaN(sizeQuery)) {
      fontSizeChange(sizeQuery.trim());
    }
  };

  const handleSizeInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      e.preventDefault();
      if (sizeQuery.trim() !== "" && !isNaN(sizeQuery)) {
        fontSizeChange(sizeQuery.trim());
      }
    }
  };

  //fontWeight
  const fontWeightOpts = [
    {
      value: "100",
      icon: "Thin",
    },
    {
      value: "200",
      icon: "ExtraLight",
    },
    {
      value: "300",
      icon: "Light",
    },
    {
      value: "400",
      icon: "Regular",
    },
    {
      value: "500",
      icon: "Medium",
    },
    {
      value: "600",
      icon: "DemiBold",
    },
    {
      value: "700",
      icon: "Bold",
    },
    {
      value: "800",
      icon: "ExtraBold",
    },
    {
      value: "900",
      icon: "Black",
    },
  ];
  const fontWeightChange = (size) => {
    setFontWeight(size);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          font: { ...prev.font, weight: size, isBold: size === "700" },
        }));
      }
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, (node) => ({
          font: { ...node.font, weight: size, isBold: size === "700" },
        }))
      );
    } else if (selectedRelId) {
      setRels((prev) =>
        prev.map((rel) =>
          rel.id === selectedRelId
            ? {
                ...rel,
                font: { ...rel.font, weight: size, isBold: size === "700" },
              }
            : rel
        )
      );
    }
  };

  //textColor
  const pickerToggle = () => {
    setShowPicker((prev) => !prev);
  };
  const textColorChange = (newColor) => {
    setTextColor(newColor.hex);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          font: { ...prev.font, color: newColor.hex },
        }));
      }
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, (node) => ({
          font: { ...node.font, color: newColor.hex },
        }))
      );
    } else if (selectedRelId) {
      setRels((prev) =>
        prev.map((rel) =>
          rel.id === selectedRelId
            ? {
                ...rel,
                font: { ...rel.font, color: newColor.hex },
              }
            : rel
        )
      );
    }
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //toggleBold
  const toggleBold = () => {
    const newWeight = fontWeight === "700" ? "400" : "700";
    setFontWeight(newWeight);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          font: {
            ...prev.font,
            weight: newWeight,
            isBold: newWeight === "700",
          },
        }));
      }
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, (node) => ({
          font: {
            ...node.font,
            weight: newWeight,
            isBold: newWeight === "700",
          },
        }))
      );
    } else if (selectedRelId) {
      setRels((prev) =>
        prev.map((rel) =>
          rel.id === selectedRelId
            ? {
                ...rel,
                font: {
                  ...rel.font,
                  weight: newWeight,
                  isBold: newWeight === "700",
                },
              }
            : rel
        )
      );
    }
  };

  //toggleItalic
  const toggleItalic = () => {
    setIsItalic(!isItalic);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          font: {
            ...prev.font,
            isItalic: !isItalic,
          },
        }));
      }
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, (node) => ({
          font: {
            ...node.font,
            isItalic: !isItalic,
          },
        }))
      );
    } else if (selectedRelId) {
      setRels((prev) =>
        prev.map((rel) =>
          rel.id === selectedRelId
            ? {
                ...rel,
                font: {
                  ...rel.font,
                  isItalic: !isItalic,
                },
              }
            : rel
        )
      );
    }
  };

  //toggleStrikethrough
  const toggleStrikethrough = () => {
    setIsStrikethrough(!isStrikethrough);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          font: {
            ...prev.font,
            isStrikethrough: !isStrikethrough,
          },
        }));
      }
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, (node) => ({
          font: {
            ...node.font,
            isStrikethrough: !isStrikethrough,
          },
        }))
      );
    } else if (selectedRelId) {
      setRels((prev) =>
        prev.map((rel) =>
          rel.id === selectedRelId
            ? {
                ...rel,
                font: {
                  ...rel.font,
                  isStrikethrough: !isStrikethrough,
                },
              }
            : rel
        )
      );
    }
  };

  //根據選取的節點樣式屬性動態更新文字工具
  useEffect(() => {
    if (selectedNodes.length > 0) {
      const selectedNode = findNode([rootNode, ...nodes], selectedNodes[0]);

      if (selectedNode) {
        setFontSize(
          selectedNode.font.size
            ? selectedNode.font.size.replace("px", "")
            : "16"
        );
        setFontWeight(selectedNode.font.weight || "400");
        setTextColor(selectedNode.font.color || "white");
        setIsItalic(selectedNode.font.isItalic || false);
        setIsStrikethrough(selectedNode.font.isStrikethrough || false);
      }
    } else if (selectedRelId) {
      const selectedRel = rels.find((rel) => rel.id === selectedRelId);
      if (selectedRel) {
        setFontSize(
          selectedRel.font.size ? selectedRel.font.size.replace("px", "") : "16"
        );
        setFontWeight(selectedRel.font.weight || "400");
        setIsItalic(selectedRel.font.isItalic || false);
        setIsStrikethrough(selectedRel.font.isStrikethrough || false);
        setTextColor(selectedRel.font.color || "#000");
      }
    }
  }, [
    selectedNodes,
    rootNode,
    nodes,
    findNode,
    setFontSize,
    rels,
    selectedRelId,
  ]);

  let selectedNode = findNode([rootNode, ...nodes], selectedNodes[0]);
  const selectedRel = rels.find((rel) => rel.id === selectedRelId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between space-x-4">
        <div className="flex flex-col space-y-4">
          <FontFamilyTool
            rootNode={rootNode}
            setRootNode={setRootNode}
            nodes={nodes}
            setNodes={setNodes}
            selectedNodes={selectedNodes}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            findNode={findNode}
            isGlobal={false}
            fontSize={fontSize}
            rels={rels}
            setRels={setRels}
            selectedRelId={selectedRelId}
          />
          <Menu as="div" className="relative block w-full ">
            <MenuButton className="flex items-center justify-between rounded-md border shadow w-full h-6 px-2 py-1 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-white">
              {fontWeightOpts.find((opt) => opt.value === fontWeight)?.icon}
              <ChevronDownIcon className="size-4" />
            </MenuButton>
            <MenuItems
              transition
              className="absolute z-10 left-0 right-0 origin-top-right rounded-md border shadow-lg bg-white py-1 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
            >
              {fontWeightOpts.map((opt) => (
                <MenuItem key={opt.value}>
                  <button
                    onClick={() => fontWeightChange(opt.value)}
                    className="group flex items-center gap-2 px-2 py-1 w-full data-[focus]:bg-gray-100"
                  >
                    {opt.icon}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
        <div className="flex flex-col items-end space-y-4 relative">
          <Combobox
            as="div"
            className="relative"
            value={fontSize}
            onChange={fontSizeChange}
            onClose={() => setSizeQuery("")}
          >
            <div className="relative group w-16">
              <ComboboxInput
                className={clsx(
                  "w-16 h-6 rounded-md border shadow bg-white pl-2 pr-6 py-1",
                  "group-hover:bg-gray-100 data-[open]:bg-gray-100"
                )}
                displayValue={() => fontSize}
                onChange={handleSizeInputChange}
                onBlur={handleSizeInputBlur}
                onKeyDown={handleSizeInputKeyDown}
              />
              <ComboboxButton className="absolute inset-y-0 right-0 px-2">
                <ChevronDownIcon className="size-4 group-hover:fill-black" />
              </ComboboxButton>
            </div>

            <ComboboxOptions
              transition
              className={clsx(
                "absolute z-10  w-[var(--input-width)] rounded-md border shadow-lg bg-white py-1 [--anchor-gap:var(--spacing-1)] empty:invisible",
                "transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
              )}
            >
              {fontSizeOpts.map((size) => (
                <ComboboxOption
                  key={size}
                  value={size}
                  className="group flex cursor-default items-center gap-2 px-2 py-1 h-6 data-[focus]:bg-gray-100"
                >
                  <div className="text-sm">{size}</div>
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </Combobox>
          <div
            ref={btnRef}
            className="w-12 h-6 rounded-md border border-gray-300"
            style={{ backgroundColor: textColor }}
            onClick={pickerToggle}
          ></div>
          {showPicker && (
            <div className="absolute z-10 top-6 right-10" ref={pickerRef}>
              <SketchPicker
                color={textColor}
                onChangeComplete={textColorChange}
                disableAlpha={true}
                presetColors={["#000000", "#FFFFFF"]}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex border rounded-md shadow">
        <Button
          className={`btn grow ${
            selectedNode?.font?.isBold || selectedRel?.font?.isBold
              ? "bg-primary text-white hover:bg-primary"
              : ""
          }`}
          onClick={toggleBold}
        >
          <FaBold size={18} />
        </Button>
        <Button
          className={`btn grow ${
            selectedNode?.font?.isItalic || selectedRel?.font?.isItalic
              ? "bg-primary text-white hover:bg-primary"
              : ""
          }`}
          onClick={toggleItalic}
        >
          <FaItalic size={18} />
        </Button>
        <Button
          className={`btn grow py-1.5 ${
            selectedNode?.font?.isStrikethrough ||
            selectedRel?.font?.isStrikethrough
              ? "bg-primary text-white hover:bg-primary"
              : ""
          }`}
          onClick={toggleStrikethrough}
        >
          <FaStrikethrough size={18} />
        </Button>
      </div>
    </div>
  );
}
