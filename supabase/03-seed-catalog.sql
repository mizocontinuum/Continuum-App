-- ============================================================================
-- Continuum Academy - 03 SEED CATALOG  (disciplines, speakers, videos)
-- ----------------------------------------------------------------------------
-- Run in the Supabase SQL Editor (Dashboard -> SQL -> New query) AFTER
-- supabase/01-catalog.sql has created the tables.
--
-- Idempotent: every insert uses ON CONFLICT (id) DO UPDATE, so re-running this
-- file updates the existing rows in place instead of failing or duplicating.
-- The whole script runs in one transaction: it either fully applies or not.
--
-- Source of truth: continuum-academy-mobile/constants/mockData.ts
--   * DISCIPLINES (7)  -> public.disciplines
--   * SPEAKERS    (10) -> public.speakers
--   * VIDEO_SEEDS (28) -> public.videos   (v01..v21 masterclasses, c01..c07 clips)
-- Ids are copied verbatim ('leadership', 's1', 'v01', ...) - never renumbered.
--
-- Not seeded on purpose: public.profiles, public.progress, public.favorites and
-- public.notifications. Those are per-user tables and must start empty for a
-- new account.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Disciplines
--    emoji is stored as real UTF-8 (e.g. the rocket glyph), not a JS escape.
-- ---------------------------------------------------------------------------
insert into public.disciplines
  (id, name, goal, description, emoji, accent, accent_deep, sort_order)
values
  (
    'entrepreneurship',
    'Entrepreneurship',
    'Turn an idea into a business that scales.',
    'Validation, first customers and the operating rhythm of a company that is still finding its shape.',
    '🚀',
    '#E7B94C',
    '#7A5A12',
    1
  ),
  (
    'marketing',
    'Marketing',
    'Win attention and convert it into demand.',
    'Positioning, messaging and the compounding content engine that keeps a pipeline full.',
    '📣',
    '#22C8DD',
    '#0E5E6B',
    2
  ),
  (
    'leadership',
    'Leadership',
    'Lead people with clarity and trust.',
    'Influence without authority, candid conversations and the culture work that outlives any quarter.',
    '🧭',
    '#8B7BF7',
    '#3A2E8C',
    3
  ),
  (
    'strategy',
    'Strategy',
    'Choose where to play and how to win.',
    'Focus, defensibility and the discipline of saying no to almost everything.',
    '♟️',
    '#4ADE80',
    '#166534',
    4
  ),
  (
    'finance',
    'Finance',
    'Read the numbers and protect margin.',
    'The three statements, unit economics and raising capital without surrendering the company.',
    '📊',
    '#F0A868',
    '#8A4E1B',
    5
  ),
  (
    'technology',
    'Technology',
    'Adopt AI and digital tools with confidence.',
    'Practical automation, sensible security and a clear-eyed view of what AI can and cannot do.',
    '⚙️',
    '#60A5FA',
    '#1E40AF',
    6
  ),
  (
    'mastery',
    'Mastery',
    'Compound skill into lasting advantage.',
    'Attention, deliberate practice and the judgement that only shows up after years of reps.',
    '🎯',
    '#F472B6',
    '#831843',
    7
  )
on conflict (id) do update set
  name        = excluded.name,
  goal        = excluded.goal,
  description = excluded.description,
  emoji       = excluded.emoji,
  accent      = excluded.accent,
  accent_deep = excluded.accent_deep,
  sort_order  = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- 2. Speakers
-- ---------------------------------------------------------------------------
insert into public.speakers
  (id, name, title, company, bio, avatar_url, sort_order)
