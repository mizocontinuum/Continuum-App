/**
 * Continuum Academy - static catalogue data.
 *
 * This is the ONLY source of content in the app: no backend, no database and
 * no network calls. Every page renders from these exports (optionally overlaid
 * with the visitor's own localStorage edits, see store.js).
 *
 * Shape notes
 *  - disciplines[] -> { id, slug, title, name, goal, blurb, sort_order }
 *  - videos[]      -> { id, discipline_id, title, speaker, minutes, tag,
 *                       highlight, rating, summary, outcomes[], video_url,
 *                       is_clip, featured, sort_order }
 *  - video_url is a path relative to the site root. Drop a matching file into
 *    assets/videos/ and the player picks it up automatically; when the file is
 *    missing the watch page shows its built-in placeholder instead.
 */

export const DISCIPLINES = [
  {
    id: 'ent',
    slug: 'entrepreneurship',
    title: 'Entrepreneurship',
    name: 'Entrepreneurship',
    goal: 'Grow ventures',
    blurb: 'Founder-grade playbooks for building, funding and scaling a business that outlives you.',
    sort_order: 1
  },
  {
    id: 'mkt',
    slug: 'marketing-and-brand',
    title: 'Marketing & Brand',
    name: 'Marketing & Brand',
    goal: 'Own the market',
    blurb: 'Positioning, storytelling and demand generation that make customers choose you first.',
    sort_order: 2
  },
  {
    id: 'lead',
    slug: 'leadership-and-culture',
    title: 'Leadership & Culture',
    name: 'Leadership & Culture',
    goal: 'Lead with clarity',
    blurb: 'Executive presence, decisive communication and the culture systems behind high-performing teams.',
    sort_order: 3
  },
  {
    id: 'strat',
    slug: 'business-model-and-strategy',
    title: 'Business Model & Strategy',
    name: 'Business Model & Strategy',
    goal: 'Design the model',
    blurb: 'Turn ambition into a defensible model: pricing, moats, unit economics and the bets that matter.',
    sort_order: 4
  },
  {
    id: 'fin',
    slug: 'finance-and-wealth',
    title: 'Finance & Wealth',
    name: 'Finance & Wealth',
    goal: 'Build lasting capital',
    blurb: 'Read the numbers, steward capital and compound personal and corporate wealth with discipline.',
    sort_order: 5
  },
  {
    id: 'tech',
    slug: 'technology-and-ai',
    title: 'Technology & AI',
    name: 'Technology & AI',
    goal: 'Adopt with confidence',
    blurb: 'Practical AI adoption, data literacy and automation for leaders who are not engineers.',
    sort_order: 6
  },
  {
    id: 'mastery',
    slug: 'personal-mastery',
    title: 'Personal Mastery',
    name: 'Personal Mastery',
    goal: 'Perform under pressure',
    blurb: 'Energy, focus and decision quality for the person carrying the whole enterprise.',
    sort_order: 7
  }
];

