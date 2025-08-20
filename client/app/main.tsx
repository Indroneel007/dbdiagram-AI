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

  // Resizable layout state (percentages)
  const [leftWidth, setLeftWidth] = React.useState<number>(28);   // IDE panel
  const [rightWidth, setRightWidth] = React.useState<number>(28);  // Chat panel
  const minWidth = 15; // percent

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const draggingRef = React.useRef<null | 'left' | 'right'>(null);

  const onMouseDownLeft = () => { draggingRef.current = 'left'; };
  const onMouseDownRight = () => { draggingRef.current = 'right'; };

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const total = rect.width;
      const x = e.clientX - rect.left;
      if (draggingRef.current === 'left') {
        const newPct = Math.max(minWidth, Math.min(50, (x / total) * 100));
        setLeftWidth(newPct);
      } else if (draggingRef.current === 'right') {
        const fromRight = rect.right - e.clientX;
        const newPct = Math.max(minWidth, Math.min(50, (fromRight / total) * 100));
        setRightWidth(newPct);
      }
    };
    const onUp = () => { draggingRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);
  
  return(
    <div ref={containerRef} className='flex h-screen overflow-hidden bg-zinc-600 select-none'>
      {/* Left panel (IDE) */}
      <div style={{ width: `${leftWidth}%`, minWidth: `${minWidth}%` }} className='h-full overflow-hidden'>
        <Ide ideAnswer={ideAnswer} setIdeAnswer={setIdeAnswer} setNodes={setNodes} setEdges={setEdges} />
      </div>
      {/* Splitter between left and center */}
      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={onMouseDownLeft}
        style={{ cursor: 'col-resize', width: 6 }}
        className='bg-zinc-500 hover:bg-zinc-400 active:bg-zinc-300'
      />

      {/* Center panel (Diagram) flexes */}
      <div style={{ flex: 1 }} className='bg-white h-full'>
        <Diagram nodes={nodes} edges={edges} />
      </div>

      {/* Splitter between center and right */}
      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={onMouseDownRight}
        style={{ cursor: 'col-resize', width: 6 }}
        className='bg-zinc-500 hover:bg-zinc-400 active:bg-zinc-300'
      />

      {/* Right panel (Chat) */}
      <div style={{ width: `${rightWidth}%`, minWidth: `${minWidth}%` }} className='h-full overflow-hidden'>
        <Chat setIdeAnswer={setIdeAnswer} />
      </div>
    </div>
  )
}

export default Main