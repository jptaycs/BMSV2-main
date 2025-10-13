package controllers

import (
	"net/http"
	"server/lib"
	"server/src/models"
	"server/src/services"

	"github.com/gin-gonic/gin"
)

type AuthController struct{}

func (AuthController) Login(ctx *gin.Context) {
	loginReq := struct {
		Role     string `json:"role" binding:"required"`
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}{}

	if err := ctx.ShouldBindJSON(&loginReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	lib.Database.First(&user, "username = ?", loginReq.Username)

	if user.Username == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Username"})
		return
	}

	if user.Role != loginReq.Role {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "That user is not associated in that role"})
		return
	}

	if !services.Compare(loginReq.Password, user.Password) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Password",
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"message": "Login Success",
		"user":    user,
	})
}
