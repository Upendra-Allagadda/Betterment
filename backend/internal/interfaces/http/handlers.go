package http

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"betterment/backend/internal/application"
	"betterment/backend/internal/domain"
	"github.com/go-chi/chi/v5"
)

type Handler struct {
	svc *application.Service
}

func NewHandler(svc *application.Service) *Handler {
	return &Handler{svc: svc}
}

type APIError struct {
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
	Details string `json:"details,omitempty"`
}

func respondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		_ = json.NewEncoder(w).Encode(data)
	}
}

func respondError(w http.ResponseWriter, status int, message, code string) {
	respondJSON(w, status, APIError{
		Error: message,
		Code:  code,
	})
}

// -------------------------------------------------------------
// Health Check
// -------------------------------------------------------------

func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]any{
		"status":    "healthy",
		"service":   "Goal Operating System API",
		"timestamp": time.Now().UTC(),
	})
}

// -------------------------------------------------------------
// Areas
// -------------------------------------------------------------

func (h *Handler) ListAreas(w http.ResponseWriter, r *http.Request) {
	areas, err := h.svc.ListAreas()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusOK, areas)
}

func (h *Handler) CreateArea(w http.ResponseWriter, r *http.Request) {
	var input application.CreateAreaInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON body", "BAD_REQUEST")
		return
	}
	area, err := h.svc.CreateArea(input)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error(), "VALIDATION_ERROR")
		return
	}
	respondJSON(w, http.StatusCreated, area)
}

// -------------------------------------------------------------
// Goals
// -------------------------------------------------------------

func (h *Handler) ListGoals(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	areaID := r.URL.Query().Get("areaId")

	goals, err := h.svc.ListGoals(status, areaID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusOK, goals)
}

func (h *Handler) CreateGoal(w http.ResponseWriter, r *http.Request) {
	var input application.CreateGoalInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON body", "BAD_REQUEST")
		return
	}
	goal, err := h.svc.CreateGoal(input)
	if err != nil {
		if errors.Is(err, domain.ErrGoalIncomplete) || errors.Is(err, domain.ErrAreaRequired) {
			respondError(w, http.StatusBadRequest, err.Error(), "GOAL_INCOMPLETE")
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusCreated, goal)
}

type GoalDetailResponse struct {
	Goal       *domain.Goal        `json:"goal"`
	Milestones []*domain.Milestone `json:"milestones"`
	Actions    []*domain.Action    `json:"actions"`
	Comments   []*domain.Comment   `json:"comments"`
}

func (h *Handler) GetGoal(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	goal, milestones, actions, err := h.svc.GetGoalDetails(id)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusNotFound, "Goal not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	comments, _ := h.svc.ListGoalComments(id)
	if comments == nil {
		comments = []*domain.Comment{}
	}
	respondJSON(w, http.StatusOK, GoalDetailResponse{
		Goal:       goal,
		Milestones: milestones,
		Actions:    actions,
		Comments:   comments,
	})
}

type TransitionStatusRequest struct {
	Status domain.GoalStatus `json:"status"`
}

func (h *Handler) TransitionGoalStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req TransitionStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON body", "BAD_REQUEST")
		return
	}
	goal, err := h.svc.TransitionGoalStatus(id, req.Status)
	if err != nil {
		if errors.Is(err, domain.ErrInvalidStatus) {
			respondError(w, http.StatusBadRequest, "Invalid lifecycle transition", "INVALID_TRANSITION")
			return
		}
		if errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusNotFound, "Goal not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusOK, goal)
}

type UpdateProgressRequest struct {
	Progress int `json:"progress"`
}

func (h *Handler) UpdateGoalProgress(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpdateProgressRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON body", "BAD_REQUEST")
		return
	}
	goal, err := h.svc.UpdateGoalProgress(id, req.Progress)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusNotFound, "Goal not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusOK, goal)
}

func (h *Handler) DeleteGoal(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.DeleteGoal(id); err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusNotFound, "Goal not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) UpdateGoal(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var input application.UpdateGoalInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON body", "BAD_REQUEST")
		return
	}
	goal, err := h.svc.UpdateGoal(id, input)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusNotFound, "Goal not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusBadRequest, err.Error(), "BAD_REQUEST")
		return
	}
	respondJSON(w, http.StatusOK, goal)
}

