import express from "express";
import { emailQueue } from "./queue.js"
import { Backoffs } from "bullmq";
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.post('/welcome-email', async (req, res) => {
    const email = emailQueue.add(
        "send-welcome-email",
        {
            to: req.body.to,
            name: req.body.name,
        },
        {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000
            }
        },
    );
    return res.json({ message: "Welcome email added to the queue", email });
});