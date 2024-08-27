import React, { useRef, useEffect, useState } from "react";
import { selectText } from "./RootNode";
import Summary from "./Summary";
// 子節點組件
const ChildNode = ({
  rootNode,
  childNode,
  nodes,
  setNodes,
  parentNode,
  childRef,
  isSelected,
  nodeRefs,
  setSelectedNodes,
  selectedNodes,
  parentRef,

  sumRefs,
  isSelectedSum,
  handleNodeClick,
}) => {
  const [isEditing, setIsEditing] = useState(childNode.isNew);
  const inputRef = useRef(null);
  const svgRef = useRef(null);

  //進入編輯模式後切換焦點，更新nodes狀態
  useEffect(() => {
    if (isEditing && inputRef.current) {
      selectText(inputRef.current);
      setNodes((prev) => {
        return prev.map((node) => {
          if (node.id === parentNode.id) {
            return {
              ...node,
              children: node.children.map((child) =>
                child.id === childNode.id ? { ...child, isNew: false } : child
              ),
            };
          }
          return node;
        });
      });
    }
  }, [isEditing, childNode.id, parentNode.id, setNodes]);

  //開啟編輯模式
  const editMode = () => {
    setIsEditing(true);
  };
  //關閉編輯模式
  const unEditMode = (e) => {
    //遞迴遍歷nodes每一層，更新子節點名稱
    const updateNodeName = (nodes) => {
      return nodes.map((node) => {
        if (node.id === parentNode.id) {
          //若當前節點是父節點，更新其children內相應的子節點名稱
          return {
            ...node,
            children: node.children.map((child) =>
              child.id === childNode.id
                ? { ...child, name: e.target.textContent }
                : child
            ),
          };
        } else if (node.children && node.children.length > 0) {
          //若當前節點有子節點，遞迴處理其子節點
          return {
            ...node,
            children: updateNodeName(node.children), //遞迴處理其children，繼續查找下一層子節點是否有父節點
          };
        }
        return node; //若當前節點既不是父節點，也沒有子節點，代表是最末層的節點，不做任何修改
      });
    };
    //更新節點數據為更新完名稱的新nodes
    if (childNode.name !== e.target.textContent) {
      setNodes((prevNodes) => updateNodeName(prevNodes));
    }
    setIsEditing(false);
  };
  //取得子節點svg位置
  const getChildSvgLoc = (childRef, parentRef, svgRef) => {
    if (childRef?.current && parentRef?.current && svgRef?.current) {
      const childRect = childRef.current.getBoundingClientRect();
      const parentRect = parentRef.current.getBoundingClientRect();
      const svgRect = svgRef.current.getBoundingClientRect();

      return {
        x: parentRect.left - svgRect.left + parentRect.width,
        y: parentRect.top - svgRect.top + parentRect.height / 2,
        childX: childRect.left - svgRect.left,
        childY: childRect.top - svgRect.top + childRect.height / 2,
      };
    }

    return { x: 0, y: 0, childX: 0, childY: 0 };
  };

  const childLoc = getChildSvgLoc(childRef, parentRef, svgRef);

  return (
    <div
      className={`flex items-center ml-24 ${
        isSelectedSum ? "selected-sum" : ""
      }`}
      style={{
        "--outline-width": `${
          childNode.outline.style !== "none"
            ? parseInt(childNode.outline.width, 10)
            : 0
        }px`,
      }}
    >
      <div
        className={`child-node ${isSelected ? "selected" : ""}`}
        style={{
          "--outline-width": `${
            childNode.outline.style !== "none"
              ? parseInt(childNode.outline.width, 10)
              : 0
          }px`,
          backgroundColor: childNode.bkColor,
          outline: `${childNode.outline.width} ${childNode.outline.style} ${childNode.outline.color}`,
          fontFamily: `${childNode.font.family}`,
          fontSize: `${childNode.font.size}`,
          fontWeight: `${childNode.font.weight}`,
          color: `${childNode.font.color}`,
          fontStyle: `${childNode.font.isItalic ? "italic" : "normal"}`,
          textDecorationLine: `${
            childNode.font.isStrikethrough ? "line-through" : "none"
          }`,
        }}
        tabIndex="0"
        onDoubleClick={editMode}
        onClick={(e) => handleNodeClick(childNode.id, e)}
        ref={childRef}
      >
        {isEditing ? (
          <>
            <div
              ref={inputRef}
              className="input-box"
              style={{
                minWidth: `${
                  childRef.current?.getBoundingClientRect().width ?? 82
                }px`,
                maxWidth: `${500}px`,
                textDecorationLine: `${
                  childNode.font.isStrikethrough ? "line-through" : "none"
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
              {childNode.name}
            </div>
            <span>{childNode.name}</span>
          </>
        ) : (
          <span>{childNode.name}</span>
        )}
      </div>
      <div className="children">
        {childNode.children &&
          childNode.children.length > 0 &&
          childNode.children.map((subchildNode, index) => {
            //確保在引用中有當前子節點，若沒有則新增
            if (!nodeRefs.current[childNode.id]) {
              nodeRefs.current[childNode.id] = [];
            }
            return (
              <ChildNode
                key={subchildNode.id}
                rootNode={rootNode}
                childNode={subchildNode}
                nodes={nodes}
                setNodes={setNodes}
                parentNode={childNode} //父節點id為上一層子節點id
                isSelected={selectedNodes.includes(subchildNode.id)}
                nodeRefs={nodeRefs}
                setSelectedNodes={setSelectedNodes}
                selectedNodes={selectedNodes}
                parentRef={childRef} //父節點引用為上一層子節點引用
                childRef={
                  nodeRefs.current[childNode.id][index] ||
                  (nodeRefs.current[childNode.id][index] = React.createRef())
                } //子節點引用為上一層子節點的對應索引位置元素，若沒有這個引用則建立一個新的引用
                sumRefs={sumRefs}
                isSelectedSum={selectedNodes.includes(subchildNode.summary?.id)}
                handleNodeClick={handleNodeClick}
              />
            );
          })}
      </div>
      {childNode.summary && (
        <Summary
          summary={childNode.summary}
          nodes={nodes}
          setNodes={setNodes}
          sumRefs={sumRefs}
          isSelectedSum={isSelectedSum}
        />
      )}
      <svg className="subLines" overflow="visible" ref={svgRef}>
        <path
          d={`M ${childLoc.x} ${childLoc.y} Q ${childLoc.x} ${childLoc.childY}, ${childLoc.childX} ${childLoc.childY}`}
          stroke={childNode.pathColor}
          fill="none"
          strokeWidth={childNode.path.width}
          strokeDasharray={childNode.path.style}
        />
      </svg>
    </div>
  );
};

export default function Node({
  rootNode,
  node,
  nodeRef,
  setNodes,
  isSelected,
  selectedNodes,
  nodeRefs,
  setSelectedNodes,

  sumRefs,
  isSelectedSum,
  nodes,
  handleNodeClick,
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
    <div
      className={`flex items-center ml-40 ${
        isSelectedSum ? "selected-sum" : ""
      }`}
      style={{
        "--outline-width": `${
          node.outline.style !== "none" ? parseInt(node.outline.width, 10) : 0
        }px`,
      }}
    >
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
        onClick={(e) => handleNodeClick(node.id, e)}
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

      {node.children && node.children.length > 0 && (
        <div className="children flex flex-col items-start ">
          {node.children.map((childNode, childIndex) => {
            if (!nodeRefs.current[node.id][childIndex]) {
              //若nodeRefs中沒有當前子節點的引用，建立一個新的引用
              nodeRefs.current[node.id][childIndex] = React.createRef();
            }
            //取得當前子節點引用
            const childRef = nodeRefs.current[node.id][childIndex];
            return (
              <ChildNode
                key={childNode.id}
                rootNode={rootNode}
                childNode={childNode}
                nodes={nodes}
                setNodes={setNodes}
                parentNode={node}
                childRef={childRef}
                parentRef={nodeRef} //第一層子節點的父節點是節點
                isSelected={selectedNodes.includes(childNode.id)}
                nodeRefs={nodeRefs}
                setSelectedNodes={setSelectedNodes}
                selectedNodes={selectedNodes}
                sumRefs={sumRefs}
                isSelectedSum={selectedNodes.includes(childNode.summary?.id)}
                handleNodeClick={handleNodeClick}
              />
            );
          })}
        </div>
      )}

      {node.summary && (
        <Summary
          summary={node.summary}
          nodes={nodes}
          setNodes={setNodes}
          sumRefs={sumRefs}
          isSelectedSum={isSelectedSum}
        />
      )}
    </div>
  );
}
