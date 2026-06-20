import express from express;
import Redis from "ioredis";

const app = express()
app.use(express.json())

const publisher = new Redis(process.env.REDIS_URI || 'redis://localhost:6379');

app.post("/notification",async (req,res) => {
  const payload = {
    title: req.body.title || 'Default Title',
    createdAt: new Date().toString()
  } 
  
  const receivers = await publisher.publish("notifications",JSON.stringify(payload));
  res.json({message:`notification sent to ${receivers} subscribers`}); 
})

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
