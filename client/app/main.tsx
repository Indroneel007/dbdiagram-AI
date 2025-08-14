'use client'
import React from 'react'
import Ide from './components/ide'
import Diagram from './components/diagram'
import Chat from './components/chat'

const Main: React.FC = () => {
  
  
  return(
    <div className='flex h-screen overflow-hidden'>
      <div className='flex-2'>
        <Ide />
      </div>
      <div className='flex-3 bg-amber-50'>
        <Diagram />
      </div>
      <div className='flex-2'>
        <Chat />
      </div>
    </div>
  )
}

export default Main