package models

type Mapping struct {
	Household   Household `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	MappingName string
	Type        string
	HouseholdID *uint
	FID         uint
	ID          uint
}
