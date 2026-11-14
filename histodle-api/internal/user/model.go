package user

import "time"

type User struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Provider        string    `gorm:"not null" json:"provider"`
	ProviderSubject *string   `json:"-"`
	Email           string    `gorm:"not null" json:"email"`
	PasswordHash    *string   `json:"-"`
	Name            string    `json:"name"`
	AvatarURL       string    `json:"avatarUrl"`
	Role            string    `gorm:"not null" json:"role"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

func (u User) IsAdmin() bool { return u.Role == "admin" }
