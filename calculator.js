(function (root) {
  'use strict';
  function number(value) {
    const text = String(value ?? '').trim();
    return /^\d+(?:[.,]\d+)?$/.test(text) ? Number(text.replace(',', '.')) : NaN;
  }
  function calculate(cat) {
    const weight = number(cat.weight) / 1000, factor = number(cat.factor), density = number(cat.calories);
    if (!(weight > 0 && weight <= 30)) throw new Error('Ağırlık 0’dan büyük, en fazla 30.000 gram olmalı.');
    if (!(factor > 0 && factor <= 5)) throw new Error('RER katsayısı 0’dan büyük, en fazla 5 olmalı.');
    if (!(density > 0 && density <= 10000)) throw new Error('Mama enerjisi 0’dan büyük, en fazla 10.000 kcal/kg olmalı.');
    const needsIdeal = factor === 0.8 || factor === 1.8;
    const hasIdeal = needsIdeal && String(cat.ideal ?? '').trim() !== '';
    const ideal = hasIdeal ? number(cat.ideal) / 1000 : weight;
    if (!(ideal > 0 && ideal <= 30)) throw new Error('İdeal ağırlık 0’dan büyük, en fazla 30.000 gram olmalı.');
    const rer = 70 * ideal ** 0.75, energy = rer * factor, grams = energy / (density / 1000);
    let portions = null;
    if (cat.automatic) {
      const portion = number(cat.portion);
      if (!(portion > 0 && portion <= 100)) throw new Error('Bir porsiyon 0’dan büyük, en fazla 100 g olmalı.');
      portions = grams / portion;
    }
    return { rer, energy, grams, portions, needsIdeal, hasIdeal, referenceWeight: ideal };
  }
  const api = { number, calculate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MamaCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
