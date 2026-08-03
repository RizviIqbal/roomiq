const cron = require("node-cron");
const Chore = require("../models/Chore");
const Expense = require("../models/Expense");
const House = require("../models/House");

/**
 * Chore Auto-Rotation
 * Runs every day at midnight.
 * Finds chores with isAutoRotate=true and nextRotationDate <= now,
 * then advances assignedTo to the next user in rotationOrder.
 */
const scheduleChoreRotation = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Running chore rotation check...");
    try {
      const now = new Date();
      const choresToRotate = await Chore.find({
        isAutoRotate: true,
        nextRotationDate: { $lte: now }
      });

      for (const chore of choresToRotate) {
        if (!chore.rotationOrder.length) continue;

        const currentIndex = chore.rotationOrder.findIndex(
          uid => uid.toString() === chore.assignedTo.toString()
        );
        const nextIndex = (currentIndex + 1) % chore.rotationOrder.length;
        chore.assignedTo = chore.rotationOrder[nextIndex];
        chore.status = "pending";
        chore.completedAt = null;

        // Set next rotation date based on frequency
        const next = new Date(now);
        if (chore.rotationFrequency === "daily")     next.setDate(next.getDate() + 1);
        if (chore.rotationFrequency === "weekly")    next.setDate(next.getDate() + 7);
        if (chore.rotationFrequency === "biweekly")  next.setDate(next.getDate() + 14);
        if (chore.rotationFrequency === "monthly")   next.setMonth(next.getMonth() + 1);

        chore.nextRotationDate = next;
        chore.dueDate = next;

        await chore.save();
        console.log(`[CRON] Rotated chore: ${chore.title}`);
      }
    } catch (err) {
      console.error("[CRON] Chore rotation error:", err.message);
    }
  });

  console.log("[CRON] Chore rotation scheduler initialized");
};

/**
 * Recurring Expense Generator
 * Runs on the 1st of each month at 00:05.
 * Finds recurring expenses and creates new expense copies for current month.
 */
const scheduleRecurringExpenses = () => {
  cron.schedule("5 0 1 * *", async () => {
    console.log("[CRON] Generating recurring expenses...");
    try {
      const templates = await Expense.find({ isRecurring: true });

      for (const template of templates) {
        const house = await House.findById(template.house);
        if (!house || !house.isActive) continue;

        // Rebuild splits for current members
        const memberIds = house.members.map(m => m.user);
        const splitAmount = parseFloat((template.totalAmount / memberIds.length).toFixed(2));

        const newSplits = memberIds.map(uid => ({
          user:   uid,
          amount: splitAmount,
          isPaid: false
        }));

        await Expense.create({
          house:       template.house,
          title:       template.title,
          totalAmount: template.totalAmount,
          category:    template.category,
          paidBy:      template.paidBy,
          splitType:   "equal",
          splits:      newSplits,
          isRecurring: false,  // copies are not recurring themselves
          note:        `Auto-generated from recurring expense`,
          date:        new Date()
        });

        console.log(`[CRON] Created recurring expense: ${template.title}`);
      }
    } catch (err) {
      console.error("[CRON] Recurring expense error:", err.message);
    }
  });

  console.log("[CRON] Recurring expense scheduler initialized");
};

module.exports = { scheduleChoreRotation, scheduleRecurringExpenses };
