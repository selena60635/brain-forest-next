"use client";
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useLayoutEffect,
  useEffect,
  useContext,
} from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  doc,
  setDoc,
  collection,
  Timestamp,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebaseConfig";
import { Button } from "@headlessui/react";
import { PiToolbox } from "react-icons/pi";
import { updateSelectedNodes } from "../../components/tools/ToolBox";
import MindMap from "../../components/MindMap";
import BtnsGroupCol from "../../components/BtnsGroupCol";
import BtnsGroupRow from "../../components/BtnsGroupRow";
import Shortcuts from "../../components/Shortcuts";
import ToolBox from "../../components/tools/ToolBox";
import SweetAlert from "../../components/SweetAlert";
import Loading from "../../components/Loading";
import "../../lib/setupConsole";
import { Context } from "../../components/AuthContext";

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function WorkArea({ id }) {
  const { user } = useContext(Context);
  const router = useRouter();
  const [loading, setLoading] = useState(true); //是否開啟loading page
  const [isSaved, setIsSaved] = useState(true); //紀錄檔案是否還未儲存
  const [isPanMode, setIsPanMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isToolBoxOpen, setIsToolBoxOpen] = useState(false);

  const [relMode, setRelMode] = useState(false);
  const [rels, setRels] = useState([]);
  const [relFromNode, setRelFromNode] = useState(null);
  const [selectedRelId, setSelectedRelId] = useState(null);

  const [fontFamily, setFontFamily] = useState("Noto Sans TC");
  const [pathWidth, setPathWidth] = useState("3");
  const [pathStyle, setPathStyle] = useState("solid");
  const [currentTheme, setCurrentTheme] = useState(0); // 當前主題索引
  const [currentColorStyle, setCurrentColorStyle] = useState(1); //目前顏色風格索引
  const [colorIndex, setColorIndex] = useState(0); //目前節點顏色索引
  const [nodesColor, setNodesColor] = useState("#17493b"); //純色模式目前顏色
  const [canvasBgColor, setCanvasBgColor] = useState("#fff");
  const [canvasBgStyle, setCanvasBgStyle] = useState("none");

  const [selectBox, setSelectBox] = useState(null); //存儲選擇框位置
  const selectStart = useRef({ x: 0, y: 0 }); //用來引用並存儲鼠標起始位置，始終不變
  const canvasRef = useRef(null); //用來引用並存儲畫布Dom

  const themes = useMemo(
    () => [
      {
        name: "繽紛彩虹",
        colorStyles: [
          {
            root: "#000229",
            text: "#FFFFFF",
            nodes: [
              "#FA8155",
              "#FFAD36",
              "#B7C82B",
              "#0098B9",
              "#7574BC",
              "#A165A8",
            ],
            child: [
              "#FA8155",
              "#FFAD36",
              "#B7C82B",
              "#0098B9",
              "#7574BC",
              "#A165A8",
            ],
          },
          {
            root: "#000229",
            text: "#FFFFFF",
            nodes: [
              "#F9423A",
              "#F6A04D",
              "#F3D321",
              "#00BC7B",
              "#486AFF",
              "#4D49BE",
            ],
            child: [
              "#F9423A",
              "#F6A04D",
              "#F3D321",
              "#00BC7B",
              "#486AFF",
              "#4D49BE",
            ],
          },
          {
            root: "#92C1B7",
            text: "#000000",
            nodes: [
              "#9DCFCE",
              "#F1CD91",
              "#EC936B",
              "#DDB3A4",
              "#C6CA97",
              "#F1C2CA",
            ],
            child: [
              "#9DCFCE",
              "#F1CD91",
              "#EC936B",
              "#DDB3A4",
              "#C6CA97",
              "#F1C2CA",
            ],
          },
        ],
      },
      {
        name: "紅粉佳人",
        colorStyles: [
          {
            root: "#3A0715",
            text: "#fff",
            nodes: [
              "#E81C56",
              "#CB184B",
              "#A3143C",
              "#911136",
              "#990000",
              "#C21E56",
            ],
            child: [
              "#E81C56",
              "#CB184B",
              "#A3143C",
              "#911136",
              "#990000",
              "#C21E56",
            ],
          },
          {
            root: "#C05D64",
            text: "#fff",
            nodes: [
              "#D17075",
              "#C98087",
              "#C58B8F",
              "#D7847F",
              "#C99499",
              "#E1A1A1",
            ],
            child: [
              "#D17075",
              "#C98087",
              "#C58B8F",
              "#D7847F",
              "#C99499",
              "#E1A1A1",
            ],
          },
          {
            root: "#C8657A",
            text: "#fff",
            nodes: [
              "#B0737F",
              "#CE8091",
              "#A45F63",
              "#D2848C",
              "#AD6B71",
              "#996566",
            ],
            child: [
              "#B0737F",
              "#CE8091",
              "#A45F63",
              "#D2848C",
              "#AD6B71",
              "#996566",
            ],
          },
        ],
      },
      {
        name: "復古狂潮",
        colorStyles: [
          {
            root: "#0C1440",
            text: "#fff",
            nodes: [
              "#D90467",
              "#027373",
              "#03A678",
              "#F26A1B",
              "#B81B83",
              "#22B859",
            ],
            child: [
              "#D90467",
              "#027373",
              "#03A678",
              "#F26A1B",
              "#B81B83",
              "#22B859",
            ],
          },
          {
            root: "#260101",
            text: "#fff",
            nodes: [
              "#A68A56",
              "#8AB5BF",
              "#384759",
              "#F26D85",
              "#A04A2D",
              "#916A46",
            ],
            child: [
              "#A68A56",
              "#8AB5BF",
              "#384759",
              "#F26D85",
              "#A04A2D",
              "#916A46",
            ],
          },
          {
            root: "#BAB86C",
            text: "#000000",
            nodes: [
              "#98CBCB",
              "#EDB458",
              "#D2B48C",
              "#B0C4DE",
              "#A9A9A9",
              "#C0C0C0",
            ],
            child: [
              "#98CBCB",
              "#EDB458",
              "#D2B48C",
              "#B0C4DE",
              "#A9A9A9",
              "#C0C0C0",
            ],
          },
        ],
      },
    ],
    []
  );
  //所有顏色風格
  const colorStyles = useMemo(
    () => [
      {
        root: nodesColor,
        text: "#FFFFFF",
        nodes: [nodesColor],
        child: [nodesColor],
      },
      ...themes[currentTheme].colorStyles,
    ],
    [nodesColor, themes, currentTheme]
  );

  const rootColor = colorStyles[currentColorStyle].root; //取得當前顏色風格的根節點顏色
  const textColor = colorStyles[currentColorStyle].text; //取得當前顏色風格的文字顏色
  //取得當前顏色風格相應的節點顏色，並按照順序提取使用
  const colors = colorStyles[currentColorStyle].nodes;
  const color = colors[colorIndex % colors.length];

  //定義根節點狀態
  const [rootNode, setRootNode] = useState({
    id: uuidv4(),
    name: "Central Topic",
    bkColor: rootColor,
    pathColor: rootColor,
    outline: { color: rootColor, width: "3px", style: "none" },
    font: {
      family: fontFamily,
      size: "24px",
      weight: "400",
      color: textColor,
    },
    path: {
      width: pathStyle === "none" ? "0" : pathWidth,
      style: pathStyle === "dashed" ? "8" : "0",
    },
  });
  const [nodes, setNodes] = useState([]); //定義節點們的狀態，用来存儲所有節點，初始為空陣列
  const newNode = useMemo(
    () => ({
      id: uuidv4(),
      name: "Main Topic",
      isNew: true, //標記為新創建的節點
      children: [],
      bkColor: color,
      pathColor: color,
      outline: { color: color, width: "3px", style: "none" },
      font: {
        family: fontFamily,
        size: "20px",
        weight: "400",
        color: textColor,
      },
      path: {
        width: pathStyle === "none" ? "0" : pathWidth,
        style: pathStyle === "dashed" ? "8" : "0",
      },
    }),
    [color, textColor, pathWidth, pathStyle, fontFamily]
  );

  const newChildNode = useMemo(
    () => ({
      id: uuidv4(),
      name: "Subtopic",
      isNew: true,
      children: [],
      outline: { width: "3px", style: "none" },
      font: {
        family: fontFamily,
        size: "16px",
        weight: "400",
      },
      path: {
        width: pathStyle === "none" ? "0" : pathWidth,
        style: pathStyle === "dashed" ? "8" : "0",
      },
    }),
    [pathWidth, pathStyle, fontFamily]
  );

  const [selectedNodes, setSelectedNodes] = useState([]); //定義選中節點們的狀態，初始為空陣列，用來存儲所有被選中的節點id
  const rootRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的根節點Dom元素
  const nodeRefs = useRef([]); //宣告一個引用，初始為空陣列，用來存儲每個引用的節點Dom元素
  const sumRefs = useRef([]);
  const btnsRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的按鈕群組
  const relRefs = useRef({});
  const pageRef = useRef(null);

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

  //儲存心智圖組件並重導向
  const saveMindMap = async (id = null) => {
    try {
      const mindMapData = {
        currentTheme,
        currentColorStyle,
        canvasBg: { canvasBgStyle, canvasBgColor },
        path: { pathWidth, pathStyle },
        fontFamily,
        rels,
        rootNode,
        nodes,
        lastSavedAt: Timestamp.now(),
      };
      const userId = auth.currentUser.uid;
      let docRef;
      if (id) {
        docRef = doc(db, "users", userId, "mindMaps", id);
        await setDoc(docRef, mindMapData);
        SweetAlert({
          type: "toast",
          title: "Save successfully!",
          icon: "success",
        });
      } else {
        docRef = await addDoc(
          collection(db, "users", userId, "mindMaps"),
          mindMapData
        );
        SweetAlert({
          type: "toast",
          title: "Save new file successfully!",
          icon: "success",
        });
        router.push(`/workArea/${docRef.id}`);
      }
    } catch (err) {
      SweetAlert({
        type: "toast",
        title: `Save ${id ? "" : "new"} file failed!`,
        icon: "error",
      });
    }
  };

  const handleSaveMindMap = async () => {
    if (!user) {
      //若是訪客，將試用的檔案暫存到localStorage
      const state = {
        currentTheme,
        currentColorStyle,
        canvasBg: { canvasBgStyle, canvasBgColor },
        path: { pathWidth, pathStyle },
        fontFamily,
        rels,
        rootNode,
        nodes,
        lastSavedAt: Timestamp.now(),
      };
      localStorage.setItem("mindMapTest", JSON.stringify(state));

      const needLoginAlert = await SweetAlert({
        type: "alert",
        title: "Please sign in.",
        icon: "warning",
        text: "You need to sign in to save files. Would you like to go to the login page now?",
        confirmButtonText: "Yes",
        showCancelButton: true,
        cancelButtonText: "No",
      });

      if (needLoginAlert.isConfirmed) {
        router.push(`/login`);
      }
    } else {
      await saveMindMap(id);
      setIsSaved(true);
    }
  };
  //重置心智圖組件為初始狀態
  const resetMindMap = useCallback(async () => {
    // setRootNode({
    //   id: uuidv4(),
    //   name: "Central Topic",
    //   bkColor: "#000229",
    //   pathColor: "#000229",
    //   outline: { color: "#000229", width: "3px", style: "none" },
    //   font: {
    //     family: "Noto Sans TC",
    //     size: "24px",
    //     weight: "400",
    //     color: "#FFFFFF",
    //   },
    //   path: {
    //     width: "3",
    //     style: "0",
    //   },
    // });
    // setNodes([]);
    // nodeRefs.current = [];
    await delay(1000); // loading頁面至少顯示1秒
    setLoading(false);
    setIsSaved(true);
  }, []);

  //獲取檔案並設定心智圖組件狀態
  const fetchMindMap = useCallback(
    async (mindMapId) => {
      try {
        const userId = auth.currentUser.uid;
        const docRef = doc(db, "users", userId, "mindMaps", mindMapId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const mindMapData = docSnap.data();
          // await document.fonts.load(
          //   `${mindMapData.rootNode.font.size} ${mindMapData.fontFamily}`
          // );

          setRootNode(mindMapData.rootNode);
          setNodes(mindMapData.nodes);
          setCurrentColorStyle((prev) => mindMapData.currentColorStyle || prev);
          setCurrentTheme((prev) => mindMapData.currentTheme || prev);
          setCanvasBgColor(
            (prev) => mindMapData.canvasBg?.canvasBgColor || prev
          );
          setCanvasBgStyle(
            (prev) => mindMapData.canvasBg?.canvasBgStyle || prev
          );
          setPathWidth((prev) => mindMapData.path?.pathWidth || prev);
          setPathStyle((prev) => mindMapData.path?.pathStyle || prev);

          setFontFamily((prev) => mindMapData.fontFamily || prev);
          setRels((prev) => mindMapData.rels || prev);
          nodeRefs.current = new Array(mindMapData.nodes.length)
            .fill(null)
            .map(() => React.createRef());
        }
      } catch (err) {
        SweetAlert({
          type: "toast",
          title: "Failed to load file!",
          icon: "error",
        });
        console.log(err);
      } finally {
        await delay(1000); // loading頁面至少顯示1秒
        setLoading(false);
        setIsSaved(true);
      }
    },
    [setCurrentColorStyle, setRootNode, setNodes]
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

  const findNode = useCallback((nodes, id) => {
    const stack = [...nodes];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node.id === id) {
        return node;
      } else if (node.summary && node.summary.id === id) {
        return node.summary;
      }
      if (node.children && node.children.length > 0) {
        stack.push(...node.children);
      }
    }
    return null;
  }, []);

  const addNode = () => {
    setColorIndex((prev) => prev + 1);
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
    setColorIndex((prev) => prev + 1);
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
      const parentNode = findNode(nodes, parentId);
      let parentColorIndex = colorStyles[currentColorStyle].nodes.indexOf(
        parentNode.bkColor
      );
      if (parentColorIndex === -1) {
        parentColorIndex = colorStyles[currentColorStyle].child.indexOf(
          parentNode.bkColor
        );
      }
      const childColor = colorStyles[currentColorStyle].child[parentColorIndex];
      const newChildInstance = {
        ...newChildNode,
        id: uuidv4(),
        parent: parentId,
        bkColor: childColor,
        pathColor: childColor,
        outline: { ...newChildNode.outline, color: childColor },
        font: { ...newChildNode.font, color: textColor },
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
    [
      setNodes,
      setSelectedNodes,
      nodes,
      textColor,
      colorStyles,
      currentColorStyle,
      findNode,
      newChildNode,
    ]
  );

  const addSiblingChildNode = useCallback(
    (parentNode) => {
      let parentColorIndex = colorStyles[currentColorStyle].nodes.indexOf(
        parentNode.bkColor
      );
      if (parentColorIndex === -1) {
        parentColorIndex = colorStyles[currentColorStyle].child.indexOf(
          parentNode.bkColor
        );
      }
      const childColor = colorStyles[currentColorStyle].child[parentColorIndex];

      const selectedNodeIndex = parentNode.children.findIndex(
        (child) => child.id === selectedNodes[0]
      );
      const newChildInstance = {
        ...newChildNode,
        id: uuidv4(),
        parent: parentNode.id,
        bkColor: childColor,
        pathColor: childColor,
        outline: { ...newChildNode.outline, color: childColor },
        font: { ...newChildNode.font, color: textColor },
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
    [
      selectedNodes,
      setNodes,
      setSelectedNodes,
      nodeRefs,
      textColor,
      colorStyles,
      currentColorStyle,
      newChildNode,
    ]
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
                family: fontFamily,
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
  }, [selectedNodes, fontFamily]);

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
                family: fontFamily,
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
    [relMode, relFromNode, fontFamily]
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

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (pageRef.current.requestFullscreen) {
        //最新版瀏覽器幾乎都支援
        pageRef.current.requestFullscreen();
      } else if (pageRef.current.mozRequestFullScreen) {
        //Firefox
        pageRef.current.mozRequestFullScreen();
      } else if (pageRef.current.webkitRequestFullscreen) {
        //Safari、Chrome、Opera
        pageRef.current.webkitRequestFullscreen();
      } else if (pageRef.current.msRequestFullscreen) {
        //Edge
        pageRef.current.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  //設定zoom in/out/reset
  const handleZoom = (type) => {
    setZoomLevel((prev) => {
      if (type === "in") {
        return Math.min(prev * 1.25, 3); //最大300%
      } else if (type === "out") {
        return Math.max(prev * 0.8, 0.4); //最小40%
      } else if (type === "reset") {
        return 1;
      } else {
        return prev;
      }
    });
  };

  //更新isSaved狀態
  const nodesStr = JSON.stringify(nodes);
  const rootNodeStr = JSON.stringify(rootNode);
  const relsStr = JSON.stringify(rels);
  useEffect(() => {
    setIsSaved(false);
  }, [nodesStr, rootNodeStr, canvasBgStyle, canvasBgColor, relsStr]);

  //監聽全螢幕事件(F12、Esc)，使isFullScreen能夠正確設置
  useEffect(() => {
    const toggleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };
    document.addEventListener("fullscreenchange", toggleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", toggleFullScreenChange);
    };
  }, []);

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
  }, [scrollToCenter, rootRef, loading]);

  //若id改變，重新載入相應的心智圖檔案
  useEffect(() => {
    setLoading(true);
    if (id) {
      fetchMindMap(id);
    } else {
      resetMindMap();
    }
  }, [id, fetchMindMap, resetMindMap]);

  return (
    <>
      {loading && <Loading />}
      {relMode && (
        <p className="absolute z-10">Please click the target node.</p>
      )}

      <div
        className={`flex w-full ${isFullScreen && "h-screen"}`}
        ref={pageRef}
      >
        <div
          className={`transition-all duration-300 ease-in-out ${
            isToolBoxOpen ? "w-6/12 sm:w-10/12" : "w-screen"
          }`}
        >
          <div
            className={`canvas-wrap ${
              isFullScreen ? "h-screen" : "h-[calc(100vh-65px)]"
            }`}
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
                  handleSaveMindMap={handleSaveMindMap}
                  isSaved={isSaved}
                />
              </div>

              <div className="btns-group bottom-10 left-5 fixed z-20 h-12">
                <Shortcuts />
              </div>
              <div
                className={`bottom-10 fixed z-20 transition-all duration-300 ease-in-out ${
                  isToolBoxOpen ? "right-[356px]" : "right-10"
                }`}
              >
                <BtnsGroupRow
                  togglePanMode={togglePanMode}
                  isPanMode={isPanMode}
                  scrollToCenter={scrollToCenter}
                  toggleFullScreen={toggleFullScreen}
                  handleZoom={handleZoom}
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
            <div
              className={`canvas  ${canvasBgStyle}`}
              style={{
                backgroundColor: canvasBgColor,
                transform: `scale(${zoomLevel})`,
              }}
            >
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
                toggleFullScreen={toggleFullScreen}
                handleZoom={handleZoom}
                zoomLevel={zoomLevel}
                handleSaveMindMap={handleSaveMindMap}
              />
            </div>
          </div>
        </div>
        <div
          className={`bg-white absolute right-0 w-6/12 sm:w-2/12 transition-all duration-300 ease-in-out ${
            isToolBoxOpen ? "translate-x-0" : "translate-x-full "
          }`}
        >
          <div
            className={`${
              isFullScreen ? "h-screen" : "h-[calc(100vh-65px)]"
            } border-l shadow-lg tool-box`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <ToolBox
              rootNode={rootNode}
              setRootNode={setRootNode}
              nodes={nodes}
              setNodes={setNodes}
              selectedNodes={selectedNodes}
              currentColorStyle={currentColorStyle}
              setCurrentColorStyle={setCurrentColorStyle}
              colorStyles={colorStyles}
              findNode={findNode}
              setColorIndex={setColorIndex}
              nodesColor={nodesColor}
              setNodesColor={setNodesColor}
              setSelectedNodes={setSelectedNodes}
              setLoading={setLoading}
              nodeRefs={nodeRefs}
              themes={themes}
              currentTheme={currentTheme}
              setCurrentTheme={setCurrentTheme}
              canvasBgColor={canvasBgColor}
              setCanvasBgColor={setCanvasBgColor}
              canvasBgStyle={canvasBgStyle}
              setCanvasBgStyle={setCanvasBgStyle}
              pathWidth={pathWidth}
              setPathWidth={setPathWidth}
              pathStyle={pathStyle}
              setPathStyle={setPathStyle}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              rels={rels}
              setRels={setRels}
              selectedRelId={selectedRelId}
            />
            <div className="btns-group top-4 -left-[84px] absolute z-20 h-12">
              <Button
                className="btn aspect-square"
                onClick={() => setIsToolBoxOpen(!isToolBoxOpen)}
              >
                <PiToolbox
                  size={24}
                  strokeWidth="3"
                  className={`${isToolBoxOpen ? "text-primary" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
