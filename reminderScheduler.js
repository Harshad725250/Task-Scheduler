const cron = require("node-cron");
const moment = require("moment-timezone");
const Task = require("./models/Task");
const User = require("./models/User");
const sendReminderEmail = require("./utils/sendEmail");

console.log("🔁 Reminder scheduler is running every minute...");

// ⏰ Run every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  console.log("🕐 Scheduler tick at:", now.toLocaleTimeString());

  try {
    const tasks = await Task.find({
      reminder: { $gte: oneMinuteAgo, $lte: now },
      completed: false,
      reminderSent: false,
    });

    console.log(`🔍 Found ${tasks.length} task(s) needing reminders.`);

    if (tasks.length === 0) {
      console.log("📭 No tasks to remind.");
    }

    for (const task of tasks) {
      const user = await User.findById(task.userId);
      if (!user?.email) {
        console.log(`⚠️ Skipping task "${task.title}" - user or email missing.`);
        continue;
      }

      let dueAt = "N/A";
      if (task.dueDate && moment.utc(task.dueDate).isValid()) {
        try {
          dueAt = moment.utc(task.dueDate)
            .tz("Asia/Kolkata")
            .format("DD MMM YYYY, h:mm A"); 
        } catch (err) {
          console.error("Error formatting dueDate:", err.message);
        }
      }

      // Log it for debugging
      console.log("dueDate UTC:", task.dueDate);

      const message = `Hi ${user.username},

Reminder: Your task "${task.title}" is due soon.

Description: ${task.description || "No description provided."}

– Task Manager`;

      try {
        console.log(`Sending reminder for "${task.title}" to ${user.email}`);
        await sendReminderEmail(user.email, "Task Reminder", message);
        console.log(`Reminder sent for "${task.title}"`);

        await Task.findByIdAndUpdate(task._id, { reminderSent: true });
      } catch (emailErr) {
        console.error(`Email failed for ${user.email}:`, emailErr.message);
      }
    }
  } catch (err) {
    console.error("Error in reminder scheduler:", err.message);
  }
});
