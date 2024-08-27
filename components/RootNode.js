import React, { useRef, useEffect, useState } from "react";

//聚焦到inputbox並自動選取文本
export const selectText = (inputElement) => {
  if (inputElement) {
    inputElement.focus(); //將焦點設置到inputRef目前引用的Dom元素上
    //選取整個文本
    const range = document.createRange(); //創建一個新的Range物件，用來表示文本
    range.selectNodeContents(inputElement); //加入inputRef目前引用的Dom元素的所有內容(包含textnode的文本)
    const selection = window.getSelection(); //取得目前選擇的文本範圍(Selection物件)
    selection.removeAllRanges(); //清除目前選擇的文本範圍
    selection.addRange(range); //將包含目前選取文本內容的Range物件加入到目前selection中
  }
};

export default function RootNode({
  rootNode,
  setRootNode,
  rootRef,
  isSelected,
}) {
  const [isEditRoot, setIsEditRoot] = useState(false); //定義根節點編輯模式狀態，初始為false
  const inputRef = useRef(null);

  // 進入編輯模式後切換焦點
  useEffect(() => {
    if (isEditRoot && inputRef.current) {
      selectText(inputRef.current);
    }
  }, [isEditRoot]);
  // 開啟編輯模式
  const editMode = () => {
    setIsEditRoot(true);
  };

  // 關閉編輯模式
  const unEditMode = (e) => {
    if (rootNode.name !== e.target.textContent) {
      setRootNode((prev) => ({ ...prev, name: e.target.textContent }));
    }
    setIsEditRoot(false);
  };

  return (
    <div
      className={`rootnode  ${isSelected ? "selected" : ""}`}
      tabIndex="0"
      ref={rootRef}
      onDoubleClick={editMode}
      style={{
        "--outline-width": `${
          rootNode.outline.style !== "none"
            ? parseInt(rootNode.outline.width, 10)
            : 0
        }px`,
        backgroundColor: rootNode.bkColor,
        outline: `${rootNode.outline.width} ${rootNode.outline.style} ${rootNode.outline.color}`,
        fontSize: `${rootNode.font.size}`,
        fontFamily: `${rootNode.font.family}`,
        fontWeight: `${rootNode.font.weight}`,
        color: `${rootNode.font.color}`,
        fontStyle: `${rootNode.font.isItalic ? "italic" : "normal"}`,
        textDecorationLine: `${
          rootNode.font.isStrikethrough ? "line-through" : "none"
        }`,
      }}
    >
      {isEditRoot ? (
        <>
          <div
            ref={inputRef}
            className="input-box"
            style={{
              minWidth: `${
                rootRef.current?.getBoundingClientRect().width ?? 128
              }px`,
              maxWidth: `${500}px`,
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
            {rootNode.name}
          </div>
          <span>{rootNode.name}</span>
        </>
      ) : (
        <span>{rootNode.name}</span>
      )}
    </div>
  );
}
