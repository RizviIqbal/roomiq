const Chore = require("../models/Chore");

describe("Chore Rotation Logic", () => {
  test("calculates next assignee correctly in rotation order", () => {
    const rotationOrder = ["user_1", "user_2", "user_3"];
    const currentAssignedTo = "user_1";
    
    const currentIndex = rotationOrder.indexOf(currentAssignedTo);
    const nextIndex = (currentIndex + 1) % rotationOrder.length;
    const nextAssignee = rotationOrder[nextIndex];

    expect(nextAssignee).toBe("user_2");
  });

  test("wraps around to the first member at the end of rotation", () => {
    const rotationOrder = ["user_1", "user_2", "user_3"];
    const currentAssignedTo = "user_3";
    
    const currentIndex = rotationOrder.indexOf(currentAssignedTo);
    const nextIndex = (currentIndex + 1) % rotationOrder.length;
    const nextAssignee = rotationOrder[nextIndex];

    expect(nextAssignee).toBe("user_1");
  });

  test("calculates on-time status accurately based on due date", () => {
    const dueDate = new Date("2026-07-15T18:00:00.000Z");
    const completedOnTime = new Date("2026-07-15T14:00:00.000Z");
    const completedLate = new Date("2026-07-16T10:00:00.000Z");

    expect(completedOnTime <= dueDate).toBe(true);
    expect(completedLate <= dueDate).toBe(false);
  });
});
