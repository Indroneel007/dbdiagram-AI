const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { clerkMiddleware } = require("@clerk/express");
const chatrouter = require("./routes/chat.js");

const app = express();
const port = 8567;

app.use(cors(
    {
        origin: "https://dbdiagram-ai-azet.vercel.app/",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true
    }
))

app.use(clerkMiddleware());

app.use(express.json());

/*app.get('/chat/test', (req, res) => {
    res.json({msg : "Something working"});
});*/

app.use('/chat', chatrouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});