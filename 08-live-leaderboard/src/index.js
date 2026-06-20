import express from "express";
import Redis from "ioredis";

const app = express()
app.use(express.json())

const redis = new Redis(process.env.REDIS_URI || 'redis://localhost:6379');

app.post('/post/:id/view', async (req, res) => {
    await redis.incr(`post:${req.params.id}:views`);
    res.json({ message: `view count for post ${req.params.id} incremented` });
});

app.post('/leaderboard', async (req, res) => {
    const { userid, score } = req.body;
    await redis.zincrby('leaderboard', score, userid);
    res.json({ message: `score for user ${userid} updated` });
});

app.get('/leaderboard', async (req, res) => {
    const leaderboard = await redis.zrevrange('leaderboard', 0, 10, 'WITHSCORES');

    
    res.json({ leaderboard: leaderboard.reduce((acc, val, idx) => {
        if (idx % 2 === 0) {
            acc.push({ userid: val });
        } else {
            acc[acc.length - 1].score = parseInt(val);
        }
        return acc;
    }, []) });
});

app.get('/leaderboard/:userid/rank', async (req, res) => {
    const rank = await redis.zrevrank('leaderboard', req.params.userid);
    res.json({ userid: req.params.userid, rank: rank !== null ? rank + 1 : null });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
}); 