values
  (
    's1',
    'Marco Villanueva',
    'Founder & CEO',
    'Northwind Ventures',
    'Built and sold two software companies. Now backs first-time founders across Southeast Asia.',
    'https://picsum.photos/seed/continuum-speaker-s1/200/200',
    1
  ),
  (
    's2',
    'Dr. Anna Reyes',
    'Chief Marketing Officer',
    'Lumen Group',
    'Twenty years of brand and demand work for consumer and B2B categories.',
    'https://picsum.photos/seed/continuum-speaker-s2/200/200',
    2
  ),
  (
    's3',
    'Gabriel Santos',
    'Managing Partner',
    'Sierra Capital',
    'Led more than forty financings and sat on both sides of the term sheet.',
    'https://picsum.photos/seed/continuum-speaker-s3/200/200',
    3
  ),
  (
    's4',
    'Rachel Tan',
    'Chief People Officer',
    'Orbit Labs',
    'Scaled three organisations from thirty to eight hundred people.',
    'https://picsum.photos/seed/continuum-speaker-s4/200/200',
    4
  ),
  (
    's5',
    'Daniel Ocampo',
    'Chief Financial Officer',
    'Meridian Holdings',
    'Turns messy books into numbers a board can actually act on.',
    'https://picsum.photos/seed/continuum-speaker-s5/200/200',
    5
  ),
  (
    's6',
    'Priya Nair',
    'Head of AI',
    'Helix Systems',
    'Deploys applied machine learning inside companies that are not technology companies.',
    'https://picsum.photos/seed/continuum-speaker-s6/200/200',
    6
  ),
  (
    's7',
    'Elena Cruz',
    'Executive Coach',
    'The Cruz Method',
    'Coaches founders and executives through the conversations they have been avoiding.',
    'https://picsum.photos/seed/continuum-speaker-s7/200/200',
    7
  ),
  (
    's8',
    'Miguel Bautista',
    'VP Growth',
    'Payload',
    'Runs acquisition and lifecycle marketing against a single north-star metric.',
    'https://picsum.photos/seed/continuum-speaker-s8/200/200',
    8
  ),
  (
    's9',
    'Sofia Lim',
    'Strategy Director',
    'Anchor Advisory',
    'Helps boards decide what to stop doing before they decide what to start.',
    'https://picsum.photos/seed/continuum-speaker-s9/200/200',
    9
  ),
  (
    's10',
    'Tomas Reyes',
    'Serial Entrepreneur',
    'Founder''s Table',
    'Fifth company, first one that ran without him. Writes about judgement and deliberate practice.',
    'https://picsum.photos/seed/continuum-speaker-s10/200/200',
    10
  )
on conflict (id) do update set
  name       = excluded.name,
  title      = excluded.title,
  company    = excluded.company,
  bio        = excluded.bio,
  avatar_url = excluded.avatar_url,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- 3. Videos
--    duration_sec = seed.minutes * 60 (the seeds store minutes).
--    poster_url   = https://picsum.photos/seed/continuum-<id>/800/450
--    video_url    = SAMPLE_VIDEOS[index % 13] (Google public sample MP4s).
--    sort_order   = position in VIDEO_SEEDS (1-based).
--    is_clip      = seed.clip === true.
-- ---------------------------------------------------------------------------
insert into public.videos
  (id, discipline_id, speaker_id, title, subtitle, description,
   duration_sec, poster_url, video_url, tags, year, rating, views, is_clip, sort_order)
