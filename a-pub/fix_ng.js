const fs = require('fs');

const TEMPLATE_FILE = 'de.json';
const SOURCE_FILE = 'g1_fixed.json';
const OUTPUT_FILE = 'converted_lessons_improved.json';

// ===================== PART OF SPEECH LIBRARY =====================

const VERBS = new Set([
  'go','come','see','look','make','run','jump','walk','talk','sing',
  'dance','play','read','write','eat','drink','sleep','wake','open','close',
  'sit','stand','hit','kick','throw','catch','carry','push','pull','turn',
  'break','fix','build','grow','fly','swim','drive','ride','climb','dig',
  'find','hide','keep','let','put','get','set','stop','start','try',
  'use','work','think','know','want','need','like','love','hate','feel',
  'hear','smell','taste','touch','say','tell','ask','answer','call','help',
  'hold','take','give','buy','sell','bring','send','show','learn','teach',
  'change','choose','allow','belong','depend','exist','seem','appear','happen','occur',
  'continue','follow','lead','cover','wash','clean','cook','bake','cut','draw',
  'paint','build','mend','count','save','spend','trade','agree','disagree','explain',
  'understand','remember','forget','believe','hope','wish','wonder','guess','notice','watch',
  'observe','listen','speak','shout','whisper','laugh','smile','cry','sigh','snore',
  'stretch','yawn','wave','clap','knock','tap','scratch','rub','shake','bounce',
  'spin','roll','slide','slip','drop','lift','pump','hop','tramp','romp',
  'champ','stomp','clap','click','cluck','clasp','snap','snip','sneeze','snore',
  'sniff','spin','spill','spark','sprout','scrub','scream','splash','splat','squash',
  'squeeze','squint','squeak','squeal','squawk','whisper','whistle','whine','whack','wrap',
  'wrestle','wring','gnash','gnaw','sign','design','campaign','chase','chop','chill',
  'check','chime','chew','cheer','choose','charge','chant','cheat','treat','meet',
  'beat','bleat','fleet','sweep','sleep','creep','leap','keep','weep','help',
  'gulp','yelp','skelp','melt','felt','bolt','molt','jolt','hold','fold',
  'mold','scold','told','sold','cold','bold','wild','mild','bind','find',
  'kind','mind','grind','wind','blink','sink','drink','think','thank','stink',
  'chunk','plank','bank','pink','link','climb','crawl','creep'
]);

const ADJECTIVES = new Set([
  'big','small','tall','short','long','high','low','deep','wide','thin',
  'thick','fat','old','new','young','fast','slow','hard','soft','rough',
  'smooth','hot','cold','warm','cool','bright','dark','light','heavy','empty',
  'full','open','closed','clean','dirty','clear','cloudy','sunny','rainy','windy',
  'foggy','snowy','wet','dry','loud','quiet','happy','sad','angry','calm',
  'brave','shy','silly','funny','friendly','kind','mean','nice','sweet','sour',
  'bitter','salty','fresh','stale','safe','dangerous','strong','weak','rich','poor',
  'famous','smart','wise','foolish','lazy','busy','tired','hungry','thirsty','beautiful',
  'ugly','handsome','cute','lovely','wonderful','terrible','awesome','excellent','fine','good',
  'great','fair','equal','different','same','huge','tiny','large','massive','minimal',
  'happy','silly','glad','grand','green','blue','red','yellow','pink','white',
  'black','orange','purple','brown','grey'
]);

const PRONOUNS = new Set([
  'i','me','my','mine','you','your','yours','he','him','his',
  'she','her','hers','it','its','we','us','our','ours','they',
  'them','their','theirs','that','those','these','this','myself','yourself','himself',
  'herself','itself','ourselves','yourselves','themselves'
]);

const ADVERBS = new Set([
  'very','quite','really','too','so','just','almost','always','never','sometimes',
  'often','rarely','soon','later','now','then','before','after','here','there',
  'everywhere','away','back','down','up','out','in','on','off','fast',
  'slow','hard','soft','well','badly','clearly','simply','suddenly','quietly','loudly',
  'happily','sadly','quickly','slowly','gently','roughly','nicely','bravely','calmly','wisely'
]);

