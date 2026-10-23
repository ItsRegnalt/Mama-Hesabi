const assert = require('node:assert/strict');
const { calculate, number } = require('./calculator.js');
const automaticCat = { weight: '8000', factor: '0.8', calories: '3352', automatic: true, portion: '6,2', ideal: '' };
const manualCat = { weight: '3280', factor: '1', calories: '3352', automatic: false };
assert.equal(number('3,28'), 3.28);
assert.ok(Number.isNaN(number('3,2,8')));
assert.ok(Number.isNaN(number('')));
assert.ok(Math.abs(calculate(automaticCat).grams - 79.47) < 0.01);
assert.ok(Math.abs(calculate(automaticCat).portions - 12.82) < 0.01);
assert.ok(Math.abs(calculate(manualCat).rer - 170.61) < 0.01);
assert.equal(calculate(manualCat).portions, null);
assert.equal(calculate({ ...manualCat, calories: '1676' }).grams, calculate(manualCat).grams * 2);
assert.equal(calculate({ ...automaticCat, ideal: '6000' }).rer, 70 * 6 ** 0.75);
assert.equal(calculate({ ...manualCat, ideal: '6000' }).rer, calculate(manualCat).rer);
for (const [key, value] of [['weight', '0'], ['weight', '-2'], ['weight', '30001'], ['calories', ''], ['calories', '0'], ['factor', 'NaN'], ['portion', '0'], ['ideal', 'abc']]) {
  assert.throws(() => calculate({ ...automaticCat, [key]: value }), Error);
}
console.log('Hesap testleri geçti: ayrı mamalar, ideal kilo, virgüllü sayılar ve geçersiz girdiler.');

