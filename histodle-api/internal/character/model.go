package character

type Character struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `json:"name"`
	Gender      string `json:"gender"`
	Period      string `json:"period"`
	Country     string `json:"country"`
	Continent   string `json:"continent"`
	KnowFor     string `json:"knowFor"`
	Position    string `json:"position"`
	BirthYear   int32  `json:"birthYear"`
	YearOfDeath int32  `json:"yearOfDeath"`
}
