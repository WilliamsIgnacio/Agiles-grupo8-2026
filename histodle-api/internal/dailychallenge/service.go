package dailychallenge

import (
	"fmt"
	"time"
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (service *Service) Get(date time.Time) (DailyChallenge, error) {
	dailyChallenge, err := service.repository.findOrCreate(date)
	if err != nil {
		return DailyChallenge{}, err
	}

	return DailyChallenge{
		Date:        date.Format(time.DateOnly),
		CharacterID: dailyChallenge.CharacterID,
		Name:        fmt.Sprintf("Desafío diario — %s", date.Format("02/01/2006")),
		Description: "Adiviná el personaje del día.",
	}, nil
}
