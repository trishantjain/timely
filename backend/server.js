import "dotenv/config"; 
import app from "./src/app.js"
import connectDB from "./src/config/db.js";
import { startReminderScheduler } from "./src/jobs/reminderScheduler.js";

const PORT = process.env.PORT || 5000

// connect to database
connectDB();

// Start the backend-driven pending-task digest schedule (9AM/9PM
// Asia/Kolkata). Runs once per process on the server -- never in the
// browser/React -- so it keeps firing regardless of whether anyone
// has the app open.
startReminderScheduler();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})