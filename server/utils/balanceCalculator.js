/**
 * Calculates net debts between roommates from a list of expenses.
 *
 * Pure function — no DB access, no side effects. Takes plain objects
 * (already populated) and returns a flat list of debts.
 *
 * @param {Array} expenses - array of expense objects, each with:
 *   { paidBy: { _id }, splits: [{ user: { _id }, amount, isPaid }] }
 * @returns {Array} debts - [{ debtor, creditor, amount }]
 *   amount is always > 0, rounded to 2 decimals.
 */
const calculateBalances = (expenses) => {
  const balanceMap = {};

  for (const expense of expenses) {
    const payerId = String(expense.paidBy?._id ?? expense.paidBy);

    for (const split of expense.splits) {
      if (split.isPaid) continue;

      const debtorId = String(split.user?._id ?? split.user);
      if (debtorId === payerId) continue;

      if (!balanceMap[debtorId]) balanceMap[debtorId] = {};
      if (!balanceMap[debtorId][payerId]) balanceMap[debtorId][payerId] = 0;
      balanceMap[debtorId][payerId] += split.amount;
    }
  }

  const debts = [];
  for (const [debtorId, creditors] of Object.entries(balanceMap)) {
    for (const [creditorId, amount] of Object.entries(creditors)) {
      if (amount > 0) {
        debts.push({
          debtor:   debtorId,
          creditor: creditorId,
          amount:   parseFloat(amount.toFixed(2)),
        });
      }
    }
  }

  return debts;
};

/**
 * Simplifies debts using a greedy settlement algorithm.
 * Reduces the total number of transactions needed to settle all debts
 * by netting out circular and offsetting debts.
 *
 * e.g. if A owes B ৳100 and B owes A ৳40, this simplifies to: A owes B ৳60
 *
 * @param {Array} debts - [{ debtor, creditor, amount }]
 * @returns {Array} simplified debts
 */
const simplifyDebts = (debts) => {
  // Step 1: compute net balance per user (positive = is owed, negative = owes)
  const net = {};
  for (const { debtor, creditor, amount } of debts) {
    net[debtor]   = (net[debtor]   || 0) - amount;
    net[creditor] = (net[creditor] || 0) + amount;
  }

  // Step 2: split into creditors (net > 0) and debtors (net < 0)
  const creditors = [];
  const debtors   = [];
  for (const [user, balance] of Object.entries(net)) {
    const rounded = parseFloat(balance.toFixed(2));
    if (rounded > 0)      creditors.push({ user, amount: rounded });
    else if (rounded < 0) debtors.push({ user, amount: -rounded });
  }

  // Step 3: greedily match largest debtor with largest creditor
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const result = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor   = debtors[i];
    const creditor = creditors[j];
    const settled  = Math.min(debtor.amount, creditor.amount);

    if (settled > 0.001) {
      result.push({
        debtor:   debtor.user,
        creditor: creditor.user,
        amount:   parseFloat(settled.toFixed(2)),
      });
    }

    debtor.amount   -= settled;
    creditor.amount -= settled;

    if (debtor.amount   < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return result;
};

module.exports = { calculateBalances, simplifyDebts };
