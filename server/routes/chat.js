import express from 'express';
import { Ollama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import pkg from 'pg';
import { createClient } from 'redis';
import {requireAuth} from '@clerk/express';

const { Client } = pkg;

const router = express.Router();

const llm = new Ollama({
  model: "llama3", // Default value
  temperature: 0,
  maxRetries: 2,
  baseUrl: "http://localhost:11434"
});

const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

async function init(){
  await redisClient.connect();
}

init();

writePrompt = PromptTemplate.fromTemplate(
  ""
);

correctionPrompt = PromptTemplate.fromTemplate("");

chatPrompt = PromptTemplate.fromTemplate("Write a {chatType} about {message}");

function validateSyntax(sql){
  try {
    parse(sql);
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

async function validateLogic(sql) {
  const client = new Client({
    connectionString: "postgresql://root:rootpassword@localhost:5433/simple_bank_2?sslmode=disable"
  })

  try{
    await client.connect();
    await client.query("BEGIN");

    await client.query(sql);

    await client.query("ROLLBACK");
    return { valid: true };
  } catch(err){
    return { valid: false, error: err.message };
  } finally {
    await client.end();
  }
}

router.post("/", requireAuth() ,async (req, res)=>{
  try {
    const {message, chatType} = req.body;
    const userId = req.auth.userId;

    //Error Message
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    if(!chatType || !message){
      return res.status(400).json({message: "Please provide a chat type and message"})
    }

    if(chatType === "write"){
      const chain = writePrompt.pipe(llm).pipe(new StringOutputParser());
      let answer = await chain.invoke({message})

      const MAX_ATTEMPTS = 3;
      let attempts = 0;
      
      while(attempts < MAX_ATTEMPTS && !validateSyntax(answer).valid){
        attempts++;

        const chain = correctionPrompt.pipe(llm).pipe(new StringOutputParser());
        const correction = await chain.invoke({message, error:validateSyntax(answer).error });

        if(validateSyntax(correction).valid){
          answer = correction;
          break;
        }
      }

      if(!validateSyntax(answer).valid){
        return res.status(200).json({answer})
      }

      attempts = 0;
      while(attempts < MAX_ATTEMPTS && !validateLogic(answer).valid){
        attempts++;

        const chain = correctionPrompt.pipe(llm).pipe(new StringOutputParser());
        const correction = await chain.invoke({message, error:validateLogic(answer).error });

        if(validateLogic(correction).valid){
          answer = correction;
          break;
        }
      }

      const chatEntry = {
        message,
        answer,
        timestamp: new Date().toISOString(),
      }

      const redisKey = `chat:${userId}`
      await redisClient.rPush(redisKey, JSON.stringify(chatEntry));

      res.status(200).json({answer})

    }else{
      const chain = chatPrompt.pipe(llm).pipe(new StringOutputParser());
      const answer = await chain.invoke({message})

      res.json({answer})
    }
  }catch (error) {
    
  }
})