export const VIDEOS = [
  /* ---------------------------------- Entrepreneurship ------------------- */
  {
    id: 'v-ent-01',
    discipline_id: 'ent',
    title: 'Insight Without Action Fails',
    speaker: 'Chiqui Escareal-Go',
    minutes: 27,
    tag: 'Entrepreneurship',
    highlight: '1m Highlight',
    rating: 96,
    summary:
      'Learn how to preserve entrepreneurial agility and overcome internal bottlenecks as your business scales. Discover key strategies to close the action gap and keep a founder\'s mindset through rapid growth.',
    outcomes: ['Grow ventures', 'Close the action gap', 'Keep founder speed'],
    video_url: '/assets/videos/insight-without-action-fails.mp4',
    is_clip: true,
    featured: true,
    sort_order: 1
  },
  {
    id: 'v-ent-02',
    discipline_id: 'ent',
    title: 'The First 100 Days of a New Venture',
    speaker: 'Ramon Del Rosario',
    minutes: 34,
    tag: 'Launch',
    highlight: 'Founder Playbook',
    rating: 93,
    summary:
      'A day-by-day operating plan for validating demand, assembling a founding team and shipping a first version customers actually pay for.',
    outcomes: ['Validate demand fast', 'Assemble a founding team', 'Ship v1'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 2
  },
  {
    id: 'v-ent-03',
    discipline_id: 'ent',
    title: 'Pricing Before You Have Customers',
    speaker: 'Marites Lim-Aquino',
    minutes: 22,
    tag: 'Revenue',
    highlight: 'Quick Win',
    rating: 91,
    summary:
      'Why the earliest pricing conversation is the cheapest strategy work you will ever do, and how to run it before your first invoice.',
    outcomes: ['Price with confidence', 'Test willingness to pay', 'Protect margin'],
    video_url: '',
    is_clip: true,
    featured: false,
    sort_order: 3
  },
  {
    id: 'v-ent-04',
    discipline_id: 'ent',
    title: 'Raising Your First Outside Capital',
    speaker: 'Jonathan Sy',
    minutes: 41,
    tag: 'Funding',
    highlight: 'Deep Dive',
    rating: 89,
    summary:
      'What investors actually screen for in a first institutional round, and how to build a data room that shortens diligence by weeks.',
    outcomes: ['Build a data room', 'Tell a growth story', 'Negotiate terms'],
    video_url: '',
    is_clip: false,
    featured: true,
    sort_order: 4
  },
  {
    id: 'v-ent-05',
    discipline_id: 'ent',
    title: 'Three Crises of Scaling',
    speaker: 'Chiqui Escareal-Go',
    minutes: 31,
    tag: 'Scale',
    highlight: 'Case Study',
    rating: 94,
    summary:
      'The three predictable points where growth stalls, and the leadership moves that get the organisation moving again.',
    outcomes: ['Spot the stall points', 'Rebuild decision speed', 'Delegation that holds'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 5
  },

  /* ---------------------------------- Marketing & Brand ------------------ */
  {
    id: 'v-mkt-01',
    discipline_id: 'mkt',
    title: 'Own the Mind: Positioning That Wins',
    speaker: 'Anna Melissa Cruz',
    minutes: 29,
    tag: 'Positioning',
    highlight: '1m Highlight',
    rating: 97,
    summary:
      'How to position your brand so customers choose you first. A practical framework for claiming a word in the market and defending it.',
    outcomes: ['Claim a market word', 'Sharpen the promise', 'Defend the position'],
    video_url: '/assets/videos/own-the-mind.mp4',
    is_clip: true,
    featured: true,
    sort_order: 1
  },
  {
    id: 'v-mkt-02',
    discipline_id: 'mkt',
    title: 'Storytelling for Executive Audiences',
    speaker: 'Gabriel Tan',
    minutes: 24,
    tag: 'Narrative',
    highlight: 'Workshop',
    rating: 92,
    summary:
      'The four-beat structure that turns a strategy deck into a story a board can repeat from memory.',
    outcomes: ['Structure a narrative', 'Make numbers memorable', 'Land the ask'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 2
  },
  {
    id: 'v-mkt-03',
    discipline_id: 'mkt',
    title: 'Demand Generation Without Wasted Spend',
    speaker: 'Patricia Gomez',
    minutes: 36,
    tag: 'Growth',
    highlight: 'Deep Dive',
    rating: 88,
    summary:
      'Build a pipeline model from first principles: cost per qualified conversation, payback windows and where to cut without losing growth.',
    outcomes: ['Model pipeline', 'Cut waste', 'Prove payback'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 3
  },
  {
    id: 'v-mkt-04',
    discipline_id: 'mkt',
    title: 'The Price Is the Brand',
    speaker: 'Jonathan Sy',
    minutes: 20,
    tag: 'Pricing',
    highlight: 'Quick Win',
    rating: 90,
    summary:
      'Discounting quietly rewrites what your brand means. Here is how to raise price and keep the customers you want.',
    outcomes: ['Raise price safely', 'Protect premium', 'Manage churn'],
    video_url: '',
    is_clip: true,
    featured: false,
    sort_order: 4
  },
  {
    id: 'v-mkt-05',
    discipline_id: 'mkt',
    title: 'Marketing Metrics the Board Understands',
    speaker: 'Anna Melissa Cruz',
    minutes: 26,
    tag: 'Measurement',
    highlight: 'Framework',
    rating: 87,
    summary:
      'Six numbers that translate marketing activity into commercial language, and the vanity metrics to stop reporting.',
    outcomes: ['Speak commercially', 'Retire vanity metrics', 'Report with rigour'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 5
  },

  /* ---------------------------------- Leadership & Culture --------------- */
  {
    id: 'v-lead-01',
    discipline_id: 'lead',
    title: 'Executive Presence Under Pressure',
    speaker: 'Rafael Mendoza',
    minutes: 33,
    tag: 'Presence',
    highlight: '1m Highlight',
    rating: 95,
    summary:
      'What separates leaders who steady a room from those who add to the noise, and the three habits you can rehearse.',
    outcomes: ['Steady the room', 'Speak in one breath', 'Hold the silence'],
    video_url: '/assets/videos/executive-presence.mp4',
    is_clip: true,
    featured: true,
    sort_order: 1
  },
  {
    id: 'v-lead-02',
    discipline_id: 'lead',
    title: 'Hiring the Second Layer',
    speaker: 'Marites Lim-Aquino',
    minutes: 38,
    tag: 'Talent',
    highlight: 'Deep Dive',
    rating: 92,
    summary:
      'Choosing leaders who can run the business without you, and structuring the first ninety days so the hire succeeds.',
    outcomes: ['Define the role', 'Interview for judgement', 'Onboard deliberately'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 2
  },
  {
    id: 'v-lead-03',
    discipline_id: 'lead',
    title: 'Difficult Conversations, Done Well',
    speaker: 'Rafael Mendoza',
    minutes: 25,
    tag: 'Communication',
    highlight: 'Workshop',
    rating: 93,
    summary:
      'A repeatable script for the conversation you have been postponing, from preparation to the follow-through note.',
    outcomes: ['Prepare the facts', 'Say the hard thing', 'Agree next steps'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 3
  },
  {
    id: 'v-lead-04',
    discipline_id: 'lead',
    title: 'Culture Is a System, Not a Slogan',
    speaker: 'Gabriel Tan',
    minutes: 30,
    tag: 'Culture',
    highlight: 'Framework',
    rating: 90,
    summary:
      'Translate stated values into decisions, rituals and consequences the organisation can actually feel.',
    outcomes: ['Codify behaviour', 'Design rituals', 'Enforce consistently'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 4
  },
  {
    id: 'v-lead-05',
    discipline_id: 'lead',
    title: 'Delegation That Actually Holds',
    speaker: 'Chiqui Escareal-Go',
    minutes: 21,
    tag: 'Execution',
    highlight: 'Quick Win',
    rating: 91,
    summary:
      'Why delegated work comes back, and the five-level handover model that stops the boomerang.',
    outcomes: ['Set the level', 'Agree checkpoints', 'Stop re-doing it'],
    video_url: '',
    is_clip: true,
    featured: false,
    sort_order: 5
  },

  /* ---------------------------------- Business Model & Strategy ---------- */
  {
    id: 'v-strat-01',
    discipline_id: 'strat',
    title: 'The Growth Paradox',
    speaker: 'Jonathan Sy',
    minutes: 35,
    tag: 'Strategy',
    highlight: '1m Highlight',
    rating: 94,
    summary:
      'The bigger the business gets, the harder it is to move fast. Diagnose bureaucracy and analysis paralysis before they compound.',
    outcomes: ['Diagnose drag', 'Restore agility', 'Decide faster'],
    video_url: '/assets/videos/growth-paradox.mp4',
    is_clip: true,
    featured: true,
    sort_order: 1
  },
  {
    id: 'v-strat-02',
    discipline_id: 'strat',
    title: 'Designing a Defensible Business Model',
    speaker: 'Marites Lim-Aquino',
    minutes: 44,
    tag: 'Model',
    highlight: 'Deep Dive',
    rating: 90,
    summary:
      'Work through the nine questions that reveal whether a model compounds advantage or quietly leaks it.',
    outcomes: ['Map the model', 'Find the moat', 'Stress-test assumptions'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 2
  },
  {
    id: 'v-strat-03',
    discipline_id: 'strat',
    title: 'Unit Economics in One Page',
    speaker: 'Patricia Gomez',
    minutes: 23,
    tag: 'Economics',
    highlight: 'Quick Win',
    rating: 92,
    summary:
      'The single page every executive should be able to draw from memory: contribution margin, payback and cash conversion.',
    outcomes: ['Draw the page', 'Test payback', 'Watch cash'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 3
  },
  {
    id: 'v-strat-04',
    discipline_id: 'strat',
    title: 'Choosing What Not to Do',
    speaker: 'Rafael Mendoza',
    minutes: 28,
    tag: 'Focus',
    highlight: 'Framework',
    rating: 89,
    summary:
      'Portfolio discipline for leaders with too many good ideas: scoring, sequencing and the courage to stop things.',
    outcomes: ['Score opportunities', 'Sequence bets', 'Kill politely'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 4
  },
  {
    id: 'v-strat-05',
    discipline_id: 'strat',
    title: 'Scenario Planning for Volatile Markets',
    speaker: 'Anna Melissa Cruz',
    minutes: 32,
    tag: 'Foresight',
    highlight: 'Workshop',
    rating: 88,
    summary:
      'Build three futures, identify the leading indicators and pre-commit the moves you will make in each.',
    outcomes: ['Build scenarios', 'Watch indicators', 'Pre-commit moves'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 5
  },

  /* ---------------------------------- Finance & Wealth ------------------- */
  {
    id: 'v-fin-01',
    discipline_id: 'fin',
    title: 'Reading a Balance Sheet Like an Owner',
    speaker: 'Ramon Del Rosario',
    minutes: 39,
    tag: 'Financials',
    highlight: '1m Highlight',
    rating: 96,
    summary:
      'Move past the income statement: what the balance sheet is telling you about risk, resilience and real returns.',
    outcomes: ['Read the sheet', 'Spot risk early', 'Judge resilience'],
    video_url: '/assets/videos/balance-sheet.mp4',
    is_clip: true,
    featured: true,
    sort_order: 1
  },
  {
    id: 'v-fin-02',
    discipline_id: 'fin',
    title: 'Cash Conversion: The Silent Killer',
    speaker: 'Patricia Gomez',
    minutes: 27,
    tag: 'Cash',
    highlight: 'Deep Dive',
    rating: 93,
    summary:
      'Profitable companies still run out of money. Learn to manage the cash conversion cycle as a first-class metric.',
    outcomes: ['Measure the cycle', 'Free up cash', 'Fund growth internally'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 2
  },
  {
    id: 'v-fin-03',
    discipline_id: 'fin',
    title: 'Building Personal Capital Alongside the Business',
    speaker: 'Marites Lim-Aquino',
    minutes: 26,
    tag: 'Wealth',
    highlight: 'Framework',
    rating: 90,
    summary:
      'Why founders end up asset-rich and cash-poor, and the structure that converts enterprise value into personal freedom.',
    outcomes: ['Separate the balance sheets', 'Pay yourself properly', 'Diversify deliberately'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 3
  },
  {
    id: 'v-fin-04',
    discipline_id: 'fin',
    title: 'Budgeting That People Follow',
    speaker: 'Jonathan Sy',
    minutes: 24,
    tag: 'Planning',
    highlight: 'Quick Win',
    rating: 86,
    summary:
      'A budgeting rhythm that survives contact with reality: drivers, owners and a monthly variance ritual.',
    outcomes: ['Budget by driver', 'Assign owners', 'Review variance'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 4
  },
  {
    id: 'v-fin-05',
    discipline_id: 'fin',
    title: 'Talking to Your Bank and Your Board',
    speaker: 'Rafael Mendoza',
    minutes: 29,
    tag: 'Governance',
    highlight: 'Workshop',
    rating: 88,
    summary:
      'How to present financial reality without losing confidence, and what both audiences are really asking.',
    outcomes: ['Frame the numbers', 'Answer the hidden question', 'Keep the mandate'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 5
  },

  /* ---------------------------------- Technology & AI -------------------- */
  {
    id: 'v-tech-01',
    discipline_id: 'tech',
    title: 'AI Adoption Without the Hype',
    speaker: 'Gabriel Tan',
    minutes: 31,
    tag: 'AI',
    highlight: '1m Highlight',
    rating: 95,
    summary:
      'A sober filter for choosing the first three AI use cases in your business, and the governance that keeps them safe.',
    outcomes: ['Pick three use cases', 'Set guardrails', 'Measure the gain'],
    video_url: '/assets/videos/ai-adoption.mp4',
    is_clip: true,
    featured: true,
    sort_order: 1
  },
  {
    id: 'v-tech-02',
    discipline_id: 'tech',
    title: 'Automating the Back Office',
    speaker: 'Patricia Gomez',
    minutes: 25,
    tag: 'Automation',
    highlight: 'Quick Win',
    rating: 91,
    summary:
      'Map a process, find the manual handoffs and remove them in sequence without a large technology budget.',
    outcomes: ['Map the process', 'Remove handoffs', 'Measure hours saved'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 2
  },
  {
    id: 'v-tech-03',
    discipline_id: 'tech',
    title: 'Data Literacy for Decision Makers',
    speaker: 'Anna Melissa Cruz',
    minutes: 34,
    tag: 'Data',
    highlight: 'Deep Dive',
    rating: 89,
    summary:
      'Ask better questions of your dashboards: sampling, correlation and the traps that make confident people wrong.',
    outcomes: ['Ask better questions', 'Read a chart honestly', 'Avoid the traps'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 3
  },
  {
    id: 'v-tech-04',
    discipline_id: 'tech',
    title: 'Security for Small Executive Teams',
    speaker: 'Ramon Del Rosario',
    minutes: 22,
    tag: 'Security',
    highlight: 'Checklist',
    rating: 87,
    summary:
      'The short list of controls that actually reduce risk for a lean organisation, ranked by effort and impact.',
    outcomes: ['Close the basics', 'Rank by impact', 'Plan the response'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 4
  },
  {
    id: 'v-tech-05',
    discipline_id: 'tech',
    title: 'Buying Software Without Regret',
    speaker: 'Jonathan Sy',
    minutes: 20,
    tag: 'Vendors',
    highlight: 'Quick Win',
    rating: 85,
    summary:
      'A buying process that protects you from shelfware: requirements first, references second, pilots always.',
    outcomes: ['Write requirements', 'Check references', 'Pilot before scaling'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 5
  },

  /* ---------------------------------- Personal Mastery ------------------- */
  {
    id: 'v-mastery-01',
    discipline_id: 'mastery',
    title: 'The Executive Energy Audit',
    speaker: 'Rafael Mendoza',
    minutes: 23,
    tag: 'Energy',
    highlight: '1m Highlight',
    rating: 94,
    summary:
      'Find where your week leaks capacity, and rebuild the calendar around the two hours that decide everything.',
    outcomes: ['Audit the week', 'Protect deep hours', 'Recover deliberately'],
    video_url: '/assets/videos/energy-audit.mp4',
    is_clip: true,
    featured: false,
    sort_order: 1
  },
  {
    id: 'v-mastery-02',
    discipline_id: 'mastery',
    title: 'Deciding With Incomplete Information',
    speaker: 'Chiqui Escareal-Go',
    minutes: 28,
    tag: 'Judgement',
    highlight: 'Framework',
    rating: 92,
    summary:
      'Separate reversible from irreversible calls, set a decision date, and stop paying the tax of delay.',
    outcomes: ['Sort the decisions', 'Set decision dates', 'Stop reopening calls'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 2
  },
  {
    id: 'v-mastery-03',
    discipline_id: 'mastery',
    title: 'Board-Ready in Ten Minutes',
    speaker: 'Marites Lim-Aquino',
    minutes: 19,
    tag: 'Preparation',
    highlight: 'Quick Win',
    rating: 90,
    summary:
      'The ten-minute pre-brief that makes every high-stakes meeting feel like the second time you have had it.',
    outcomes: ['Pre-brief the room', 'Anticipate objections', 'Arrive decided'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 3
  },
  {
    id: 'v-mastery-04',
    discipline_id: 'mastery',
    title: 'Sustaining Focus Across a Quarter',
    speaker: 'Gabriel Tan',
    minutes: 26,
    tag: 'Focus',
    highlight: 'Workshop',
    rating: 88,
    summary:
      'Turn a quarterly priority into weekly proof, using a simple visible scoreboard the whole team can see.',
    outcomes: ['Pick one priority', 'Make weekly proof', 'Review Fridays'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 4
  },
  {
    id: 'v-mastery-05',
    discipline_id: 'mastery',
    title: 'Rest as a Performance Strategy',
    speaker: 'Anna Melissa Cruz',
    minutes: 21,
    tag: 'Recovery',
    highlight: 'Quick Win',
    rating: 86,
    summary:
      'Why sustained output is a recovery problem, and how to design rest into a founder\'s calendar without apology.',
    outcomes: ['Schedule recovery', 'Guard sleep', 'Model the behaviour'],
    video_url: '',
    is_clip: false,
    featured: false,
    sort_order: 5
  }
];

/** Default signed-in member (profile page renders and edits this). */
export const PROFILE = {
  full_name: 'Mansmith Andfielder',
  email: 'member@continuum.com.ph',
  role: 'member',
  title: 'Managing Director',
  company: 'Continuum Academy Inc.',
  timezone: 'Asia/Shanghai',
  joined: '2026-01-15'
};

/** Notification bell feed. */
export const NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'New masterclass in Marketing & Brand',
    body: 'Own the Mind: Positioning That Wins is now available.',
    read: false,
    created_at: '2026-11-13T01:20:00.000Z'
  },
  {
    id: 'n2',
    title: 'You are 60% through Entrepreneurship',
    body: 'Two masterclasses remain in this discipline.',
    read: false,
    created_at: '2026-11-12T09:05:00.000Z'
  },
  {
    id: 'n3',
    title: 'Executive briefing: AI adoption',
    body: 'A new 1m highlight clip from Technology & AI was added.',
    read: false,
    created_at: '2026-11-11T23:40:00.000Z'
  },
  {
    id: 'n4',
    title: 'Weekly executive digest',
    body: 'Five new insights across your followed disciplines.',
    read: true,
    created_at: '2026-11-10T00:00:00.000Z'
  },
  {
    id: 'n5',
    title: 'Welcome to Continuum Academy',
    body: 'Your executive learning cockpit is ready.',
    read: true,
    created_at: '2026-11-01T00:00:00.000Z'
  }
];

/** Initial progress + My List so the demo never starts empty. */
export const SEED_FAVORITES = ['v-ent-01', 'v-mkt-01', 'v-lead-01', 'v-fin-01'];

export const SEED_PROGRESS = {
  'v-ent-01': { position: 1455, completed: true, updated_at: '2026-11-12T10:12:00.000Z' },
  'v-ent-05': { position: 640, completed: false, updated_at: '2026-11-12T10:40:00.000Z' },
  'v-mkt-02': { position: 300, completed: false, updated_at: '2026-11-11T20:02:00.000Z' },
  'v-strat-01': { position: 900, completed: false, updated_at: '2026-11-09T18:31:00.000Z' }
};

/** Look-ups used by the store and the page modules. */
export function videosFor(disciplineId) {
  return VIDEOS.filter((v) => v.discipline_id === disciplineId).sort(bySortOrder);
}

export function bySortOrder(a, b) {
  return (a.sort_order || 0) - (b.sort_order || 0) || String(a.id).localeCompare(String(b.id));
}
