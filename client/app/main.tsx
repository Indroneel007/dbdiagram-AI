'use client'
import React from 'react'
import Ide from './components/ide'
import Diagram from './components/diagram'
import Chat from './components/chat'
import { Edge, Node } from '@xyflow/react'

const Main: React.FC = () => {
  const [ideAnswer, setIdeAnswer] = React.useState<string>("");
  const [nodes, setNodes] = React.useState<Node[]>([])
  const [edges, setEdges] = React.useState<Edge[]>([])
  
  return(
    <div className='flex h-screen overflow-hidden bg-zinc-600'>
      <div className='flex-2'>
          <Ide ideAnswer={ideAnswer} setIdeAnswer={setIdeAnswer} setNodes={setNodes} setEdges={setEdges} />
      </div>
      <div className='flex-3 bg-white'>
        <Diagram nodes={nodes} edges={edges} />
      </div>
      <div className='flex-2'>
        <Chat setIdeAnswer={setIdeAnswer} />
      </div>
    </div>
  )
}

export default Main