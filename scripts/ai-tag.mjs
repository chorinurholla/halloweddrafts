#!/usr/bin/env node
// AI tagging for Hallowed Drafts.
//
// Step 1 — tidy: a post uploaded exactly as exported (starting "# Title — Blog Post" and a
//   "Sep 11, 2026 · @Tolu" line, with no frontmatter) gets a proper frontmatter block, a clean
//   file name (what-actually-matters.md), and British spelling outside quoted Scripture.
// Step 2 — tag: posts missing a topic, tags or excerpt are sent to Claude; the answer is
//   validated and written into the frontmatter. Fields you filled in yourself are never changed.
//   The post's wording is never changed by Claude.
//
// Needs ANTHROPIC_API_KEY for step 2. Optional: ANTHROPIC_MODEL.
// Writes .ai-tag-summary.txt (the commit message used by the GitHub Action).
// Exits 1 if any post could not be tagged, so the Action fails and GitHub emails you.
// Untagged posts never break the site: the build skips them until they are tagged.

import { readFileSync, writeFileSync, readdirSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const POSTS_DIR = 'posts';
const TOPICS = ['prayer', 'work', 'inner-life', 'ideas'];
const TAG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const API_KEY = process.env.ANTHROPIC_API_KEY;
const summary = [];
// Surface errors as GitHub annotations (visible on the run page and through the API).
const annotate = (msg) => { if (process.env.GITHUB_ACTIONS) console.log(`::error title=AI tagging::${msg.replace(/\r?\n/g, ' ')}`); };

// ---------- Frontmatter helpers (keep your formatting intact) ----------
function split(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? { fm: m[1], body: m[2] } : null;
}
function field(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  if (!m) return undefined;
  const v = m[1].trim();
  if (!v) return undefined;
  if (v.startsWith('[')) return v.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  return v.replace(/^["']|["']$/g, '');
}
function setField(fm, key, value) {
  const line = `${key}: ${value}`;
  const re = new RegExp(`^${key}:.*$`, 'm');
  return re.test(fm) ? fm.replace(re, line) : `${fm}\n${line}`;
}
const q = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

// ---------- Step 1: tidy raw exports ----------
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

// British spelling for prose. Text inside straight double quotes (quoted Scripture) is left alone.
const KEEP_IZE = /^(size|sizes|sized|prize|prizes|prized|seize|seizes|seized|seizing|capsize|baize|maize)$/i;
const UK = {
  center: 'centre', centers: 'centres', centered: 'centred', honor: 'honour', honors: 'honours', honored: 'honoured',
  honorable: 'honourable', favor: 'favour', favorite: 'favourite', behavior: 'behaviour', behaviors: 'behaviours',
  behavioral: 'behavioural', neighbor: 'neighbour', neighbors: 'neighbours', color: 'colour', colors: 'colours',
  labor: 'labour', armor: 'armour', harbor: 'harbour', gray: 'grey', traveler: 'traveller', travelers: 'travellers',
  traveled: 'travelled', traveling: 'travelling', fueled: 'fuelled', fueling: 'fuelling', skeptic: 'sceptic',
  skeptical: 'sceptical', judgment: 'judgement', catalog: 'catalogue', defense: 'defence', offense: 'offence',
  endeavor: 'endeavour', savior: 'saviour', splendor: 'splendour', rumor: 'rumour', vapor: 'vapour',
};
function britishWord(w) {
  const lower = w.toLowerCase();
  let out = UK[lower];
  if (!out && /iz(e|es|ed|ing|ation|ations|er|ers)$/i.test(w) && !KEEP_IZE.test(w)) out = lower.replace(/iz(?=(e|es|ed|ing|ation|ations|er|ers)$)/, 'is');
  if (!out) out = lower.replace(/yz(e|es|ed|ing)$/, 'ys$1');
  if (out === lower) return w;
  return w[0] === w[0].toUpperCase() ? out[0].toUpperCase() + out.slice(1) : out;
}
function toBritish(text) {
  return text.split('\n').map((line) =>
    line.split(/("[^"]*")/).map((part) =>
      part.startsWith('"') && part.endsWith('"') && part.length > 1 ? part : part.replace(/[A-Za-z]+/g, britishWord),
    ).join(''),
  ).join('\n');
}

function tidyRaw(file, src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const h = lines.findIndex((l) => l.trim());
  const heading = (lines[h] || '').match(/^#\s+(.+?)\s*$/);
  if (!heading) throw new Error('has no frontmatter and does not start with a "# Title" heading');
  const title = heading[1].replace(/\s+[—–-]\s+Blog Post\s*$/i, '').trim();
  let rest = lines.slice(h + 1);
  let date;
  const b = rest.findIndex((l) => l.trim());
  const dm = (rest[b] || '').match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2}),\s*(\d{4})/);
  const mo = dm && MONTHS[dm[1].slice(0, 3).toLowerCase()];
  if (mo) {
    date = `${dm[3]}-${String(mo).padStart(2, '0')}-${dm[2].padStart(2, '0')}`;
    rest = rest.slice(b + 1);
  } else {
    date = new Date().toISOString().slice(0, 10);
  }
  const body = toBritish(rest.join('\n').replace(/^\n+/, ''));
  let slug = slugify(title) || slugify(file.replace(/\.md$/, ''));
  let target = `${slug}.md`;
  for (let n = 2; target !== file && existsSync(join(POSTS_DIR, target)); n++) target = `${slug}-${n}.md`;
  writeFileSync(join(POSTS_DIR, file), `---\ntitle: ${q(title)}\ndate: ${date}\n---\n\n${body.trimEnd()}\n`);
  if (target !== file) renameSync(join(POSTS_DIR, file), join(POSTS_DIR, target));
  summary.push(`${target.replace(/\.md$/, '')}: tidied from "${file}" (title, date ${date}, file name, British spelling)`);
  console.log(`Tidied ${file} -> ${target}`);
  return target;
}

for (const f of readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'))) {
  const src = readFileSync(join(POSTS_DIR, f), 'utf8');
  if (split(src)) {
    // Already has frontmatter; still give it a clean file name if it has spaces or capitals.
    const clean = slugify(f.replace(/\.md$/, '').replace(/\s+[—–-]\s+Blog Post$/i, ''));
    if (clean && `${clean}.md` !== f && !existsSync(join(POSTS_DIR, `${clean}.md`)) && /[^a-z0-9-]/.test(f.replace(/\.md$/, ''))) {
      renameSync(join(POSTS_DIR, f), join(POSTS_DIR, `${clean}.md`));
      summary.push(`${clean}: renamed from "${f}"`);
    }
    continue;
  }
  try {
    tidyRaw(f, src);
  } catch (err) {
    console.error(`Could not tidy ${f}: ${err.message}`);
    annotate(`Could not tidy ${f}: ${err.message}`);
    summary.push(`${f}: could not tidy (${err.message})`);
  }
}

// ---------- Step 2: tag ----------
const posts = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).sort().flatMap((f) => {
  const src = readFileSync(join(POSTS_DIR, f), 'utf8');
  const parts = split(src);
  if (!parts) return [];
  const { fm, body } = parts;
  return [{ file: f, fm, body, data: {
    title: field(fm, 'title'), topic: field(fm, 'topic'), tags: field(fm, 'tags'),
    excerpt: field(fm, 'excerpt'), translation: field(fm, 'translation'), draft: field(fm, 'draft'),
  } }];
});
const existingTags = [...new Set(posts.flatMap((p) => (Array.isArray(p.data.tags) ? p.data.tags : [])))].sort();
const todo = posts.filter((p) => p.data.draft !== 'true' && (!p.data.topic || !p.data.tags?.length || !p.data.excerpt));