const PREPOSITIONS = new Set([
  'of','in','to','for','on','with','without','at','by','from',
  'up','down','over','under','through','between','among','behind','in front','next to',
  'near','far','across','along','around','about','after','before','during','except',
  'concerning','regarding','including','against','throughout','despite','inside','outside','above','below',
  'toward','onto','upon','within','without'
]);

function getPartOfSpeech(word) {
  const lower = word.toLowerCase();
  if (VERBS.has(lower)) return 'verb';
  if (ADJECTIVES.has(lower)) return 'adjective';
  if (PRONOUNS.has(lower)) return 'pronoun';
  if (ADVERBS.has(lower)) return 'adverb';
  if (PREPOSITIONS.has(lower)) return 'preposition';
  return 'noun';
}

// ===================== SENTENCE TEMPLATES BY POS =====================

const NOUN_TEMPLATES = [
  "I see a {word}.", "We see a {word}.", "They see a {word}.",
  "I like my {word}.", "The {word} is big.", "The {word} is red.",
  "The {word} is here.", "We have a {word}.", "I have a {word}.",
  "My {word} is nice.", "That {word} is good.", "Look at the {word}.",
  "Put the {word} here.", "Get the {word}.", "Do you see the {word}?",
  "Can you see the {word}?", "Is that a {word}?", "What is the {word}?",
  "Where is the {word}?", "I want the {word}.", "The {word} is fun.",
  "I love the {word}.", "Here is a {word}.", "There is a {word}.",
  "A {word} is on the mat.", "The {word} is on the bed.",
  "I see a {word} on the table.", "Look at my {word}.",
  "What a big {word}!", "What a cute {word}!", "I like that {word}.",
  "That {word} is mine.", "My {word} is small.", "The {word} is yellow.",
  "The {word} is blue.", "The {word} is green.", "I want a {word}.",
  "We want a {word}.", "Can I have a {word}?", "Can we have a {word}?",
  "I got a {word}.", "We got a {word}.", "They got a {word}.",
  "He got a {word}.", "She got a {word}.", "I see a {word} and a {word2}.",
  "The {word} and the {word2} are here."
];

const VERB_TEMPLATES = [
  "I can {word}.", "We can {word}.", "They can {word}.",
  "Let's {word}.", "We will {word}.", "He can {word}.",
  "She can {word}.", "They can {word}.", "I will {word}.",
  "We {word} now.", "They {word} here.", "He {word} fast.",
  "She {word} well.", "I {word} a lot.", "We {word} every day.",
  "Can you {word}?", "Will you {word}?", "I like to {word}.",
  "We love to {word}.", "Do you {word}?", "I {word} with my friends.",
  "We {word} together.", "They {word} in the park."
];

const ADJECTIVE_TEMPLATES = [
  "It is {word}.", "The {word} one.", "I like {word} things.",
  "We see {word} ones.", "It looks {word}.", "The {word} cat.",
  "A {word} dog.", "Look at the {word} one.", "I want the {word} one.",
  "It feels {word}.", "It tastes {word}.", "It sounds {word}."
];

const PRONOUN_TEMPLATES = [
  "I see {word}.", "We see {word}.", "Look at {word}.",
  "I like {word}.", "We like {word}.", "Can you see {word}?",
  "Is that {word}?", "I got {word}.", "We got {word}.",
  "They got {word}.", "Here is {word}.", "There is {word}."
];

// ===================== DECODABLE GENERATOR =====================

