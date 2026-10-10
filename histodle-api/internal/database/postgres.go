package database

import (
	"net/url"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"histodle-api/config"
)

func Connect(cfg config.Config) (*gorm.DB, error) {
	query := url.Values{"sslmode": []string{cfg.DBSSLMode}}
	dsn := url.URL{
		Scheme:   "postgres",
		User:     url.UserPassword(cfg.DBUser, cfg.DBPassword),
		Host:     cfg.DBHost + ":" + cfg.DBPort,
		Path:     "/" + cfg.DBName,
		RawQuery: query.Encode(),
	}

	db, err := gorm.Open(postgres.Open(dsn.String()), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return db, nil
}