function finish(code) {
  const names = [...new Set(summary.map((s) => s.split(':')[0]))];
  const title = `Auto-tag: ${names.join(', ') || 'no changes'}`;
  writeFileSync('.ai-tag-summary.txt', summary.length ? `${title}\n\n${summary.join('\n')}\n` : '');
  process.exit(code);
}

if (!todo.length) {
  console.log('Nothing to tag: every post has a topic, tags and an excerpt.');
  finish(0);
}
if (!API_KEY) {
  const msg = 'ANTHROPIC_API_KEY is not set. Add it as a repository secret (Settings → Secrets and variables → Actions).';
  console.error(msg);
  annotate(msg);
  finish(1);
}

const SYSTEM = `You tag posts for "Hallowed Drafts", a personal journal of close readings of Scripture on prayer, worship and the inner life, and what they mean for how we live and work. British English.

Return ONLY a JSON object, no prose, with these keys:
- "topic": exactly one of ${JSON.stringify(TOPICS)}.
  prayer = how we pray; work = work, vocation, integrity, leadership, excellence, ambition, status; inner-life = worship, trust, peace, attention, identity before God, mortality and meaning; ideas = anything that fits none of these.
  If a post straddles two topics, pick the closest and set "topicNote" to one short sentence saying which other topic it touches.
- "tags": 2 to 5 tags. Lowercase, singular, hyphenated (e.g. "fear-of-the-lord"). Name the subject, never the mood.
  Reuse tags from the EXISTING TAGS list wherever one fits. Add at most ONE new tag, only if nothing existing fits.
  Use a Bible-book tag (e.g. "isaiah", "ecclesiastes") when a passage from that book is central to the post.
  Do not use a tag identical to a topic name unless it is already in the existing list.
- "excerpt": 140 to 180 characters. In the author's own voice and person. Plain text: no quotation marks, no emoji, no hype, no clickbait question. British spelling.
- "quotesScripture": true if the post quotes Bible verses in quotation marks.
- "scriptureFlags": an array of short notes for any quoted verse whose wording is clearly not the ESV (name the verse and the likely translation). Empty array if none or unsure.`;

