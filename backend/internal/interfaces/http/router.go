package http

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func NewRouter(h *Handler) http.Handler {
	r := chi.NewRouter()

	// Standard middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Cross-Origin Resource Sharing (CORS) for Vite frontend dev server
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:*", "http://127.0.0.1:*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// API v1 Versioned Route Hierarchy (FDR §22, §23)
	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", h.HealthCheck)

		// Areas
		r.Get("/areas", h.ListAreas)
		r.Post("/areas", h.CreateArea)

		// Goals
		r.Get("/goals", h.ListGoals)
		r.Post("/goals", h.CreateGoal)
		r.Get("/goals/{id}", h.GetGoal)
		r.Patch("/goals/{id}/status", h.TransitionGoalStatus)
		r.Patch("/goals/{id}/progress", h.UpdateGoalProgress)
		r.Delete("/goals/{id}", h.DeleteGoal)

		// Milestones
		r.Post("/milestones", h.CreateMilestone)
		r.Patch("/milestones/{id}/toggle", h.ToggleMilestone)
		r.Delete("/milestones/{id}", h.DeleteMilestone)

		// Actions
		r.Get("/actions/daily", h.ListDailyActions)
		r.Post("/actions", h.CreateAction)
		r.Patch("/actions/{id}/toggle", h.ToggleAction)
		r.Delete("/actions/{id}", h.DeleteAction)

		// Weekly Reviews (FDR §10)
		r.Get("/reviews", h.ListWeeklyReviews)
		r.Get("/reviews/{id}", h.GetWeeklyReview)
		r.Post("/reviews/start", h.StartWeeklyReview)
		r.Post("/reviews/{id}/complete", h.CompleteWeeklyReview)

		// Capacity & Trade-offs (FDR §16)
		r.Get("/capacity", h.GetCapacity)

		// Seed
		r.Post("/seed", h.SeedData)
	})

	return r
}
