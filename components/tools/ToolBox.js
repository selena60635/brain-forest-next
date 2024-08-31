import React, { useState, useEffect } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import ShapeTool from "../tools/ShapeTool";
import TextTool from "../tools/TextTool";
import PathTool from "../tools/PathTool";
import ColorStyleTool from "../tools/ColorStyleTool";
import ThemeTool from "../tools/ThemeTool";
import CanvasTool from "../tools/CanvasTool";
import FontFamilyTool from "../tools/FontFamilyTool";
import FileTool from "../tools/FileTool";

export const updateNodes = (nodes, updateFn) => {
  return nodes.map((node) => {
    const updatedNode = {
      ...node,
      ...updateFn(node),
      children: node.children ? updateNodes(node.children, updateFn) : [],
    };

    if (node.summary) {
      updatedNode.summary = {
        ...node.summary,
        ...updateFn(node.summary),
      };
    }

    return updatedNode;
  });
};

export const updateSelectedNodes = (nodes, selectedNodes, updateFn) => {
  return nodes.map((node) => {
    let updatedNode = { ...node };

    if (selectedNodes.includes(node.id)) {
      updatedNode = {
        ...updatedNode,
        ...updateFn(updatedNode),
      };
    }

    if (node.summary && selectedNodes.includes(node.summary.id)) {
      updatedNode = {
        ...updatedNode,
        summary: {
          ...updatedNode.summary,
          ...updateFn(updatedNode.summary),
        },
      };
    }

    if (node.children && node.children.length > 0) {
      updatedNode.children = updateSelectedNodes(
        updatedNode.children,
        selectedNodes,
        updateFn
      );
    }

    return updatedNode;
  });
};

