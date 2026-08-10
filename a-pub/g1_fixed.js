const fs = require('fs');
const data = JSON.parse(fs.readFileSync('g2.json', 'utf8'));

function flatten(lookAndSay) {
  return lookAndSay?.words?.flat() || [];
}

function isOff(lesson) {
  const dec = lesson.activities.decodable;
  if (!dec.active) return false;
  const words = flatten(lesson.activities.lookAndSay);
  const fill = dec.fillBlanks || [];
  if (words.length !== fill.length) return true;
  for (let i = 0; i < words.length; i++) {
    if ((fill[i] || '').replace(/_/g, '').toLowerCase() !== words[i].toLowerCase())
      return true;
  }
  return false;
}

function rebuild(wordList) {
  return wordList.map(word => {
    const len = word.length;
    let replace = len <= 3 ? 1 : len === 4 ? 2 : 3;
    const chars = word.split('');
    const idx = Array.from({ length: len }, (_, i) => i);
    const chosen = [];
    for (let i = 0; i < replace; i++) {
      const r = Math.floor(Math.random() * idx.length);
      chosen.push(idx[r]);
      idx.splice(r, 1);
    }
    chosen.forEach(i => chars[i] = '_');
    return chars.join('');
  });
}

for (const lesson of data.lessons) {
  const dec = lesson.activities.decodable;
  if (isOff(lesson)) {
    dec.sentences = [];
    dec.fillBlanks = rebuild(flatten(lesson.activities.lookAndSay));
  }
}

fs.writeFileSync('g2_fixed.json', JSON.stringify(data, null, 2));
console.log('✅ g2_fixed.json created');