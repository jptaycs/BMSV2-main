package models

type ResidentHousehold struct {
	Household Household `gorm:"foreignKey:HouseholdID;references:ID;constraint:OnDelete:CASCADE"`
	Resident  Resident  `gorm:"foreignKey:ResidentID;references:ID;constraint:OnDelete:CASCADE"`

	HouseholdID uint `gorm:"not null"`
	ResidentID  uint `gorm:"not null"`
	Role        string
	ID          uint
}
