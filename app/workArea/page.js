"use client";
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
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
  const [isPanMode, setIsPanMode] = useState(false);

  const [relMode, setRelMode] = useState(false);
  const [rels, setRels] = useState([]);
  const [relFromNode, setRelFromNode] = useState(null);
  const [selectedRelId, setSelectedRelId] = useState(null);

  const [selectBox, setSelectBox] = useState(null); //存儲選擇框位置
  const selectStart = useRef({ x: 0, y: 0 }); //用來引用並存儲鼠標起始位置，始終不變
  const canvasRef = useRef(null); //用來引用並存儲畫布Dom

  //定義根節點狀態
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

  const [selectedNodes, setSelectedNodes] = useState([]); //定義選中節點們的狀態，初始為空陣列，用來存儲所有被選中的節點id
  const rootRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的根節點Dom元素
  const nodeRefs = useRef([]); //宣告一個引用，初始為空陣列，用來存儲每個引用的節點Dom元素
  const sumRefs = useRef([]);
  const btnsRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的按鈕群組
  const relRefs = useRef({});

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
    if (isPanMode) {
      handlePanMouseDown(e);
    } else {
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
    }
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
  //pan mode
  const handlePanMouseDown = (e) => {
    if (!isPanMode) return;
    canvasRef.current.style.cursor = "grabbing";
    const startX = e.clientX;
    const startY = e.clientY;
    const startScrollLeft = canvasRef.current.scrollLeft;
    const startScrollTop = canvasRef.current.scrollTop;

    const handlePanMouseMove = (moveEvent) => {
      const xOffset = moveEvent.clientX - startX;
      const yOffset = moveEvent.clientY - startY;
      canvasRef.current.scrollLeft = startScrollLeft - xOffset;
      canvasRef.current.scrollTop = startScrollTop - yOffset;
    };

    const handlePanMouseUp = () => {
      window.removeEventListener("mousemove", handlePanMouseMove);
      window.removeEventListener("mouseup", handlePanMouseUp);
      canvasRef.current.style.cursor = "grab";
    };

    window.addEventListener("mousemove", handlePanMouseMove);
    window.addEventListener("mouseup", handlePanMouseUp);
  };
  //設定PanMode開/關，及滑鼠樣式
  const togglePanMode = () => {
    setIsPanMode((prev) => {
      const newPanMode = !prev;
      if (newPanMode) {
        canvasRef.current.style.cursor = "grab";
      } else {
        canvasRef.current.style.cursor = "auto";
      }
      return newPanMode;
    });
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
  }, [nodes, newNode, selectedNodes, setNodes, setSelectedNodes, nodeRefs]);

  const addChildNode = useCallback(
    (parentId) => {
      const newChildInstance = {
        ...newChildNode,
        id: uuidv4(),
        parent: parentId,
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
        parent: parentNode.id,
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

  const delNode = useCallback(
    (idArr) => {
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
        // 檢查每個 rel，若其 from 或 to 節點在 idsToDelete 中，則刪除該 rel
        setRels((prevRels) => {
          return prevRels.filter((rel) => {
            //遍歷rel，若目前選取的id中是rel的關連節點之一，則需要一併刪除
            const deleteRel =
              idArr.includes(rel.from) || idArr.includes(rel.to);
            if (
              (idArr.includes(rel.from) || idArr.includes(rel.to)) &&
              relRefs.current[rel.id]
            ) {
              delete relRefs.current[rel.id];
            }

            //若deleteRel為true，表示該 rel 需要被過濾掉
            return !deleteRel;
          });
        });

        return newNodes;
      });
      //刪除關聯
      if (selectedRelId) {
        setRels((prev) => {
          const newRels = prev.filter((rel) => rel.id !== selectedRelId);

          if (relRefs.current[selectedRelId]) {
            delete relRefs.current[selectedRelId];
          }

          return newRels;
        });
        setSelectedRelId(null);
      }

      setSelectedNodes([]);
    },
    [
      nodeRefs,
      setNodes,
      setSelectedNodes,
      sumRefs,
      relRefs,
      setRels,
      selectedRelId,
      setSelectedRelId,
    ]
  );

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

  const isSummaryNode = (nodes, from) => {
    return nodes.some((node) => {
      if (node.summary && node.summary.id === from) {
        return true;
      }

      if (node.children && node.children.length > 0) {
        return isSummaryNode(node.children, from);
      }
      return false;
    });
  };

  const handleLinkMode = (from) => {
    if (selectedNodes[0] && !isSummaryNode(nodes, from)) {
      setRelFromNode(from);
      setRelMode(true);
    }
  };
  const addRel = useCallback(
    (to) => {
      if (relMode && relFromNode) {
        const relId = uuidv4();
        setRels((prev) => {
          const newRels = [
            ...prev,
            {
              id: relId,
              name: "Relationship",
              pathColor: "#000",
              font: {
                family: "Noto Sans TC",
                size: "16px",
                weight: "400",
                color: "#000",
              },
              from: relFromNode,
              to: to,
            },
          ];
          return newRels;
        });
        setSelectedRelId(relId);
        setRelMode(false);
        setRelFromNode(null);
      }
    },
    [relMode, relFromNode]
  );

  const handleNodeClick = (nodeId, e) => {
    e.stopPropagation();
    if (!relMode) return;
    if (relMode && relFromNode && nodeId !== relFromNode) {
      addRel(nodeId);
    }
    // else {
    //   console.log("你不能關聯自己");
    // }
  };
  //滾動至畫布的中心點(根節點)
  const scrollToCenter = useCallback(
    (behavior) => {
      if (canvasRef.current && rootRef.current) {
        const rootPosition = getNodeCanvasLoc(rootRef);
        const { clientWidth, clientHeight } = canvasRef.current;
        const scrollToX =
          rootPosition.left -
          clientWidth / 2 +
          (rootPosition.right - rootPosition.left) / 2;
        const scrollToY =
          rootPosition.top -
          clientHeight / 2 +
          (rootPosition.bottom - rootPosition.top) / 2;
        canvasRef.current.scrollTo({
          left: scrollToX,
          top: scrollToY,
          behavior: behavior,
        });
      }
    },
    [canvasRef, rootRef, getNodeCanvasLoc]
  );
  // 初始渲染設定
  useLayoutEffect(() => {
    const handleTab = (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleTab);
    if (rootRef.current) {
      scrollToCenter("auto");
    }
    return () => {
      window.removeEventListener("keydown", handleTab);
    };
  }, [scrollToCenter, rootRef]);

  return (
    <>
      {relMode && (
        <p className="absolute z-10">Please click the target node.</p>
      )}

      <div className={`flex w-full`}>
        <div className={`transition-all duration-300 ease-in-out w-screen `}>
          <div
            className={`canvas-wrap h-[calc(100vh-65px)] `}
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
                  delNode={delNode}
                  findParentNode={findParentNode}
                  addSiblingNode={addSiblingNode}
                  addSiblingChildNode={addSiblingChildNode}
                  addChildNode={addChildNode}
                  addSummary={addSummary}
                  handleLinkMode={handleLinkMode}
                  selectedRelId={selectedRelId}
                />
              </div>

              <div className="btns-group bottom-10 left-5 fixed z-20 h-12">
                <Shortcuts />
              </div>
              <div
                className={`bottom-10 fixed z-20 transition-all duration-300 ease-in-out right-10 `}
              >
                <BtnsGroupRow
                  togglePanMode={togglePanMode}
                  isPanMode={isPanMode}
                  scrollToCenter={scrollToCenter}
                />
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
            <div className={`canvas `}>
              <MindMap
                nodes={nodes}
                setNodes={setNodes}
                rootNode={rootNode}
                setRootNode={setRootNode}
                selectedNodes={selectedNodes}
                setSelectedNodes={setSelectedNodes}
                selectBox={selectBox}
                rootRef={rootRef}
                nodeRefs={nodeRefs}
                delNode={delNode}
                findParentNode={findParentNode}
                addNode={addNode}
                addSiblingNode={addSiblingNode}
                addSiblingChildNode={addSiblingChildNode}
                addChildNode={addChildNode}
                getNodeCanvasLoc={getNodeCanvasLoc}
                togglePanMode={togglePanMode}
                sumRefs={sumRefs}
                addSummary={addSummary}
                handleNodeClick={handleNodeClick}
                rels={rels}
                relMode={relMode}
                setRelMode={setRelMode}
                setRels={setRels}
                selectedRelId={selectedRelId}
                setSelectedRelId={setSelectedRelId}
                relRefs={relRefs}
                btnsRef={btnsRef}
                isPanMode={isPanMode}
                handleLinkMode={handleLinkMode}
                scrollToCenter={scrollToCenter}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
