"use client"
import React from "react";
import type { NodeProps } from "@xyflow/react";

// Expects node.data = { label: string, columns?: string[] }
const TableNode: React.FC<NodeProps> = ({ data }) => {
  const { label, columns = [] } = (data ?? {}) as { label?: string; columns?: string[] };

  return (
    <div style={{
      border: "1px solid #d4d4d8",
      borderRadius: 8,
      background: "#ffffff",
      minWidth: 180,
      boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
      overflow: "hidden",
      fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"
    }}>
      <div style={{
        fontWeight: 600,
        fontSize: 14,
        padding: "8px 10px",
        background: "#f4f4f5",
        borderBottom: "1px solid #e4e4e7"
      }}>
        {label ?? ""}
      </div>
      <div style={{ padding: 8 }}>
        {columns.length === 0 ? (
          <div style={{ color: "#71717a", fontSize: 12 }}>(no columns)</div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {columns.map((col: string, idx: number) => (
              <li key={idx} style={{
                fontSize: 12,
                color: "#3f3f46",
                padding: "4px 6px",
                borderRadius: 4,
                border: "1px solid #f1f5f9",
                marginBottom: 4,
                background: "#fafafa"
              }}>
                {col}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TableNode;