async function ask(post) {
  const user = `EXISTING TAGS: ${existingTags.join(', ') || '(none yet)'}

TITLE: ${post.data.title}

POST:
${post.body.slice(0, 40000)}`;
  const base = { model: MODEL, max_tokens: 4096, system: SYSTEM, messages: [{ role: 'user', content: user }] };
  // Newer models think before answering by default, which can use up the reply. Ask for no
  // up-front thinking and a guaranteed JSON shape; fall back to a plain request if a model
  // (e.g. one set through ANTHROPIC_MODEL) doesn't accept those settings.
  const tuned = {
    ...base,
    thinking: { type: 'between_tools' },
    output_config: { effort: 'low', format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
  };
  const call = (body) =>
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  let res = await call(tuned);
  if (res.status === 400) res = await call(base);
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  const text = (json.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
  const start = text.indexOf('{');
  if (start === -1) {
    const types = (json.content || []).map((c) => c.type).join(', ') || 'none';
    throw new Error(`no JSON in reply (stop_reason: ${json.stop_reason}; blocks: ${types})`);
  }
  return JSON.parse(text.slice(start, text.lastIndexOf('}') + 1));
}

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    topic: { type: 'string', enum: TOPICS },
    topicNote: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    excerpt: { type: 'string' },
    quotesScripture: { type: 'boolean' },
    scriptureFlags: { type: 'array', items: { type: 'string' } },
  },
  required: ['topic', 'tags', 'excerpt', 'quotesScripture', 'scriptureFlags'],
  additionalProperties: false,
};

function validate(out) {
  const errors = [];
  if (!TOPICS.includes(out.topic)) errors.push(`topic "${out.topic}" is not allowed`);
  if (!Array.isArray(out.tags) || out.tags.length < 2 || out.tags.length > 5) errors.push('needs 2–5 tags');
  else {
    out.tags = [...new Set(out.tags.map((t) => String(t).trim().toLowerCase()))];
    const bad = out.tags.filter((t) => !TAG_RE.test(t));
    if (bad.length) errors.push(`badly formed tags: ${bad.join(', ')}`);
    const fresh = out.tags.filter((t) => !existingTags.includes(t));
    if (existingTags.length && fresh.length > 1) errors.push(`more than one new tag: ${fresh.join(', ')}`);
  }
  const ex = String(out.excerpt || '').trim().replace(/["“”]/g, '');
  out.excerpt = ex;
  if (ex.length < 120 || ex.length > 200) errors.push(`excerpt is ${ex.length} characters`);
  return errors;
}

let failed = 0;
for (const post of todo) {
  try {
    let out, errors;
    for (let attempt = 1; attempt <= 2; attempt++) {
      out = await ask(post);
      errors = validate(out);
      if (!errors.length) break;
    }
    if (errors.length) throw new Error(errors.join('; '));

    let fm = post.fm;
    const filled = [];
    if (!post.data.topic) { fm = setField(fm, 'topic', out.topic); filled.push(`topic ${out.topic}`); }
    if (!post.data.tags?.length) { fm = setField(fm, 'tags', `[${out.tags.join(', ')}]`); filled.push(`tags ${out.tags.join(', ')}`); }
    if (!post.data.excerpt) { fm = setField(fm, 'excerpt', q(out.excerpt)); filled.push('excerpt'); }
    if (!post.data.translation && out.quotesScripture) fm = setField(fm, 'translation', 'ESV');
    writeFileSync(join(POSTS_DIR, post.file), `---\n${fm}\n---\n${post.body.startsWith('\n') ? '' : '\n'}${post.body}`);

    const fresh = (out.tags || []).filter((t) => !existingTags.includes(t));
    let line = `${post.file.replace(/\.md$/, '')}: ${filled.join('; ')}`;
    if (fresh.length) line += ` (new tag: ${fresh.join(', ')})`;
    if (out.topicNote) line += ` — ${out.topicNote}`;
    if (Array.isArray(out.scriptureFlags) && out.scriptureFlags.length) line += `\n  Check Scripture wording: ${out.scriptureFlags.join(' | ')}`;
    summary.push(line);
    fresh.forEach((t) => existingTags.push(t));
    console.log('Tagged', line);
  } catch (err) {
    failed++;
    console.error(`Could not tag ${post.file}: ${err.message}`);
    annotate(`Could not tag ${post.file}: ${err.message}`);
  }
}
finish(failed ? 1 : 0);
