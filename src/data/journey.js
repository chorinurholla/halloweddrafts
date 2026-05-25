// ═══════════════════════════════════════════════════════
// THEMATIC JOURNEY — Curated OT+NT paired devotions
// Each entry pairs an OT and NT passage around a shared theme
// Visual themes rotate: nature, space, adventure, mixed
// ═══════════════════════════════════════════════════════

export const VISUAL_THEMES = {
  nature: {
    name: 'Nature',
    emoji: '🌿',
    gradient: 'linear-gradient(135deg, #2D9B4E 0%, #7BC67E 100%)',
    bg: '#E8F5E9',
    accent: '#2D9B4E',
    icon: '🦁'
  },
  space: {
    name: 'Stars & Wonder',
    emoji: '✨',
    gradient: 'linear-gradient(135deg, #1A237E 0%, #5C6BC0 100%)',
    bg: '#E8EAF6',
    accent: '#3949AB',
    icon: '⭐'
  },
  adventure: {
    name: 'Adventure',
    emoji: '🗺️',
    gradient: 'linear-gradient(135deg, #E65100 0%, #FB8C00 100%)',
    bg: '#FFF3E0',
    accent: '#E65100',
    icon: '⚔️'
  },
  ocean: {
    name: 'Ocean',
    emoji: '🌊',
    gradient: 'linear-gradient(135deg, #0277BD 0%, #4FC3F7 100%)',
    bg: '#E1F5FE',
    accent: '#0277BD',
    icon: '🐋'
  }
};

export const CONTENT_CATEGORIES = [
  'Creation & Identity',
  'Courage & Faith',
  'Love & Kindness',
  'Wisdom & Truth',
  'Prayer & Worship',
  'Forgiveness & Grace',
  'God\'s Promises',
  'Serving Others',
  'Standing Firm',
  'Joy & Praise'
];

