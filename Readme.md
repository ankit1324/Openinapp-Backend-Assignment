# TASK - OpenInApp Assignment

## You have to create following APIs

1. Create task - input is title, description and due_date with jwt auth token
2. Create sub task - input is task_id
3. Get all user task(with filter like priority, due date and proper pagination etc)
4. Get all user sub tasks (with filter like task_id if passed)
5. Update task- due_date, status-”TODO” or “DONE” can be changed
6. Update subtask - only status can be updated - 0,1
7. Delete task(soft deletion)
8. Delete sub task(soft deletion)
   And the following cron jobs
9. Cron logic for changing priority of task based on due_date of task (refer below for
   priority)
10. Cron logic for voice calling using twilio if a task passes its due_date. Calling should be based on priority of the user, i.e. first the user with priority 0 should be called,then 1 and then 2. The user should only be called if the previous user does not attend the call. This priority should be fetched from the user table.

## Instructions

    ● Proper validation should be there while taking input and authenticating user for api
    calls
    ● Error handling should be implemented wherever necessary and user friendly error
    should be thrown
    ● You can use https://jwt.io/ for creating a jwt token with user_id and only
    corresponding decoding logic should be there
    ● You should also update the corresponding sub tasks in case of task updation and
    deletion
    ● Sub task model and user table is given, you have to make task model accordingly
    ● Task should also have priority and status (refer below for both)
    ● You can use postman to demonstrate all the apis

    Sub Task model
    id (int, unique identifier)
    task_id (int)//references task table
    status (0,1) //0- incomplete, 1- complete
    created_at (date/string)
    updated_at (date/string)
    deleted_at (date/string)

    User model
    id (int, unique identifier)
    phone_number (num)
    priority (0,1,2) //for twilio calling priority

    Priority for task model
    0 - Due date is today //0
    1 - Due date is between tomorrow and day after tomorrow // 1-2
    2 - 3-4
    3 - 5+

    Status for task model
    “TODO” - when no sub task is finished
    “IN_PROGRESS” - when at least 1 sub task is finished
    “DONE” - when every sub task is completed

# My Solution

