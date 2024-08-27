import React, { useState, useLayoutEffect, useCallback } from "react";
import RootNode from "./RootNode";

export default function MindMap({
  nodes,
  setNodes,
  rootNode,
  setRootNode,
  selectedNodes,
  setSelectedNodes,
  selectBox,
  rootRef,

  getNodeCanvasLoc,
}) {
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
    isNodeSelected,
    rootNode.id,
    setSelectedNodes,
    getNodeCanvasLoc,
    rootRef,
  ]);

  return (
    <>
      <div className="mindmap">
        <RootNode
          rootNode={rootNode}
          setRootNode={setRootNode}
          rootRef={rootRef}
          isSelected={selectedNodes.includes(rootNode.id)}
        />
      </div>
    </>
  );
}
