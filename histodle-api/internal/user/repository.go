package user

import (
	"strings"

	"gorm.io/gorm"
)

type Repository struct{ db *gorm.DB }

func NewRepository(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) FindByEmail(email string) (User, error) {
	var u User
	err := r.db.Where("LOWER(email) = ?", strings.ToLower(strings.TrimSpace(email))).First(&u).Error
	return u, err
}

func (r *Repository) FindByProviderSubject(provider, subject string) (User, error) {
	var u User
	err := r.db.Where("provider_subject = ?", subject).First(&u).Error
	return u, err
}

func (r *Repository) FindByID(id uint) (User, error) {
	var u User
	err := r.db.First(&u, id).Error
	return u, err
}

func (r *Repository) Create(u *User) error {
	u.Email = strings.ToLower(strings.TrimSpace(u.Email))
	if u.Role == "" {
		u.Role = "user"
	}
	return r.db.Create(u).Error
}

func (r *Repository) Save(u *User) error {
	return r.db.Model(u).Updates(map[string]interface{}{
		"provider": u.Provider, "provider_subject": u.ProviderSubject,
		"email": u.Email, "name": u.Name, "avatar_url": u.AvatarURL,
	}).Error
}
