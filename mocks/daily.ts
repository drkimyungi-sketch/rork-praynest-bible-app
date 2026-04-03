export interface DailyScripture {
  id: string;
  date: string;
  verse: string;
  reference: string;
  reflection: string;
  topic: string;
}

export const dailyScriptures: DailyScripture[] = [
  {
    id: "1",
    date: "Today",
    verse: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
    reference: "Proverbs 3:5-6",
    reflection: "When we surrender our plans to God, He promises to guide our steps. Today, let go of the need to control every outcome and trust that His path for you is perfect.",
    topic: "Trust",
  },
  {
    id: "2",
    date: "Yesterday",
    verse: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    reference: "John 3:16",
    reflection: "The depth of God's love is beyond measure. He gave His most precious gift so that we could live eternally. Rest in the knowledge that you are deeply, sacrificially loved.",
    topic: "Love",
  },
  {
    id: "3",
    date: "2 days ago",
    verse: "The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters.",
    reference: "Psalm 23:1-2",
    reflection: "God is our provider and protector. In seasons of plenty and in seasons of lack, He is faithful. Let His peace wash over you as you rest in His provision today.",
    topic: "Peace",
  },
  {
    id: "4",
    date: "3 days ago",
    verse: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    reference: "Romans 8:28",
    reflection: "Even in trials, God is weaving together a beautiful story. What seems broken today may be the very thing He uses to build something extraordinary tomorrow.",
    topic: "Hope",
  },
  {
    id: "5",
    date: "4 days ago",
    verse: "I can do all things through Christ which strengtheneth me.",
    reference: "Philippians 4:13",
    reflection: "Your strength is not your own — it comes from the One who created the universe. Face today's challenges knowing that His power flows through you.",
    topic: "Strength",
  },
  {
    id: "6",
    date: "5 days ago",
    verse: "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.",
    reference: "Psalm 46:10",
    reflection: "In the noise and rush of life, God invites us to simply be still. In the quiet, we discover His presence and His sovereignty over all things.",
    topic: "Stillness",
  },
];
