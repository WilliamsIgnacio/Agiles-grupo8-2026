package main

import (
	"log"
	"net/http"

	"histodle-api/config"
	"histodle-api/internal/database"
	"histodle-api/internal/router"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("error loading configuration:", err)
	}

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal("error connecting to database:", err)
	}

	log.Println("database connected")

	r, err := router.New(db, cfg)
	if err != nil {
		log.Fatal("error configuring authentication:", err)
	}

	log.Printf("server running on port %s", cfg.Port)

	err = http.ListenAndServe(":"+cfg.Port, r)
	if err != nil {
		log.Fatal(err)
	}
}