func (h *Handler) ListGoalComments(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	comments, err := h.svc.ListGoalComments(id)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusNotFound, "Goal not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	if comments == nil {
		comments = []*domain.Comment{}
	}
	respondJSON(w, http.StatusOK, comments)
}

func (h *Handler) AddGoalComment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var input application.CreateCommentInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON body", "BAD_REQUEST")
		return
	}
	comment, err := h.svc.AddGoalComment(id, input)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusNotFound, "Goal not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusBadRequest, err.Error(), "BAD_REQUEST")
		return
	}
	respondJSON(w, http.StatusCreated, comment)
}

// -------------------------------------------------------------
// Milestones & Telemetry Trends
// -------------------------------------------------------------

func (h *Handler) ListMilestones(w http.ResponseWriter, r *http.Request) {
	milestones, err := h.svc.ListAllMilestones()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	if milestones == nil {
		milestones = []*domain.Milestone{}
	}
	respondJSON(w, http.StatusOK, milestones)
}

func (h *Handler) GetPerformanceTrends(w http.ResponseWriter, r *http.Request) {
	trends, err := h.svc.GetPerformanceTrends()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusOK, trends)
}

func (h *Handler) CreateMilestone(w http.ResponseWriter, r *http.Request) {
	var input application.CreateMilestoneInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON body", "BAD_REQUEST")
		return
	}
	ms, err := h.svc.CreateMilestone(input)
	if err != nil {
		if errors.Is(err, domain.ErrInvalidInput) || errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusBadRequest, err.Error(), "BAD_REQUEST")
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusCreated, ms)
}

func (h *Handler) ToggleMilestone(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ms, err := h.svc.ToggleMilestone(id)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusNotFound, "Milestone not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusOK, ms)
}

func (h *Handler) DeleteMilestone(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.DeleteMilestone(id); err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusNotFound, "Milestone not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// -------------------------------------------------------------
// Actions
// -------------------------------------------------------------

func (h *Handler) ListDailyActions(w http.ResponseWriter, r *http.Request) {
	actions, err := h.svc.ListDailyActions()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusOK, actions)
}

func (h *Handler) CreateAction(w http.ResponseWriter, r *http.Request) {
	var input application.CreateActionInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON body", "BAD_REQUEST")
		return
	}
	act, err := h.svc.CreateAction(input)
	if err != nil {
		if errors.Is(err, domain.ErrMilestoneRequired) || errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusBadRequest, err.Error(), "BAD_REQUEST")
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusCreated, act)
}

func (h *Handler) ToggleAction(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	act, err := h.svc.ToggleAction(id)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusNotFound, "Action not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusOK, act)
}

func (h *Handler) DeleteAction(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.DeleteAction(id); err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusNotFound, "Action not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// -------------------------------------------------------------
// Weekly Reviews (FDR §10)
// -------------------------------------------------------------

func (h *Handler) ListWeeklyReviews(w http.ResponseWriter, r *http.Request) {
	reviews, err := h.svc.ListWeeklyReviews()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusOK, reviews)
}

func (h *Handler) GetWeeklyReview(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	rev, err := h.svc.GetWeeklyReview(id)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusNotFound, "Review not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusOK, rev)
}

func (h *Handler) StartWeeklyReview(w http.ResponseWriter, r *http.Request) {
	rev, err := h.svc.StartWeeklyReview()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusCreated, rev)
}

func (h *Handler) CompleteWeeklyReview(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var input application.CompleteReviewInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON body", "BAD_REQUEST")
		return
	}
	rev, err := h.svc.CompleteWeeklyReview(id, input)
	if err != nil {
		if errors.Is(err, domain.ErrReviewAlreadyClosed) {
			respondError(w, http.StatusBadRequest, "Review already finalized", "ALREADY_COMPLETED")
			return
		}
		if errors.Is(err, domain.ErrNotFound) {
			respondError(w, http.StatusNotFound, "Review not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusOK, rev)
}

// -------------------------------------------------------------
// Capacity and Trade-offs (FDR §16)
// -------------------------------------------------------------

func (h *Handler) GetCapacity(w http.ResponseWriter, r *http.Request) {
	assessment, err := h.svc.GetCapacityAssessment()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusOK, assessment)
}

// -------------------------------------------------------------
// Seed Data
// -------------------------------------------------------------

func (h *Handler) SeedData(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.ResetAndSeedRealisticData(); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{
		"message": "Realistic sample data successfully seeded",
	})
}
