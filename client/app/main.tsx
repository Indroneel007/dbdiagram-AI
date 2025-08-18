'use client'
import React from 'react'
import Ide from './components/ide'
import Diagram from './components/diagram'
import Chat from './components/chat'

const Main: React.FC = () => {
  const [ideAnswer, setIdeAnswer] = React.useState<string>("");
  
  return(
    <div className='flex h-screen overflow-hidden bg-zinc-600'>
      <div className='flex-2'>
          <Ide ideAnswer={ideAnswer} />
      </div>
      <div className='flex-3'>
        <Diagram />
      </div>
      <div className='flex-2'>
        <Chat setIdeAnswer={setIdeAnswer} />
      </div>
    </div>
  )
}

export default Main