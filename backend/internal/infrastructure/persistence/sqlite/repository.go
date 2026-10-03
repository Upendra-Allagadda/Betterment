package sqlite

import (
	"database/sql"
	"errors"
	"time"

	"betterment/backend/internal/domain"
)

type Repository struct {
	db *DB
}

func NewRepository(db *DB) *Repository {
	return &Repository{db: db}
}

// -------------------------------------------------------------
// Areas
// -------------------------------------------------------------

func (r *Repository) ListAreas() ([]*domain.Area, error) {
	rows, err := r.db.SQL.Query(`
		SELECT id, name, description, color, icon, created_at, updated_at
		FROM areas ORDER BY name ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var areas []*domain.Area
	for rows.Next() {
		var a domain.Area
		if err := rows.Scan(&a.ID, &a.Name, &a.Description, &a.Color, &a.Icon, &a.CreatedAt, &a.UpdatedAt); err != nil {
			return nil, err
		}
		areas = append(areas, &a)
	}
	return areas, nil
}

func (r *Repository) GetAreaByID(id string) (*domain.Area, error) {
	var a domain.Area
	err := r.db.SQL.QueryRow(`
		SELECT id, name, description, color, icon, created_at, updated_at
		FROM areas WHERE id = ?
	`, id).Scan(&a.ID, &a.Name, &a.Description, &a.Color, &a.Icon, &a.CreatedAt, &a.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *Repository) SaveArea(a *domain.Area) error {
	_, err := r.db.SQL.Exec(`
		INSERT INTO areas (id, name, description, color, icon, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			name = excluded.name,
			description = excluded.description,
			color = excluded.color,
			icon = excluded.icon,
			updated_at = excluded.updated_at
	`, a.ID, a.Name, a.Description, a.Color, a.Icon, a.CreatedAt, a.UpdatedAt)
	return err
}

func (r *Repository) DeleteArea(id string) error {
	res, err := r.db.SQL.Exec(`DELETE FROM areas WHERE id = ?`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return domain.ErrNotFound
	}
	return nil
}

// -------------------------------------------------------------
// Goals
// -------------------------------------------------------------

func (r *Repository) ListGoals(statusFilter, areaIDFilter string) ([]*domain.Goal, error) {
	query := `
		SELECT id, area_id, title, why, description, target_date, success_definition, status, progress, start_date, created_at, updated_at
		FROM goals WHERE 1=1
	`
	var args []any
	if statusFilter != "" {
		query += " AND status = ?"
		args = append(args, statusFilter)
	}
	if areaIDFilter != "" {
		query += " AND area_id = ?"
		args = append(args, areaIDFilter)
	}
	query += " ORDER BY target_date ASC, created_at DESC"

	rows, err := r.db.SQL.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var goals []*domain.Goal
	for rows.Next() {
		var g domain.Goal
		if err := rows.Scan(&g.ID, &g.AreaID, &g.Title, &g.Why, &g.Description, &g.TargetDate, &g.SuccessDefinition, &g.Status, &g.Progress, &g.StartDate, &g.CreatedAt, &g.UpdatedAt); err != nil {
			return nil, err
		}
		goals = append(goals, &g)
	}
	return goals, nil
}

func (r *Repository) GetGoalByID(id string) (*domain.Goal, error) {
	var g domain.Goal
	err := r.db.SQL.QueryRow(`
		SELECT id, area_id, title, why, description, target_date, success_definition, status, progress, start_date, created_at, updated_at
		FROM goals WHERE id = ?
	`, id).Scan(&g.ID, &g.AreaID, &g.Title, &g.Why, &g.Description, &g.TargetDate, &g.SuccessDefinition, &g.Status, &g.Progress, &g.StartDate, &g.CreatedAt, &g.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &g, nil
}

func (r *Repository) SaveGoal(g *domain.Goal) error {
	_, err := r.db.SQL.Exec(`
		INSERT INTO goals (id, area_id, title, why, description, target_date, success_definition, status, progress, start_date, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			area_id = excluded.area_id,
			title = excluded.title,
			why = excluded.why,
			description = excluded.description,
			target_date = excluded.target_date,
			success_definition = excluded.success_definition,
			status = excluded.status,
			progress = excluded.progress,
			updated_at = excluded.updated_at
	`, g.ID, g.AreaID, g.Title, g.Why, g.Description, g.TargetDate, g.SuccessDefinition, g.Status, g.Progress, g.StartDate, g.CreatedAt, g.UpdatedAt)
	return err
}

func (r *Repository) DeleteGoal(id string) error {
	res, err := r.db.SQL.Exec(`DELETE FROM goals WHERE id = ?`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return domain.ErrNotFound
	}
	return nil
}

// -------------------------------------------------------------
// Milestones
// -------------------------------------------------------------

func (r *Repository) ListMilestonesByGoalID(goalID string) ([]*domain.Milestone, error) {
	rows, err := r.db.SQL.Query(`
		SELECT id, goal_id, title, target_date, status, order_index, completed_at, created_at, updated_at
		FROM milestones WHERE goal_id = ? ORDER BY order_index ASC, target_date ASC
	`, goalID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var milestones []*domain.Milestone
	for rows.Next() {
		var m domain.Milestone
		var compAt sql.NullTime
		if err := rows.Scan(&m.ID, &m.GoalID, &m.Title, &m.TargetDate, &m.Status, &m.Order, &compAt, &m.CreatedAt, &m.UpdatedAt); err != nil {
			return nil, err
		}
		if compAt.Valid {
			m.CompletedAt = &compAt.Time
		}
		milestones = append(milestones, &m)
	}
	return milestones, nil
}

func (r *Repository) GetMilestoneByID(id string) (*domain.Milestone, error) {
	var m domain.Milestone
	var compAt sql.NullTime
	err := r.db.SQL.QueryRow(`
		SELECT id, goal_id, title, target_date, status, order_index, completed_at, created_at, updated_at
		FROM milestones WHERE id = ?
	`, id).Scan(&m.ID, &m.GoalID, &m.Title, &m.TargetDate, &m.Status, &m.Order, &compAt, &m.CreatedAt, &m.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if compAt.Valid {
		m.CompletedAt = &compAt.Time
	}
	return &m, nil
}

func (r *Repository) SaveMilestone(m *domain.Milestone) error {
	var compAt sql.NullTime
	if m.CompletedAt != nil {
		compAt = sql.NullTime{Time: *m.CompletedAt, Valid: true}
	}
	_, err := r.db.SQL.Exec(`
		INSERT INTO milestones (id, goal_id, title, target_date, status, order_index, completed_at, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			title = excluded.title,
			target_date = excluded.target_date,
			status = excluded.status,
			order_index = excluded.order_index,
			completed_at = excluded.completed_at,
			updated_at = excluded.updated_at
	`, m.ID, m.GoalID, m.Title, m.TargetDate, m.Status, m.Order, compAt, m.CreatedAt, m.UpdatedAt)
	return err
}

func (r *Repository) DeleteMilestone(id string) error {
	res, err := r.db.SQL.Exec(`DELETE FROM milestones WHERE id = ?`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return domain.ErrNotFound
	}
	return nil
}

// -------------------------------------------------------------
// Actions
// -------------------------------------------------------------

func (r *Repository) ListActionsByGoalID(goalID string) ([]*domain.Action, error) {
	rows, err := r.db.SQL.Query(`
		SELECT a.id, a.goal_id, a.milestone_id, a.title, a.due_date, a.priority, a.estimated_effort, a.status, a.notes, a.completed_at, a.created_at, a.updated_at,
		       g.title as goal_title, m.title as milestone_title, ar.name as area_name, ar.color as area_color
		FROM actions a
		JOIN goals g ON a.goal_id = g.id
		JOIN milestones m ON a.milestone_id = m.id
		JOIN areas ar ON g.area_id = ar.id
		WHERE a.goal_id = ?
		ORDER BY a.status ASC, a.due_date ASC, a.created_at DESC
	`, goalID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanActions(rows)
}

func (r *Repository) ListActionsByMilestoneID(milestoneID string) ([]*domain.Action, error) {
	rows, err := r.db.SQL.Query(`
		SELECT a.id, a.goal_id, a.milestone_id, a.title, a.due_date, a.priority, a.estimated_effort, a.status, a.notes, a.completed_at, a.created_at, a.updated_at,
		       g.title as goal_title, m.title as milestone_title, ar.name as area_name, ar.color as area_color
		FROM actions a
		JOIN goals g ON a.goal_id = g.id
		JOIN milestones m ON a.milestone_id = m.id
		JOIN areas ar ON g.area_id = ar.id
		WHERE a.milestone_id = ?
		ORDER BY a.status ASC, a.due_date ASC, a.created_at DESC
	`, milestoneID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanActions(rows)
}

// ListDailyActions fetches pending actions due today or earlier, along with recently completed actions (FDR §8).
func (r *Repository) ListDailyActions() ([]*domain.Action, error) {
	rows, err := r.db.SQL.Query(`
		SELECT a.id, a.goal_id, a.milestone_id, a.title, a.due_date, a.priority, a.estimated_effort, a.status, a.notes, a.completed_at, a.created_at, a.updated_at,
		       g.title as goal_title, m.title as milestone_title, ar.name as area_name, ar.color as area_color
		FROM actions a
		JOIN goals g ON a.goal_id = g.id
		JOIN milestones m ON a.milestone_id = m.id
		JOIN areas ar ON g.area_id = ar.id
		WHERE g.status = 'Active'
		ORDER BY 
			CASE WHEN a.status = 'Pending' THEN 0 ELSE 1 END,
			CASE WHEN a.priority = 'High' THEN 0 WHEN a.priority = 'Medium' THEN 1 ELSE 2 END,
			a.due_date ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanActions(rows)
}

func (r *Repository) GetActionByID(id string) (*domain.Action, error) {
	row := r.db.SQL.QueryRow(`
		SELECT a.id, a.goal_id, a.milestone_id, a.title, a.due_date, a.priority, a.estimated_effort, a.status, a.notes, a.completed_at, a.created_at, a.updated_at,
		       g.title as goal_title, m.title as milestone_title, ar.name as area_name, ar.color as area_color
		FROM actions a
		JOIN goals g ON a.goal_id = g.id
		JOIN milestones m ON a.milestone_id = m.id
		JOIN areas ar ON g.area_id = ar.id
		WHERE a.id = ?
	`, id)

	var a domain.Action
	var dueDate, compAt sql.NullTime
	err := row.Scan(
		&a.ID, &a.GoalID, &a.MilestoneID, &a.Title, &dueDate, &a.Priority, &a.EstimatedEffort,
		&a.Status, &a.Notes, &compAt, &a.CreatedAt, &a.UpdatedAt,
		&a.GoalTitle, &a.MilestoneTitle, &a.AreaName, &a.AreaColor,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if dueDate.Valid {
		a.DueDate = &dueDate.Time
	}
	if compAt.Valid {
		a.CompletedAt = &compAt.Time
	}
	return &a, nil
}

func (r *Repository) SaveAction(a *domain.Action) error {
	var dueDate, compAt sql.NullTime
	if a.DueDate != nil {
		dueDate = sql.NullTime{Time: *a.DueDate, Valid: true}
	}
	if a.CompletedAt != nil {
		compAt = sql.NullTime{Time: *a.CompletedAt, Valid: true}
	}

	_, err := r.db.SQL.Exec(`
		INSERT INTO actions (id, goal_id, milestone_id, title, due_date, priority, estimated_effort, status, notes, completed_at, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			title = excluded.title,
			milestone_id = excluded.milestone_id,
			due_date = excluded.due_date,
			priority = excluded.priority,
			estimated_effort = excluded.estimated_effort,
			status = excluded.status,
			notes = excluded.notes,
			completed_at = excluded.completed_at,
			updated_at = excluded.updated_at
	`, a.ID, a.GoalID, a.MilestoneID, a.Title, dueDate, a.Priority, a.EstimatedEffort, a.Status, a.Notes, compAt, a.CreatedAt, a.UpdatedAt)
	return err
}

func (r *Repository) DeleteAction(id string) error {
	res, err := r.db.SQL.Exec(`DELETE FROM actions WHERE id = ?`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func scanActions(rows *sql.Rows) ([]*domain.Action, error) {
	var actions []*domain.Action
	for rows.Next() {
		var a domain.Action
		var dueDate, compAt sql.NullTime
		if err := rows.Scan(
			&a.ID, &a.GoalID, &a.MilestoneID, &a.Title, &dueDate, &a.Priority, &a.EstimatedEffort,
			&a.Status, &a.Notes, &compAt, &a.CreatedAt, &a.UpdatedAt,
			&a.GoalTitle, &a.MilestoneTitle, &a.AreaName, &a.AreaColor,
		); err != nil {
			return nil, err
		}
		if dueDate.Valid {
			a.DueDate = &dueDate.Time
		}
		if compAt.Valid {
			a.CompletedAt = &compAt.Time
		}
		actions = append(actions, &a)
	}
	return actions, nil
}

// -------------------------------------------------------------
// Weekly Reviews
// -------------------------------------------------------------

func (r *Repository) ListWeeklyReviews() ([]*domain.WeeklyReview, error) {
	rows, err := r.db.SQL.Query(`
		SELECT id, start_date, end_date, status, completed_actions_count, missed_actions_count, goals_reviewed_count,
		       what_worked, what_did_not_work, what_to_change_next_week, key_learnings, completed_at, created_at, updated_at
		FROM weekly_reviews
		ORDER BY start_date DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []*domain.WeeklyReview
	for rows.Next() {
		var rev domain.WeeklyReview
		var compAt sql.NullTime
		if err := rows.Scan(
			&rev.ID, &rev.StartDate, &rev.EndDate, &rev.Status, &rev.CompletedActionsCount, &rev.MissedActionsCount,
			&rev.GoalsReviewedCount, &rev.WhatWorked, &rev.WhatDidNotWork, &rev.WhatToChangeNextWeek,
			&rev.KeyLearnings, &compAt, &rev.CreatedAt, &rev.UpdatedAt,
		); err != nil {
			return nil, err
		}
		if compAt.Valid {
			rev.CompletedAt = &compAt.Time
		}
		reviews = append(reviews, &rev)
	}
	return reviews, nil
}

func (r *Repository) GetWeeklyReviewByID(id string) (*domain.WeeklyReview, error) {
	row := r.db.SQL.QueryRow(`
		SELECT id, start_date, end_date, status, completed_actions_count, missed_actions_count, goals_reviewed_count,
		       what_worked, what_did_not_work, what_to_change_next_week, key_learnings, completed_at, created_at, updated_at
		FROM weekly_reviews WHERE id = ?
	`, id)

	var rev domain.WeeklyReview
	var compAt sql.NullTime
	err := row.Scan(
		&rev.ID, &rev.StartDate, &rev.EndDate, &rev.Status, &rev.CompletedActionsCount, &rev.MissedActionsCount,
		&rev.GoalsReviewedCount, &rev.WhatWorked, &rev.WhatDidNotWork, &rev.WhatToChangeNextWeek,
		&rev.KeyLearnings, &compAt, &rev.CreatedAt, &rev.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if compAt.Valid {
		rev.CompletedAt = &compAt.Time
	}
	return &rev, nil
}

func (r *Repository) SaveWeeklyReview(rev *domain.WeeklyReview) error {
	var compAt sql.NullTime
	if rev.CompletedAt != nil {
		compAt = sql.NullTime{Time: *rev.CompletedAt, Valid: true}
	}
	_, err := r.db.SQL.Exec(`
		INSERT INTO weekly_reviews (id, start_date, end_date, status, completed_actions_count, missed_actions_count, goals_reviewed_count, what_worked, what_did_not_work, what_to_change_next_week, key_learnings, completed_at, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			status = excluded.status,
			completed_actions_count = excluded.completed_actions_count,
			missed_actions_count = excluded.missed_actions_count,
			goals_reviewed_count = excluded.goals_reviewed_count,
			what_worked = excluded.what_worked,
			what_did_not_work = excluded.what_did_not_work,
			what_to_change_next_week = excluded.what_to_change_next_week,
			key_learnings = excluded.key_learnings,
			completed_at = excluded.completed_at,
			updated_at = excluded.updated_at
	`, rev.ID, rev.StartDate, rev.EndDate, rev.Status, rev.CompletedActionsCount, rev.MissedActionsCount, rev.GoalsReviewedCount, rev.WhatWorked, rev.WhatDidNotWork, rev.WhatToChangeNextWeek, rev.KeyLearnings, compAt, rev.CreatedAt, rev.UpdatedAt)
	return err
}

// -------------------------------------------------------------
// Capacity and Breakdown Queries (FDR §16)
// -------------------------------------------------------------

func (r *Repository) GetCapacityAssessment() (domain.CapacityAssessment, error) {
	areas, err := r.ListAreas()
	if err != nil {
		return domain.CapacityAssessment{}, err
	}

	var breakdowns []domain.AreaCommitment
	now := time.Now().UTC()

	for _, a := range areas {
		var activeGoals int
		_ = r.db.SQL.QueryRow(`SELECT COUNT(*) FROM goals WHERE area_id = ? AND status = 'Active'`, a.ID).Scan(&activeGoals)

		var pendingActions int
		_ = r.db.SQL.QueryRow(`
			SELECT COUNT(*) FROM actions act
			JOIN goals g ON act.goal_id = g.id
			WHERE g.area_id = ? AND act.status = 'Pending' AND g.status = 'Active'
		`, a.ID).Scan(&pendingActions)

		var overdueActions int
		_ = r.db.SQL.QueryRow(`
			SELECT COUNT(*) FROM actions act
			JOIN goals g ON act.goal_id = g.id
			WHERE g.area_id = ? AND act.status = 'Pending' AND g.status = 'Active' AND act.due_date < ?
		`, a.ID, now).Scan(&overdueActions)

		breakdowns = append(breakdowns, domain.AreaCommitment{
			AreaID:           a.ID,
			AreaName:         a.Name,
			AreaColor:        a.Color,
			ActiveGoalsCount: activeGoals,
			PendingActions:   pendingActions,
			OverdueActions:   overdueActions,
		})
	}

	return domain.EvaluateCapacity(breakdowns), nil
}

// -------------------------------------------------------------
// Goal Comments
// -------------------------------------------------------------

func (r *Repository) ListCommentsByGoalID(goalID string) ([]*domain.Comment, error) {
	rows, err := r.db.SQL.Query(`
		SELECT id, goal_id, author, content, created_at
		FROM goal_comments
		WHERE goal_id = ?
		ORDER BY created_at ASC
	`, goalID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []*domain.Comment
	for rows.Next() {
		var c domain.Comment
		if err := rows.Scan(&c.ID, &c.GoalID, &c.Author, &c.Content, &c.CreatedAt); err != nil {
			return nil, err
		}
		comments = append(comments, &c)
	}
	return comments, nil
}

func (r *Repository) SaveComment(c *domain.Comment) error {
	_, err := r.db.SQL.Exec(`
		INSERT INTO goal_comments (id, goal_id, author, content, created_at)
		VALUES (?, ?, ?, ?, ?)
	`, c.ID, c.GoalID, c.Author, c.Content, c.CreatedAt)
	return err
}

func (r *Repository) ClearAll() error {
	_, _ = r.db.SQL.Exec(`DELETE FROM goal_comments`)
	_, _ = r.db.SQL.Exec(`DELETE FROM actions`)
	_, _ = r.db.SQL.Exec(`DELETE FROM milestones`)
	_, _ = r.db.SQL.Exec(`DELETE FROM goals`)
	_, _ = r.db.SQL.Exec(`DELETE FROM weekly_reviews`)
	_, _ = r.db.SQL.Exec(`DELETE FROM areas`)
	return nil
}
