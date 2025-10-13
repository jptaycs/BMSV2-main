package models

type Certificate struct {
	ID          uint     `json:"id"`
	Resident    Resident `json:"resident"`
	ResidentID  uint     `json:"resident_id" gorm:"not null"`
	Type        string   `json:"type_" gorm:"not null"`
	Amount      float64  `json:"amount" gorm:"not null"`
	IssuedDate  string   `json:"issued_date" gorm:"type:date;not null"`
	Ownership   *string  `json:"ownership_text,omitempty"`
	CivilStatus string   `json:"civil_status,omitempty"`
	Purpose     string   `json:"purpose,omitempty"`
	Age         *int     `json:"age,omitempty"`
}
