// Independent expected tax totals from IRS Rev. Proc. 2025-32, tables 1–3.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context = { window: {}, document: { querySelector: () => null } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../paycalc-2026.js'), 'utf8'), context);
const model = context.window.PayCalc2026;
const cases = {
  single: [[12400, 1240], [50400, 5800], [105700, 17966], [201775, 41024], [256225, 58448], [640600, 192979.25]],
  married: [[24800, 2480], [100800, 11600], [211400, 35932], [403550, 82048], [512450, 116896], [768700, 206583.50]],
  hoh: [[17700, 1770], [67450, 7740], [105700, 16155], [201750, 39207], [256200, 56631], [640600, 191171]]
};
for (const [status, rows] of Object.entries(cases)) {
  assert.equal(model.incomeTax(0, status), 0);
  for (const [income, expected] of rows) assert(Math.abs(model.incomeTax(income, status) - expected) < .001, `${status}: ${income}`);
  const [topIncome, topTax] = rows.at(-1);
  assert(Math.abs(model.incomeTax(topIncome + 1000, status) - topTax - 370) < .001);
}
assert.equal(model.standard.single, 16100);
assert.equal(model.standard.married, 32200);
assert.equal(model.standard.hoh, 24150);
assert.equal(model.socialSecurityWageBase, 184500);
assert(Number.isNaN(model.incomeTax(-1, 'single')));
assert(Number.isNaN(model.incomeTax(100, 'invalid')));
console.log('30 independent 2026 tax scenarios passed.');