function generateDecodableContent(words, lessonInfo, report) {
  const selected = words.slice(0, 5);

  const sentences = selected.map((word, i) => {
    const pos = getPartOfSpeech(word);
    if (pos === 'noun') {
      report.defaultNouns.add(word.toLowerCase());
    }
    let pool;
    switch (pos) {
      case 'verb': pool = VERB_TEMPLATES; break;
      case 'adjective': pool = ADJECTIVE_TEMPLATES; break;
      case 'pronoun': pool = PRONOUN_TEMPLATES; break;
      default: pool = NOUN_TEMPLATES; break;
    }
    let template = pool[Math.floor(Math.random() * pool.length)];
    let sentence = template.replace('{word}', word);
    if (template.includes('{word2}')) {
      const other = words[Math.floor(Math.random() * words.length)];
      sentence = sentence.replace('{word2}', other);
    }
    return sentence;
  });

  // Fill blanks: 0 underscores for 1‑letter, 1 for 2‑3, 2 for 4, 3 for 5+
  const fillBlanks = words.map(word => {
    const len = word.length;
    let count;
    if (len === 1) count = 0;
    else if (len <= 3) count = 1;
    else if (len === 4) count = 2;
    else count = 3;

    if (count === 0) return word;
    if (count >= len) return '_'.repeat(len);

    const positions = [];
    while (positions.length < count) {
      const pos = Math.floor(Math.random() * len);
      if (!positions.includes(pos)) positions.push(pos);
    }
    let result = word.split('');
    positions.forEach(pos => result[pos] = '_');
    return result.join('');
  });

  return { sentences, fillBlanks };
}

// ===================== CONVERSION CORE =====================

function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

function subtitle(title) {
  const m = title.match(/^([^—:,]+)/);
  return m ? m[0].trim() : title.split(' ').slice(0, 2).join(' ');
}

function splitIntro(text) {
  const p = /(.*?)(?:\.\s*)?(Say each picture word out loud and listen for this pattern\.\s*)$/i;
  const m = text.match(p);
  return m ? { intro: m[1].trim(), instruction: m[2].trim() } : { intro: text, instruction: '' };
}

function convertLesson(src, tmpl, report) {
  const out = deepClone(tmpl);
  out.id = src.id;
  out.mainTitle = src.mainTitle;
  out.subtitle = subtitle(src.mainTitle);
  out.lessonNumber = src.lessonNumber;
  out.letterTile = src.letterTile;

  const { intro, instruction } = splitIntro(src.introText);
  out.introText = intro;
  out.instruction = instruction;
  out.showInstruction = instruction.length > 0;

  const words = (src.activities.lookAndSay.words || []).flat();
  out.words = words;
  out.showGrid = src.activities.lookAndSay.active || false;

  const decActive = src.activities.decodable.active || false;
  out.showDecodable = decActive;
  out.showFillBlanks = decActive;

  let decSentences = src.activities.decodable.sentences || [];
  let decFill = src.activities.decodable.fillBlanks || [];

  // FILL ALL EMPTY ARRAYS – regardless of active flag
  if (decSentences.length === 0 || decFill.length === 0) {
    const gen = generateDecodableContent(words, src, report);
    if (decSentences.length === 0) decSentences = gen.sentences;
    if (decFill.length === 0) decFill = gen.fillBlanks;
  }

  out.decodableSentences = decSentences;
  out.fillItems = decFill;

  out.showSentenceWrite = src.activities.sentenceWrite.active || false;
  out.sentenceLines = src.activities.sentenceWrite.lineCount || 4;
  out.imagePath = '';
  return out;
}

// ===================== MAIN =====================

try {
  // Check files
  if (!fs.existsSync(TEMPLATE_FILE)) throw new Error(`File not found: ${TEMPLATE_FILE}`);
  if (!fs.existsSync(SOURCE_FILE)) throw new Error(`File not found: ${SOURCE_FILE}`);

  const tmpl = JSON.parse(fs.readFileSync(TEMPLATE_FILE, 'utf8')).lessons[0];
  const src = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));

  const report = { defaultNouns: new Set() };

  const converted = src.lessons.map(l => convertLesson(l, tmpl, report));

  const output = {
    lessons: converted,
    sightWords: src.sightWords || [],
    coverData: src.coverData || { title: 'Crystal Phonics', subtitle: 'Grade 1' }
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log('✅ Conversion done! Output written to', OUTPUT_FILE);

  // Print report of default nouns
  console.log('\n=== WORDS DEFAULTED TO NOUN (add to VERBS/ADJECTIVES etc. if needed) ===');
  console.log([...report.defaultNouns].sort().join(', '));

} catch (err) {
  console.error('❌ ERROR:', err.message);
  console.error(err.stack);
}