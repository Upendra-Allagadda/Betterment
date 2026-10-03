export interface GoalTemplate {
  id: string;
  title: string;
  category: string; // e.g. "Health & Energy", "Self-Growth", "Career", "Financial Peace", "Relationships"
  areaName: string;
  areaColor: string;
  areaIcon: string;
  why: string;
  targetDays: number;
  successDefinition: string;
  suggestedCheckpoints: string[];
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: 'tpl-sleep-energy',
    title: '60-Day Energy & Sleep Transformation',
    category: 'Health & Energy',
    areaName: 'Health & Energy',
    areaColor: '#10b981',
    areaIcon: 'activity',
    why: 'Reclaim all-day focus, wake up clear-headed, and have steady physical energy for family and passions.',
    targetDays: 60,
    successDefinition: 'Waking up before the alarm feeling rested and having sustained energy throughout the afternoon 5 days a week.',
    suggestedCheckpoints: [
      'Week 2: Establish a relaxing 30-min wind-down routine without bright screens',
      'Week 4: Optimize sleep environment (cool room, blackout darkness, phone docked outside bedroom)',
      'Week 8: Track steady energy gains and solidify lifelong morning vitality',
    ],
  },
  {
    id: 'tpl-morning-reading',
    title: 'Mindful Morning & Deep Reading Routine',
    category: 'Self-Growth',
    areaName: 'Self-Growth',
    areaColor: '#8b5cf6',
    areaIcon: 'book-open',
    why: 'Expand mental models, disconnect from chaotic notification feeds, and start each morning with calm clarity.',
    targetDays: 90,
    successDefinition: 'Read and capture actionable takeaways from 6 transformative books with a daily 20-minute morning reading block.',
    suggestedCheckpoints: [
      'Week 2: Select 6 foundational books & prepare morning tea/coffee reading space',
      'Week 6: Complete 3 books and write one-page synthesis summaries of key insights',
      'Week 12: Finish reading challenge and review personal operating rules',
    ],
  },
  {
    id: 'tpl-career-skill',
    title: 'Master a High-Impact Professional Skill',
    category: 'Career',
    areaName: 'Career & Calling',
    areaColor: '#3b82f6',
    areaIcon: 'briefcase',
    why: 'Elevate personal craft, deliver high-quality work with confidence, and open senior career advancement opportunities.',
    targetDays: 90,
    successDefinition: 'Successfully design and ship a flagship capability or project showcasing the new skill with peer recognition.',
    suggestedCheckpoints: [
      'Month 1: Grasp core fundamentals through hands-on practice projects',
      'Month 2: Build a functional, production-ready project implementation',
      'Month 3: Present project findings and establish repeatable best practices',
    ],
  },
  {
    id: 'tpl-emergency-fund',
    title: 'Build 3-Month Peace-of-Mind Savings',
    category: 'Finance',
    areaName: 'Financial Peace',
    areaColor: '#f59e0b',
    areaIcon: 'dollar-sign',
    why: 'Sleep soundly knowing sudden emergencies, car repairs, or transitions won\'t cause stress or debt.',
    targetDays: 120,
    successDefinition: 'Dedicated high-yield savings buffer reaches full 3-month essential living costs with automatic transfers.',
    suggestedCheckpoints: [
      'Week 2: Calculate exact 1-month essential baseline spending and eliminate subscription waste',
      'Month 2: Reach Month 1 savings milestone via automated weekly transfers',
      'Month 4: Achieve complete 3-month security buffer and celebrate financial peace of mind',
    ],
  },
  {
    id: 'tpl-weekly-connection',
    title: 'Consistent Weekly Connection Ritual',
    category: 'Relationships',
    areaName: 'Relationships',
    areaColor: '#ec4899',
    areaIcon: 'heart',
    why: 'Nurture deep, loving bonds with key loved ones and family rather than letting life get too busy for connection.',
    targetDays: 60,
    successDefinition: '8 consecutive weeks of protected, device-free quality time and shared experiences with those who matter most.',
    suggestedCheckpoints: [
      'Week 1: Agree upon a protected recurring weekly dinner, walk, or phone date block',
      'Week 4: Plan and execute 2 memorable shared outings or heartfelt conversations',
      'Week 8: Solidify consistent connection habit and reflect on relationship closeness',
    ],
  },
];
