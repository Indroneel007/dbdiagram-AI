const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { clerkMiddleware } = require("@clerk/express");
const chatrouter = require('./routes/chat.js');

const app = express();
const port = 8567;

app.use(cors({
    origin: 'http://localhost:3000'
}))

app.use(clerkMiddleware());

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/chat', chatrouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});