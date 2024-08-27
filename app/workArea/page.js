"use client";
import React, { useState, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import MindMap from "../../components/MindMap";

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export default function WorkArea() {
  const [selectBox, setSelectBox] = useState(null); //存儲選擇框位置
  const selectStart = useRef({ x: 0, y: 0 }); //用來引用並存儲鼠標起始位置，始終不變
  const [selectedNodes, setSelectedNodes] = useState([]); //定義選中節點們的狀態，初始為空陣列，用來存儲所有被選中的節點id

  const canvasRef = useRef(null); //用來引用並存儲畫布Dom

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

  return (
    <div className={`flex w-full`}>
      <div className={`transition-all duration-300 ease-in-out w-screen`}>
        <div
          className={`canvas-wrap  h-[calc(100vh-65px)]
    `}
          onMouseDown={handleMouseDown}
          ref={canvasRef}
        >
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
              selectBox={selectBox}
              selectedNodes={selectedNodes}
              setSelectedNodes={setSelectedNodes}
              getNodeCanvasLoc={getNodeCanvasLoc}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
