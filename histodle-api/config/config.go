package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	DBHost             string
	DBPort             string
	DBUser             string
	DBPassword         string
	DBName             string
	DBSSLMode          string
	Environment        string
	WebURL             string
	SessionSecret      string
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string
	CookieSecure       bool
}

func Load() (Config, error) {
	_ = godotenv.Load()

	environment := os.Getenv("APP_ENV")
	if environment == "" {
		environment = "development"
	}

	cookieSecure := environment != "development"
	if rawCookieSecure := os.Getenv("COOKIE_SECURE"); rawCookieSecure != "" {
		var err error
		cookieSecure, err = strconv.ParseBool(rawCookieSecure)
		if err != nil {
			return Config{}, fmt.Errorf("COOKIE_SECURE inválido: %w", err)
		}
	}

	cfg := Config{
		Port:               os.Getenv("PORT"),
		DBHost:             os.Getenv("DB_HOST"),
		DBPort:             os.Getenv("DB_PORT"),
		DBUser:             os.Getenv("DB_USER"),
		DBPassword:         os.Getenv("DB_PASSWORD"),
		DBName:             os.Getenv("DB_NAME"),
		DBSSLMode:          os.Getenv("DB_SSLMODE"),
		Environment:        environment,
		WebURL:             os.Getenv("WEB_URL"),
		SessionSecret:      os.Getenv("SESSION_SECRET"),
		GoogleClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		GoogleRedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		CookieSecure:       cookieSecure,
	}
	if environment != "development" && !cfg.CookieSecure {
		return Config{}, fmt.Errorf("COOKIE_SECURE debe ser true fuera de development")
	}
	if environment != "development" && os.Getenv("SESSION_SECRET") == "change-me-in-production" {
		return Config{}, fmt.Errorf("SESSION_SECRET no puede usar el valor predeterminado fuera de development")
	}
	if environment != "development" {
		for name, rawURL := range map[string]string{
			"WEB_URL":             cfg.WebURL,
			"GOOGLE_REDIRECT_URL": cfg.GoogleRedirectURL,
		} {
			parsed, err := url.Parse(rawURL)
			if err != nil || parsed.Scheme != "https" || parsed.Host == "" {
				return Config{}, fmt.Errorf("%s debe ser una URL HTTPS válida fuera de development", name)
			}
		}
	}
	return cfg, nil
}
