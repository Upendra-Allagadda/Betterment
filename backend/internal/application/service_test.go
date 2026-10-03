package application_test

import (
	"path/filepath"
	"testing"
	"time"

	"betterment/backend/internal/application"
	"betterment/backend/internal/domain"
	"betterment/backend/internal/infrastructure/persistence/sqlite"
)

func setupTestService(t *testing.T) *application.Service {
	t.Helper()
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test.db")
	db, err := sqlite.NewDB(dbPath)
	if err != nil {
		t.Fatalf("failed to create test db: %v", err)
	}
	repo := sqlite.NewRepository(db)
	return application.NewService(repo)
}

func TestService_CoreLoop(t *testing.T) {
	svc := setupTestService(t)

	// 1. Create Area
	area, err := svc.CreateArea(application.CreateAreaInput{
		Name:        "Career",
		Description: "Professional growth",
		Color:       "#3b82f6",
		Icon:        "briefcase",
	})
	if err != nil {
		t.Fatalf("failed to create area: %v", err)
	}

	// 2. Define Goal (FDR §6: What, Why, By When, Success Definition)
	targetDate := time.Now().Add(60 * 24 * time.Hour)
	goal, err := svc.CreateGoal(application.CreateGoalInput{
		AreaID:            area.ID,
		Title:             "Master Distributed Systems in Go",
		Why:               "Lead core platform architecture",
		TargetDate:        targetDate,
		SuccessDefinition: "Deploy Raft-based consensus cluster",
		Status:            domain.GoalStatusActive,
	})
	if err != nil {
		t.Fatalf("failed to create goal: %v", err)
	}

	// 3. Plan Milestones (Goal -> Milestones)
	ms1, err := svc.CreateMilestone(application.CreateMilestoneInput{
		GoalID:     goal.ID,
		Title:      "Understand Raft paper and RPCs",
		TargetDate: time.Now().Add(14 * 24 * time.Hour),
		Order:      1,
	})
	if err != nil {
		t.Fatalf("failed to create milestone: %v", err)
	}

	ms2, err := svc.CreateMilestone(application.CreateMilestoneInput{
		GoalID:     goal.ID,
		Title:      "Implement leader election and log replication",
		TargetDate: time.Now().Add(30 * 24 * time.Hour),
		Order:      2,
	})
	if err != nil {
		t.Fatalf("failed to create milestone: %v", err)
	}
	_ = ms2

	// 4. Create Actions (Milestone -> Actions)
	tomorrow := time.Now().Add(24 * time.Hour)
	act, err := svc.CreateAction(application.CreateActionInput{
		GoalID:          goal.ID,
		MilestoneID:     ms1.ID,
		Title:           "Read Section 5 of Diego Ongaro's Raft dissertation",
		DueDate:         &tomorrow,
		Priority:        domain.ActionPriorityHigh,
		EstimatedEffort: "45m",
		Notes:           "Take structured notes on safety invariants",
	})
	if err != nil {
		t.Fatalf("failed to create action: %v", err)
	}

	// 5. Execute Action (1-click completion)
	toggledAct, err := svc.ToggleAction(act.ID)
	if err != nil {
		t.Fatalf("failed to toggle action: %v", err)
	}
	if toggledAct.Status != domain.ActionStatusCompleted {
		t.Errorf("expected action to be completed, got: %s", toggledAct.Status)
	}

	// 6. Complete Milestone -> triggers automatic progress sync
	completedMs, err := svc.ToggleMilestone(ms1.ID)
	if err != nil {
		t.Fatalf("failed to toggle milestone: %v", err)
	}
	if completedMs.Status != domain.MilestoneStatusCompleted {
		t.Errorf("expected milestone to be completed")
	}

	updatedGoal, _, _, err := svc.GetGoalDetails(goal.ID)
	if err != nil {
		t.Fatalf("failed to get goal: %v", err)
	}
	if updatedGoal.Progress != 50 { // 1 of 2 milestones completed
		t.Errorf("expected goal progress to be 50%%, got: %d", updatedGoal.Progress)
	}

	// 7. Weekly Review
	rev, err := svc.StartWeeklyReview()
	if err != nil {
		t.Fatalf("failed to start weekly review: %v", err)
	}
	if rev.GoalsReviewedCount != 1 {
		t.Errorf("expected 1 reviewed goal, got: %d", rev.GoalsReviewedCount)
	}

	closedRev, err := svc.CompleteWeeklyReview(rev.ID, application.CompleteReviewInput{
		WhatWorked:           "Morning focused sprint on Raft invariants",
		WhatDidNotWork:       "Distractions during afternoon",
		WhatToChangeNextWeek: "Protect 8-10am slot without checking messages",
		KeyLearnings:         "Raft state machine safety is simpler than Paxos",
	})
	if err != nil {
		t.Fatalf("failed to complete weekly review: %v", err)
	}
	if closedRev.Status != domain.ReviewStatusCompleted {
		t.Errorf("expected review status Completed, got: %s", closedRev.Status)
	}
}

