'use client'
import React from 'react'
import CodeMirror from '@uiw/react-codemirror';
import {PostgreSQL, sql} from '@codemirror/lang-sql';
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
      <div className='h-screen bg-zinc-900 w-full flex'>
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
      </div>      
    </>
  )
}

export default Ide