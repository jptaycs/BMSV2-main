package main

import (
	"net/http"
	"server/config"
	"server/lib"
	"server/migration"
	"server/seeder"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "BMS Server",
	Short: "Backend Management System Server",
	Run: func(cmd *cobra.Command, args []string) {
		// fallback if no subcommands
		StartServer()
	},
}

var seedCmd = &cobra.Command{
	Use:   "seed",
	Short: "Backend Management System Seeder",
	Run: func(cmd *cobra.Command, args []string) {
		seeder.SeedUser()
	},
}

var migrationCmd = &cobra.Command{
	Use:   "migrate",
	Short: "Backend Management System Migration",
	Run: func(cmd *cobra.Command, args []string) {
		migration.Migrate()
	},
}

func init() {
	rootCmd.AddCommand(seedCmd)
	rootCmd.AddCommand(migrationCmd)
	config.Load()
	lib.ConnectDatabase()
}

func StartServer() {
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://192.168.1.5.1420", "http://192.168.123.53:1420", "http://localhost:1420", "http://192.168.123.39:1420", "http://192.168.123.35:1420"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			return origin == "" || true
		},
	}))
	router.NoRoute(func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"message": "JSSL"})
	})
	APIRoutes(router)
	router.Run()
}

func main() {
	rootCmd.Execute()
}