export const updateNodesColor = (
  nodes,
  colorStyle,
  parentColorIndex = null
) => {
  return nodes.map((node, index) => {
    const nodeColorIndex =
      parentColorIndex !== null
        ? parentColorIndex
        : index % colorStyle.nodes.length;
    const newBkColor =
      parentColorIndex === null
        ? colorStyle.nodes[nodeColorIndex]
        : colorStyle.child[nodeColorIndex];
    return {
      ...node,
      bkColor: newBkColor,
      pathColor: newBkColor,
      outline: { ...node.outline, color: newBkColor },
      font: { ...node.font, color: colorStyle.text },
      children: node.children
        ? updateNodesColor(node.children, colorStyle, nodeColorIndex)
        : [],
    };
  });
};
export default function ToolBox({
  rootNode,
  setRootNode,
  nodes,
  setNodes,
  selectedNodes,
  currentColorStyle,
  setCurrentColorStyle,
  colorStyles,
  findNode,
  setColorIndex,
  nodesColor,
  setNodesColor,
  setSelectedNodes,
  setLoading,
  nodeRefs,
  themes,
  currentTheme,
  setCurrentTheme,
  canvasBgColor,
  setCanvasBgColor,
  canvasBgStyle,
  setCanvasBgStyle,
  pathWidth,
  setPathWidth,
  pathStyle,
  setPathStyle,
  fontFamily,
  setFontFamily,
  rels,
  setRels,
  selectedRelId,
}) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(1);
  const [fontSize, setFontSize] = useState("16");
  const [colorStyleEnabled, setColorStyleEnabled] = useState(true);
  const colorStyleopts = colorStyles.slice(1).map((style) => {
    return { colors: [...style.nodes, style.root] };
  });

  useEffect(() => {
    if (selectedNodes.length === 0 && !selectedRelId) {
      setSelectedTabIndex(1);
    }
  }, [selectedNodes, selectedRelId]);

  return (
    <>
      <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
        <TabList className="flex justify-between divide-x text-gray-700">
          <Tab
            className={clsx(
              "grow p-1",
              {
                "pointer-events-none opacity-40 bg-white text-gray-700":
                  selectedNodes.length === 0 && !selectedRelId,
                "data-[selected]:bg-secondary data-[selected]:text-white":
                  selectedNodes.length > 0 || selectedRelId,
              },
              "data-[hover]:bg-primary data-[hover]:text-white data-[selected]:data-[hover]:bg-secondary data-[selected]:data-[hover]:text-white"
            )}
          >
            樣式
          </Tab>
          <Tab className="grow p-1 data-[selected]:bg-secondary data-[selected]:text-white data-[hover]:bg-primary data-[hover]:text-white data-[selected]:data-[hover]:bg-secondary data-[selected]:data-[hover]:text-white">
            佈景
          </Tab>
          <Tab className="grow p-1 data-[selected]:bg-secondary data-[selected]:text-white data-[hover]:bg-primary data-[hover]:text-white data-[selected]:data-[hover]:bg-secondary data-[selected]:data-[hover]:text-white">
            檔案
          </Tab>
        </TabList>
        <TabPanels className="text-gray-700 text-sm">
          <TabPanel>
            <ShapeTool
              rootNode={rootNode}
              setRootNode={setRootNode}
              nodes={nodes}
              setNodes={setNodes}
              selectedNodes={selectedNodes}
              setCurrentColorStyle={setCurrentColorStyle}
              currentColorStyle={currentColorStyle}
              colorStyles={colorStyles}
              findNode={findNode}
              colorStyleEnabled={colorStyleEnabled}
              colorStyleopts={colorStyleopts}
            />
            <Disclosure as="div" className="p-4 border-t" defaultOpen={true}>
              <DisclosureButton className="group flex w-full items-center">
                <ChevronDownIcon className="-rotate-90 size-5 fill-gray-400 group-data-[hover]:fill-gray-700 group-data-[open]:rotate-0" />
                <span className="font-medium">文字</span>
              </DisclosureButton>
              <DisclosurePanel className="mt-3 mb-1">
                <TextTool
                  rootNode={rootNode}
                  setRootNode={setRootNode}
                  nodes={nodes}
                  setNodes={setNodes}
                  selectedNodes={selectedNodes}
                  findNode={findNode}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  rels={rels}
                  setRels={setRels}
                  selectedRelId={selectedRelId}
                  fontFamily={fontFamily}
                  setFontFamily={setFontFamily}
                />
              </DisclosurePanel>
            </Disclosure>
            <Disclosure as="div" className="p-4 border-t" defaultOpen={true}>
              <DisclosureButton className="group flex w-full items-center">
                <ChevronDownIcon className="-rotate-90 size-5 fill-gray-400 group-data-[hover]:fill-gray-700 group-data-[open]:rotate-0" />
                <span className=" font-medium">分支</span>
              </DisclosureButton>
              <DisclosurePanel className="mt-3">
                <PathTool
                  rootNode={rootNode}
                  setRootNode={setRootNode}
                  nodes={nodes}
                  setNodes={setNodes}
                  selectedNodes={selectedNodes}
                  findNode={findNode}
                  pathWidth={pathWidth}
                  setPathWidth={setPathWidth}
                  pathStyle={pathStyle}
                  setPathStyle={setPathStyle}
                  isGlobal={false}
                />
                <ColorStyleTool
                  rootNode={rootNode}
                  setRootNode={setRootNode}
                  nodes={nodes}
                  setNodes={setNodes}
                  selectedNodes={selectedNodes}
                  currentColorStyle={currentColorStyle}
                  setCurrentColorStyle={setCurrentColorStyle}
                  colorStyles={colorStyles}
                  setColorIndex={setColorIndex}
                  nodesColor={nodesColor}
                  setNodesColor={setNodesColor}
                  findNode={findNode}
                  colorStyleEnabled={colorStyleEnabled}
                  setColorStyleEnabled={setColorStyleEnabled}
                  colorStyleopts={colorStyleopts}
                  isGlobal={false}
                  rels={rels}
                  setRels={setRels}
                  selectedRelId={selectedRelId}
                />
              </DisclosurePanel>
            </Disclosure>
          </TabPanel>
          <TabPanel>
            <ThemeTool
              setRootNode={setRootNode}
              setNodes={setNodes}
              setCurrentColorStyle={setCurrentColorStyle}
              themes={themes}
              currentTheme={currentTheme}
              setCurrentTheme={setCurrentTheme}
            />
            <div className="px-4 pb-4">
              <ColorStyleTool
                rootNode={rootNode}
                setRootNode={setRootNode}
                nodes={nodes}
                setNodes={setNodes}
                selectedNodes={selectedNodes}
                currentColorStyle={currentColorStyle}
                setCurrentColorStyle={setCurrentColorStyle}
                colorStyles={colorStyles}
                setColorIndex={setColorIndex}
                nodesColor={nodesColor}
                setNodesColor={setNodesColor}
                findNode={findNode}
                colorStyleEnabled={colorStyleEnabled}
                setColorStyleEnabled={setColorStyleEnabled}
                colorStyleopts={colorStyleopts}
                isGlobal={true}
                rels={rels}
                setRels={setRels}
                selectedRelId={selectedRelId}
              />
            </div>
            <div className="p-4 border-t">
              <CanvasTool
                canvasBgColor={canvasBgColor}
                setCanvasBgColor={setCanvasBgColor}
                canvasBgStyle={canvasBgStyle}
                setCanvasBgStyle={setCanvasBgStyle}
              />
            </div>
            <div className="p-4 border-t">
              <FontFamilyTool
                rootNode={rootNode}
                setRootNode={setRootNode}
                nodes={nodes}
                setNodes={setNodes}
                selectedNodes={selectedNodes}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                findNode={findNode}
                isGlobal={true}
                fontSize={fontSize}
                rels={rels}
                setRels={setRels}
                selectedRelId={selectedRelId}
              />
            </div>
            <div className="p-4 border-t">
              <PathTool
                rootNode={rootNode}
                setRootNode={setRootNode}
                nodes={nodes}
                setNodes={setNodes}
                selectedNodes={selectedNodes}
                findNode={findNode}
                pathWidth={pathWidth}
                setPathWidth={setPathWidth}
                pathStyle={pathStyle}
                setPathStyle={setPathStyle}
                isGlobal={true}
              />
            </div>
          </TabPanel>
          <TabPanel>
            <FileTool
              setRootNode={setRootNode}
              setNodes={setNodes}
              setSelectedNodes={setSelectedNodes}
              setCurrentColorStyle={setCurrentColorStyle}
              colorStyles={colorStyles}
              setLoading={setLoading}
              nodeRefs={nodeRefs}
              setCurrentTheme={setCurrentTheme}
              setCanvasBgColor={setCanvasBgColor}
              setCanvasBgStyle={setCanvasBgStyle}
              themes={themes}
              setPathWidth={setPathWidth}
              setPathStyle={setPathStyle}
              setFontFamily={setFontFamily}
              setRels={setRels}
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </>
  );
}
