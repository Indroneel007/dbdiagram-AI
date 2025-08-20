'use client'
import React from 'react'
import CodeMirror from '@uiw/react-codemirror';
import {PostgreSQL, sql} from '@codemirror/lang-sql';
import { Button } from '@/components/ui/button';
import { Table2 } from 'lucide-react';
import {parse} from 'pgsql-ast-parser'
import { Edge, Node } from '@xyflow/react';
import { extractTables } from '../utils/table';

// Table structure we want in frontend
interface Table {
  id: string;
  name: string;
  columns: string[];
}

// Minimal AST types for CREATE TABLE
interface ASTColumn {
  name: { name: string };
}

interface ASTCreateTable {
  type: "create table";
  name: { name: string };
  columns: ASTColumn[];
}

// The parse() function returns (ASTCreateTable | OtherStatements)[]
// If you don’t want to define all statements, just use a union with `unknown`.
type ASTNode = ASTCreateTable;

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
      const ast = parse(ideAnswer) as ASTNode[]; // parser returns unknown; cast to our minimal type
      const tables: Table[] = extractTables(ast);

      const newNodes = tables.map((table, i) => ({
        id: table.id,
        type: "tableNode",
        position: { x: 100 + i * 250, y: 150 },
        data: { label: table.name, columns: table.columns },
      }));

      setNodes(newNodes);
      setEdges([]);
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