import React, { useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { updateNodes, updateSelectedNodes } from "./ToolBox";

export default function PathTool({
  rootNode,
  setRootNode,
  nodes,
  setNodes,
  selectedNodes,
  findNode,
  isGlobal,
  pathWidth,
  setPathWidth,
  pathStyle,
  setPathStyle,
}) {
  const pathWidthOpts = [
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

  const pathWidthChange = (width) => {
    setPathWidth(width);
    if (isGlobal) {
      setRootNode((prev) => ({
        ...prev,
        path: { ...prev.path, width: width },
      }));
      setNodes((prev) =>
        updateNodes(prev, (node) => ({
          path: { ...node.path, width: width },
        }))
      );
    } else if (selectedNodes.length > 0) {
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, (node) => ({
          path: { ...node.path, width: width },
        }))
      );
    }
  };
  const pathStyleOpts = [
    {
      label: "solid",
      value: "0",
      icon: (
        <svg width="100%" height="20">
          <line
            x1="0"
            y1="10"
            x2="100%"
            y2="10"
            stroke="black"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      label: "dashed",
      value: "8",
      icon: (
        <svg width="100%" height="20">
          <line
            x1="0"
            y1="10"
            x2="100%"
            y2="10"
            stroke="black"
            strokeWidth="2"
            strokeDasharray="8,8"
          />
        </svg>
      ),
    },

    {
      label: "none",
      value: "0",
      icon: "無",
    },
  ];

  const pathStyleChange = (value, style) => {
    let newWidth = style === "none" ? "0" : pathWidth === "0" ? "3" : pathWidth;
    setPathWidth(newWidth);
    setPathStyle(style);
    if (isGlobal) {
      setRootNode((prev) => ({
        ...prev,
        path: {
          ...prev.path,
          style: value,
          width: newWidth,
        },
      }));
      setNodes((prev) =>
        updateNodes(prev, (node) => ({
          path: {
            ...node.path,
            style: value,
            width: newWidth,
          },
        }))
      );
    } else if (selectedNodes.length > 0) {
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, (node) => ({
          path: {
            ...node.path,
            style: value,
            width: newWidth,
          },
        }))
      );
    }
  };

  useEffect(() => {
    if (isGlobal) {
      if (rootNode.path.width !== pathWidth) {
        setPathWidth(rootNode.path.width || "3");
      }
      const newStyle =
        rootNode.path.width === "0"
          ? "none"
          : rootNode.path.style === "0"
          ? "solid"
          : "dashed";
      if (pathStyle !== newStyle) {
        setPathStyle(newStyle);
      }
    } else if (selectedNodes.length === 1) {
      const selectedNode = findNode([rootNode, ...nodes], selectedNodes[0]);

      if (selectedNode) {
        if (selectedNode.path.width !== pathWidth) {
          setPathWidth(selectedNode.path.width || "3");
        }
        const newStyle =
          selectedNode.path.width === "0"
            ? "none"
            : selectedNode.path.style === "0"
            ? "solid"
            : "dashed";
        if (pathStyle !== newStyle) {
          setPathStyle(newStyle);
        }
      }
    }
  }, [
    selectedNodes,
    rootNode,
    nodes,
    findNode,
    isGlobal,
    pathWidth,
    pathStyle,
    setPathStyle,
    setPathWidth,
  ]);

  return (
    <div>
      {isGlobal && <p className="mb-2">分支線段寬度</p>}
      <Menu as="div" className="relative inline-block w-full mb-4">
        <MenuButton className="flex items-center justify-between gap-2 rounded-md border shadow w-full h-6 px-2 py-1 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-white">
          {pathStyleOpts.find((opt) => opt.label === pathStyle)?.icon}

          <ChevronDownIcon className="shrink-0 size-4" />
        </MenuButton>

        <MenuItems
          transition
          className="absolute z-10 left-0 right-0 origin-top-right rounded-md border shadow-lg bg-white py-1 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {pathStyleOpts.map((opt, index) => (
            <MenuItem key={index}>
              <button
                onClick={() => pathStyleChange(opt.value, opt.label)}
                className="group flex items-center gap-2 px-4 py-1 w-full data-[focus]:bg-gray-100"
              >
                {opt.icon}
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
      {isGlobal && <p className="mb-2">分支線段樣式</p>}
      <Menu as="div" className="relative inline-block w-full mb-4">
        <MenuButton className="flex items-center justify-between gap-2 rounded-md border shadow w-full h-6 px-2 py-1 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-white">
          {pathWidthOpts.find((opt) => opt.value === pathWidth)?.icon || "無"}
          <ChevronDownIcon className="size-4 " />
        </MenuButton>

        <MenuItems
          transition
          className="absolute z-10 left-0 right-0 origin-top-right rounded-md border shadow-lg bg-white py-1 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {pathWidthOpts.map((opt) => (
            <MenuItem key={opt.value}>
              <button
                onClick={() => pathWidthChange(opt.value)}
                className="group flex items-center gap-2 px-2 py-1 w-full data-[focus]:bg-gray-100"
              >
                {opt.icon}
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
}
