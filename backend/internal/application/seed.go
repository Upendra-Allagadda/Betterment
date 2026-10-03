package application

import (
	"time"

	"betterment/backend/internal/domain"
	"github.com/google/uuid"
)

// SeedRealisticData seeds the database with initial areas, goals, milestones, actions, and a past review.
func (s *Service) SeedRealisticData() error {
	existingAreas, err := s.repo.ListAreas()
	if err == nil && len(existingAreas) > 0 {
		return nil // already seeded
	}

	now := time.Now().UTC()
	today := time.Date(now.Year(), now.Month(), now.Day(), 12, 0, 0, 0, time.UTC)
	yesterday := today.AddDate(0, 0, -1)
	tomorrow := today.AddDate(0, 0, 1)
	inThreeDays := today.AddDate(0, 0, 3)

	// 1. Life Areas
	careerArea, _ := domain.NewArea(uuid.New().String(), "Career & Engineering", "Professional craft, systems design, and technical mastery", "#3b82f6", "briefcase")
	fitnessArea, _ := domain.NewArea(uuid.New().String(), "Health & Fitness", "Physical energy, cardiovascular endurance, and recovery", "#10b981", "activity")
	learningArea, _ := domain.NewArea(uuid.New().String(), "Learning & Systems", "Mental models, deep reading, and cognitive frameworks", "#8b5cf6", "book-open")
	financeArea, _ := domain.NewArea(uuid.New().String(), "Personal Finance", "Wealth accumulation, budgeting, and investment discipline", "#f59e0b", "dollar-sign")

	for _, a := range []*domain.Area{careerArea, fitnessArea, learningArea, financeArea} {
		_ = s.repo.SaveArea(a)
	}

	// 2. Goal 1: Career Go Services
	goGoal, _ := domain.NewGoal(
		uuid.New().String(),
		careerArea.ID,
		"Become capable of building production-grade Go services",
		"Transition to senior distributed systems engineering and lead high-throughput microservice architecture.",
		today.AddDate(0, 3, 0),
		"Design, build, and deploy an end-to-end event-driven service in Go with gRPC, Kafka, SQLite, and full telemetry sustaining 2,000 req/sec.",
		domain.GoalStatusActive,
	)
	_ = s.repo.SaveGoal(goGoal)

	ms1, _ := domain.NewMilestone(uuid.New().String(), goGoal.ID, "Master Go Concurrency Patterns & Channels", today.AddDate(0, -1, 0), 1)
	ms1.Complete()
	_ = s.repo.SaveMilestone(ms1)

	ms2, _ := domain.NewMilestone(uuid.New().String(), goGoal.ID, "Build gRPC Microservice with Protobuf", today.AddDate(0, 0, -5), 2)
	ms2.Complete()
	_ = s.repo.SaveMilestone(ms2)

	ms3, _ := domain.NewMilestone(uuid.New().String(), goGoal.ID, "Implement Event Sourcing with Kafka Consumer", today.AddDate(0, 0, 14), 3)
	_ = s.repo.SaveMilestone(ms3)

	ms4, _ := domain.NewMilestone(uuid.New().String(), goGoal.ID, "Production Telemetry with OpenTelemetry & Metrics", today.AddDate(0, 1, 0), 4)
	_ = s.repo.SaveMilestone(ms4)

	// Actions for Go Goal
	actGo1, _ := domain.NewAction(uuid.New().String(), goGoal.ID, ms3.ID, "Implement Kafka consumer worker pool with graceful cancellation", &today, domain.ActionPriorityHigh, "45m", "Use context.WithCancel and sync.WaitGroup")
	_ = s.repo.SaveAction(actGo1)

	actGo2, _ := domain.NewAction(uuid.New().String(), goGoal.ID, ms3.ID, "Write table-driven benchmark tests for channel buffers", &tomorrow, domain.ActionPriorityMedium, "30m", "Compare 100 vs 1000 buffer sizes under load")
	_ = s.repo.SaveAction(actGo2)

	actGo3, _ := domain.NewAction(uuid.New().String(), goGoal.ID, ms4.ID, "Setup OpenTelemetry tracer with Jaeger integration", &inThreeDays, domain.ActionPriorityMedium, "1h", "Trace HTTP & gRPC request spans")
	_ = s.repo.SaveAction(actGo3)

	_ = s.syncGoalProgress(goGoal.ID)

	// 3. Goal 2: 10K Road Race
	runGoal, _ := domain.NewGoal(
		uuid.New().String(),
		fitnessArea.ID,
		"Run a 10K Road Race Under 50 Minutes",
		"Rebuild cardiovascular endurance, mental stamina, and daily energetic clarity.",
		today.AddDate(0, 2, 0),
		"Cross the official 10K timing mat with sub-5:00/km average pace without injuries.",
		domain.GoalStatusActive,
	)
	_ = s.repo.SaveGoal(runGoal)

	msRun1, _ := domain.NewMilestone(uuid.New().String(), runGoal.ID, "Build 25km weekly aerobic base", today.AddDate(0, 0, -10), 1)
	msRun1.Complete()
	_ = s.repo.SaveMilestone(msRun1)

	msRun2, _ := domain.NewMilestone(uuid.New().String(), runGoal.ID, "Complete 4x 1km interval speed track session", today.AddDate(0, 0, 7), 2)
	_ = s.repo.SaveMilestone(msRun2)

	actRun1, _ := domain.NewAction(uuid.New().String(), runGoal.ID, msRun2.ID, "Morning 6km interval run (5x 400m fast repeats)", &today, domain.ActionPriorityHigh, "40m", "Target 4:40/km on repeats")
	_ = s.repo.SaveAction(actRun1)

	actRun2, _ := domain.NewAction(uuid.New().String(), runGoal.ID, msRun2.ID, "Lower body mobility and hip flexor foam rolling", &tomorrow, domain.ActionPriorityLow, "20m", "Focus on calves and hamstrings")
	_ = s.repo.SaveAction(actRun2)

	_ = s.syncGoalProgress(runGoal.ID)

	// 4. Goal 3: Books Synthesis
	bookGoal, _ := domain.NewGoal(
		uuid.New().String(),
		learningArea.ID,
		"Synthesize 6 High-Impact Systems & Leadership Books",
		"Improve strategic thinking, decision making under uncertainty, and engineering coaching capability.",
		today.AddDate(0, 4, 0),
		"Publish 6 executive one-page synthesis summaries with actionable personal operating principles.",
		domain.GoalStatusActive,
	)
	_ = s.repo.SaveGoal(bookGoal)

	msBook1, _ := domain.NewMilestone(uuid.New().String(), bookGoal.ID, "Read & synthesize 'Thinking in Systems' by Donella Meadows", today.AddDate(0, 0, -14), 1)
	msBook1.Complete()
	_ = s.repo.SaveMilestone(msBook1)

	msBook2, _ := domain.NewMilestone(uuid.New().String(), bookGoal.ID, "Read & synthesize 'High Output Management' by Andy Grove", today.AddDate(0, 0, 10), 2)
	_ = s.repo.SaveMilestone(msBook2)

	// Overdue action sample for testing daily view reminders
	actBook1, _ := domain.NewAction(uuid.New().String(), bookGoal.ID, msBook2.ID, "Draft chapter 4-7 notes on Andy Grove's managerial leverage", &yesterday, domain.ActionPriorityMedium, "45m", "Extract task-relevant maturity models")
	_ = s.repo.SaveAction(actBook1)

	_ = s.syncGoalProgress(bookGoal.ID)

	// 5. Seed a Past Completed Weekly Review
	pastReview, _ := domain.NewWeeklyReview(uuid.New().String(), today.AddDate(0, 0, -14), today.AddDate(0, 0, -7))
	pastReview.CompletedActionsCount = 8
	pastReview.MissedActionsCount = 1
	pastReview.GoalsReviewedCount = 3
	_ = pastReview.Complete(
		"Consistent morning deep work blocks before 9 AM allowed completing the gRPC protobuf milestone ahead of schedule.",
		"Stayed up past 11:30 PM twice, which caused sluggish morning runs and postponed Thursday's reading block.",
		"Enforce strict phone dock outside bedroom at 10 PM. Prioritize the Kafka consumer refactor during Tuesday's prime morning window.",
		"When milestones are broken down into sub-45 minute actions, execution resistance drops dramatically.",
	)
	_ = s.repo.SaveWeeklyReview(pastReview)

	return nil
}
