package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"betterment/backend/internal/application"
	"betterment/backend/internal/infrastructure/persistence/sqlite"
	api "betterment/backend/internal/interfaces/http"
)

func main() {
	port := flag.String("port", "8080", "HTTP server port")
	dbPath := flag.String("db", "data/betterment.db", "SQLite database path")
	flag.Parse()

	// Environment variable fallback
	if envPort := os.Getenv("PORT"); envPort != "" {
		*port = envPort
	}
	if envDB := os.Getenv("DB_PATH"); envDB != "" {
		*dbPath = envDB
	}

	log.Printf("[GoalOS] Initializing SQLite database at %s ...", *dbPath)
	db, err := sqlite.NewDB(*dbPath)
	if err != nil {
		log.Fatalf("[GoalOS] Failed to initialize database: %v", err)
	}
	defer db.Close()

	repo := sqlite.NewRepository(db)
	svc := application.NewService(repo)

	// Seed realistic sample dataset on startup if database is empty
	if err := svc.SeedRealisticData(); err != nil {
		log.Printf("[GoalOS] Warning: seeding initial data: %v", err)
	} else {
		log.Printf("[GoalOS] Initial sample dataset verified / seeded.")
	}

	handler := api.NewHandler(svc)
	router := api.NewRouter(handler)

	addr := fmt.Sprintf(":%s", *port)
	server := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown handling
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("[GoalOS] Server listening on http://localhost:%s", *port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[GoalOS] Listen error: %v", err)
		}
	}()

	<-stop
	log.Println("[GoalOS] Shutting down server gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("[GoalOS] Forced shutdown: %v", err)
	}
	log.Println("[GoalOS] Server gracefully stopped.")
}
