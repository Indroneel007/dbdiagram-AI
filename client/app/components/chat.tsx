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
      const response = await fetch('http://localhost:8567/chat/',{
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
        setChatAnswer(data.answer || "No answer received");
        setMessages((prev)=>[...prev, {
          id: Date.now().toString(),
          content: data.answer || "No answer received",
          role: 'assistant',
          timestamp: new Date(),
        }])
      }
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return(
    <>
      <div className='flex flex-col h-screen w-full max-w-200'>
        <div>
          <ScrollArea className='mb-4 pr-4' style={{ height: 'calc(100vh - 150px)' }}>
            <div className='flex flex-col gap-2'>
              {messages.map((msg) => (
                <div key={msg.id} className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 text-black self-start'}`}>
                  <p>{msg.content}</p>
                  <span className='text-xs text-gray-500'>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
              {chatAnswer && (
                <div className='p-2 rounded-lg bg-gray-300 text-black self-start'>
                  <p>{chatAnswer}</p>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        </div>
        <div className='flex flex-col h-25 w-full border rounded-xl bg-zinc-600 p-2 fixed bottom-0 right-0 max-w-104 mx-auto mb-3 mr-4'>
          <div className='flex-3 flex'>
            <Input type='text' placeholder='Ask me anything' className='mr-2 text-white' value={message} onChange={(e) => setMessage(e.target.value)} />
            <Button variant="secondary" onClick={handleSubmit}>
              <SendHorizonal />
            </Button>
          </div>
          <div className='flex-2 justify-end h-5'>
            <ToggleGroup type="single" defaultValue="write" className='bg-zinc-600 w-40 h-5 text-xs' aria-label="Text alignment" onValueChange={(val)=>val && setchatType(val)}>
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