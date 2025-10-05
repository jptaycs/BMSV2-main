package seeder

import (
	"fmt"
	"log"
	"server/config"
	"server/lib"
	"server/src/services"
)

func init() {
	config.Load()
	lib.ConnectDatabase()
}

func SeedUser() {
	fmt.Println("-----Seeding Initial User-----")
	for _, user := range Users {
		hashPassword, err := services.Encrypt(user.Password)
		if err != nil {
			log.Printf("Error on hashing password for user %s: %v", user.Username, err)
		}
		user.Password = hashPassword
		if err := lib.Database.Create(&user).Error; err != nil {
			log.Printf("Error in seeding user %s: %v", user.Username, err)
		}
	}
	fmt.Println("-----Done Seeding User-----")
}
