import React, { useEffect, useLayoutEffect, useCallback, useRef } from "react";
import RootNode from "./RootNode";
import Node from "./Node";
import Relations from "./Relations";

export default function MindMap({
  nodes,
  setNodes,
  rootNode,
  setRootNode,
  selectedNodes,
  setSelectedNodes,
  selectBox,
  rootRef,
  nodeRefs,
  delNode,
  findParentNode,
  addNode,
  addSiblingNode,
  addSiblingChildNode,
  addChildNode,

  getNodeCanvasLoc,

  togglePanMode,
  sumRefs,
  addSummary,
  handleNodeClick,
  rels,
  relMode,
  setRelMode,
  setRels,
  selectedRelId,
  setSelectedRelId,
  relRefs,
  btnsRef,
  isPanMode,

  handleLinkMode,
}) {
  const svgRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的svg Dom元素

  //取得根結點svg位置
  const getRootSvgLoc = () => {
    if (rootRef.current && svgRef.current) {
      const rootRect = rootRef.current.getBoundingClientRect(); // 獲取根節點的矩形物件
      const svgRect = svgRef.current.getBoundingClientRect(); // 獲取 SVG 的矩形物件

      return {
        x: rootRect.left - svgRect.left + rootRect.width, // 計算path根節點接點的X坐標(相對於g，也就是將g當作視口去計算)
        y: rootRect.top - svgRect.top + rootRect.height / 2, // 計算根節點的中心點相對於g的Y坐標
      };
    }

    return { x: 0, y: 0 };
  };

  //取得節點svg位置
  const getNodeSvgLoc = useCallback(
    (nodeRef) => {
      if (nodeRef && nodeRef.current && svgRef.current) {
        const nodeRect = nodeRef.current.getBoundingClientRect();
        const svgRect = svgRef.current.getBoundingClientRect();

        return {
          x: nodeRect.left - svgRect.left,
          y: nodeRect.top - svgRect.top + nodeRect.height / 2,
        };
      }
      return { x: 0, y: 0 };
    },
    [svgRef]
  );

  //更新節點與根節點的連接線
  const updateLocs = useCallback(() => {
    setNodes((prev) => [...prev]);
    setRootNode((prev) => ({ ...prev }));
  }, [setNodes, setRootNode]);

  const nodesStr = JSON.stringify(nodes);
  const rootNodeStr = JSON.stringify(rootNode);

  useLayoutEffect(() => {
    updateLocs();
  }, [nodesStr, rootNodeStr, updateLocs, rels]);

  //判定是否被選取
  const isNodeSelected = useCallback(
    (nodeRect) => {
      if (!selectBox) return false; // 如果沒有生成選擇框，返回false
      // 計算選擇框的四個邊位置
      const selBox = {
        left: selectBox.left,
        right: selectBox.left + selectBox.width,
        top: selectBox.top,
        bottom: selectBox.top + selectBox.height,
      };
      // 計算節點的四個邊位置
      const nodeBox = {
        left: nodeRect.left,
        right: nodeRect.right,
        top: nodeRect.top,
        bottom: nodeRect.bottom,
      };
      //滿足以下的條件就表示選擇框有接觸到節點
      return (
        selBox.right > nodeBox.left &&
        selBox.left < nodeBox.right &&
        selBox.bottom > nodeBox.top &&
        selBox.top < nodeBox.bottom
      );
    },
    [selectBox]
  );

  useLayoutEffect(() => {
    if (selectBox) {
      const selected = []; //存放被選中的節點ID
      const rootRect = getNodeCanvasLoc(rootRef); //取得根節點在canvas上的位置
      //如果根節點被選中，將根節點ID加入到selected中
      if (isNodeSelected(rootRect)) {
        selected.push(rootNode.id);
      }

      //一層層遞迴遍歷nodes中所有的節點，判斷每一個節點是否有被選中
      const traverseNodes = (nodes, refs, parentRefs) => {
        nodes.forEach((node, index) => {
          //取得當前節點的引用
          const nodeRef = parentRefs
            ? parentRefs.current[index]
            : refs.current[index];

          if (nodeRef) {
            const nodeRect = getNodeCanvasLoc(nodeRef); // 取得當前節點在canvas上的位置
            if (isNodeSelected(nodeRect)) {
              //若當前節點在選擇範圍內，將節點ID加入到selected中
              selected.push(node.id);
            }
            if (node.children) {
              //將當前節點的children、children中子節點的引用、子節點的父節點引用傳入，遞迴一層層遍歷子節點
              traverseNodes(node.children, nodeRefs, {
                current: nodeRefs.current[node.id],
              });
            }
          }
        });
      };

      traverseNodes(nodes, nodeRefs); //開始遞迴遍歷所有節點

      //判斷所有的總結節點是否在選取框範圍內
      for (let id in sumRefs.current) {
        if (sumRefs.current[id]?.current) {
          const sumRect = getNodeCanvasLoc(sumRefs.current[id]); // 取得總結節點的位置
          if (isNodeSelected(sumRect)) {
            selected.push(id); // 若被選中，將 summary.id 加入到 selected 中
          }
        }
      }

      setSelectedNodes((prev) => {
        const newSelectedNodes = prev.filter((id) => selected.includes(id));
        selected.forEach((id) => {
          if (!newSelectedNodes.includes(id)) {
            newSelectedNodes.push(id);
          }
        });
        return newSelectedNodes;
      }); //更新選擇名單
    }
  }, [
    selectBox,
    nodes,
    isNodeSelected,
    rootNode.id,
    nodeRefs,
    setSelectedNodes,
    getNodeCanvasLoc,
    rootRef,
    sumRefs,
  ]);

  const handleKeyDown = useCallback(
    (e) => {
      if (selectBox) {
        return;
      }
      if (
        (["Enter", "Delete", "Tab"].includes(e.key) &&
          selectedNodes.length === 1) ||
        [" "].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === "Enter" && selectedNodes.length === 1) {
        if (selectedNodes[0] === rootNode.id) {
          addNode();
          return;
        }

        const parentNode = findParentNode([rootNode, ...nodes]);

        if (parentNode && parentNode.children.length > 0) {
          addSiblingChildNode(parentNode);
        } else {
          addSiblingNode();
        }
      }

      if (e.key === "Delete" && (selectedNodes.length > 0 || selectedRelId)) {
        delNode(selectedNodes);
      }

      if (e.key === "Tab" && selectedNodes.length === 1) {
        if (selectedNodes[0] === rootNode.id) {
          addNode();
        } else {
          addChildNode(selectedNodes[0]);
        }
      }

      //pan mode
      if (e.key === " ") {
        togglePanMode();
      }
      //add summary
      if (e.altKey && e.key === "s") {
        e.preventDefault();
        e.stopPropagation();
        if (selectedNodes.length > 0 && !selectedNodes.includes(rootNode.id)) {
          addSummary();
        }
      }
      //add rel
      if (e.altKey && e.key === "r") {
        e.preventDefault();
        e.stopPropagation();
        if (selectedNodes.length === 1) {
          handleLinkMode(selectedNodes[0]);
        }
      }
    },
    [
      selectedNodes,
      addNode,
      addChildNode,
      addSiblingChildNode,
      addSiblingNode,
      delNode,
      findParentNode,

      nodes,
      rootNode,

      togglePanMode,
      addSummary,
      selectBox,
      handleLinkMode,
      selectedRelId,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const rootSvgLoc = getRootSvgLoc(rootNode.outline.width);

  return (
    <>
      <div className="mindmap">
        <Relations
          rootNode={rootNode}
          rootRef={rootRef}
          nodes={nodes}
          nodeRefs={nodeRefs}
          rels={rels}
          relMode={relMode}
          setRelMode={setRelMode}
          setRels={setRels}
          selectedRelId={selectedRelId}
          setSelectedRelId={setSelectedRelId}
          relRefs={relRefs}
          btnsRef={btnsRef}
          isPanMode={isPanMode}
        />

        <RootNode
          rootNode={rootNode}
          setRootNode={setRootNode}
          rootRef={rootRef}
          isSelected={selectedNodes.includes(rootNode.id)}
          handleNodeClick={handleNodeClick}
        />

        <div className="flex flex-col items-start">
          {nodes.map((node, index) => (
            <Node
              key={node.id}
              rootNode={rootNode}
              node={nodes[index]}
              setNodes={setNodes}
              nodeRef={nodeRefs.current[index]}
              nodeRefs={nodeRefs}
              delNode={delNode}
              isSelected={selectedNodes.includes(node.id)}
              selectedNodes={selectedNodes}
              setSelectedNodes={setSelectedNodes}
              nodes={nodes}
              sumRefs={sumRefs}
              isSelectedSum={selectedNodes.includes(node.summary?.id)}
              handleNodeClick={handleNodeClick}
            />
          ))}
        </div>

        <svg
          className="lines"
          overflow="visible"
          xmlns="http://www.w3.org/2000/svg"
          ref={svgRef}
        >
          {nodes.map((node, index) => {
            const nodeLoc = getNodeSvgLoc(nodeRefs.current[index], node);
            return (
              <React.Fragment key={node.id}>
                <path
                  d={`M${rootSvgLoc.x} ${rootSvgLoc.y} Q ${rootSvgLoc.x} ${nodeLoc.y}, ${nodeLoc.x} ${nodeLoc.y}`}
                  stroke={node.pathColor}
                  fill="none"
                  strokeWidth={node.path.width}
                  strokeDasharray={node.path.style}
                />
                {/* <circle cx={nodeLoc.x} cy={nodeLoc.y} r="5" fill="blue" /> */}
              </React.Fragment>
            );
          })}
          {/* <circle cx={rootSvgLoc.x} cy={rootSvgLoc.y} r="5" fill="red" /> */}
        </svg>
      </div>
    </>
  );
}
