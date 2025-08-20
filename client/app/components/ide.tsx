'use client'
import React from 'react'
import CodeMirror from '@uiw/react-codemirror';
import {PostgreSQL, sql} from '@codemirror/lang-sql';
import { Button } from '@/components/ui/button';
import { Table2 } from 'lucide-react';
type IdeProps = {
  ideAnswer: string
  setIdeAnswer: React.Dispatch<React.SetStateAction<string>>
};
const Ide: React.FC<IdeProps> = ({ideAnswer, setIdeAnswer}) => {

  const [newIdeAnswer, setNewIdeAnswer] = React.useState<string>("");
  console.log("ideAnswer is hit");
/*  React.useEffect(() => {
    if(ideAnswer) {
      setNewIdeAnswer(ideAnswer);
    }
  }, [ideAnswer]);
*/
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
  onChange={(value) => {
    setIdeAnswer(value); // 👈 updates parent directly
  }}
/>   
    <Button className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg">
      <Table2 />
      <span className='ml-0'>Generate</span>
    </Button>
      </div>      
    </>
  )
}

export default Ide