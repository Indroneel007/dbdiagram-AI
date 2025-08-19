'use cliet'
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
      <div className='h-screen bg-zinc-900 w-full'>
        <CodeMirror
          id="postgres-editor"         // 👈 unique id
          value={ideAnswer}
          height='100%'
          extensions={[
          sql({
            dialect: PostgreSQL,  // 👈 PostgreSQL dialect
          }),
        ]}
        theme="dark"
        editable={true}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
        }}
        onChange={(value) => {
          setIdeAnswer(value);
        }}
        />  
      </div>      
    </>
  )
}

export default Ide