package occupation

type Occupation struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `json:"name"`
}