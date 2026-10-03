package domain_test

import (
	"testing"
	"time"

	"betterment/backend/internal/domain"
)

func TestNewGoal_Validation(t *testing.T) {
	now := time.Now()
	targetDate := now.Add(30 * 24 * time.Hour)

	// Valid goal
	g, err := domain.NewGoal(
		"goal-1",
		"area-1",
		"Become capable of building production-grade Go services",
		"To advance as a senior backend engineer",
		targetDate,
		"Deploy a concurrent microservice handling 1k rps",
		domain.GoalStatusActive,
	)
	if err != nil {
		t.Fatalf("expected valid goal creation, got err: %v", err)
	}
	if g.Title != "Become capable of building production-grade Go services" {
		t.Errorf("unexpected title: %s", g.Title)
	}
	if g.Progress != 0 {
		t.Errorf("expected 0 initial progress, got %d", g.Progress)
	}

	// Missing Why
	_, err = domain.NewGoal("goal-2", "area-1", "Learn Go", "", targetDate, "Score 100", domain.GoalStatusDraft)
	if err != domain.ErrGoalIncomplete {
		t.Errorf("expected ErrGoalIncomplete, got: %v", err)
	}

	// Missing Success Definition
	_, err = domain.NewGoal("goal-3", "area-1", "Learn Go", "Career", targetDate, "", domain.GoalStatusDraft)
	if err != domain.ErrGoalIncomplete {
		t.Errorf("expected ErrGoalIncomplete, got: %v", err)
	}
}

func TestGoal_LifecycleTransitions(t *testing.T) {
	targetDate := time.Now().Add(30 * 24 * time.Hour)
	g, err := domain.NewGoal(
		"goal-1",
		"area-1",
		"Pass Marathon Under 4 Hours",
		"Improve physical stamina and endurance",
		targetDate,
		"Complete official marathon in < 4:00:00",
		domain.GoalStatusDraft,
	)
	if err != nil {
		t.Fatal(err)
	}

	// Draft -> Active
	if err := g.TransitionStatus(domain.GoalStatusActive); err != nil {
		t.Fatalf("expected transition Draft -> Active to succeed, got %v", err)
	}
	if g.Status != domain.GoalStatusActive {
		t.Errorf("expected status Active, got %s", g.Status)
	}

	// Active -> Paused
	if err := g.TransitionStatus(domain.GoalStatusPaused); err != nil {
		t.Fatalf("expected transition Active -> Paused to succeed, got %v", err)
	}

	// Paused -> Completed is invalid directly (must be active or abandoned)
	if err := g.TransitionStatus(domain.GoalStatusCompleted); err != domain.ErrInvalidStatus {
		t.Errorf("expected ErrInvalidStatus for Paused -> Completed, got %v", err)
	}

	// Paused -> Active
	if err := g.TransitionStatus(domain.GoalStatusActive); err != nil {
		t.Fatalf("expected transition Paused -> Active to succeed, got %v", err)
	}

	// Active -> Completed
	if err := g.TransitionStatus(domain.GoalStatusCompleted); err != nil {
		t.Fatalf("expected transition Active -> Completed to succeed, got %v", err)
	}
	if g.Progress != 100 {
		t.Errorf("expected progress to be 100 upon completion, got %d", g.Progress)
	}
}

func TestAction_TraceabilityAndDueDates(t *testing.T) {
	now := time.Now()
	yesterday := now.Add(-24 * time.Hour)
	tomorrow := now.Add(24 * time.Hour)

	// Action missing milestone/goal ID
	_, err := domain.NewAction("act-0", "", "ms-1", "Do something", &tomorrow, domain.ActionPriorityHigh, "30m", "")
	if err != domain.ErrMilestoneRequired {
		t.Errorf("expected ErrMilestoneRequired, got %v", err)
	}

	// Overdue action
	actOverdue, err := domain.NewAction("act-1", "g-1", "ms-1", "Build Kafka producer", &yesterday, domain.ActionPriorityHigh, "1h", "Check docs")
	if err != nil {
		t.Fatal(err)
	}
	if !actOverdue.IsOverdue(now) {
		t.Errorf("expected action to be overdue")
	}

	// Complete action
	actOverdue.Complete()
	if actOverdue.Status != domain.ActionStatusCompleted {
		t.Errorf("expected status Completed, got %s", actOverdue.Status)
	}
	if actOverdue.IsOverdue(now) {
		t.Errorf("completed action should not be considered overdue")
	}
}

func TestEvaluateCapacity_OverloadWarning(t *testing.T) {
	commitments := []domain.AreaCommitment{
		{AreaID: "a-1", AreaName: "Career", ActiveGoalsCount: 3, PendingActions: 10, OverdueActions: 1},
		{AreaID: "a-2", AreaName: "Health", ActiveGoalsCount: 2, PendingActions: 8, OverdueActions: 0},
		{AreaID: "a-3", AreaName: "Finance", ActiveGoalsCount: 2, PendingActions: 5, OverdueActions: 2},
	}

	assessment := domain.EvaluateCapacity(commitments)
	if assessment.TotalActiveGoals != 7 {
		t.Errorf("expected 7 active goals, got %d", assessment.TotalActiveGoals)
	}
	if !assessment.IsOvercommitted {
		t.Errorf("expected isOvercommitted to be true for 7 active goals")
	}
	if assessment.OverloadWarning == "" {
		t.Errorf("expected overload warning message")
	}
}
