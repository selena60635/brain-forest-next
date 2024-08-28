import React, { useState, useEffect } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { updateSelectedNodes } from "./ToolBox";
import clsx from "clsx";

export const getAvailableFonts = async () => {
  const fonts = await document.fonts.ready;
  const fontList = [];
  const excludedFonts = ["Material Symbols Rounded", "Poppins"];
  fonts.forEach((font) => {
    if (excludedFonts.includes(font.family)) return;
    fontList.push(font.family);
  });

  return [...new Set(fontList)];
};
export default function FontFamilyTool({
  rootNode,
  setRootNode,
  nodes,
  setNodes,
  selectedNodes,
  fontFamily,
  setFontFamily,
  findNode,
  isGlobal,
  fontSize,
  rels,
  setRels,
  selectedRelId,
}) {
  const [query, setQuery] = useState("");
  const [availableFonts, setAvailableFonts] = useState([]);

  //fontFamily
  useEffect(() => {
    const fetchFonts = async () => {
      const fonts = await getAvailableFonts();
      setAvailableFonts(fonts);
    };
    fetchFonts();
  }, []);

  const filteredFonts =
    query === ""
      ? availableFonts
      : availableFonts.filter((font) =>
          font.toLowerCase().includes(query.toLowerCase())
        );

  const fontFamilyChange = async (font) => {
    setFontFamily(font);

    await document.fonts.load(`${fontSize}px ${font}`);

    if (isGlobal) {
      setRootNode((prev) => ({
        ...prev,
        font: { ...prev.font, family: font },
      }));
      setNodes((prev) =>
        updateNodes(prev, (node) => ({
          font: { ...node.font, family: font },
        }))
      );
      setRels((prev) =>
        prev.map((rel) => ({ ...rel, font: { ...rel.font, family: font } }))
      );
    } else if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          font: { ...prev.font, family: font },
        }));
      }
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, (node) => ({
          font: { ...node.font, family: font },
        }))
      );
    } else if (selectedRelId) {
      setRels((prev) =>
        prev.map((rel) =>
          rel.id === selectedRelId
            ? {
                ...rel,
                font: { ...rel.font, family: font },
              }
            : rel
        )
      );
    }
  };
  useEffect(() => {
    if (isGlobal) {
      setFontFamily(rootNode.font.family || "Noto Sans TC");
    } else if (selectedNodes.length > 0) {
      const selectedNode = findNode([rootNode, ...nodes], selectedNodes[0]);

      if (selectedNode) {
        setFontFamily(selectedNode.font.family || "Noto Sans TC");
      }
    } else if (selectedRelId) {
      const selectedRel = rels.find((rel) => rel.id === selectedRelId);
      if (selectedRel) {
        setFontFamily(selectedRel.font?.family || "Noto Sans TC");
      }
    }
  }, [
    selectedNodes,
    rootNode,
    nodes,
    findNode,
    isGlobal,
    setFontFamily,
    rels,
    selectedRelId,
  ]);

  return (
    <>
      {isGlobal && <p className="mb-2">整體字型</p>}
      <Combobox
        as="div"
        className="relative"
        value={fontFamily}
        onChange={fontFamilyChange}
        onClose={() => setQuery("")}
      >
        <div className="relative group w-full">
          <ComboboxInput
            className={clsx(
              "w-full h-6 rounded-md border shadow bg-white pl-2 pr-6 py-1",
              "group-hover:bg-gray-100 data-[open]:bg-gray-100"
            )}
            displayValue={() => fontFamily}
            onChange={(e) => setQuery(e.target.value)}
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
          {filteredFonts.map((font) => (
            <ComboboxOption
              key={font}
              value={font}
              className="group flex cursor-default items-center gap-2 px-4 py-1 data-[focus]:bg-gray-100"
            >
              <div className="text-sm">{font}</div>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </>
  );
}
