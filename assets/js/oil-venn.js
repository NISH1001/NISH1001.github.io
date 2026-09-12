/* Ayurvedic oils: which oil, for which prakriti, for which use.
   Three-circle diagram (vata, pitta, kapha) with toggles for prakriti and use.
   The pure logic is exported for tests (node); the DOM part only runs in a browser. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.OilVenn = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', api.mountAll);
    else api.mountAll();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['vata', 'pitta', 'kapha'];

  var DOSHAS = [
    { id: 'vata', name: 'Vata', traits: 'dry, light, cold, mobile', wants: 'Heavy, warm, generous oil. The oil is the medicine.' },
    { id: 'pitta', name: 'Pitta', traits: 'hot, sharp, a little oily', wants: 'Cooling oils, moderate amounts, lukewarm.' },
    { id: 'kapha', name: 'Kapha', traits: 'heavy, slow, cold, dense', wants: 'The least oil that works: light, hot, brisk.' }
  ];

  var PRACTICES = [
    { id: 'abhyanga', name: 'Abhyanga', glyph: 'circle', hint: 'body massage' },
    { id: 'hair', name: 'Hair and scalp', glyph: 'square', hint: 'head oil' },
    { id: 'nasya', name: 'Nasya', glyph: 'triangle', hint: 'nose drops' }
  ];

  // weight: 1 light, 2 medium, 3 heavy. temp: cold | cooling | mild | warm | hot.
  var OILS = [
    // vata only
    { id: 'mahanarayana', name: 'Mahanarayana taila', doshas: ['vata'], practices: ['abhyanga'], base: 'sesame', weight: 3, temp: 'warm',
      use: 'Everyday body oil for vata. Joints, stiffness, fatigue.', notes: { vata: 'Mix it into warm sesame for everyday abhyanga.' } },
    { id: 'dhanwantharam', name: 'Dhanwantharam taila', doshas: ['vata'], practices: ['abhyanga'], base: 'sesame', weight: 3, temp: 'warm',
      use: 'Rejuvenating. Supports the nervous system, relieves fatigue. The postpartum classic.',
      notes: { vata: 'Everyday alternative to Mahanarayana.', pitta: 'Tolerated. Gentler than Mahanarayana.' } },
    { id: 'bala', name: 'Bala Ashwagandhadi taila', short: 'Bala Ashwagandhadi', doshas: ['vata'], practices: ['abhyanga', 'hair'], base: 'sesame', weight: 3, temp: 'warm',
      use: 'Thinness, depletion, weak hair roots, mental stress. Plain Bala taila is the simpler version.' },
    { id: 'sahacharadi', name: 'Sahacharadi taila', doshas: ['vata'], practices: ['abhyanga'], base: 'sesame', weight: 3, temp: 'warm',
      use: 'Legs, sciatica, low back.' },
    { id: 'almond', name: 'Almond oil', doshas: ['vata'], practices: ['abhyanga', 'hair', 'nasya'], base: null, weight: 2, temp: 'warm',
      use: 'Face and head when sesame feels too heavy. Helps the sinus.', notes: { vata: 'Face and head massage. Nasya when Anu taila is not at hand.' } },
    { id: 'castor', name: 'Castor oil', doshas: ['vata'], practices: ['abhyanga', 'hair'], base: null, weight: 3, temp: 'warm',
      use: 'Very heavy. One part in four of sesame.', notes: { vata: 'Never on its own.' } },
    { id: 'bhringaraj', name: 'Bhringraj taila', doshas: ['vata'], practices: ['hair'], base: 'sesame', weight: 3, temp: 'mild',
      use: 'Roots the hair, prevents premature hair fall, calms vata-type sleep trouble.' },

    // vata and kapha
    { id: 'sesame', name: 'Sesame oil', doshas: ['vata', 'kapha'], practices: ['abhyanga', 'hair', 'nasya'], base: null, weight: 3, temp: 'warm',
      use: 'The base. Most of the medicated oils here are cooked in it. Also weekly ear oiling for vata.',
      notes: { vata: 'The default. Generous and warm.', kapha: 'Sparingly, hot, brisk strokes.', pitta: 'Heating. Coconut or a ghee base instead.' } },
    { id: 'shadbindu', name: 'Shadbindu taila', doshas: ['vata', 'kapha'], practices: ['nasya'], base: 'sesame', weight: 3, temp: 'hot',
      use: 'Headaches, heavy head, sinus.' },
    { id: 'karpasasthyadi', name: 'Karpasasthyadi taila', short: 'Karpasasthyadi', doshas: ['vata', 'kapha'], practices: ['abhyanga'], base: 'sesame', weight: 3, temp: 'hot',
      use: 'Neck and shoulders. Its heat suits kapha too.' },
    { id: 'kottamchukkadi', name: 'Kottamchukkadi taila', short: 'Kottamchukkadi', doshas: ['vata', 'kapha'], practices: ['abhyanga'], base: 'sesame', weight: 3, temp: 'hot',
      use: 'Swelling, stiff joints. Kapha everyday oil.' },
    { id: 'nirgundi', name: 'Nirgundi taila', doshas: ['vata', 'kapha'], practices: ['abhyanga'], base: 'sesame', weight: 3, temp: 'warm',
      use: 'Stiffness, joint pain.' },
    { id: 'prasarini', name: 'Prasarini taila', doshas: ['vata', 'kapha'], practices: ['abhyanga'], base: 'sesame', weight: 3, temp: 'warm',
      use: 'Cold joints, legs.' },

    // all three
    { id: 'anu', name: 'Anu taila', doshas: ['vata', 'pitta', 'kapha'], practices: ['nasya'], base: 'sesame', weight: 3, temp: 'warm',
      use: 'The daily nasya oil. Clears the senses, grounds the nervous system. Two drops per nostril, sniffed gently.',
      notes: { vata: 'Daily, warmed.', kapha: 'Fine daily. Shadbindu or Vacha when congestion is heavy.', pitta: 'Fine at the two-drop dose. Skip during heat or inflammation.' } },

    // vata and pitta
    { id: 'ghee', name: 'Ghee', doshas: ['vata', 'pitta'], practices: ['abhyanga', 'nasya'], base: null, weight: 3, temp: 'cooling',
      use: 'Dryness that comes with heat or irritation.',
      notes: { vata: 'When the dryness comes with heat.', pitta: 'The cooling choice. Also as nasya for pitta-type headaches.', kapha: 'Avoid.' } },
    { id: 'ksheerabala', name: 'Ksheerabala taila', doshas: ['vata', 'pitta'], practices: ['abhyanga', 'nasya'], base: 'sesame', weight: 3, temp: 'cooling',
      use: 'Anxiety, insomnia, nerve pain. Ksheerabala 101 as nasya. Weekly in the ears.',
      notes: { vata: 'Nerves and sleep.', pitta: 'Tolerated. Cooked in milk, so it cools.' } },
    { id: 'brahmi', name: 'Brahmi taila', doshas: ['vata', 'pitta'], practices: ['hair'], base: 'sesame', weight: 3, temp: 'cooling',
      use: 'Head oil for sleep and stress.', added: true },
    { id: 'neelibhringadi', name: 'Neelibhringadi taila', short: 'Neelibhringadi', doshas: ['vata', 'pitta'], practices: ['hair'], base: 'coconut', weight: 3, temp: 'cooling',
      use: 'Hair fall, early greying. Coconut based in the Kerala versions.' },

    // pitta and kapha
    { id: 'neem', name: 'Neem oil', doshas: ['pitta', 'kapha'], practices: ['hair', 'abhyanga'], base: null, weight: 1, temp: 'cooling',
      use: 'Damp scalp, skin issues. Drying.', notes: { vata: 'Drying. Avoid.', kapha: 'Damp scalp.', pitta: 'Cooling. Skin.' } },

    // pitta only
    { id: 'coconut', name: 'Coconut oil', doshas: ['pitta'], practices: ['abhyanga', 'hair'], base: null, weight: 3, temp: 'cold',
      use: 'The pitta base. For anyone in real summer heat.',
      notes: { pitta: 'The base.', vata: 'Too cold, except in real summer heat.', kapha: 'Worst fit.' } },
    { id: 'sunflower', name: 'Sunflower oil', doshas: ['pitta'], practices: ['abhyanga'], base: null, weight: 1, temp: 'cooling',
      use: 'Light cooling base.', added: true },
    { id: 'chandanadi', name: 'Chandanadi taila', doshas: ['pitta'], practices: ['abhyanga'], base: 'sesame', weight: 3, temp: 'cooling',
      use: 'Burning, heat in the body, restless sleep.', added: true },

    // kapha only
    { id: 'mustard', name: 'Mustard oil', doshas: ['kapha'], practices: ['abhyanga', 'hair'], base: null, weight: 1, temp: 'hot',
      use: 'Cuts congestion and sluggishness. Hair and scalp for kapha.',
      notes: { kapha: 'Hot and light. Hair, scalp, everyday body.', vata: 'Too drying and hot on its own.', pitta: 'Avoid.' } },
    { id: 'safflower', name: 'Safflower oil', doshas: ['kapha'], practices: ['abhyanga'], base: null, weight: 1, temp: 'warm',
      use: 'Light everyday base.' },
    { id: 'vacha', name: 'Vacha taila', doshas: ['kapha'], practices: ['nasya'], base: 'sesame', weight: 2, temp: 'hot',
      use: 'Congestion, dull head.' },
    { id: 'herbs', name: 'Neem, rosemary or tulsi in a light base', short: 'Rosemary, tulsi', doshas: ['kapha'], practices: ['hair'], base: null, weight: 1, temp: 'warm',
      use: 'Scalp only.' },
    { id: 'kolakulathadi', name: 'Kolakulathadi (dry powder)', short: 'Kolakulathadi', doshas: ['kapha'], practices: ['abhyanga'], base: 'powder', weight: 1, temp: 'hot',
      use: 'Udvartana, a dry powder massage instead of oil, when heaviness is the issue.' }
  ];

  // Geometry of the diagram, in SVG user units.
  var GEOMETRY = {
    width: 860, height: 780, rowHeight: 24, fontSize: 14.5, charWidth: 7.3, glyphSize: 12, glyphGap: 3, glyphPad: 7,
    circles: {
      vata: { cx: 320, cy: 300, r: 260 },
      kapha: { cx: 540, cy: 300, r: 260 },
      pitta: { cx: 430, cy: 490, r: 260 }
    },
    // Baseline y of each label row a region can hold. Labels are assigned widest-to-widest.
    slots: {
      'vata': [160, 184, 208, 232, 256, 280, 304],
      'kapha': [184, 208, 232, 256, 280],
      'pitta': [590, 614, 638],
      'vata+kapha': [106, 130, 154, 178, 202, 226],
      'vata+pitta': [454, 478, 502, 526],
      'pitta+kapha': [478, 502],
      'vata+pitta+kapha': [378, 402]
    },
    titles: {
      vata: { x: 243, y: 118 }, kapha: { x: 617, y: 118 }, pitta: { x: 430, y: 700 }
    }
  };

  function regionKey(oil) {
    return ORDER.filter(function (d) { return oil.doshas.indexOf(d) !== -1; }).join('+');
  }

  function isActive(oil, sel) {
    var doshaOk = !sel.doshas.length || oil.doshas.some(function (d) { return sel.doshas.indexOf(d) !== -1; });
    var practiceOk = !sel.practices.length || oil.practices.some(function (p) { return sel.practices.indexOf(p) !== -1; });
    return doshaOk && practiceOk;
  }

  function toggleIn(list, item) {
    return list.indexOf(item) === -1 ? list.concat([item]) : list.filter(function (x) { return x !== item; });
  }

  function groupByRegion(oils) {
    var groups = {};
    oils.forEach(function (o) { var k = regionKey(o); (groups[k] = groups[k] || []).push(o); });
    return groups;
  }

  function regionAt(x, y) {
    var inside = ORDER.filter(function (d) {
      var c = GEOMETRY.circles[d];
      return (x - c.cx) * (x - c.cx) + (y - c.cy) * (y - c.cy) <= c.r * c.r;
    });
    return inside.length ? inside.join('+') : null;
  }

  // Longest horizontal run of the region at height y: [xmin, xmax], or null.
  function regionSpanAt(key, y) {
    var best = null, start = null;
    for (var x = 0; x <= GEOMETRY.width; x++) {
      var hit = regionAt(x, y) === key;
      if (hit && start === null) start = x;
      if ((!hit || x === GEOMETRY.width) && start !== null) {
        var end = hit ? x : x - 1;
        if (!best || end - start > best[1] - best[0]) best = [start, end];
        start = null;
      }
    }
    return best;
  }

  function labelText(oil) { return oil.short || oil.name; }

  function glyphsWidth(oil) {
    var n = oil.practices.length;
    return n * GEOMETRY.glyphSize + (n - 1) * GEOMETRY.glyphGap + GEOMETRY.glyphPad;
  }

  function estimateLabelWidth(oil) {
    return glyphsWidth(oil) + labelText(oil).length * GEOMETRY.charWidth;
  }

  // Place every oil: within a region, the widest label takes the widest row.
  function layoutOils(oils) {
    var placed = [];
    var groups = groupByRegion(oils);
    Object.keys(groups).forEach(function (key) {
      var rows = GEOMETRY.slots[key];
      if (!rows) throw new Error('no slots defined for region ' + key);
      var items = groups[key];
      if (items.length > rows.length) throw new Error('region ' + key + ' holds ' + rows.length + ' rows but has ' + items.length + ' oils');
      var spans = rows.map(function (y) { var s = regionSpanAt(key, y); return { y: y, span: s, width: s ? s[1] - s[0] : 0 }; });
      var byWidth = spans.slice().sort(function (a, b) { return b.width - a.width; });
      var sorted = items.slice().sort(function (a, b) { return estimateLabelWidth(b) - estimateLabelWidth(a); });
      sorted.forEach(function (oil, i) {
        var slot = byWidth[i];
        placed.push({ oil: oil, x: (slot.span[0] + slot.span[1]) / 2, y: slot.y, anchor: 'middle', width: estimateLabelWidth(oil) });
      });
    });
    return placed;
  }

  // ---------------------------------------------------------------- DOM part

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    setAttrs(node, attrs);
    appendAll(node, children);
    return node;
  }
  function s(tag, attrs, children) {
    var node = document.createElementNS(SVG_NS, tag);
    setAttrs(node, attrs);
    appendAll(node, children);
    return node;
  }
  function setAttrs(node, attrs) {
    if (!attrs) return;
    Object.keys(attrs).forEach(function (k) {
      if (attrs[k] === null || attrs[k] === undefined) return;
      if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
  }
  function appendAll(node, children) {
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
  }

  function glyphShape(kind, left, baseline, size) {
    var cy = baseline - size / 2 + 1;
    if (kind === 'circle') return s('circle', { 'class': 'glyph', cx: left + size / 2, cy: cy, r: size / 2 - 1.5 });
    if (kind === 'square') return s('rect', { 'class': 'glyph', x: left + 1.5, y: cy - size / 2 + 1.5, width: size - 3, height: size - 3 });
    var top = cy - size / 2 + 1, bottom = cy + size / 2 - 1;
    return s('polygon', { 'class': 'glyph', points: [left + 1, top, left + size - 1, top, left + size / 2, bottom].join(' ') });
  }

  function glyphHTML(kind) {
    var size = 10;
    var svg = s('svg', { 'class': 'oilv-glyph', viewBox: '0 0 ' + size + ' ' + size, width: size, height: size, 'aria-hidden': 'true' },
      [glyphShape(kind, 0, size - 1, size)]);
    return svg;
  }

  function practiceOf(id) { return PRACTICES.filter(function (p) { return p.id === id; })[0]; }
  function doshaOf(id) { return DOSHAS.filter(function (d) { return d.id === id; })[0]; }

  var TEMP_WORD = { cold: 'cold', cooling: 'cooling', mild: 'mild', warm: 'warming', hot: 'heating' };
  var WEIGHT_WORD = { 1: 'light', 2: 'medium weight', 3: 'heavy' };

  function factsLine(oil) {
    var parts = [];
    if (oil.base === 'powder') parts.push('a dry powder');
    else if (oil.base) parts.push(oil.base + ' base');
    else parts.push('a base oil');
    parts.push(WEIGHT_WORD[oil.weight]);
    parts.push(TEMP_WORD[oil.temp]);
    var line = parts.join(', ');
    return line.charAt(0).toUpperCase() + line.slice(1) + '.';
  }

  function mount(container) {
    var state = { doshas: [], practices: [], oil: null };
    var G = GEOMETRY;

    // Controls
    var doshaButtons = DOSHAS.map(function (d) {
      return h('button', { type: 'button', 'class': 'oilv-toggle', 'data-dosha': d.id, 'aria-pressed': 'false', text: d.name });
    });
    var practiceButtons = PRACTICES.map(function (p) {
      return h('button', { type: 'button', 'class': 'oilv-toggle', 'data-practice': p.id, 'aria-pressed': 'false' }, [glyphHTML(p.glyph), p.name]);
    });
    var clearButton = h('button', { type: 'button', 'class': 'oilv-clear', text: 'Clear', hidden: '' });
    var controls = h('div', { 'class': 'oilv-controls' }, [
      h('div', { 'class': 'oilv-row' }, [h('span', { 'class': 'oilv-rowlabel', text: 'Prakriti' })].concat(doshaButtons)),
      h('div', { 'class': 'oilv-row' }, [h('span', { 'class': 'oilv-rowlabel', text: 'Use' })].concat(practiceButtons, [clearButton]))
    ]);

    // Diagram
    var svg = s('svg', { 'class': 'oilv-venn', viewBox: '0 0 ' + G.width + ' ' + G.height, role: 'img',
      'aria-label': 'Three overlapping circles for vata, pitta and kapha, with oils placed where they fit.' });
    var circleEls = {};
    ORDER.forEach(function (d) {
      var c = G.circles[d];
      circleEls[d] = s('circle', { 'class': 'oilv-circle c-' + d, cx: c.cx, cy: c.cy, r: c.r });
      svg.appendChild(circleEls[d]);
    });
    ORDER.forEach(function (d) {
      var t = G.titles[d], info = doshaOf(d);
      svg.appendChild(s('text', { 'class': 'oilv-title t-' + d, x: t.x, y: t.y, 'text-anchor': 'middle', text: info.name }));
      svg.appendChild(s('text', { 'class': 'oilv-sub', x: t.x, y: t.y + 18, 'text-anchor': 'middle', text: info.traits }));
    });

    var oilEls = {};
    layoutOils(OILS).forEach(function (item) {
      var oil = item.oil, left = item.x - item.width / 2;
      var g = s('g', { 'class': 'oilv-oil', tabindex: '0', role: 'button', 'aria-pressed': 'false', 'data-oil': oil.id });
      g.appendChild(s('title', { text: oil.name + ': ' + oil.use }));
      g.appendChild(s('rect', { 'class': 'hit', x: left - 6, y: item.y - 17, width: item.width + 12, height: G.rowHeight, rx: 6 }));
      var gx = left;
      oil.practices.forEach(function (p) {
        g.appendChild(glyphShape(practiceOf(p).glyph, gx, item.y, G.glyphSize));
        gx += G.glyphSize + G.glyphGap;
      });
      g.appendChild(s('text', { x: left + glyphsWidth(oil), y: item.y, text: labelText(oil) }));
      g.appendChild(s('circle', { 'class': 'dot', cx: item.x, cy: item.y - 5, r: 5 }));
      g.addEventListener('click', function () { selectOil(oil.id); });
      g.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); selectOil(oil.id); }
      });
      oilEls[oil.id] = g;
      svg.appendChild(g);
    });

    // Compact list, for narrow screens
    var REGION_NAMES = {
      'vata': 'Vata only', 'pitta': 'Pitta only', 'kapha': 'Kapha only',
      'vata+kapha': 'Vata and kapha', 'vata+pitta': 'Vata and pitta', 'pitta+kapha': 'Pitta and kapha', 'vata+pitta+kapha': 'All three'
    };
    var listButtons = {};
    var groups = groupByRegion(OILS);
    var list = h('div', { 'class': 'oilv-list' }, Object.keys(REGION_NAMES).filter(function (k) { return groups[k]; }).map(function (k) {
      return h('div', { 'class': 'oilv-group' }, [
        h('div', { 'class': 'oilv-groupname', text: REGION_NAMES[k] }),
        h('div', { 'class': 'oilv-groupitems' }, groups[k].map(function (oil) {
          var b = h('button', { type: 'button', 'class': 'oilv-item', 'data-oil': oil.id, 'aria-pressed': 'false' },
            oil.practices.map(function (p) { return glyphHTML(practiceOf(p).glyph); }).concat([labelText(oil)]));
          b.addEventListener('click', function () { selectOil(oil.id); });
          listButtons[oil.id] = b;
          return b;
        }))
      ]);
    }));

    var panel = h('div', { 'class': 'oilv-panel', 'aria-live': 'polite' });

    container.appendChild(controls);
    container.appendChild(svg);
    container.appendChild(list);
    container.appendChild(panel);

    doshaButtons.forEach(function (b) {
      b.addEventListener('click', function () { state.doshas = toggleIn(state.doshas, b.getAttribute('data-dosha')); state.oil = null; update(); });
    });
    practiceButtons.forEach(function (b) {
      b.addEventListener('click', function () { state.practices = toggleIn(state.practices, b.getAttribute('data-practice')); state.oil = null; update(); });
    });
    clearButton.addEventListener('click', function () { state = { doshas: [], practices: [], oil: null }; update(); });
    container.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && state.oil) { state.oil = null; update(); } });

    function selectOil(id) { state.oil = state.oil === id ? null : id; update(); }

    function renderPanel() {
      panel.textContent = '';
      var active = OILS.filter(function (o) { return isActive(o, state); });
      if (state.oil) {
        var oil = OILS.filter(function (o) { return o.id === state.oil; })[0];
        panel.appendChild(h('h4', { text: oil.name }));
        panel.appendChild(h('p', { 'class': 'oilv-use', text: oil.use }));
        panel.appendChild(h('p', { 'class': 'oilv-facts', text: factsLine(oil) }));
        var tags = h('p', { 'class': 'oilv-tags' });
        oil.doshas.forEach(function (d) { tags.appendChild(h('span', { 'class': 'oilv-chip d-' + d, text: doshaOf(d).name })); });
        oil.practices.forEach(function (p) { tags.appendChild(h('span', { 'class': 'oilv-chip' }, [glyphHTML(practiceOf(p).glyph), practiceOf(p).name])); });
        panel.appendChild(tags);
        if (oil.notes) {
          var notes = h('ul', { 'class': 'oilv-notes' });
          ORDER.forEach(function (d) {
            if (oil.notes[d]) notes.appendChild(h('li', {}, [h('b', { text: doshaOf(d).name }), ' ' + oil.notes[d]]));
          });
          panel.appendChild(notes);
        }
        if (oil.added) panel.appendChild(h('p', { 'class': 'oilv-added', text: 'Added from references, not from the notes above.' }));
        return;
      }
      if (state.doshas.length || state.practices.length) {
        ORDER.filter(function (d) { return state.doshas.indexOf(d) !== -1; }).forEach(function (d) {
          var info = doshaOf(d);
          panel.appendChild(h('p', { 'class': 'oilv-dosha' }, [h('b', { 'class': 'd-' + d, text: info.name }), ' is ' + info.traits + '. ' + info.wants]));
        });
        var uses = state.practices.map(function (p) { return practiceOf(p).name.toLowerCase(); }).join(' or ');
        var summary = active.length + ' of ' + OILS.length + ' oils fit' + (uses ? ' for ' + uses : '') + '. Click one for what it is for.';
        panel.appendChild(h('p', { 'class': 'oilv-summary', text: summary }));
        return;
      }
      panel.appendChild(h('p', { 'class': 'oilv-hint', text: 'Pick a prakriti or a use to narrow the oils down. Click an oil for what it is for.' }));
    }

    function update() {
      doshaButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(state.doshas.indexOf(b.getAttribute('data-dosha')) !== -1)); });
      practiceButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(state.practices.indexOf(b.getAttribute('data-practice')) !== -1)); });
      var any = state.doshas.length || state.practices.length || state.oil;
      if (any) clearButton.removeAttribute('hidden'); else clearButton.setAttribute('hidden', '');
      ORDER.forEach(function (d) {
        var el = circleEls[d];
        el.classList.toggle('is-lit', state.doshas.indexOf(d) !== -1);
        el.classList.toggle('is-off', state.doshas.length > 0 && state.doshas.indexOf(d) === -1);
      });
      OILS.forEach(function (oil) {
        var on = isActive(oil, state), sel = state.oil === oil.id;
        [oilEls[oil.id], listButtons[oil.id]].forEach(function (el) {
          el.classList.toggle('is-dim', !on);
          el.classList.toggle('is-selected', sel);
          el.setAttribute('aria-pressed', String(sel));
        });
      });
      renderPanel();
    }

    update();
  }

  function mountAll() {
    var nodes = document.querySelectorAll('[data-oil-venn]');
    for (var i = 0; i < nodes.length; i++) {
      if (!nodes[i].getAttribute('data-mounted')) { nodes[i].setAttribute('data-mounted', '1'); mount(nodes[i]); }
    }
  }

  return {
    ORDER: ORDER, DOSHAS: DOSHAS, PRACTICES: PRACTICES, OILS: OILS, GEOMETRY: GEOMETRY,
    regionKey: regionKey, isActive: isActive, toggleIn: toggleIn, groupByRegion: groupByRegion,
    regionAt: regionAt, regionSpanAt: regionSpanAt, layoutOils: layoutOils, estimateLabelWidth: estimateLabelWidth,
    mountAll: mountAll
  };
});
