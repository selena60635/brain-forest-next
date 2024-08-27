import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import { selectText } from "./RootNode";

export default function Summary({
  summary,
  nodes,
  setNodes,

  sumRefs,
  isSelectedSum,
}) {
  const [isEditing, setIsEditing] = useState(summary.isNew);
  const inputRef = useRef(null);
  const sumSvgRef = useRef(null);
  const sumRef = useRef(null);
  const sumNodeRef = useRef(null);
  const [sumPath, setSumPath] = useState("");

  const updateSum = useCallback(
    (nodes, updateFn) => {
      return nodes.map((item) => {
        if (item.summary && item.summary.id === summary.id) {
          return {
            ...item,
            summary: updateFn(item.summary),
          };
        }

        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: updateSum(item.children, updateFn),
          };
        }
        return item;
      });
    },
    [summary.id]
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      selectText(inputRef.current);
      setNodes((prev) =>
        updateSum(prev, (summary) => ({
          ...summary,
          isNew: false,
        }))
      );
    }
  }, [isEditing, setNodes, updateSum]);

  // 開啟編輯模式
  const editMode = () => {
    setIsEditing(true);
  };
  // 關閉編輯模式
  const unEditMode = (e) => {
    const newName = e.target.textContent;
    if (summary.name !== newName) {
      setNodes((prev) =>
        updateSum(prev, (summary) => ({
          ...summary,
          name: newName,
        }))
      );
    }
    setIsEditing(false);
  };

  //確保在新增總結時，引用中有最新的總結節點，若沒有則建立
  useLayoutEffect(() => {
    if (sumRef.current && summary && sumRefs.current) {
      sumRefs.current[summary.id] = sumNodeRef;
    }
  }, [summary, sumRefs]);
  //取得總結節點svg位置
  const getSumSvgLoc = useCallback((sumRef, node, sumSvgRef) => {
    if (sumRef && sumRef.current && sumSvgRef.current) {
      const sumRect = sumRef.current.getBoundingClientRect();
      const svgRect = sumSvgRef.current.getBoundingClientRect();
      // const offset = parseInt(node.outline.width, 10);
      const height = sumRect.height;
      return {
        x: sumRect.left - svgRect.left,
        y: sumRect.top - svgRect.top + sumRect.height / 2,
        height,
      };
    }
    return { x: 0, y: 0 };
  }, []);

  // 當 nodes 狀態改變時，更新svg path，重繪summary連接線
  useLayoutEffect(() => {
    if (sumRef.current && sumSvgRef.current) {
      const sumLoc = getSumSvgLoc(sumRef, summary, sumSvgRef);
      const { x, y, height } = sumLoc;
      const startY = y - height / 2;
      const endY = y + height / 2;
      const radius = 6;
      const offset = 20;

      setSumPath(`
          M ${x - radius} ${startY + offset}
          c ${radius / 2} 0, ${radius} ${radius / 2}, ${radius} ${radius}
          L ${x} ${startY + radius + offset}
          L ${x} ${endY - radius - offset}
          c 0 ${radius / 2}, -${radius / 2} ${radius}, -${radius} ${radius}
          M ${x} ${y}
          h ${radius}
        `);
    }
  }, [sumRef, sumSvgRef, getSumSvgLoc, summary, nodes]);

  return (
    <>
      <div
        style={{
          "--outline-width": "-5px",
        }}
        className={`flex items-center ml-6 self-stretch`}
        ref={sumRef}
      >
        <div
          className={`sum-node ${isSelectedSum ? "selected" : ""}`}
          style={{
            "--outline-width": `${
              summary.outline.style !== "none"
                ? parseInt(summary.outline.width, 10)
                : 0
            }px`,
            backgroundColor: summary.bkColor,
            outline: `${summary.outline.width} ${summary.outline.style} ${summary.outline.color}`,
            fontFamily: `${summary.font.family}`,
            fontSize: `${summary.font.size}`,
            fontWeight: `${summary.font.weight}`,
            color: `${summary.font.color}`,
            fontStyle: `${summary.font.isItalic ? "italic" : "normal"}`,
            textDecorationLine: `${
              summary.font.isStrikethrough ? "line-through" : "none"
            }`,
          }}
          tabIndex="0"
          ref={sumNodeRef}
          onDoubleClick={editMode}
        >
          {isEditing ? (
            <>
              <div
                ref={inputRef}
                className="input-box"
                style={{
                  minWidth: `${
                    sumNodeRef.current?.getBoundingClientRect().width ?? 94
                  }px`,
                  maxWidth: `${500}px`,
                  textDecorationLine: `${
                    summary.font.isStrikethrough ? "line-through" : "none"
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
                {summary.name}
              </div>
              <span>{summary.name}</span>
            </>
          ) : (
            <span>{summary.name}</span>
          )}
        </div>
      </div>

      <svg className="summary" overflow="visible" ref={sumSvgRef}>
        <path
          d={sumPath}
          stroke={summary.pathColor}
          fill="none"
          strokeWidth={summary.path.width}
          strokeDasharray={summary.path.style - 24}
        />
        {/* <circle cx={sumLoc.x} cy={sumLoc.y} r="5" fill="blue" /> */}
      </svg>
    </>
  );
}
