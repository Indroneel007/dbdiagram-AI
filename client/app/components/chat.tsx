'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SendHorizonal } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@clerk/nextjs'

type setIDEProps = {
  setIdeAnswer: React.Dispatch<React.SetStateAction<string>>;
};

type MessageRole = 'user' | 'assistant';

interface IMessage{
id: string;
content: string;
role: MessageRole;
timestamp: Date;
}
const Chat: React.FC<setIDEProps> = ({setIdeAnswer}) => {
  const [message, setMessage] = React.useState<string>("");
  const [chatAnswer, setChatAnswer] = React.useState<string>("");
  const [chatType, setchatType] = React.useState<string>("write"); //default mode is 'write'
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if(messagesEndRef.current){
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const {getToken} = useAuth();
  const handleSubmit = async () => {
    if(!message.trim()) {
      return;
    }
    setMessage(""); // Clear input field
    setChatAnswer(""); // Clear previous answer

    const newMessage: IMessage = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev)=>[...prev, newMessage]);

    const token = await getToken({ template: 'db-diagram' });

    try {
      const response = await fetch('https://dbdiagram-ai.onrender.com/chat/',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          chatType, 
        })
      })

      if (!response.ok) {
        // optional: inspect text to see error message
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      //console.log("RAW RESPONSE:", data);

      if(data.target==="chat"){
        console.log('Chat response:', data.answer);
        setChatAnswer(data.answer || "No answer received");
        setMessages((prev)=>[...prev, {
          id: Date.now().toString(),
          content: data.answer || "No answer received",
          role: 'assistant',
          timestamp: new Date(),
        }])
      }
      else if(data.target==="write"){
        console.log('Chat response:', data.answer);
        setIdeAnswer(data.answer || "No answer received");
      }
      setMessage("");
    } catch (error) {
      console.error("Error fetching chat response:", error);
      setChatAnswer("Error fetching response");
      setIdeAnswer("Error fetching response");
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return(
    <>
      <div className='flex flex-col h-full w-full'>
        {/* Messages area */}
        <div className='flex-1 min-h-0'>
          <ScrollArea className='h-full pr-2'>
            <div className='flex flex-col gap-2 p-2'>
              {messages.map((msg) => (
                <div key={msg.id} className={`p-2 rounded-lg max-w-[85%] ${msg.role === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 text-black self-start'}`}>
                  <p className='whitespace-pre-wrap break-words'>{msg.content}</p>
                  <span className='text-xs opacity-70'>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
              {chatAnswer && (
                <div className='p-2 rounded-lg bg-gray-300 text-black self-start max-w-[85%]'>
                  <p className='whitespace-pre-wrap break-words'>{chatAnswer}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Composer */}
        <div className='border-t bg-zinc-700 p-2'>
          <div className='flex items-center gap-2'>
            <Input type='text' placeholder='Ask me anything' className='text-white' value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} />
            <Button variant="secondary" onClick={handleSubmit}>
              <SendHorizonal />
            </Button>
          </div>
          <div className='flex justify-end mt-2'>
            <ToggleGroup type="single" defaultValue="write" className='bg-zinc-600 h-7 text-xs' aria-label="Mode" onValueChange={(val)=>val && setchatType(val)}>
              <ToggleGroupItem value="write" className='text-white text-xs'>Write</ToggleGroupItem>
              <ToggleGroupItem value="chat" className='text-white text-xs'>Chat</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </>
  )
}

export default Chat