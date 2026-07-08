const { calculateBalances, simplifyDebts } = require("../utils/balanceCalculator");

// Helper to build a fake expense object shaped like a populated Mongoose doc
const expense = ({ paidBy, splits }) => ({
  paidBy: { _id: paidBy },
  splits: splits.map(s => ({ user: { _id: s.user }, amount: s.amount, isPaid: s.isPaid ?? false })),
});

describe("calculateBalances", () => {

  test("single expense — payer is owed by everyone else", () => {
    const expenses = [
      expense({
        paidBy: "A",
        splits: [
          { user: "A", amount: 100, isPaid: true },
          { user: "B", amount: 100, isPaid: false },
          { user: "C", amount: 100, isPaid: false },
        ],
      }),
    ];

    const debts = calculateBalances(expenses);

    expect(debts).toEqual(
      expect.arrayContaining([
        { debtor: "B", creditor: "A", amount: 100 },
        { debtor: "C", creditor: "A", amount: 100 },
      ])
    );
    expect(debts).toHaveLength(2);
  });

  test("paid splits are excluded from debts", () => {
    const expenses = [
      expense({
        paidBy: "A",
        splits: [
          { user: "A", amount: 100, isPaid: true },
          { user: "B", amount: 100, isPaid: true },  // already settled
          { user: "C", amount: 100, isPaid: false },
        ],
      }),
    ];

    const debts = calculateBalances(expenses);

    expect(debts).toEqual([{ debtor: "C", creditor: "A", amount: 100 }]);
  });

  test("payer's own split never appears as a debt to themselves", () => {
    const expenses = [
      expense({
        paidBy: "A",
        splits: [
          { user: "A", amount: 50, isPaid: false }, // edge case: payer marked unpaid
          { user: "B", amount: 50, isPaid: false },
        ],
      }),
    ];

    const debts = calculateBalances(expenses);

    // A should never owe themselves
    expect(debts.find(d => d.debtor === "A" && d.creditor === "A")).toBeUndefined();
    expect(debts).toEqual([{ debtor: "B", creditor: "A", amount: 50 }]);
  });

  test("multiple expenses with same debtor/creditor pair are summed", () => {
    const expenses = [
      expense({ paidBy: "A", splits: [{ user: "B", amount: 100, isPaid: false }] }),
      expense({ paidBy: "A", splits: [{ user: "B", amount: 50,  isPaid: false }] }),
    ];

    const debts = calculateBalances(expenses);

    expect(debts).toEqual([{ debtor: "B", creditor: "A", amount: 150 }]);
  });

  test("no expenses returns empty array", () => {
    expect(calculateBalances([])).toEqual([]);
  });

  test("rounds amounts to 2 decimals", () => {
    const expenses = [
      // 100 / 3 = 33.333...
      expense({
        paidBy: "A",
        splits: [
          { user: "A", amount: 33.33, isPaid: true },
          { user: "B", amount: 33.33, isPaid: false },
          { user: "C", amount: 33.34, isPaid: false },
        ],
      }),
    ];

    const debts = calculateBalances(expenses);
    debts.forEach(d => {
      expect(d.amount).toBe(parseFloat(d.amount.toFixed(2)));
    });
  });
});

describe("simplifyDebts", () => {

  test("offsetting debts between two people net out", () => {
    const debts = [
      { debtor: "A", creditor: "B", amount: 100 },
      { debtor: "B", creditor: "A", amount: 40 },
    ];

    const simplified = simplifyDebts(debts);

    // Net: A owes B 60
    expect(simplified).toEqual([{ debtor: "A", creditor: "B", amount: 60 }]);
  });

  test("equal offsetting debts cancel out completely", () => {
    const debts = [
      { debtor: "A", creditor: "B", amount: 50 },
      { debtor: "B", creditor: "A", amount: 50 },
    ];

    expect(simplifyDebts(debts)).toEqual([]);
  });

  test("circular debts (A->B->C->A) reduce transaction count", () => {
    const debts = [
      { debtor: "A", creditor: "B", amount: 100 },
      { debtor: "B", creditor: "C", amount: 100 },
      { debtor: "C", creditor: "A", amount: 100 },
    ];

    // All three cancel out — net balance for everyone is 0
    expect(simplifyDebts(debts)).toEqual([]);
  });

  test("reduces a 3-person chain to fewer transactions", () => {
    // A owes B 100, B owes C 100 → simplifies to A owes C 100 (1 transaction instead of 2)
    const debts = [
      { debtor: "A", creditor: "B", amount: 100 },
      { debtor: "B", creditor: "C", amount: 100 },
    ];

    const simplified = simplifyDebts(debts);

    expect(simplified).toHaveLength(1);
    expect(simplified[0]).toEqual({ debtor: "A", creditor: "C", amount: 100 });
  });

  test("total amount owed is conserved after simplification", () => {
    const debts = [
      { debtor: "A", creditor: "B", amount: 120 },
      { debtor: "C", creditor: "B", amount: 80 },
      { debtor: "C", creditor: "D", amount: 30 },
      { debtor: "B", creditor: "D", amount: 50 },
    ];

    const totalBefore = debts.reduce((sum, d) => sum + d.amount, 0);

    const simplified = simplifyDebts(debts);
    // Net total isn't conserved (it can decrease due to netting),
    // but each individual's net position must be conserved.
    const netBefore = {};
    const netAfter  = {};

    debts.forEach(({ debtor, creditor, amount }) => {
      netBefore[debtor]   = (netBefore[debtor]   || 0) - amount;
      netBefore[creditor] = (netBefore[creditor] || 0) + amount;
    });
    simplified.forEach(({ debtor, creditor, amount }) => {
      netAfter[debtor]   = (netAfter[debtor]   || 0) - amount;
      netAfter[creditor] = (netAfter[creditor] || 0) + amount;
    });

    for (const user of new Set([...Object.keys(netBefore), ...Object.keys(netAfter)])) {
      expect(netAfter[user] ?? 0).toBeCloseTo(netBefore[user] ?? 0, 2);
    }

    expect(totalBefore).toBeGreaterThan(0); // sanity check
  });

  test("empty input returns empty output", () => {
    expect(simplifyDebts([])).toEqual([]);
  });
});
