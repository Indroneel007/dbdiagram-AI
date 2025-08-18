'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SendHorizonal } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
const Chat: React.FC = () => {
  const [message, setMessage] = React.useState<string>("");
  const [chatAnswer, setChatAnswer] = React.useState<string>("");
  const [ideAnswer, setIdeAnswer] = React.useState<string>("");
  const [chatType, setchatType] = React.useState<string>("write"); //default mode is 'write'

  const handleSubmit = async () => {
    if(!message.trim()) {
      return;
    }

    setChatAnswer(""); // Clear previous answer
    try {
      const response = await fetch('http://localhost:8567/api/chat',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          chatType, 
        })
      })

      const data = await response.json();

      if(data.target==="chat")setChatAnswer(data.answer || "No answer received");
      else if(data.target === "write"){
        setIdeAnswer(data.answer || "No answer received");
        
      }
      setMessage("");
    } catch (error) {
      console.error("Error fetching chat response:", error);
      setChatAnswer("Error fetching response");
      setIdeAnswer("Error fetching response");
    }
  }

  return(
    <>
      <div>
        <div className='flex flex-col h-30 w-full border rounded-xl bg-zinc-600 p-2 fixed bottom-0 right-0 max-w-100 mx-auto mb-3'>
          <div className='flex-3 flex'>
            <Input type='text' placeholder='Ask me anything' className='mr-2 text-white' value={message} onChange={(e) => setMessage(e.target.value)} />
            <Button variant="secondary" onClick={handleSubmit}>
              <SendHorizonal />
            </Button>
          </div>
          <div className='flex-2 justify-end'>
            <ToggleGroup type="single" defaultValue="write" className='bg-zinc-600 w-40 p-2' aria-label="Text alignment">
              <ToggleGroupItem value="write" className='text-white'>Write</ToggleGroupItem>
              <ToggleGroupItem value="chat" className='text-white'>Chat</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </>
  )
}

export default Chat