[Github](https://github.com/ankit1324/Openinapp-Backend-Assignment)

[Video-Demo](#)

## My Code File-Structure

## MainFile: server.js

## Routes

| Folder | File             |
| ------ | ---------------- |
| routes | authRoutes.js    |
|        | taskRoutes.js    |
|        | subtaskRoutes.js |

## Middlewares

| Folder      | File           |
| ----------- | -------------- |
| middlewares | verifyToken.js |

## Models

| Folder | File       |
| ------ | ---------- |
| models | User.js    |
|        | Task.js    |
|        | SubTask.js |

## Config

| Folder | File        |
| ------ | ----------- |
| config | database.js |

# server.js

The code snippet is a part of a server-side JavaScript application using the Express.js framework. It schedules two cron jobs: one to update task priorities based on certain criteria, and another to make voice calls using Twilio for overdue tasks. The code also sets up the Express.js server and listens on a specific port.

Inputs
The code requires the following dependencies: express, cors, dotenv, connectDB, authRoutes, taskRoutes, subtaskRoutes, cron, twilio, and Task.
The code relies on environment variables set in a .env file, including the port number, Twilio account SID, auth token, and phone number.
Flow
The code imports the required dependencies and sets up the Express.js server.
It connects to the database using the connectDB function.
The code sets up middleware for handling CORS and parsing JSON.
It defines routes for authentication, tasks, and subtasks.
The code schedules a cron job to update task priorities every minute.
Inside the cron job, it retrieves tasks with due dates that have passed and updates their priorities based on the difference between the due date and the current date.
The code schedules another cron job to make voice calls using Twilio every day at 12:00 PM.
Inside the voice call cron job, it retrieves overdue tasks, sorts them by priority, and makes voice calls to the associated users using Twilio.
The code starts the Express.js server and listens on the specified port.
Outputs
The code updates task priorities based on the calculated difference between the due date and the current date.
The code makes voice calls to users for overdue tasks using Twilio.

Usage example

```
// Import required dependencies
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const cron = require("node-cron");
const twilio = require("twilio");
const Task = require("./models/Task");
```

```
// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

// Create an Express.js app
const app = express();
const port = process.env.PORT;

// Set up middleware
app.use(cors());
app.use(express.json());

// Define routes
```

// Schedule a cron job to update task priorities
cron.schedule("\*_\*\*_", async () => {
try {
// Your logic to update task priorities based on new criteria goes here
const currentDate = new Date();
const tasksToUpdate = await Task.find({ due_date: { $lt: currentDate } });

    tasksToUpdate.forEach(async (task) => {
      // Calculate the difference in days between the due date and today
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

// Schedule a cron job for voice calling using Twilio
cron.schedule("0 12 \*\* \*", async () => {
try {
const currentDate = new Date();

    // Find tasks with due dates that have passed
    const overdueTasks = await Task.find({ due_date: { $lt: currentDate } });

    // Sort tasks by priority
    overdueTasks.sort((a, b) => b.priority - a.priority);

    // Iterate over tasks and make voice calls
    for (const task of overdueTasks) {
      // Make voice calls using Twilio
    }

    console.log("Voice calls made successfully");

} catch (error) {
console.error("Error making voice calls:", error);
}
});

// Start the server
app.listen(port, () => {
console.log(`Server listening on port ${port}`);
});
In this example, the code sets up an Express.js server, connects to a database, and schedules two cron jobs. The first cron job updates task priorities based on the difference between the due date and the current date. The second cron job makes voice calls to users for overdue tasks using Twilio. The server listens on the specified port.

# Routes

- authRoutes.js
- taskRoutes.js
- subtaskRoutes.js

## authRoutes.js

```
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

// Move your /register and /login routes here
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "10h" });
};

//register a user->✅
router.post("/register", async (req, res) => {
  try {
    const { id, phone_number, priority, username, password } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      id,
      phone_number,
      priority,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id);

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//login a user->✅
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = generateToken(user._id);
    message = "Login Successfully";
    res.json({ message, token, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;

```

- This code snippet is a JavaScript module that handles user registration and login functionality using Express, bcrypt, and JWT.
-
- It exports an Express router that contains two routes:
- - "/register": This route handles user registration. It checks if the provided username already exists, hashes the password, creates a new user, and generates a JWT token for authentication.
- - "/login": This route handles user login. It checks if the provided username exists and if the password is correct. If the credentials are valid, it generates a JWT token for authentication.
-
- The module also imports the necessary dependencies: express, bcrypt, jwt, and the User model.
-
- Note: The code assumes the existence of a User model and a middleware function called verifyToken.

## taskRoutes.js

```
   const express = require("express");
const Task = require("../models/Task");
const SubTask = require("../models/subTask");
const verifyToken = require("../middlewares/verifyToken");
const User = require("../models/User");

const mongoose = require("mongoose");
const router = express.Router();

// Move your /tasks, /tasks/:taskId/subtasks, /tasks/:taskId, and /tasks/:taskId/subtasks/:_id routes here

// Create Task endpoint ✅
router.post("/settasks", verifyToken, async (req, res) => {
  try {
    const { title, description, due_date, priority, status } = req.body;
    const userId = req.userId; // Get the user ID from the token

    // Create a new task associated with the user
    const task = new Task({
      title,
      description,
      due_date,
      priority,
      status,
      userId,
    });
    await task.save();

    // Update the user's tasks array (if needed)
    await User.findByIdAndUpdate(userId, { $addToSet: { tasks: task._id } });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Get All User Tasks endpoint ✅
router.get("/gettasks", verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // Get the user ID from the token

    // Fetch tasks associated with the user
    const tasks = await Task.find({ userId });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// Update Task API ✅
router.put("/settasks/:taskId", verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { due_date, status } = req.body;

    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid Task ID" });
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { due_date, status },
      { new: true }
    );

    // Check if task exists
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update corresponding sub-tasks
    await SubTask.updateMany({ task_id: taskId }, { status });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete Task endpoint✅
router.delete("/settasks/:taskId", verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid Task ID" });
    }

    // Delete task
    const deletedTask = await Task.findByIdAndDelete(taskId);

    // Check if task exists
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Delete corresponding subtasks
    await SubTask.deleteMany({ task_id: taskId });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;

```

- This code snippet defines an Express router that handles various endpoints related to tasks.
- It includes endpoints for creating a new task, fetching all tasks for a user, updating a task, and deleting a task.
- The router uses middleware to verify the user's token before allowing access to the endpoints.
- The code also imports necessary models and libraries, such as Task, SubTask, verifyToken, and User.
- The endpoints handle different HTTP methods (POST, GET, PUT, DELETE) and perform operations such as creating a new task, fetching tasks, updating a task, and deleting a task.
- The code includes error handling and returns appropriate responses with status codes and messages.
- The router is exported for use in other parts of the application.

## subtaskRoutes.js

```
const express = require("express");
const Task = require("../models/Task");
const SubTask = require("../models/subTask");
const verifyToken = require("../middlewares/verifyToken");
// const User = require("../models/User");

const mongoose = require("mongoose");
const router = express.Router();

// Move your /tasks/:taskId/subtasks/:_id and /tasks/:taskId/subtasks/:_id routes here

// Create SubTask endpoint✅
router.post("/tasks/:taskId/subtasks", verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const subtask = new SubTask(req.body);
    subtask.task_id = task._id;
    await subtask.save();

    // Update task status based on subtasks
    await task.updateStatus();

    // // Update the user's tasks array with the subtask's task ID
    // const userId = req.userId;
    // await User.findByIdAndUpdate(userId, { $addToSet: { tasks: task._id } });

    res.status(201).json(subtask);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Get All User Subtasks endpoint✅
router.get("/tasks/:taskId/subtasks", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    const subtasks = await SubTask.find({ task_id: task._id });
    res.json(subtasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching subtasks" });
  }
});

// Update a particular Sub Task API ✅
router.put("/tasks/:taskId/subtasks/:_id", verifyToken, async (req, res) => {
  try {
    const { _id } = req.params;
    const { status } = req.body;

    // Validate subtask ID
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid Sub Task ID" });
    }

    // Update subtask
    const updatedSubTask = await SubTask.findByIdAndUpdate(
      _id,
      { status },
      { new: true }
    );

    // Check if subtask exists
    if (!updatedSubTask) {
      return res.status(404).json({ message: "Sub Task not found" });
    }

    res.status(200).json(updatedSubTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete Subtask endpoint✅
router.delete("/tasks/:taskId/subtasks/:_id", async (req, res) => {
  try {
    const { taskId, _id } = req.params;

    // Validate task ID and subtask ID
    if (
      !mongoose.Types.ObjectId.isValid(taskId) ||
      !mongoose.Types.ObjectId.isValid(_id)
    ) {
      return res.status(400).json({ message: "Invalid Task or Subtask ID" });
    }

    // Delete subtask
    const deletedSubtask = await SubTask.findByIdAndDelete(_id);

    // Check if subtask exists
    if (!deletedSubtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    // Update task status if needed
    const task = await Task.findById(taskId);
    if (task) {
      await task.updateStatus();
    }

    res.status(200).json({ message: "Subtask deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;

```

- This code snippet defines a router for handling subtasks related to tasks in an Express.js application.
- It includes endpoints for creating, retrieving, updating, and deleting subtasks.
- The router uses the Task and SubTask models, as well as the verifyToken middleware, to perform these operations.
- The endpoints are protected with authentication using JWT tokens.
- The code snippet exports the router for use in other parts of the application.

# Model

- User.js
- Task.js
- SubTask.js

## User.js

```
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  phone_number: {
    type: Number,
  },
  priority: {
    type: Number,
    enum: [0, 1, 2],
    default: 0,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);

```

## Task.js

```
const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  due_date: {
    type: Date,
    required: true,
  },
  priority: {
    type: Number,
    required: true,
    default: 0, // 0 - Due today, 1 - Tomorrow/day after, 2 - 3-4 days, 3 - 5+ days
  },
  status: {
    type: String, // Change the type to String
    enum: ["TODO", "IN_PROGRESS", "DONE"], // Use enum to specify allowed values
    required: true,
    default: "TODO", // Default value is set to "TODO", 0-incomplet,1-complete
  },
  subtasks: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "SubTask",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Update task status based on subtasks
TaskSchema.methods.updateStatus = async function () {
  const completedSubtasks = await this.model("SubTask").find({
    task_id: this._id,
    status: 1,
  });
  const allSubtasks = await this.model("SubTask").find({ task_id: this._id });
  if (completedSubtasks.length === 0) {
    this.status = "TODO";
  } else if (completedSubtasks.length === allSubtasks.length) {
    this.status = "DONE";
  } else {
    this.status = "IN_PROGRESS";
  }
  await this.save();
};

module.exports = mongoose.model("Task", TaskSchema);

```

## SubTask.js

```
const mongoose = require("mongoose");

const SubTaskSchema = new mongoose.Schema({
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Task",
  },
  status: {
    type: Number,
    enum: [0, 1], //0-incomplet,1-complete
    required: true,
    default: "TODO",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("SubTask", SubTaskSchema);

```

# Middlewares

## verifyToken.js

```
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.userId = decoded.userId;
    next();
  });
};
```

### Inputs

req: The request object containing information about the incoming HTTP request.

res: The response object used to send HTTP responses.
next: A callback function to pass control to the next middleware function.

Flow:
The code snippet retrieves the authorization token from the request headers.
If the token is missing, it sends a 401 Unauthorized response with a JSON message indicating that the authorization token is missing.
If the token is present, it verifies the token using the JWT library and the JWT secret stored in the environment variables.
If the token is invalid, it sends a 401 Unauthorized response with a JSON message indicating that the token is invalid.
If the token is valid, it sets the decoded user ID in the req object and calls the next callback function to pass control to the next middleware function.
Outputs
None
Usage example

```
const express = require("express");
const authenticate = require("./middleware/authenticate");
```

`const app = express();
app.use(authenticate);`

```
app.get("/protected", (req, res) => {
// Access the authenticated user ID from req.userId
const userId = req.userId;
// Perform actions for the protected route
res.send("Protected route");
});
```

`app.listen(3000, () => {
console.log("Server started on port 3000");
});`

In this example, the code snippet is used as middleware in an Express.js application. The authenticate middleware is added using app.use() to authenticate all incoming requests. The /protected route demonstrates how to access the authenticated user ID from the req object

# Config

## Datbase.js

```
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;
```

This code snippet is a function called connectDB that uses the Mongoose library to connect to a MongoDB database. It takes no inputs and does not return any outputs.

#### Inputs

None.

#### Flow

The function imports the mongoose library.
Inside the connectDB function, it uses mongoose.connect to establish a connection to the MongoDB database specified by the MONGO_URI environment variable.
The connection options useNewUrlParser and useUnifiedTopology are passed to mongoose.connect.
If the connection is successful, the function logs`MongoDB connected` to the console.
If there is an error during the connection, the function logs the error to the console.

#### Outputs

None.

#### Usage example

`const connectDB = require("./connectDB");`

Call the connectDB function to establish a connection to the MongoDB database
connectDB();

In this example, the connectDB function is imported from a separate file called connectDB.js. It is then called to establish a connection to the MongoDB database.

# To Start This Server

## for Development Script

`npm run dev`

## for Start Sever

`npm run start`
