'use client'
import { applyNodeChanges, Background, Controls, Edge, Node, NodeChange, ReactFlow } from "@xyflow/react"
import React from "react"
import TableNode from "./nodes/TableNode"
import "@xyflow/react/dist/style.css"

const Diagram: React.FC<{ nodes: Node[], edges: Edge[] }> = ({ nodes, edges }) => {
  const [updatedNode, setUpdatedNode] = React.useState<Node[]>(nodes)
  //const [updatedEdge, setUpdatedEdge] = React.useState<Edge[]>(edges)

  const onNodesChange = React.useCallback(
    (changes: NodeChange[]) => setUpdatedNode((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  // Keep local state in sync when parent updates nodes (e.g., after Generate)
  React.useEffect(() => {
    setUpdatedNode(nodes);
  }, [nodes]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={updatedNode}
        edges={edges}
        onNodesChange={onNodesChange}
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