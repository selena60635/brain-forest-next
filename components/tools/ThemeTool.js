import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

import { updateNodesColor } from "./ToolBox";

export default function ThemeTool({
  setRootNode,
  setNodes,
  setCurrentColorStyle,
  themes,
  currentTheme,
  setCurrentTheme,
}) {
  //佈景主題選項
  const themeStyleopts = themes.map((theme) => {
    return {
      name: theme.name,
      colors: [...theme.colorStyles[0].nodes, theme.colorStyles[0].root],
    };
  });
  //切換佈景主題
  const themeStyleChange = (index) => {
    setCurrentTheme(index);
    setCurrentColorStyle(1);
    setRootNode((prevRootNode) => ({
      ...prevRootNode,
      bkColor: themes[index].colorStyles[0].root,
      outline: {
        ...prevRootNode.outline,
        color: themes[index].colorStyles[0].root,
      },
      font: {
        ...prevRootNode.font,
        color: themes[index].colorStyles[0].text,
      },
    }));
    setNodes((prevNodes) =>
      updateNodesColor(prevNodes, themes[index].colorStyles[0])
    );
  };

  return (
    <div>
      <div className="p-4 border-t">
        <p className="font-medium mb-2">佈景主題</p>
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center justify-between gap-2 rounded-md border shadow w-full p-4 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-white">
            <div className="flex items-center gap-1 w-full">
              {themeStyleopts[currentTheme]?.colors.map((color, colorIndex) => (
                <div
                  key={colorIndex}
                  className="grow inline-block rounded-full aspect-square"
                  style={{
                    backgroundColor: color,
                  }}
                ></div>
              ))}
              <span className="ml-2 hidden sm:inline">
                {themeStyleopts[currentTheme]?.name}
              </span>
            </div>

            <ChevronDownIcon className="size-4" />
          </MenuButton>

          <MenuItems
            transition
            className="absolute z-10 left-0 right-0 origin-top-right rounded-md border shadow-lg bg-white py-2 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            {themeStyleopts.map((style, index) => (
              <MenuItem key={index}>
                <button
                  onClick={() => themeStyleChange(index)}
                  className="group w-full p-4 data-[focus]:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    {style.colors.map((color, colorIndex) => (
                      <div
                        key={colorIndex}
                        className="grow inline-block rounded-full aspect-square"
                        style={{
                          backgroundColor: color,
                        }}
                      ></div>
                    ))}
                    <span className="ml-2">{style.name}</span>
                  </div>
                </button>
              </MenuItem>
            ))}
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
}