export const THEMATIC_JOURNEY = [
  // Week 1: Creation & Identity
  { day: 0, theme: 'Creation & New Creation', category: 'Creation & Identity', visualTheme: 'space', ot: { book: 'Genesis', ch: 1 }, nt: { book: 'John', ch: 1 }, title: 'In the Beginning', heavy: false },
  { day: 1, theme: 'Made in God\'s Image', category: 'Creation & Identity', visualTheme: 'nature', ot: { book: 'Genesis', ch: 1 }, nt: { book: 'Ephesians', ch: 2 }, title: 'Made by God, Loved by God', heavy: false },
  { day: 2, theme: 'Purpose in Design', category: 'Creation & Identity', visualTheme: 'nature', ot: { book: 'Genesis', ch: 2 }, nt: { book: 'Colossians', ch: 1 }, title: 'Designed on Purpose', heavy: false },
  { day: 3, theme: 'God\'s Promises', category: 'God\'s Promises', visualTheme: 'adventure', ot: { book: 'Genesis', ch: 12 }, nt: { book: 'Matthew', ch: 1 }, title: 'Promises That Never Break', heavy: false },
  { day: 4, theme: 'Trust & Obedience', category: 'Courage & Faith', visualTheme: 'adventure', ot: { book: 'Genesis', ch: 22 }, nt: { book: 'Hebrews', ch: 11 }, title: 'When God Asks Something Hard', heavy: false },
  { day: 5, theme: 'Forgiveness', category: 'Forgiveness & Grace', visualTheme: 'nature', ot: { book: 'Genesis', ch: 45 }, nt: { book: 'Matthew', ch: 18 }, title: 'Choosing to Forgive', heavy: false },
  { day: 6, theme: 'God\'s Big Plan', category: 'God\'s Promises', visualTheme: 'space', ot: { book: 'Genesis', ch: 50 }, nt: { book: 'Romans', ch: 8 }, title: 'God Works All Things Together', heavy: false },

  // Week 2: Deliverance & God's Power
  { day: 7, theme: 'God Hears Crying', category: 'Prayer & Worship', visualTheme: 'ocean', ot: { book: 'Exodus', ch: 3 }, nt: { book: 'Luke', ch: 1 }, title: 'God Hears Every Cry', heavy: false },
  { day: 8, theme: 'God\'s Power', category: 'Courage & Faith', visualTheme: 'space', ot: { book: 'Exodus', ch: 7 }, nt: { book: 'Mark', ch: 4 }, title: 'Nothing Is Too Big for God', heavy: false },
  { day: 9, theme: 'Deliverance', category: 'Courage & Faith', visualTheme: 'ocean', ot: { book: 'Exodus', ch: 14 }, nt: { book: 'Luke', ch: 4 }, title: 'God Rescues His People', heavy: false },
  { day: 10, theme: 'God Provides', category: 'God\'s Promises', visualTheme: 'nature', ot: { book: 'Exodus', ch: 16 }, nt: { book: 'John', ch: 6 }, title: 'Bread From Heaven', heavy: false },
  { day: 11, theme: 'Following the Leader', category: 'Courage & Faith', visualTheme: 'adventure', ot: { book: 'Exodus', ch: 13 }, nt: { book: 'John', ch: 14 }, title: 'Following Where God Leads', heavy: false },
  { day: 12, theme: 'The Ten Commandments', category: 'Wisdom & Truth', visualTheme: 'adventure', ot: { book: 'Exodus', ch: 20 }, nt: { book: 'Matthew', ch: 22 }, title: 'Rules That Show God\'s Love', heavy: false },
  { day: 13, theme: 'The Leader Who Serves', category: 'Serving Others', visualTheme: 'nature', ot: { book: 'Exodus', ch: 18 }, nt: { book: 'John', ch: 13 }, title: 'The Leader Who Serves', heavy: false },

  // Week 3: Courage & Entering the Land
  { day: 14, theme: 'Courage', category: 'Courage & Faith', visualTheme: 'adventure', ot: { book: 'Joshua', ch: 1 }, nt: { book: 'Acts', ch: 4 }, title: 'Be Strong and Courageous', heavy: false },
  { day: 15, theme: 'Loyalty & Faithfulness', category: 'Love & Kindness', visualTheme: 'nature', ot: { book: 'Ruth', ch: 1 }, nt: { book: 'Luke', ch: 1 }, title: 'Loyal Love', heavy: false },
  { day: 16, theme: 'Kindness to Strangers', category: 'Love & Kindness', visualTheme: 'nature', ot: { book: 'Ruth', ch: 2 }, nt: { book: 'Luke', ch: 10 }, title: 'Helping the Person Right in Front of You', heavy: false },
  { day: 17, theme: 'God Sees the Heart', category: 'Wisdom & Truth', visualTheme: 'space', ot: { book: '1 Samuel', ch: 16 }, nt: { book: 'Matthew', ch: 6 }, title: 'What God Looks At', heavy: false },
  { day: 18, theme: 'Facing Giants', category: 'Courage & Faith', visualTheme: 'adventure', ot: { book: '1 Samuel', ch: 17 }, nt: { book: 'Ephesians', ch: 6 }, title: 'Bigger Than Any Giant', heavy: false },
  { day: 19, theme: 'Friendship', category: 'Love & Kindness', visualTheme: 'nature', ot: { book: '1 Samuel', ch: 18 }, nt: { book: 'John', ch: 15 }, title: 'A Friend Who Sticks Closer', heavy: false },
  { day: 20, theme: 'Wisdom', category: 'Wisdom & Truth', visualTheme: 'space', ot: { book: '1 Kings', ch: 3 }, nt: { book: 'James', ch: 1 }, title: 'The Best Thing to Ask For', heavy: false },

  // Week 4: Psalms, Prayer & Praise
  { day: 21, theme: 'The Good Shepherd', category: 'Prayer & Worship', visualTheme: 'nature', ot: { book: 'Psalms', ch: 23 }, nt: { book: 'John', ch: 10 }, title: 'The Shepherd Who Knows Your Name', heavy: false },
  { day: 22, theme: 'God Hears Us', category: 'Prayer & Worship', visualTheme: 'space', ot: { book: 'Psalms', ch: 34 }, nt: { book: '1 John', ch: 5 }, title: 'He Hears Every Prayer', heavy: false },
  { day: 23, theme: 'Joy', category: 'Joy & Praise', visualTheme: 'nature', ot: { book: 'Psalms', ch: 100 }, nt: { book: 'Philippians', ch: 4 }, title: 'A Joy Nobody Can Steal', heavy: false },
  { day: 24, theme: 'God Never Leaves', category: 'God\'s Promises', visualTheme: 'ocean', ot: { book: 'Psalms', ch: 139 }, nt: { book: 'Romans', ch: 8 }, title: 'You Are Never Alone', heavy: false },
  { day: 25, theme: 'Praise', category: 'Joy & Praise', visualTheme: 'space', ot: { book: 'Psalms', ch: 150 }, nt: { book: 'Revelation', ch: 5 }, title: 'All Creation Sings', heavy: false },
  { day: 26, theme: 'Prayer', category: 'Prayer & Worship', visualTheme: 'space', ot: { book: 'Daniel', ch: 6 }, nt: { book: 'Matthew', ch: 6 }, title: 'Talking to God Every Day', heavy: false },
  { day: 27, theme: 'Standing Firm', category: 'Standing Firm', visualTheme: 'adventure', ot: { book: 'Daniel', ch: 3 }, nt: { book: '1 Peter', ch: 3 }, title: 'When Everyone Else Bows Down', heavy: false },

  // Week 5: Wisdom & Words
  { day: 28, theme: 'Words Matter', category: 'Wisdom & Truth', visualTheme: 'nature', ot: { book: 'Proverbs', ch: 18 }, nt: { book: 'James', ch: 3 }, title: 'Your Words Have Power', heavy: false },
  { day: 29, theme: 'Truth', category: 'Wisdom & Truth', visualTheme: 'adventure', ot: { book: 'Proverbs', ch: 12 }, nt: { book: 'John', ch: 8 }, title: 'The Truth Sets You Free', heavy: false },
  { day: 30, theme: 'Patience', category: 'Courage & Faith', visualTheme: 'nature', ot: { book: 'Genesis', ch: 21 }, nt: { book: 'Galatians', ch: 5 }, title: 'Waiting for God\'s Timing', heavy: false },
  { day: 31, theme: 'Generosity', category: 'Serving Others', visualTheme: 'nature', ot: { book: 'Genesis', ch: 13 }, nt: { book: '2 Corinthians', ch: 9 }, title: 'Giving the Best Away', heavy: false },
  { day: 32, theme: 'Humility', category: 'Wisdom & Truth', visualTheme: 'ocean', ot: { book: 'Numbers', ch: 12 }, nt: { book: 'Philippians', ch: 2 }, title: 'The Strength in Being Small', heavy: false },
  { day: 33, theme: 'Being Brave', category: 'Courage & Faith', visualTheme: 'adventure', ot: { book: 'Esther', ch: 4 }, nt: { book: 'Acts', ch: 7 }, title: 'For Such a Time as This', heavy: false },
  { day: 34, theme: 'Rebuilding', category: 'Serving Others', visualTheme: 'adventure', ot: { book: 'Nehemiah', ch: 2 }, nt: { book: 'Acts', ch: 2 }, title: 'Building Something Together', heavy: false },

  // Week 6: The Savior Arrives
  { day: 35, theme: 'Jesus Is Coming', category: 'God\'s Promises', visualTheme: 'space', ot: { book: 'Isaiah', ch: 9 }, nt: { book: 'Luke', ch: 2 }, title: 'A Promise Kept — The Savior Arrives', heavy: false },
  { day: 36, theme: 'God Becomes Human', category: 'Creation & Identity', visualTheme: 'space', ot: { book: 'Isaiah', ch: 7 }, nt: { book: 'Matthew', ch: 1 }, title: 'God With Us', heavy: false },
  { day: 37, theme: 'Repentance', category: 'Forgiveness & Grace', visualTheme: 'nature', ot: { book: 'Genesis', ch: 44 }, nt: { book: 'Luke', ch: 15 }, title: 'Coming Home', heavy: false },
  { day: 38, theme: 'The Resurrection', category: 'God\'s Promises', visualTheme: 'space', ot: { book: 'Jonah', ch: 2 }, nt: { book: 'Matthew', ch: 28 }, title: 'Three Days That Changed Everything', heavy: false },
  { day: 39, theme: 'The Holy Spirit', category: 'God\'s Promises', visualTheme: 'space', ot: { book: 'Joel', ch: 2 }, nt: { book: 'Acts', ch: 2 }, title: 'God\'s Power Living In Us', heavy: false },
  { day: 40, theme: 'Sharing the Good News', category: 'Serving Others', visualTheme: 'adventure', ot: { book: 'Jonah', ch: 3 }, nt: { book: 'Acts', ch: 1 }, title: 'Tell Everyone What God Has Done', heavy: false },
  { day: 41, theme: 'God\'s Faithfulness', category: 'God\'s Promises', visualTheme: 'ocean', ot: { book: 'Deuteronomy', ch: 7 }, nt: { book: '2 Timothy', ch: 2 }, title: 'He Keeps Every Promise', heavy: false },

  // Week 7: Love & New Beginnings
  { day: 42, theme: 'Love', category: 'Love & Kindness', visualTheme: 'nature', ot: { book: 'Psalms', ch: 136 }, nt: { book: '1 Corinthians', ch: 13 }, title: 'The Greatest Thing of All', heavy: false },
  { day: 43, theme: 'New Beginnings', category: 'Creation & Identity', visualTheme: 'space', ot: { book: 'Genesis', ch: 8 }, nt: { book: 'Revelation', ch: 21 }, title: 'God Makes All Things New', heavy: false },
  { day: 44, theme: 'God\'s Armor', category: 'Standing Firm', visualTheme: 'adventure', ot: { book: 'Psalms', ch: 91 }, nt: { book: 'Ephesians', ch: 6 }, title: 'Wearing God\'s Armor', heavy: false },
  { day: 45, theme: 'Trusting in Hard Times', category: 'Courage & Faith', visualTheme: 'ocean', ot: { book: 'Psalms', ch: 46 }, nt: { book: 'Philippians', ch: 4 }, title: 'God Is Our Safe Place', heavy: false },
  { day: 46, theme: 'Obedience', category: 'Wisdom & Truth', visualTheme: 'nature', ot: { book: 'Deuteronomy', ch: 6 }, nt: { book: 'John', ch: 14 }, title: 'Loving God With All Your Heart', heavy: false },
  { day: 47, theme: 'God\'s Kingdom', category: 'God\'s Promises', visualTheme: 'space', ot: { book: 'Daniel', ch: 7 }, nt: { book: 'Revelation', ch: 21 }, title: 'A Kingdom That Lasts Forever', heavy: false },
  { day: 48, theme: 'Rest', category: 'Prayer & Worship', visualTheme: 'ocean', ot: { book: 'Genesis', ch: 2 }, nt: { book: 'Hebrews', ch: 4 }, title: 'The Gift of Rest', heavy: false },
  { day: 49, theme: 'Light of the World', category: 'Creation & Identity', visualTheme: 'space', ot: { book: 'Isaiah', ch: 60 }, nt: { book: 'John', ch: 8 }, title: 'Shining Like Stars', heavy: false },
];