func TestService_SeedData(t *testing.T) {
	svc := setupTestService(t)
	if err := svc.SeedRealisticData(); err != nil {
		t.Fatalf("seed failed: %v", err)
	}

	areas, _ := svc.ListAreas()
	if len(areas) != 4 {
		t.Errorf("expected 4 seeded areas, got: %d", len(areas))
	}

	goals, _ := svc.ListGoals("Active", "")
	if len(goals) != 3 {
		t.Errorf("expected 3 active seeded goals, got: %d", len(goals))
	}

	actions, _ := svc.ListDailyActions()
	if len(actions) == 0 {
		t.Errorf("expected daily actions to be populated")
	}
}

func TestService_GoalUpdatesAndComments(t *testing.T) {
	svc := setupTestService(t)

	area, _ := svc.CreateArea(application.CreateAreaInput{Name: "Growth", Color: "#8b5cf6", Icon: "book-open"})
	goal, err := svc.CreateGoal(application.CreateGoalInput{
		AreaID:            area.ID,
		Title:             "Master TypeScript Generics",
		Why:               "Write bulletproof type systems",
		Description:       "Study conditional types, template literals, and infer keyword",
		TargetDate:        time.Now().Add(30 * 24 * time.Hour),
		SuccessDefinition: "Build type-safe ORM query builder",
		Status:            domain.GoalStatusActive,
	})
	if err != nil {
		t.Fatalf("failed to create goal: %v", err)
	}
	if goal.Description != "Study conditional types, template literals, and infer keyword" {
		t.Errorf("unexpected description: %s", goal.Description)
	}

	// Update goal description
	newDesc := "Updated detailed roadmap"
	updated, err := svc.UpdateGoal(goal.ID, application.UpdateGoalInput{
		Description: &newDesc,
	})
	if err != nil {
		t.Fatalf("failed to update goal: %v", err)
	}
	if updated.Description != newDesc {
		t.Errorf("expected updated description %s, got: %s", newDesc, updated.Description)
	}

	// Create action directly under goal without specifying milestone
	act, err := svc.CreateAction(application.CreateActionInput{
		GoalID:   goal.ID,
		Title:    "Solve 10 Type Challenges (Medium)",
		Priority: domain.ActionPriorityHigh,
	})
	if err != nil {
		t.Fatalf("failed to create action directly under goal: %v", err)
	}
	if act.MilestoneID == "" {
		t.Errorf("expected action to auto-resolve a milestone")
	}

	// Add comments
	comment, err := svc.AddGoalComment(goal.ID, application.CreateCommentInput{
		Author:  "Dev",
		Content: "Completed distributive conditional types challenge!",
	})
	if err != nil {
		t.Fatalf("failed to add comment: %v", err)
	}
	if comment.Content != "Completed distributive conditional types challenge!" {
		t.Errorf("unexpected comment content: %s", comment.Content)
	}

	comments, err := svc.ListGoalComments(goal.ID)
	if err != nil {
		t.Fatalf("failed to list comments: %v", err)
	}
	if len(comments) != 1 {
		t.Errorf("expected 1 comment, got: %d", len(comments))
	}
}
