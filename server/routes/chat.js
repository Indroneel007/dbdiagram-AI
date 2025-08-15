import express from 'express';
import { Ollama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const router = express.Router();

const llm = new Ollama({
  model: "llama3", // Default value
  temperature: 0,
  maxRetries: 2,
  baseUrl: "http://localhost:11434"
});

writePrompt = PromptTemplate.fromTemplate(
  ""
);

chatPrompt = PromptTemplate.fromTemplate("Write a {chatType} about {message}");

router.post("/", async (req, res)=>{
  try {
    const {message, chatType} = req.body;
    //Error Message
    if(!chatType || !message){
      return res.status(400).json({message: "Please provide a chat type and message"})
    }

    if(chatType === "write"){
      const chain = writePrompt.pipe(llm).pipe(new StringOutputParser());
      
    }else{
      const chain = chatPrompt.pipe(llm).pipe(new StringOutputParser());
    }
  }catch (error) {
    
  }
})