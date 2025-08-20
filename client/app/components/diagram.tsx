'use client'
import { Background, Controls, Edge, Node, ReactFlow } from "@xyflow/react"
import React from "react"
import TableNode from "./nodes/TableNode"
import "@xyflow/react/dist/style.css"

const Diagram: React.FC<{ nodes: Node[], edges: Edge[] }> = ({ nodes, edges }) => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ tableNode: TableNode }}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export default Diagram