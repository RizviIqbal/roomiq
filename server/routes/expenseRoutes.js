const express = require("express");
const router  = express.Router();
const { addExpense, getHouseExpenses, submitPayment, approvePayment, requestPayment, getBalances, deleteExpense } = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

router.post("/",                           protect, addExpense);
router.get("/house/:houseId",              protect, getHouseExpenses);
router.get("/house/:houseId/balances",     protect, getBalances);
router.put("/:expenseId/submit-payment",   protect, submitPayment);
router.put("/:expenseId/approve-payment",  protect, approvePayment);
router.post("/:expenseId/request-payment", protect, requestPayment);
router.delete("/:expenseId",              protect, deleteExpense);

module.exports = router;
