import express from "express";
import Redis from "ioredis";

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URI || 'redis://localhost:6379');

const QUEUE_KEY = 'queue:key';

app.post('/send-email',async(req,res)=>{
     const job = {
        tp: req.body.to,
        subject: req.body.subject || 'no subject',
        body : req.body.body || 'no body',
        createdAt: new Date().toISOString()
     }

     await redis.lpush(QUEUE_KEY,JSON.stringify(job)); // inserting from left

     return res.json({queued:true,job})
});

app.get('/emails/process-one',async(req,res)=>{
    const rawJob = await redis.rpop(QUEUE_KEY);
    if(!rawJob){
        return res.json({message:'no jobs in the queue'});
    }

    const job = JSON.parse(rawJob);

    //simulate email sending
    res.json({message:'email sent'});

});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));

//remember there are drawbacks to using this method :-
// job less , no retry stystem and no parallel workers