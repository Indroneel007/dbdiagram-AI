'use client'
import React from 'react'
import CodeMirror from '@uiw/react-codemirror';
import {PostgreSQL, sql} from '@codemirror/lang-sql';
import { Button } from '@/components/ui/button';
import { Table2 } from 'lucide-react';
import { Edge, Node, MarkerType } from '@xyflow/react';
import { extractSchemaFromSQL } from '../utils/table';

// Table structure we want in frontend (kept for clarity)
interface Table {
  id: string;
  name: string;
  columns: string[];
}

type IdeProps = {
  ideAnswer: string
  setIdeAnswer: React.Dispatch<React.SetStateAction<string>>
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
};

const Ide: React.FC<IdeProps> = ({ideAnswer, setIdeAnswer, setNodes, setEdges}) => {

  const [newIdeAnswer, setNewIdeAnswer] = React.useState<string>("");
  console.log("ideAnswer is hit");
/*  React.useEffect(() => {
    if(ideAnswer) {
      setNewIdeAnswer(ideAnswer);
    }
  }, [ideAnswer]);
*/
  const handleGenerate = () => {
    try {
      // Use simple SQL scanner to get tables and relations
      const { tables, relations } = extractSchemaFromSQL(ideAnswer);
      console.log('Parsed tables:', tables);
      console.log('Parsed relations:', relations);

      const newNodes: Node[] = tables.map((table, i) => ({
        id: table.id,
        type: "tableNode",
        position: { x: 100 + (i % 3) * 280, y: 100 + Math.floor(i / 3) * 220 },
        data: { label: table.name, columns: table.columns },
      }));

      // Map table name -> node id
      const nameToId = new Map<string, string>();
      for (const t of tables) nameToId.set(t.name, t.id);

      const newEdges: Edge[] = relations
        .map((rel, idx) => {
          const sourceId = nameToId.get(rel.sourceTable);
          const targetId = nameToId.get(rel.targetTable);
          if (!sourceId || !targetId) return null;
          return {
            id: `e-${idx}-${rel.sourceTable}.${rel.sourceColumn}->${rel.targetTable}.${rel.targetColumn}`,
            source: sourceId,
            target: targetId,
            sourceHandle: `col-${rel.sourceColumn}`,
            targetHandle: `col-${rel.targetColumn}`,
            label: `${rel.sourceColumn} → ${rel.targetTable}.${rel.targetColumn}`,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { strokeWidth: 1.5 },
            animated: false,
          } as Edge;
        })
        .filter(Boolean) as Edge[];

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) {
      console.error("Parse error:", err);
    }
  };

  return(
    <>
      <div className='h-screen bg-zinc-900 w-full flex relative'>
        <CodeMirror
  value={ideAnswer}
  className='flex-1'
  height="100%"
  extensions={[sql({ dialect: PostgreSQL })]}
  theme="dark"
  editable={true}
  basicSetup={{
    lineNumbers: true,
    highlightActiveLine: true,
  }}
  onChange={(value) =>setIdeAnswer(value)}
/>   
    <Button type="button" onClick={handleGenerate} className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg">
      <Table2 />
      <span className='ml-0'>Generate</span>
    </Button>
      </div>   
    </>
  )
}

export default Ide