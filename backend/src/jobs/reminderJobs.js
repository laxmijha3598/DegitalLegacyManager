const cron = require("node-cron");
const { User } = require("../models/User");
const { Notification } = require("../models/Notification");

function startReminderJobs() {
  // Demo "AI Reminder": every minute, remind users who have 0 assets.
  cron.schedule("* * * * *", async () => {
    try {
      const users = await User.aggregate([
        { $match: { role: "user" } },
        {
          $lookup: {
            from: "assets",
            localField: "_id",
            foreignField: "ownerId",
            as: "assets"
          }
        },
        { $addFields: { assetCount: { $size: "$assets" } } },
        { $match: { assetCount: 0 } },
        { $project: { _id: 1 } }
      ]);

      for (const u of users) {
        await Notification.create({
          userId: u._id,
          type: "reminder",
          title: "Add your first digital asset",
          message:
            "Smart reminder: you haven't added any assets yet. Add documents, credentials, or media so your nominee can access them after verification (simulation)."
        });
      }
    } catch (_err) {
      // swallow errors to avoid crashing job loop in demo
    }
  });
}

module.exports = { startReminderJobs };

