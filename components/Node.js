import React, { useRef, useEffect, useState } from "react";
import { selectText } from "./RootNode";

export default function Node({
  node,
  nodeRef,
  setNodes,
  isSelected,

  nodeRefs,
}) {
  const [isEditing, setIsEditing] = useState(node.isNew);
  const inputRef = useRef(null);

  //確保在引用中有當前節點，若沒有則新增
  if (!nodeRefs.current[node.id]) {
    nodeRefs.current[node.id] = [];
  }

  //進入編輯模式後切換焦點
  useEffect(() => {
    if (isEditing && inputRef.current) {
      selectText(inputRef.current);
      setNodes((prev) =>
        prev.map((item) =>
          item.id === node.id ? { ...item, isNew: false } : item
        )
      );
    }
  }, [isEditing, node.id, setNodes]);
  //開啟編輯模式
  const editMode = () => {
    setIsEditing(true);
  };
  //關閉編輯模式
  const unEditMode = (e) => {
    if (node.name !== e.target.textContent) {
      setNodes((prev) => {
        return prev.map((item) => {
          if (item.id === node.id) {
            return { ...item, name: e.target.textContent };
          }
          return item;
        });
      });
    }
    setIsEditing(false);
  };
  return (
    <div className={`flex items-center ml-40 `}>
      <div
        className={`node ${isSelected ? "selected" : ""}`}
        style={{
          "--outline-width": `${
            node.outline.style !== "none" ? parseInt(node.outline.width, 10) : 0
          }px`,
          backgroundColor: node.bkColor,
          outline: `${node.outline.width} ${node.outline.style} ${node.outline.color}`,
          fontFamily: `${node.font.family}`,
          fontSize: `${node.font.size}`,
          fontWeight: `${node.font.weight}`,
          color: `${node.font.color}`,
          fontStyle: `${node.font.isItalic ? "italic" : "normal"}`,
          textDecorationLine: `${
            node.font.isStrikethrough ? "line-through" : "none"
          }`,
        }}
        tabIndex="0"
        ref={nodeRef}
        onDoubleClick={editMode}
      >
        {isEditing ? (
          <>
            <div
              ref={inputRef}
              className="input-box"
              style={{
                minWidth: `${
                  nodeRef.current?.getBoundingClientRect().width ?? 132
                }px`,
                maxWidth: `${500}px`,
                textDecorationLine: `${
                  node.font.isStrikethrough ? "line-through" : "none"
                }`,
              }}
              contentEditable="true"
              suppressContentEditableWarning="true"
              onBlur={unEditMode}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Tab") {
                  e.preventDefault();
                  e.stopPropagation();
                  unEditMode(e);
                }
              }}
            >
              {node.name}
            </div>
            <span>{node.name}</span>
          </>
        ) : (
          <span>{node.name}</span>
        )}
      </div>
    </div>
  );
}
