package sqlite

const Schema = `
CREATE TABLE IF NOT EXISTS areas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '#6366f1',
    icon TEXT NOT NULL DEFAULT 'target',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    area_id TEXT NOT NULL,
    title TEXT NOT NULL,
    why TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    target_date TIMESTAMP NOT NULL,
    success_definition TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    progress INTEGER NOT NULL DEFAULT 0,
    start_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goal_comments (
    id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'User',
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    title TEXT NOT NULL,
    target_date TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    order_index INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS actions (
    id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    milestone_id TEXT NOT NULL,
    title TEXT NOT NULL,
    due_date TIMESTAMP,
    priority TEXT NOT NULL DEFAULT 'Medium',
    estimated_effort TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pending',
    notes TEXT NOT NULL DEFAULT '',
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weekly_reviews (
    id TEXT PRIMARY KEY,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    completed_actions_count INTEGER NOT NULL DEFAULT 0,
    missed_actions_count INTEGER NOT NULL DEFAULT 0,
    goals_reviewed_count INTEGER NOT NULL DEFAULT 0,
    what_worked TEXT NOT NULL DEFAULT '',
    what_did_not_work TEXT NOT NULL DEFAULT '',
    what_to_change_next_week TEXT NOT NULL DEFAULT '',
    key_learnings TEXT NOT NULL DEFAULT '',
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goals_area_id ON goals(area_id);
CREATE INDEX IF NOT EXISTS idx_comments_goal_id ON goal_comments(goal_id);
CREATE INDEX IF NOT EXISTS idx_milestones_goal_id ON milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_actions_goal_id ON actions(goal_id);
CREATE INDEX IF NOT EXISTS idx_actions_milestone_id ON actions(milestone_id);
CREATE INDEX IF NOT EXISTS idx_actions_status ON actions(status);
`
