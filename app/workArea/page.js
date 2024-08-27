"use client";
import React, { useState, useRef, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import MindMap from "../../components/MindMap";
import BtnsGroupCol from "../../components/BtnsGroupCol";
import BtnsGroupRow from "../../components/BtnsGroupRow";
import Shortcuts from "../../components/Shortcuts";

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

export default function WorkArea() {
  const [selectBox, setSelectBox] = useState(null); //存儲選擇框位置
  const selectStart = useRef({ x: 0, y: 0 }); //用來引用並存儲鼠標起始位置，始終不變
  const [selectedNodes, setSelectedNodes] = useState([]); //定義選中節點們的狀態，初始為空陣列，用來存儲所有被選中的節點id

  const canvasRef = useRef(null); //用來引用並存儲畫布Dom
  const btnsRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的按鈕群組

  const [rootNode, setRootNode] = useState({
    id: uuidv4(),
    name: "Central Topic",
    bkColor: "#17493b",
    pathColor: "#17493b",
    outline: { color: "#17493b", width: "3px", style: "none" },
    font: {
      family: "Noto Sans TC",
      size: "24px",
      weight: "400",
      color: "#FFFFFF",
    },
    path: {
      width: "3",
      style: "solid",
    },
  });
  const rootRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的根節點Dom元素

  const [nodes, setNodes] = useState([]); //定義節點們的狀態，用来存儲所有節點，初始為空陣列

  const newNode = useMemo(
    () => ({
      id: uuidv4(),
      name: "Main Topic",
      isNew: true, //標記為新創建的節點
      children: [],
      bkColor: "#17493b",
      pathColor: "#17493b",
      outline: { color: "#17493b", width: "3px", style: "none" },
      font: {
        family: "Noto Sans TC",
        size: "20px",
        weight: "400",
        color: "#FFFFFF",
      },
      path: {
        width: "3",
        style: "solid",
      },
    }),
    []
  );
  const newChildNode = useMemo(
    () => ({
      id: uuidv4(),
      name: "Subtopic",
      isNew: true,
      children: [],
      bkColor: "#17493b",
      pathColor: "#17493b",
      outline: { color: "#17493b", width: "3px", style: "none" },
      font: {
        family: "Noto Sans TC",
        size: "16px",
        weight: "400",
        color: "#FFFFFF",
      },
      path: {
        width: "3",
        style: "solid",
      },
    }),
    []
  );
  const nodeRefs = useRef([]);
  const sumRefs = useRef([]);

  //取得節點canvas位置
  const getNodeCanvasLoc = useCallback(
    (nodeRef) => {
      if (nodeRef && nodeRef.current && canvasRef.current) {
        const nodeRect = nodeRef.current.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        return {
          left: nodeRect.left - canvasRect.left + canvasRef.current.scrollLeft,
          top: nodeRect.top - canvasRect.top + canvasRef.current.scrollTop,
          right:
            nodeRect.right - canvasRect.left + canvasRef.current.scrollLeft,
          bottom:
            nodeRect.bottom - canvasRect.top + canvasRef.current.scrollTop,
        };
      }
      return { left: 0, top: 0, right: 0, bottom: 0 };
    },
    [canvasRef]
  );

  //繪製生成選取框
  const handleMouseDown = (e) => {
    if (e.button !== 0 || btnsRef.current.contains(e.target)) return;
    const rect = canvasRef.current.getBoundingClientRect();
    selectStart.current = {
      x: e.clientX + canvasRef.current.scrollLeft - rect.left,
      y: e.clientY + canvasRef.current.scrollTop - rect.top,
    };
    setSelectBox({
      left: selectStart.current.x,
      top: selectStart.current.y,
      width: 0,
      height: 0,
    });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + canvasRef.current.scrollLeft;
    const y = e.clientY - rect.top + canvasRef.current.scrollTop;

    const scrollMargin = 10;
    const scrollSpeed = 10;

    if (e.clientX > rect.right - scrollMargin) {
      canvasRef.current.scrollLeft += scrollSpeed;
    } else if (e.clientX < rect.left + scrollMargin) {
      canvasRef.current.scrollLeft -= scrollSpeed;
    }
    if (e.clientY > rect.bottom - scrollMargin) {
      canvasRef.current.scrollTop += scrollSpeed;
    } else if (e.clientY < rect.top + scrollMargin) {
      canvasRef.current.scrollTop -= scrollSpeed;
    }

    setSelectBox({
      left: Math.min(x, selectStart.current.x),
      top: Math.min(y, selectStart.current.y),
      width: Math.abs(x - selectStart.current.x),
      height: Math.abs(y - selectStart.current.y),
    });
  };

  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    setSelectBox(null);
  };

  const findParentNode = useCallback(
    (nodes) => {
      let parentNode = null;
      const find = (nodes) => {
        for (let node of nodes) {
          if (node.children && node.children.length > 0) {
            if (node.children.some((child) => child.id === selectedNodes[0])) {
              parentNode = node;
              return;
            }
            find(node.children);
          }
        }
      };

      find(nodes);
      return parentNode;
    },
    [selectedNodes]
  );

  const addNode = () => {
    const newNodeInstance = {
      ...newNode,
      id: uuidv4(),
    };
    setNodes((prev) => {
      const newNodes = [...prev, newNodeInstance];
      nodeRefs.current.push(React.createRef());
      setSelectedNodes([newNodeInstance.id]);
      return newNodes;
    });
  };

  const addSiblingNode = useCallback(() => {
    const newNodeInstance = {
      ...newNode,
      id: uuidv4(),
    };
    const selectedNodeIndex = nodes.findIndex(
      (node) => node.id === selectedNodes[0]
    );
    setNodes((prevNodes) => {
      const newNodes = [
        ...prevNodes.slice(0, selectedNodeIndex + 1),
        newNodeInstance,
        ...prevNodes.slice(selectedNodeIndex + 1),
      ];
      return newNodes;
    });
    setSelectedNodes([newNodeInstance.id]);
    nodeRefs.current.splice(selectedNodeIndex + 1, 0, React.createRef());
  }, [nodes, newNode, selectedNodes]);

  const addChildNode = useCallback(
    (parentId) => {
      const newChildInstance = {
        ...newChildNode,
        id: uuidv4(),
      };

      const addChildToParent = (nodes) =>
        nodes.map((node) => {
          if (node.id === parentId) {
            return {
              ...node,
              children: [...(node.children || []), newChildInstance],
            };
          } else if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: addChildToParent(node.children),
            };
          }
          return node;
        });
      setNodes((prev) => addChildToParent(prev));
      setSelectedNodes([newChildInstance.id]);
    },
    [setNodes, setSelectedNodes, newChildNode]
  );

  const addSiblingChildNode = useCallback(
    (parentNode) => {
      const selectedNodeIndex = parentNode.children.findIndex(
        (child) => child.id === selectedNodes[0]
      );
      const newChildInstance = {
        ...newChildNode,
        id: uuidv4(),
      };
      const addSibling = (nodes) => {
        return nodes.map((node) => {
          if (node.id === parentNode.id) {
            return {
              ...node,
              children: [
                ...node.children.slice(0, selectedNodeIndex + 1),
                newChildInstance,
                ...node.children.slice(selectedNodeIndex + 1),
              ],
            };
          } else if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: addSibling(node.children),
            };
          }
          return node;
        });
      };

      setNodes((prev) => addSibling(prev));
      setSelectedNodes([newChildInstance.id]);
      if (!nodeRefs.current[parentNode.id]) {
        nodeRefs.current[parentNode.id] = [];
      }
      nodeRefs.current[parentNode.id].splice(
        selectedNodeIndex + 1,
        0,
        React.createRef()
      );
    },
    [selectedNodes, setNodes, setSelectedNodes, nodeRefs, newChildNode]
  );

  const delNode = useCallback((idArr) => {
    const deleteNodes = (nodes, idsToDelete) => {
      return nodes.filter((node) => {
        // 檢查節點是否在刪除ID列表中
        const isNodeToDelete = idsToDelete.includes(node.id);
        // 如果節點有總結節點，檢查是否需要刪除總結節點
        if (
          node.summary &&
          (isNodeToDelete || idsToDelete.includes(node.summary.id))
        ) {
          delete sumRefs.current[node.summary.id];
          delete node.summary; // 刪除節點上的 summary 屬性
        }
        // 如果節點本身需要刪除，返回 false 過濾掉它
        if (isNodeToDelete) {
          return false;
        }
        // 遞迴檢查並更新子節點
        if (node.children) {
          node.children = deleteNodes(node.children, idsToDelete);
        }

        return true;
      });
    };

    setNodes((prev) => {
      const newNodes = deleteNodes(prev, idArr);

      nodeRefs.current = nodeRefs.current.filter(
        (item, index) => !idArr.includes(prev[index]?.id)
      );

      return newNodes;
    });

    setSelectedNodes([]);
  }, []);

  const addSummary = useCallback(() => {
    setNodes((prev) =>
      updateSelectedNodes(prev, selectedNodes, (node) => {
        if (!node.summary) {
          const sumId = uuidv4();
          sumRefs.current[sumId] = React.createRef();
          setSelectedNodes([sumId]);

          return {
            summary: {
              id: sumId,
              isNew: true,
              name: "summary",
              pathColor: "#000",
              outline: { color: "#000", width: "3px", style: "none" },
              font: {
                family: "Noto Sans TC",
                size: "16px",
                weight: "400",
                color: "#000",
              },
              path: {
                width: "2",
                style: "0",
              },
            },
          };
        }
        return {};
      })
    );
  }, [selectedNodes]);

  return (
    <div className={`flex w-full`}>
      <div className={`transition-all duration-300 ease-in-out w-screen`}>
        <div
          className={`canvas-wrap  h-[calc(100vh-65px)]
    `}
          onMouseDown={handleMouseDown}
          ref={canvasRef}
        >
          <div ref={btnsRef}>
            <div className="top-[90px] left-5 fixed z-20">
              <BtnsGroupCol
                rootNode={rootNode}
                nodes={nodes}
                selectedNodes={selectedNodes}
                addNode={addNode}
                findParentNode={findParentNode}
                addSiblingNode={addSiblingNode}
                addSiblingChildNode={addSiblingChildNode}
                addChildNode={addChildNode}
                delNode={delNode}
                addSummary={addSummary}
              />
            </div>

            <div className="btns-group bottom-10 left-5 fixed z-20 h-12">
              <Shortcuts />
            </div>
            <div
              className={`bottom-10 fixed z-20 transition-all duration-300 ease-in-out right-10 `}
            >
              <BtnsGroupRow />
            </div>
          </div>
          {selectBox && (
            <div
              className="select-box"
              style={{
                left: selectBox.left,
                top: selectBox.top,
                width: selectBox.width,
                height: selectBox.height,
              }}
            />
          )}
          <div className="canvas">
            <MindMap
              rootNode={rootNode}
              setRootNode={setRootNode}
              rootRef={rootRef}
              nodes={nodes}
              setNodes={setNodes}
              nodeRefs={nodeRefs}
              selectBox={selectBox}
              selectedNodes={selectedNodes}
              setSelectedNodes={setSelectedNodes}
              getNodeCanvasLoc={getNodeCanvasLoc}
              findParentNode={findParentNode}
              addNode={addNode}
              addSiblingNode={addSiblingNode}
              addChildNode={addChildNode}
              addSiblingChildNode={addSiblingChildNode}
              delNode={delNode}
              sumRefs={sumRefs}
              addSummary={addSummary}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
