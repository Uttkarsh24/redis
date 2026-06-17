import express from "express";
import Redis from "ioredis";

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URI || 'redis://localhost:6379');

function otpKey(phone){
    return `otp:${phone}`;
}

app.post('/otp',async(req,res)=>{
    const {phone}= req.body;
    const otp = Math.floor(100000+Math.random()*900000).toString();
    
    await redis.set(otpKey(phone),otp,'EX',30); //valid for 30 seconds

    return res.json({message:'OTP sent',otp}); 
});

app.post('/otp/verify',async(req,res)=>{
    const {phone,otp} = req.body;
    const savedOtp = await redis.get(otpKey(phone));

    if(!savedOtp){
        return res.status(400).json({message:'OTP expired or not found'});
    }

    if(savedOtp !== otp){
        return res.status(400).json({message:'Invalid OTP'});
    }
    
    await redis.del(otpKey(phone)); //delete OTP after successful verification
    res.json({message:'OTP verified successfully'});
})

app.get('/otp/:phone/ttl',async(req,res)=>{
    const ttl = await redis.ttl(otpKey(req.params.phone));
    res.json({ttl});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));