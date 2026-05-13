const MODEL = 'meta/llama-4-maverick-17b-128e-instruct';
const INTERVAL_MIN = 3000;
const INTERVAL_MAX = 5000;

const PROXY_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8080/proxy'
  : '/.netlify/functions/proxy';
const CAP_WIDTH  = 320;
const CAP_HEIGHT = 240;

let systemPrompt = '';
let sentenceText = '';

const video     = document.getElementById('webcam');
const canvas    = document.getElementById('analysis-canvas');
const sentenceEl = document.getElementById('sentence');

canvas.width  = CAP_WIDTH;
canvas.height = CAP_HEIGHT;
const ctx = canvas.getContext('2d');

async function loadSystemPrompt() {
  systemPrompt = `You are mid-sentence. You will never end it.

Write one clause. Exactly one. Hard limit: 15 words maximum.

Rules — no exceptions:
- Lowercase first word
- End with the character , (a literal comma — not the word "comma")
- 15 words maximum. Stop earlier if you have said the thing.
- Third person. No "you." No "I."
- Present tense
- One clause only.
- No words like "appears," "seems," "suggests," "looks like," "possibly," "perhaps," "probably" — these are guesses. Do not guess.
- No describing emotions, mental states, or intentions. Only physical facts.
- Do not repeat something already said in the sentence so far. Notice something new.

Example of correct output: his right arm rests along the back of the seat,
Example of incorrect output: he appears to be relaxed, possibly thinking about something comma

You are looking at a live image. Describe one specific physical detail you can directly see — a body position, a piece of clothing, the light, an object, a background detail. One thing. Plainly. Move to a new detail each time.

Output only the clause. No quotes. No explanation.`;
}

function captureFrame() {
  ctx.drawImage(video, 0, 0, CAP_WIDTH, CAP_HEIGHT);
  return canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
}

function buildUserContent(base64Image) {
  const context = sentenceText.length > 0
    ? `The sentence so far ends with: "…${sentenceText.slice(-120)}"\n\nContinue it with one clause based on what you see. Lowercase start. End with a comma.`
    : 'The sentence has not yet begun. Write the opening clause based on what you see. Lowercase start. End with a comma.';

  return [
    { type: 'text', text: context },
    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
  ];
}

async function fetchClause(userContent) {
  const body = JSON.stringify({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userContent  },
    ],
    stream: false,
    temperature: 0.85,
    top_p: 0.9,
    max_tokens: 25,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    signal: controller.signal,
  });
  clearTimeout(timer);

  if (!res.ok) throw new Error(`API error ${res.status}`);

  const data = await res.json();
  const clause = data.choices?.[0]?.message?.content ?? '';
  return sanitizeClause(clause.trim());
}

function sanitizeClause(raw) {
  let text = raw.replace(/^["']/, '').trim();
  text = text.replace(/\s*\bcomma\b\s*$/i, '').trim();
  text = text.replace(/[.?!]+$/, '').trim();
  if (!text.endsWith(',')) text += ',';
  text = text.charAt(0).toLowerCase() + text.slice(1);
  return text;
}

function appendClause(clause) {
  sentenceText += (sentenceText.length === 0 ? '' : ' ') + clause;

  if (sentenceEl.children.length > 0) {
    sentenceEl.appendChild(document.createElement('br'));
  }

  const span = document.createElement('span');
  span.className = 'clause';
  span.textContent = clause;
  sentenceEl.appendChild(span);

  if (sentenceEl.querySelectorAll('.clause').length >= 3) {
    document.getElementById('fade-top').style.opacity = '1';
  }

  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function randomInterval() {
  return INTERVAL_MIN + Math.random() * (INTERVAL_MAX - INTERVAL_MIN);
}

async function tick() {
  const base64Image = captureFrame();
  const userContent = buildUserContent(base64Image);

  try {
    const clause = await fetchClause(userContent);
    if (clause && clause.length > 2) appendClause(clause);
  } catch (err) {
    console.warn('clause fetch failed:', err.message);
  }

  setTimeout(tick, randomInterval());
}

async function start() {
  await loadSystemPrompt();

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: CAP_WIDTH, height: CAP_HEIGHT, facingMode: 'user' },
    audio: false,
  });

  video.srcObject = stream;
  await video.play();

  setTimeout(tick, 1000);
}

start().catch(err => console.error('startup error:', err));
