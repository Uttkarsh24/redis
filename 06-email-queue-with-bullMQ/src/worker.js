import { Job, Worker } from "bullmq";
import { connection } from "./queue.js"

const worker = new Worker(
    "emails",
    async (job) => {
        console.log("Processing email job...", job.id, job.name, job.data);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Email job complete", job.id, job.name, job.data);
    },
    {connection}
)

worker.on("completed",(job)=>{
    console.log("Job completed", job.id, job.name, job.data);
})

worker.on("failed",(job)=>{
    console.log("job failed",job.id,job.name,job.data);
})

