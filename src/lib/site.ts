// Site-wide settings. Change wording here, not in the page templates.
export const SITE = {
  name: 'Hallowed Drafts',
  url: 'https://halloweddrafts.com',
  author: 'Tolu',
  tagline: 'Drafts, not doctrine.',
  description:
    'Close readings of Scripture on prayer, worship and the inner life, and what they mean for how we live and work.',
  about:
    "I’m Tolu. I write here to think out loud about the spiritual life and the ideas that come with it.",
  defaultTranslationNote: 'Scripture quotations are from the ESV.',
  postsPerPage: 12,
  // Read counts stay hidden until they are worth showing.
  postReadsThreshold: 50,
  totalReadsThreshold: 1000,
};

export type TopicKey = 'prayer' | 'work' | 'inner-life' | 'ideas';

export const TOPICS: Record<TopicKey, { label: string; intro: string }> = {
  prayer: {
    label: 'Prayer',
    intro:
      'How Scripture reshapes the way we pray: what we ask for, where we pray from, and who prays with us.',
  },
  work: {
    label: 'Work',
    intro:
      "What the Bible says about doing your work well, and why what you do and how you do it can't be separated.",
  },
  'inner-life': {
    label: 'Inner life',
    intro: "Worship, trust and peace: what holds a life steady when circumstances don't.",
  },
  ideas: {
    label: 'Ideas',
    intro: 'Other ideas worth thinking through.',
  },
};

export const TOPIC_ORDER: TopicKey[] = ['prayer', 'work', 'inner-life', 'ideas'];
