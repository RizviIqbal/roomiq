const generateInviteCode = require("../utils/generateInviteCode");

describe("generateInviteCode", () => {

  test("generates an 8-character code", () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(8);
  });

  test("generates an uppercase alphanumeric code", () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[A-F0-9]{8}$/); // hex output, uppercased
  });

  test("generates different codes on repeated calls", () => {
    const codes = new Set();
    for (let i = 0; i < 50; i++) {
      codes.add(generateInviteCode());
    }
    // Extremely unlikely to collide 50 times if randomness works
    expect(codes.size).toBeGreaterThan(45);
  });
});
