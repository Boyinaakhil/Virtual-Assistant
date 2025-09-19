import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"

import cookieParser from "cookie-parser"
import cors from "cors"
import geminiResponse from "./gemini.js"
dotenv.config()

const app = express()
const port = process.env.PORT || 5000
app.use(cors({
  origin : "https://virtual-assistant-9lp9.onrender.com",
  credentials:true
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)

app.get("/",async (req,res)=>{
  let prompt = req.query.prompt
  let data = await geminiResponse(prompt)
  res.json(data)

})

app.listen(port,()=>{
  connectDB()
  console.log("server started");
})
