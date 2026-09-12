// Tests for the pure logic behind the Ayurvedic oils Venn figure.
// Run: npm test   (node --test test/)
const test = require('node:test');
const assert = require('node:assert/strict');

const venn = require('../assets/js/oil-venn.js');
const { OILS, DOSHAS, PRACTICES, regionKey, isActive, toggleIn, groupByRegion,
        regionAt, regionSpanAt, layoutOils, estimateLabelWidth } = venn;

const byId = (id) => OILS.find((o) => o.id === id);

test('every oil has a unique id, a name, a use line, known doshas and known practices', () => {
  const ids = new Set();
  for (const oil of OILS) {
    assert.ok(oil.id && !ids.has(oil.id), `duplicate or missing id: ${oil.id}`);
    ids.add(oil.id);
    assert.ok(oil.name.length > 0, `${oil.id} has no name`);
    assert.ok(oil.use.length > 0, `${oil.id} has no use line`);
    assert.ok(oil.doshas.length >= 1, `${oil.id} has no dosha`);
    assert.ok(oil.practices.length >= 1, `${oil.id} has no practice`);
    for (const d of oil.doshas) assert.ok(DOSHAS.some((x) => x.id === d), `${oil.id}: unknown dosha ${d}`);
    for (const p of oil.practices) assert.ok(PRACTICES.some((x) => x.id === p), `${oil.id}: unknown practice ${p}`);
  }
});

test('regionKey orders doshas canonically as vata, pitta, kapha', () => {
  assert.equal(regionKey({ doshas: ['kapha', 'vata'] }), 'vata+kapha');
  assert.equal(regionKey({ doshas: ['kapha', 'pitta', 'vata'] }), 'vata+pitta+kapha');
  assert.equal(regionKey({ doshas: ['pitta'] }), 'pitta');
});

test('isActive: with nothing selected every oil is active', () => {
  for (const oil of OILS) assert.equal(isActive(oil, { doshas: [], practices: [] }), true);
});

test('isActive: a dosha selection keeps oils of that dosha and fades the rest', () => {
  assert.equal(isActive(byId('sesame'), { doshas: ['vata'], practices: [] }), true);
  assert.equal(isActive(byId('mustard'), { doshas: ['vata'], practices: [] }), false);
});

test('isActive: two doshas selected is a union, not an intersection', () => {
  assert.equal(isActive(byId('mustard'), { doshas: ['vata', 'kapha'], practices: [] }), true);
  assert.equal(isActive(byId('coconut'), { doshas: ['vata', 'kapha'], practices: [] }), false);
});

test('isActive: a practice selection keeps oils used for that practice', () => {
  assert.equal(isActive(byId('anu'), { doshas: [], practices: ['nasya'] }), true);
  assert.equal(isActive(byId('mustard'), { doshas: [], practices: ['nasya'] }), false);
});

test('isActive: dosha and practice selections combine with AND', () => {
  assert.equal(isActive(byId('shadbindu'), { doshas: ['kapha'], practices: ['nasya'] }), true);
  assert.equal(isActive(byId('mustard'), { doshas: ['kapha'], practices: ['nasya'] }), false);
  assert.equal(isActive(byId('ghee'), { doshas: ['kapha'], practices: ['nasya'] }), false);
});

test('toggleIn adds an absent item, removes a present one, and never mutates its input', () => {
  const start = ['vata'];
  const added = toggleIn(start, 'kapha');
  assert.deepEqual(added, ['vata', 'kapha']);
  assert.deepEqual(toggleIn(added, 'vata'), ['kapha']);
  assert.deepEqual(start, ['vata']);
});

test('groupByRegion puts sesame in the vata+kapha lens and Anu taila in the centre', () => {
  const groups = groupByRegion(OILS);
  assert.ok(groups['vata+kapha'].some((o) => o.id === 'sesame'));
  assert.ok(groups['vata+pitta+kapha'].some((o) => o.id === 'anu'));
  assert.ok(groups['pitta'].some((o) => o.id === 'coconut'));
});

test('regionAt reports which circles contain a point', () => {
  const { circles } = venn.GEOMETRY;
  const v = circles.vata, k = circles.kapha, p = circles.pitta;
  assert.equal(regionAt(v.cx - v.r * 0.7, v.cy - v.r * 0.3), 'vata');
  assert.equal(regionAt(k.cx + k.r * 0.7, k.cy - k.r * 0.3), 'kapha');
  assert.equal(regionAt(p.cx, p.cy + p.r * 0.7), 'pitta');
  const mx = (v.cx + k.cx + p.cx) / 3, my = (v.cy + k.cy + p.cy) / 3;
  assert.equal(regionAt(mx, my), 'vata+pitta+kapha');
  assert.equal(regionAt(2, 2), null);
});

test('every laid-out label sits inside its own region and fits within the region span at that height', () => {
  const placed = layoutOils(OILS);
  assert.equal(placed.length, OILS.length);
  for (const item of placed) {
    const key = regionKey(item.oil);
    assert.equal(regionAt(item.x, item.y), key, `${item.oil.id} anchor point is outside ${key}`);
    const span = regionSpanAt(key, item.y);
    assert.ok(span, `${item.oil.id}: no span for ${key} at y=${item.y}`);
    const width = estimateLabelWidth(item.oil);
    const left = item.anchor === 'middle' ? item.x - width / 2 : item.anchor === 'end' ? item.x - width : item.x;
    const right = left + width;
    assert.ok(left >= span[0] && right <= span[1],
      `${item.oil.id} label [${left.toFixed(0)}, ${right.toFixed(0)}] overflows ${key} span [${span[0]}, ${span[1]}] at y=${item.y}`);
  }
});

test('laid-out labels in the same region do not overlap vertically', () => {
  const placed = layoutOils(OILS);
  const groups = {};
  for (const it of placed) (groups[regionKey(it.oil)] ||= []).push(it);
  for (const [key, items] of Object.entries(groups)) {
    const ys = items.map((i) => i.y).sort((a, b) => a - b);
    for (let i = 1; i < ys.length; i++) {
      assert.ok(ys[i] - ys[i - 1] >= venn.GEOMETRY.rowHeight, `${key}: rows ${ys[i - 1]} and ${ys[i]} too close`);
    }
  }
});
