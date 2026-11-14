package auth

import (
	"crypto/sha256"
	"encoding/hex"
	"time"

	"gorm.io/gorm"
	"histodle-api/internal/user"
)

type Session struct {
	ID            uint      `gorm:"primaryKey"`
	UserID        uint      `gorm:"not null"`
	User          user.User `gorm:"foreignKey:UserID"`
	TokenHash     string    `gorm:"not null;unique"`
	CSRFTokenHash string    `gorm:"not null"`
	ExpiresAt     time.Time `gorm:"not null"`
	CreatedAt     time.Time
	LastUsedAt    time.Time
}

func hash(value string) string {
	sum := sha256.Sum256([]byte(value))
	return hex.EncodeToString(sum[:])
}

func (s *Session) BeforeDelete(tx *gorm.DB) error { return nil }
