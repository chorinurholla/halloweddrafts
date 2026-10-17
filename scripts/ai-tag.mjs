#!/usr/bin/env node
// AI tagging for Hallowed Drafts.
// Finds posts in /posts missing a topic, tags or excerpt, asks Claude to fill them in,
// validates the answer, and writes it into the post's frontmatter.
// Fields you filled in yourself are never changed. Title and body are never changed.
//
// Needs: ANTHROPIC_API_KEY. Optional: ANTHROPIC_MODEL (default below).
// Writes a summary to .ai-tag-summary.txt (used as the commit message by the GitHub Action).
// Exit code 1 if any post could not be tagged, so the Action fails and GitHub emails you.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const POSTS_DIR = 'posts';
const TOPICS = ['prayer', 'work', 'inner-life', 'ideas'];
const TAG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const API_KEY = process.env.ANTHROPIC_API_KEY;

// ---------- Minimal frontmatter handling (keeps your formatting intact) ----------
function split(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error('No frontmatter block found (the file must start with ---)');
  return { fm: m[1], body: m[2] };
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

// ---------- Collect posts ----------
const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).sort();
const posts = files.map((f) => {
  const src = readFileSync(join(POSTS_DIR, f), 'utf8');
  const { fm, body } = split(src);
  return { file: f, src, fm, body, data: {
    title: field(fm, 'title'), topic: field(fm, 'topic'), tags: field(fm, 'tags'),
    excerpt: field(fm, 'excerpt'), translation: field(fm, 'translation'), draft: field(fm, 'draft'),
  } };
});
const existingTags = [...new Set(posts.flatMap((p) => (Array.isArray(p.data.tags) ? p.data.tags : [])))].sort();
const todo = posts.filter((p) => p.data.draft !== 'true' && (!p.data.topic || !p.data.tags?.length || !p.data.excerpt));

if (!todo.length) {
  console.log('Nothing to tag: every post has a topic, tags and an excerpt.');
  writeFileSync('.ai-tag-summary.txt', '');
  process.exit(0);
}
if (!API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. Add it as a repository secret.');
  process.exit(1);
}

// ---------- Ask Claude ----------
const SYSTEM = `You tag posts for "Hallowed Drafts", a personal journal of close readings of Scripture on prayer, worship and the inner life, and what they mean for how we live and work. British English.

Return ONLY a JSON object, no prose, with these keys:
- "topic": exactly one of ${JSON.stringify(TOPICS)}.
  prayer = how we pray; work = work, vocation, integrity, leadership, excellence; inner-life = worship, trust, peace, attention, identity before God; ideas = anything that fits none of these.
  If a post straddles two topics, pick the closest and set "topicNote" to one short sentence saying which other topic it touches.
- "tags": 2 to 5 tags. Lowercase, singular, hyphenated (e.g. "fear-of-the-lord"). Name the subject, never the mood.
  Reuse tags from the EXISTING TAGS list wherever one fits. Add at most ONE new tag, only if nothing existing fits.
  Use a Bible-book tag (e.g. "isaiah", "ephesians") when a passage from that book is central to the post.
  Do not use a tag identical to a topic name unless it is already in the existing list.
- "excerpt": 140 to 180 characters. In the author's own voice and person. Plain text: no quotation marks, no emoji, no hype, no clickbait question.
- "quotesScripture": true if the post quotes Bible verses in quotation marks.
- "scriptureFlags": an array of short notes for any quoted verse whose wording is clearly not the ESV (name the verse and the likely translation). Empty array if none or unsure.`;

async function ask(post) {
  const user = `EXISTING TAGS: ${existingTags.join(', ') || '(none yet)'}

TITLE: ${post.data.title}

POST:
${post.body.slice(0, 40000)}`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 800, system: SYSTEM, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  const text = (json.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
  const obj = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  return obj;
}

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

const summary = [];
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
    if (!post.data.translation && out.quotesScripture) { fm = setField(fm, 'translation', 'ESV'); }
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
  }
}

const title = `Auto-tag: ${summary.map((s) => s.split(':')[0]).join(', ') || 'no changes'}`;
writeFileSync('.ai-tag-summary.txt', summary.length ? `${title}\n\n${summary.join('\n')}\n` : '');
process.exit(failed ? 1 : 0);