values
  (
    'v01', 'entrepreneurship', 's1',
    'The First 90 Days of a Company',
    'From idea to first paying customer',
    'The unglamorous sequence that separates a business from a hobby: talk to twenty people, sell before you build, and let the market pick your roadmap.',
    2520,
    'https://picsum.photos/seed/continuum-v01/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    array['Startups', 'Validation', 'Sales'], 2025, 4.8, 184300, false, 1
  ),
  (
    'v02', 'entrepreneurship', 's3',
    'Pricing Before You Launch',
    'Set a price you can defend',
    'Why launching free is the most expensive decision you can make, and how to find the number your customer already pays for a worse option.',
    1680,
    'https://picsum.photos/seed/continuum-v02/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    array['Pricing', 'Monetisation', 'Value'], 2025, 4.6, 96800, false, 2
  ),
  (
    'v03', 'entrepreneurship', 's5',
    'Cash Is the Only Scoreboard',
    'Runway, burn and survival',
    'Revenue is an opinion. Cash is a fact. A working model for the one metric that decides whether you get another year.',
    1860,
    'https://picsum.photos/seed/continuum-v03/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    array['Runway', 'Burn', 'Survival'], 2024, 4.7, 122400, false, 3
  ),
  (
    'c01', 'entrepreneurship', 's1',
    'The Three Questions Every Founder Must Answer',
    'Insight clip',
    'The questions that expose whether an idea is a business or a wish.',
    360,
    'https://picsum.photos/seed/continuum-c01/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    array['Insight', 'Founders'], 2025, 4.5, 48900, true, 4
  ),
  (
    'v04', 'marketing', 's2',
    'Positioning That Actually Sticks',
    'Own one word in your buyer''s mind',
    'A repeatable positioning exercise: name the enemy, name the alternative, then claim the single word you are willing to be measured on.',
    2280,
    'https://picsum.photos/seed/continuum-v04/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    array['Positioning', 'Brand', 'Messaging'], 2025, 4.9, 210600, false, 5
  ),
  (
    'v05', 'marketing', 's8',
    'The Demand Engine',
    'Content, pipeline and compounding',
    'How to build a content system that keeps producing leads after you stop posting daily, and the four numbers that tell you it is working.',
    1980,
    'https://picsum.photos/seed/continuum-v05/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    array['Content', 'Pipeline', 'Growth'], 2025, 4.7, 158200, false, 6
  ),
  (
    'v06', 'marketing', 's8',
    'Measuring What Matters',
    'Attribution without the lies',
    'Most dashboards measure what is easy. This is a short list of what actually predicts revenue, and how to instrument it honestly.',
    1740,
    'https://picsum.photos/seed/continuum-v06/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    array['Analytics', 'Attribution', 'Metrics'], 2024, 4.4, 87500, false, 7
  ),
  (
    'c02', 'marketing', 's2',
    'One Offer Beats Ten Features',
    'Insight clip',
    'Why narrowing the promise widens the market.',
    300,
    'https://picsum.photos/seed/continuum-c02/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    array['Insight', 'Offers'], 2025, 4.3, 39100, true, 8
  ),
  (
    'v07', 'leadership', 's7',
    'Leading Without a Title',
    'Influence before authority',
    'The most useful leadership skill is moving people who do not report to you. A practical model built on clarity, credibility and small wins.',
    2040,
    'https://picsum.photos/seed/continuum-v07/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    array['Influence', 'Trust', 'Communication'], 2025, 4.8, 176900, false, 9
  ),
  (
    'v08', 'leadership', 's7',
    'Difficult Conversations',
    'Say the hard thing well',
    'A five-part script for the conversation you have been postponing, and why postponing it costs more than having it badly.',
    1620,
    'https://picsum.photos/seed/continuum-v08/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    array['Feedback', 'Conflict', 'Candour'], 2024, 4.9, 143700, false, 10
  ),
  (
    'v09', 'leadership', 's4',
    'A Culture That Survives Growth',
    'Values that outlast the founding team',
    'Culture is not a poster. It is what gets rewarded when nobody is watching, and how to encode that into hiring and promotion.',
    2460,
    'https://picsum.photos/seed/continuum-v09/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    array['Culture', 'Hiring', 'Values'], 2025, 4.6, 131500, false, 11
  ),
  (
    'c03', 'leadership', 's4',
    'The Five-Minute One-on-One',
    'Insight clip',
    'A micro-format that keeps a team aligned without another meeting.',
    240,
    'https://picsum.photos/seed/continuum-c03/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    array['Insight', 'Management'], 2025, 4.4, 52300, true, 12
  ),
  (
    'v10', 'strategy', 's9',
    'Where to Play, How to Win',
    'The core of strategy',
    'Strategy is a choice about where you will compete and why you will win there. Everything else is planning.',
    2700,
    'https://picsum.photos/seed/continuum-v10/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    array['Strategy', 'Focus', 'Choice'], 2025, 4.9, 224100, false, 13
  ),
  (
    'v11', 'strategy', 's3',
    'Strategic Bets and Kill Criteria',
    'Decide fast, exit faster',
    'Write the exit condition before you write the business case. A discipline that stops good money chasing bad.',
    1800,
    'https://picsum.photos/seed/continuum-v11/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    array['Decisions', 'Risk', 'Portfolio'], 2025, 4.7, 118200, false, 14
  ),
  (
    'v12', 'strategy', 's9',
    'Moats in Practice',
    'Why customers stay',
    'Switching costs, network effects and brand are easy to name and hard to build. Here is what each looks like on a P&L.',
    2100,
    'https://picsum.photos/seed/continuum-v12/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    array['Moat', 'Retention', 'Defensibility'], 2024, 4.5, 99400, false, 15
  ),
  (
    'c04', 'strategy', 's9',
    'Strategy Is What You Say No To',
    'Insight clip',
    'If the plan has ten priorities, it has none.',
    300,
    'https://picsum.photos/seed/continuum-c04/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    array['Insight', 'Focus'], 2025, 4.6, 61200, true, 16
  ),
  (
    'v13', 'finance', 's5',
    'Reading a P&L in Twenty Minutes',
    'The three statements, simply',
    'A founder-level tour of profit and loss, balance sheet and cash flow, and the two line items that usually hide the real story.',
    1560,
    'https://picsum.photos/seed/continuum-v13/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    array['P&L', 'Accounting', 'Margins'], 2025, 4.8, 167800, false, 17
  ),
  (
    'v14', 'finance', 's5',
    'Unit Economics That Hold Up',
    'CAC, LTV and payback',
    'The three numbers investors will ask about, how to compute them without flattering yourself, and when a cohort is genuinely healthy.',
    1980,
    'https://picsum.photos/seed/continuum-v14/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    array['CAC', 'LTV', 'Payback'], 2025, 4.7, 145300, false, 18
  ),
  (
    'v15', 'finance', 's3',
    'Fundraising Without Losing Control',
    'Terms, dilution and leverage',
    'What each clause in a term sheet actually does, how much dilution is normal, and how to build leverage before you need the money.',
    2640,
    'https://picsum.photos/seed/continuum-v15/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    array['Funding', 'Dilution', 'Terms'], 2024, 4.8, 193600, false, 19
  ),
  (
    'c05', 'finance', 's5',
    'Margin Is a Decision, Not a Result',
    'Insight clip',
    'Where margin really comes from, and where it leaks.',
    300,
    'https://picsum.photos/seed/continuum-c05/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    array['Insight', 'Margin'], 2025, 4.5, 44700, true, 20
  ),
  (
    'v16', 'technology', 's6',
    'AI for Executives',
    'Where it helps, where it doesn''t',
    'A sober map of applied AI in ordinary companies: the tasks worth automating now, the ones to leave alone, and how to run a first pilot.',
    2400,
    'https://picsum.photos/seed/continuum-v16/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    array['AI', 'Automation', 'Productivity'], 2025, 4.9, 246800, false, 21
  ),
  (
    'v17', 'technology', 's6',
    'Automate the Boring Eighty Percent',
    'Tools, workflows, guardrails',
    'Find the repetitive work, remove it in the right order, and put guardrails in place before anything touches a customer.',
    1680,
    'https://picsum.photos/seed/continuum-v17/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    array['Automation', 'Workflow', 'Tools'], 2025, 4.6, 108900, false, 22
  ),
  (
    'v18', 'technology', 's6',
    'Security for Small Teams',
    'The basics that prevent disasters',
    'Six controls that stop the overwhelming majority of real incidents, none of which require a security hire.',
    1500,
    'https://picsum.photos/seed/continuum-v18/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    array['Security', 'Risk', 'Compliance'], 2024, 4.4, 76200, false, 23
  ),
  (
    'c06', 'technology', 's6',
    'Ship Small, Learn Fast',
    'Insight clip',
    'Why the smallest useful release beats the perfect plan.',
    300,
    'https://picsum.photos/seed/continuum-c06/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    array['Insight', 'Delivery'], 2025, 4.3, 35400, true, 24
  ),
  (
    'v19', 'mastery', 's10',
    'Deep Work for Leaders',
    'Protect the hours that matter',
    'A calendar architecture that defends long, uninterrupted blocks in a job designed to interrupt you.',
    1800,
    'https://picsum.photos/seed/continuum-v19/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    array['Focus', 'Energy', 'Habits'], 2025, 4.8, 189500, false, 25
  ),
  (
    'v20', 'mastery', 's10',
    'The Learning Loop',
    'Feedback, practice, repetition',
    'Deliberate practice for people who are already good: pick one micro-skill, get fast feedback, repeat until it is automatic.',
    1620,
    'https://picsum.photos/seed/continuum-v20/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    array['Practice', 'Feedback', 'Growth'], 2025, 4.7, 134100, false, 26
  ),
  (
    'v21', 'mastery', 's10',
    'The Decision Journal',
    'Improve your judgement on paper',
    'A ten-minute weekly habit that turns hindsight into foresight by recording what you expected before you knew the answer.',
    1440,
    'https://picsum.photos/seed/continuum-v21/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    array['Judgement', 'Reflection', 'Decisions'], 2024, 4.6, 91300, false, 27
  ),
  (
    'c07', 'mastery', 's7',
    'Compound Your Craft Daily',
    'Insight clip',
    'The arithmetic of small, relentless improvement.',
    240,
    'https://picsum.photos/seed/continuum-c07/800/450',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    array['Insight', 'Practice'], 2025, 4.5, 41800, true, 28
  )
on conflict (id) do update set
  discipline_id = excluded.discipline_id,
  speaker_id    = excluded.speaker_id,
  title         = excluded.title,
  subtitle      = excluded.subtitle,
  description   = excluded.description,
  duration_sec  = excluded.duration_sec,
  poster_url    = excluded.poster_url,
  video_url     = excluded.video_url,
  tags          = excluded.tags,
  year          = excluded.year,
  rating        = excluded.rating,
  views         = excluded.views,
  is_clip       = excluded.is_clip,
  sort_order    = excluded.sort_order;

-- Curated hero picks, mirroring FEATURED_VIDEO_IDS in the mobile app. Applied as
-- a separate statement so re-running the seed stays idempotent and the bulk
-- insert above never has to carry this flag.
update public.videos set featured = true  where id in ('v10', 'v16', 'v01', 'v04', 'v19');
update public.videos set featured = false where featured and id not in ('v10', 'v16', 'v01', 'v04', 'v19');

commit;
