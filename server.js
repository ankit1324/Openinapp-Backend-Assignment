const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const subtaskRoutes = require("./routes/subtaskRoutes");
const cron = require("node-cron");
const twilio = require("twilio");

const Task = require("./models/Task");
dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/subtasks", subtaskRoutes);

// Schedule a cron job to update task priorities
// '0 * * * *': Run every hour at the 0th minute.
// '*/5 * * * *': Run every 5 minutes.
// '0 0 * * *': Run daily at midnight.
cron.schedule("* * * * *", async () => {
  try {
    const currentDate = new Date();
    const tasksToUpdate = await Task.find({ due_date: { $lt: currentDate } });

    tasksToUpdate.forEach(async (task) => {
      // Calculating the difference in days between the due date and today
      const dueDate = new Date(task.due_date);
      const timeDifference = dueDate.getTime() - currentDate.getTime();
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

      // Set the priority based on the calculated difference
      if (daysDifference === 0) {
        task.priority = 0; // Due date is today
      } else if (daysDifference <= 2) {
        task.priority = 1; // Due date is between tomorrow and day after tomorrow
      } else if (daysDifference <= 4) {
        task.priority = 2; // Due date is between 3rd and 4th day
      } else {
        task.priority = 3; // Due date is 5+ days away
      }

      // Save the updated task
      await task.save();
    });

    console.log("Task priorities updated successfully");
  } catch (error) {
    console.error("Error updating task priorities:", error);
  }
});

// Schedule a cron job for voice calling using Twilio;
/* The `cron.schedule` function is used to schedule a cron job, which is a time-based job scheduler in
Node.js. In this specific code snippet, the cron job is scheduled to run every day at 12:00 PM. */
cron.schedule("0 12 * * *", async () => {
  try {
    const currentDate = new Date();

    // Find tasks with due dates that have passed
    const overdueTasks = await Task.find({ due_date: { $lt: currentDate } });

    // Sort tasks by priority
    overdueTasks.sort((a, b) => b.priority - a.priority);

    // Iterate over tasks and make voice calls
    for (const task of overdueTasks) {
      const user = await User.findById(task.userId);
      const phoneNumber = user.phone_number;

      // Initialize Twilio client
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
      const client = twilio(accountSid, authToken);

      // Make a Twilio voice call
      await client.calls.create({
        to: phoneNumber,
        from: twilioPhoneNumber,
        url: "https://twilio.com/openinapp_ankit/voice/",
        method: "GET",
      });

      console.log(`Voice call made to ${phoneNumber} for task "${task.title}"`);
    }

    console.log("Voice calls made successfully");
  } catch (error) {
    console.error("Error making voice calls:", error);
  }
});

//listening port:4000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