// Bible book metadata
export const BIBLE_BOOKS = [
  { name: 'Genesis', chapters: 50, section: 'Pentateuch', heavy: false },
  { name: 'Exodus', chapters: 40, section: 'Pentateuch', heavy: false },
  { name: 'Leviticus', chapters: 27, section: 'Pentateuch', heavy: true },
  { name: 'Numbers', chapters: 36, section: 'Pentateuch', heavy: true },
  { name: 'Deuteronomy', chapters: 34, section: 'Pentateuch', heavy: false },
  { name: 'Joshua', chapters: 24, section: 'Historical', heavy: true },
  { name: 'Judges', chapters: 21, section: 'Historical', heavy: true },
  { name: 'Ruth', chapters: 4, section: 'Historical', heavy: false },
  { name: '1 Samuel', chapters: 31, section: 'Historical', heavy: true },
  { name: '2 Samuel', chapters: 24, section: 'Historical', heavy: true },
  { name: '1 Kings', chapters: 22, section: 'Historical', heavy: true },
  { name: '2 Kings', chapters: 25, section: 'Historical', heavy: true },
  { name: '1 Chronicles', chapters: 29, section: 'Historical', heavy: false },
  { name: '2 Chronicles', chapters: 36, section: 'Historical', heavy: true },
  { name: 'Ezra', chapters: 10, section: 'Historical', heavy: false },
  { name: 'Nehemiah', chapters: 13, section: 'Historical', heavy: false },
  { name: 'Esther', chapters: 10, section: 'Historical', heavy: false },
  { name: 'Job', chapters: 42, section: 'Wisdom', heavy: true },
  { name: 'Psalms', chapters: 150, section: 'Wisdom', heavy: false },
  { name: 'Proverbs', chapters: 31, section: 'Wisdom', heavy: false },
  { name: 'Ecclesiastes', chapters: 12, section: 'Wisdom', heavy: false },
  { name: 'Song of Songs', chapters: 8, section: 'Wisdom', heavy: true },
  { name: 'Isaiah', chapters: 66, section: 'Prophets', heavy: true },
  { name: 'Jeremiah', chapters: 52, section: 'Prophets', heavy: true },
  { name: 'Ezekiel', chapters: 48, section: 'Prophets', heavy: true },
  { name: 'Daniel', chapters: 12, section: 'Prophets', heavy: false },
  { name: 'Hosea', chapters: 14, section: 'Prophets', heavy: true },
  { name: 'Joel', chapters: 3, section: 'Prophets', heavy: true },
  { name: 'Amos', chapters: 9, section: 'Prophets', heavy: true },
  { name: 'Obadiah', chapters: 1, section: 'Prophets', heavy: true },
  { name: 'Jonah', chapters: 4, section: 'Prophets', heavy: false },
  { name: 'Micah', chapters: 7, section: 'Prophets', heavy: true },
  { name: 'Nahum', chapters: 3, section: 'Prophets', heavy: true },
  { name: 'Habakkuk', chapters: 3, section: 'Prophets', heavy: false },
  { name: 'Zephaniah', chapters: 3, section: 'Prophets', heavy: true },
  { name: 'Haggai', chapters: 2, section: 'Prophets', heavy: false },
  { name: 'Zechariah', chapters: 14, section: 'Prophets', heavy: true },
  { name: 'Malachi', chapters: 4, section: 'Prophets', heavy: false },
  { name: 'Matthew', chapters: 28, section: 'Gospels', heavy: false },
  { name: 'Mark', chapters: 16, section: 'Gospels', heavy: false },
  { name: 'Luke', chapters: 24, section: 'Gospels', heavy: false },
  { name: 'John', chapters: 21, section: 'Gospels', heavy: false },
  { name: 'Acts', chapters: 28, section: 'Gospels', heavy: false },
  { name: 'Romans', chapters: 16, section: 'Epistles', heavy: false },
  { name: '1 Corinthians', chapters: 16, section: 'Epistles', heavy: false },
  { name: '2 Corinthians', chapters: 13, section: 'Epistles', heavy: false },
  { name: 'Galatians', chapters: 6, section: 'Epistles', heavy: false },
  { name: 'Ephesians', chapters: 6, section: 'Epistles', heavy: false },
  { name: 'Philippians', chapters: 4, section: 'Epistles', heavy: false },
  { name: 'Colossians', chapters: 4, section: 'Epistles', heavy: false },
  { name: '1 Thessalonians', chapters: 5, section: 'Epistles', heavy: false },
  { name: '2 Thessalonians', chapters: 3, section: 'Epistles', heavy: false },
  { name: '1 Timothy', chapters: 6, section: 'Epistles', heavy: false },
  { name: '2 Timothy', chapters: 4, section: 'Epistles', heavy: false },
  { name: 'Titus', chapters: 3, section: 'Epistles', heavy: false },
  { name: 'Philemon', chapters: 1, section: 'Epistles', heavy: false },
  { name: 'Hebrews', chapters: 13, section: 'Epistles', heavy: false },
  { name: 'James', chapters: 5, section: 'Epistles', heavy: false },
  { name: '1 Peter', chapters: 5, section: 'Epistles', heavy: false },
  { name: '2 Peter', chapters: 3, section: 'Epistles', heavy: false },
  { name: '1 John', chapters: 5, section: 'Epistles', heavy: false },
  { name: '2 John', chapters: 1, section: 'Epistles', heavy: false },
  { name: '3 John', chapters: 1, section: 'Epistles', heavy: false },
  { name: 'Jude', chapters: 1, section: 'Epistles', heavy: false },
  { name: 'Revelation', chapters: 22, section: 'Apocalyptic', heavy: true },
];
