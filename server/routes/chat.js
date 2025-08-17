const express = require("express");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const pkg = require("pg");
const { createClient } = require("redis");
const { requireAuth, getAuth } = require("@clerk/express");
const parse = require("pgsql-parser");
const OpenAI = require("openai");
const {RunnableSequence} = require("@langchain/core/runnables");
const {ChatOpenAI} = require("@langchain/openai");

const { Client } = pkg;

const router = express.Router();

const llm = new ChatOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, // your OpenRouter key (sk-or-v...)
  model: "moonshotai/kimi-k2:free",     // <-- use the correct slug from OpenRouter
  temperature: 0,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",  // point to OpenRouter
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:8567", // your app URL or domain
      "X-Title": "dbdiagram-AI"
    }
  }
});


const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

async function init(){
  await redisClient.connect();
}

init();

let writePrompt = PromptTemplate.fromTemplate(`
You are an expert PostgreSQL database assistant.
Your task is to take natural language input and translate it into valid, optimized PostgreSQL queries.
Guidelines:
1. Always return valid PostgreSQL DDL code.
2. Add primary keys, foreign keys, indexes, and constraints where logically appropriate.
3. Assume id as a primary key if not specified.
4. Always return valid PostgreSQL DML code.
5. Use snake_case for table and column names.
6. Output only the SQL code block, no explanation.

Now write the query for the following message according to given guidelines: {message}
`);

let correctionPrompt = PromptTemplate.fromTemplate(`
You are an expert in PostgreSQL. Your task is to correct SQL code using deep thinking when it produces errors.

Input:
1. The original SQL code
2. The postgres error message
3. The user's original request

Guidelines:
1. Carefully analyze the error message in context.
2. Use the user's intent to resolve ambiguities.
3. Return only the corrected PostgreSQL code.
4. Do not explain the fix.
5. Always ensure the corrected SQL is valid and executable in PostgreSQL.

Now correct the following SQL code according to given guidelines and error message
Error message:
{error}

Question:
{message}
`);

let chatPrompt = PromptTemplate.fromTemplate(`
You are an expert PostgreSQL database schema designer.
When the user describes a table or database structure in natural language, your task is to provide a clear textual explanation of how the table(s) could be designed.
Use a clear and concise language including table name, column names, data types, and constraints.
Provide a step by description according to given guidelines and get help of the past chat context provided.

Guidelines:
1. Do not output SQL code unless explicitly asked.
2. Instead, respond in natural language, clarifying:
    - Suggested table names.
    - Possible column and data type combinations.
    - rimary keys, foreign keys, and indexes.
    - Constraints.
    - Any assumptions you made if the user's description was vague.
3. Ask clarifying questions if the user request is ambiguous (e.g., "Should emails be unique?" or "Do you want to store timestamps in UTC?").
4. Use simple but precise explanations that even beginners can follow.

Input Example:
"I want a table for users with name, email, and signup date."

Output Example:
"I suggest creating a users table. Each user will have a unique identifier (an id as primary key), a name (string up to 100 characters), an email (string up to 255 characters, ideally unique so the same email can't be reused), and a signup_date (timestamp, defaulting to the current time).
Do you also want to include password storage or authentication details?"

Now below I am providing you context and Question, try to answer the question with help of context:

Context:
{context}

Question:
{message}
`);

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
    await client.query(sql);
    return { valid: true };
  } catch(err){
    return { valid: false, error: err.message };
  } finally {
    await client.end();
  }
}


router.get("/test", (req, res)=>{
  res.json({answer: "Atleast router running"})
})

router.post("/", requireAuth(), async (req, res)=>{
  try {
    const {message, chatType} = req.body;
    const {userId} = getAuth(req);

    //Error Message
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    if(!chatType || !message){
      return res.status(400).json({message: "Please provide a chat type and message"})
    }
    
    if(chatType == "write"){
      
      const chain = writePrompt.pipe(llm).pipe(new StringOutputParser());
      let answer = await chain.invoke({message})
      console.log(answer)
      //res.json({answer: "Hello motherfucker"})
      const MAX_ATTEMPTS = 3;
      let attempts = 0;
      
      return res.status(200).json({answer: String(answer)})
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
      /*const redisKey = `chat:${userId}`
      const chatHistory = await redisClient.lRange(redisKey, 0, -1);

      const context = chatHistory.map((entry) => {
        const {message, answer, timestamp} = JSON.parse(entry);
        return `User: ${message}\nAssistant: ${answer}\n`
      }).join("\n\n");

      const chain = chatPrompt.pipe(llm).pipe(new StringOutputParser());
      const answer = await chain.invoke({message, context});

      res.json({answer})*/
    }
  }catch (error) {
    res.status(500).json({ error: error.message });
  }
})

module.exports = router