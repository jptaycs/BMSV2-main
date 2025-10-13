package migration

import (
	"fmt"
	"server/config"
	"server/lib"
	"server/src/models"
)

func init() {
	config.Load()
	lib.ConnectDatabase()
}

func Migrate() {
	if err := lib.Database.AutoMigrate(
		&models.Resident{},
		&models.Household{},
		&models.ResidentHousehold{},
		&models.Health{},
		&models.Official{},
		&models.Certificate{},
		&models.Blotter{},
		&models.Event{},
		&models.Expense{},
		&models.Income{},
		&models.Logbook{},
		&models.Setting{},
		&models.User{},
		&models.Mapping{},
		&models.ProgramProject{},
		&models.Youth{},
		&models.GovDocs{},
	); err != nil {
		fmt.Println("Error Migrating")
		return
	}

	fmt.Println("Tables successfully migrated")
}
