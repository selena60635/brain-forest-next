import React, { useRef, useEffect, useCallback, useState } from "react";

export default function Relations({
  rootNode,
  rootRef,
  nodes,
  nodeRefs,
  rels,

  relMode,
  setRelMode,
  setRels,
  selectedRelId,
  setSelectedRelId,
  relRefs,
  btnsRef,
}) {
  const relsSvgRef = useRef(null);
  const tempControlPointsRef = useRef({});
  const [isEdit, setIsEdit] = useState(null);

  const editMode = (relId) => {
    const textElement = relRefs.current[relId].querySelector("text");
    const textWidth = textElement ? textElement.getBBox().width : 100;
    const textHeight = textElement ? textElement.getBBox().height : 20;
    setIsEdit({
      id: relId,
      width: textWidth + 20,
      height: textHeight + 10,
    });
  };
  const unEditMode = (relId, newValue) => {
    setRels((prev) =>
      prev.map((r) => {
        if (r.id === relId) {
          return { ...r, name: newValue };
        }
        return r;
      })
    );
    setIsEdit(null);
  };
  //控制點擊事件操作
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (e.button !== 0 || btnsRef.current.contains(e.target)) return;
      if (!relMode) {
        //關聯模式關閉時
        const isClickRelRefs = Object.values(relRefs.current).some((ref) =>
          ref?.contains(e.target)
        );
        if (!isClickRelRefs) {
          //若點擊範圍不在relRefs上，取消所有選取的rel
          setSelectedRelId(null);
        }
        return;
      }
      //關聯模式開啟時，點擊的範圍必需是節點或根節點
      const isClickNodes = () => {
        return (
          Object.values(nodeRefs.current)
            .flatMap((refArr) => (Array.isArray(refArr) ? refArr : [refArr]))
            .some((ref) => ref?.current?.contains(e.target)) ||
          rootRef.current?.contains(e.target)
        );
      };
      if (!isClickNodes()) {
        //若點擊範圍不在節點或根節點上，代表沒有選中，關閉關聯模式
        setRelMode(false);
      }
    };

    document.addEventListener("mousedown", handleGlobalClick, true);

    return () => {
      document.removeEventListener("mousedown", handleGlobalClick, true);
    };
  }, [
    relMode,
    nodeRefs,
    setRelMode,
    rootRef,
    setSelectedRelId,
    relRefs,
    btnsRef,
  ]);

  const findNodeWithIndex = useCallback(
    (nodes, id) => {
      if (rootNode.id === id) {
        return { node: rootNode, index: -1 };
      }
      const stack = nodes.map((node, index) => ({
        node,
        path: index,
      }));
      while (stack.length > 0) {
        const { node, path } = stack.pop();

        if (node.id === id) {
          return { node, index: path };
        }

        if (node.children && node.children.length > 0) {
          node.children.forEach((child, childIndex) => {
            stack.push({
              node: child,
              path: childIndex,
            });
          });
        }
      }

      return null;
    },
    [rootNode]
  );

  const findNodeRef = useCallback(
    (nodeRefs, item) => {
      if (item) {
        let ref;
        if (item.node.id === rootNode.id) {
          return rootRef;
        }
        if (item.node.parent) {
          ref = nodeRefs.current[item.node.parent]?.[item.index];
        } else {
          ref = nodeRefs.current[item.index];
        }

        return ref;
      }
    },
    [rootNode.id, rootRef]
  );

  const getRelSvgLoc = useCallback((nodeRef, node, svgRef) => {
    if (nodeRef && nodeRef.current && svgRef.current) {
      const nodeRect = nodeRef.current.getBoundingClientRect();
      const svgRect = svgRef.current.getBoundingClientRect();

      return {
        x: nodeRect.left - svgRect.left + nodeRect.width / 2,
        y: nodeRect.top - svgRect.top,
      };
    }
    return { x: 0, y: 0 };
  }, []);

  const calcRelPath = useCallback(
    (rel) => {
      const relFromNode = findNodeWithIndex(nodes, rel.from);
      const relToNode = findNodeWithIndex(nodes, rel.to);
      const relFromRef = findNodeRef(nodeRefs, relFromNode);
      const relToRef = findNodeRef(nodeRefs, relToNode);
      const from = getRelSvgLoc(relFromRef, relFromNode, relsSvgRef);
      const to = getRelSvgLoc(relToRef, relToNode, relsSvgRef);

      const cp1 = tempControlPointsRef.current["cp1"] ||
        rel.controlPoints?.cp1 || {
          x: from.x,
          y: from.y + from.y - to.y,
        };
      const cp2 = tempControlPointsRef.current["cp2"] ||
        rel.controlPoints?.cp2 || {
          x: to.x,
          y: from.y,
        };

      const midX =
        Math.pow(1 - 0.5, 3) * from.x +
        3 * Math.pow(1 - 0.5, 2) * 0.5 * cp1.x +
        3 * (1 - 0.5) * Math.pow(0.5, 2) * cp2.x +
        Math.pow(0.5, 3) * to.x;
      const midY =
        Math.pow(1 - 0.5, 3) * from.y +
        3 * Math.pow(1 - 0.5, 2) * 0.5 * cp1.y +
        3 * (1 - 0.5) * Math.pow(0.5, 2) * cp2.y +
        Math.pow(0.5, 3) * to.y;

      return { from, to, cp1, cp2, midX, midY };
    },
    [findNodeWithIndex, findNodeRef, getRelSvgLoc, nodes, nodeRefs, relsSvgRef]
  );

  const handleDrag = (e, rel, pointIndex) => {
    const svgRect = relsSvgRef.current.getBoundingClientRect();
    const newX = e.clientX - svgRect.left;
    const newY = e.clientY - svgRect.top;

    tempControlPointsRef.current[pointIndex] = { x: newX, y: newY };

    const { from, to, cp1, cp2, midX, midY } = calcRelPath(rel);

    const relPaths = relRefs.current[rel.id].querySelectorAll("path");
    const cp1Circle = relRefs.current[rel.id].querySelectorAll(".cp1");
    const cp2Circle = relRefs.current[rel.id].querySelectorAll(".cp2");
    const cp1Line = relRefs.current[rel.id].querySelectorAll(".cp1-line");
    const cp2Line = relRefs.current[rel.id].querySelectorAll(".cp2-line");
    const text = relRefs.current[rel.id].querySelector("text");

    if (pointIndex === "cp1") {
      cp1Circle.forEach((circle) => {
        circle.setAttribute("cx", cp1?.x);
        circle.setAttribute("cy", cp1?.y);
      });
      cp1Line.forEach((line) => {
        line.setAttribute("x1", from.x);
        line.setAttribute("y1", from.y);
        line.setAttribute("x2", cp1?.x);
        line.setAttribute("y2", cp1?.y);
      });
      relPaths.forEach((path) => {
        path.setAttribute(
          "d",
          `M ${from.x} ${from.y} C ${cp1?.x} ${cp1?.y}, ${cp2?.x} ${cp2?.y}, ${to.x} ${to.y}`
        );
      });
    } else if (pointIndex === "cp2") {
      cp2Circle.forEach((circle) => {
        circle.setAttribute("cx", cp2?.x);
        circle.setAttribute("cy", cp2?.y);
      });

      cp2Line.forEach((line) => {
        line.setAttribute("x1", to.x);
        line.setAttribute("y1", to.y);
        line.setAttribute("x2", cp2?.x);
        line.setAttribute("y2", cp2?.y);
      });
      relPaths.forEach((path) => {
        path.setAttribute(
          "d",
          `M ${from.x} ${from.y} C ${cp1?.x} ${cp1?.y}, ${cp2?.x} ${cp2?.y}, ${to.x} ${to.y}`
        );
      });
    }
    text.setAttribute("x", midX);
    text.setAttribute("y", midY);
  };

  const handleMouseDown = (e, rel, pointIndex) => {
    e.stopPropagation();

    const onMouseMove = (moveEvent) => handleDrag(moveEvent, rel, pointIndex);
    const onMouseUp = () => {
      setRels((prev) =>
        prev.map((item) => {
          if (item.id === rel.id) {
            const newControlPoints = {
              ...item.controlPoints,
              ...tempControlPointsRef.current,
            };
            return { ...item, controlPoints: newControlPoints };
          }
          return item;
        })
      );

      tempControlPointsRef.current = {};

      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <>
      <div className="absolute z-20 top-0 left-0">
        <svg
          className="rels-lines"
          overflow="visible"
          xmlns="http://www.w3.org/2000/svg"
          ref={relsSvgRef}
        >
          {rels.map((rel) => {
            const { from, to, cp1, cp2, midX, midY } = calcRelPath(rel);
            return (
              <g
                key={rel.id}
                ref={(el) => (relRefs.current[rel.id] = el)}
                className={`cursor-pointer ${
                  selectedRelId === rel.id ? "stroke-[8px]" : "stroke-[0px]"
                }`}
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRelId(rel.id);
                }}
                onDoubleClick={() => editMode(rel.id)}
              >
                <circle
                  cx={from.x}
                  cy={from.y}
                  r={`${5}`}
                  fill={rel.pathColor}
                />
                <circle cx={to.x} cy={to.y} r={`${5}`} fill={rel.pathColor} />
                <path
                  d={`M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`}
                  stroke={rel.pathColor}
                  fill="none"
                  strokeWidth={`${1}`}
                  strokeDasharray={`${5}`}
                ></path>
                <path
                  d={`M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`}
                  stroke="rgba(0, 153, 255, 0.5)"
                  fill="none"
                ></path>
                <path
                  d={`M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`}
                  stroke="rgba(0, 0, 0, 0)"
                  fill="none"
                  strokeWidth={`${10}`}
                ></path>

                {isEdit?.id === rel.id ? (
                  <foreignObject
                    x={midX - isEdit.width / 2}
                    y={midY - 10}
                    width={isEdit.width}
                    height={isEdit.height}
                  >
                    <input
                      value={rel.name}
                      className=""
                      onChange={(e) =>
                        setRels((prev) =>
                          prev.map((r) =>
                            r.id === rel.id ? { ...r, name: e.target.value } : r
                          )
                        )
                      }
                      onBlur={(e) => unEditMode(rel.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Tab") {
                          e.preventDefault();
                          e.stopPropagation();
                          unEditMode(rel.id, e.target.value);
                        }
                      }}
                      autoFocus
                      style={{
                        minWidth: `${isEdit.width}px`,
                        width: `${isEdit.width}px`,
                        height: "100%",
                        padding: "2px",
                        border: "1px solid #000",
                      }}
                    />
                  </foreignObject>
                ) : (
                  <>
                    <text
                      x={midX}
                      y={midY}
                      fill={rel.font.color}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      stroke="white"
                      strokeWidth={`${4}`}
                      paintOrder="stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        fontFamily: `${rel.font.family}`,
                        fontSize: `${rel.font.size}`,
                        fontWeight: `${rel.font.weight}`,
                        fontStyle: `${rel.font.isItalic ? "italic" : "normal"}`,
                        textDecorationLine: `${
                          rel.font.isStrikethrough ? "line-through" : "none"
                        }`,
                      }}
                    >
                      {rel.name}
                    </text>
                  </>
                )}
                {selectedRelId === rel.id && (
                  <>
                    <circle
                      cx={cp1.x}
                      cy={cp1.y}
                      r={`${10}`}
                      fill="rgba(255, 255, 0, 0)"
                      onMouseDown={(e) => handleMouseDown(e, rel, "cp1")}
                      className="cp1"
                    />
                    <circle
                      cx={cp1.x}
                      cy={cp1.y}
                      r={`${5}`}
                      fill="red"
                      onMouseDown={(e) => handleMouseDown(e, rel, "cp1")}
                      className="cp1"
                    />
                    <circle
                      cx={cp2.x}
                      cy={cp2.y}
                      r={`${10}`}
                      fill="rgba(255, 255, 0, 0)"
                      onMouseDown={(e) => handleMouseDown(e, rel, "cp2")}
                      className="cp2"
                    />
                    <circle
                      cx={cp2.x}
                      cy={cp2.y}
                      r={`${5}`}
                      fill="red"
                      onMouseDown={(e) => handleMouseDown(e, rel, "cp2")}
                      className="cp2"
                    />
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={cp1.x}
                      y2={cp1.y}
                      stroke="red"
                      strokeWidth={`${1}`}
                      className="cp1-line"
                    />
                    <line
                      x1={to.x}
                      y1={to.y}
                      x2={cp2.x}
                      y2={cp2.y}
                      stroke="red"
                      strokeWidth={`${1}`}
                      className="cp2-line"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}
