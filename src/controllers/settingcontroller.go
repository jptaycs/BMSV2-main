package controllers

import (
	"fmt"
	"net/http"
	"server/lib"
	"server/src/models"

	"github.com/gin-gonic/gin"
)

type SettingController struct{}

// GET /settings or /settings/:id
func (SettingController) Get(ctx *gin.Context) {
	id := ctx.Param("id")
	var setting models.Setting

	if id != "" {
		// fetch by id
		if err := lib.Database.First(&setting, id).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Settings not found"})
			return
		}
	} else {
		// fetch default row (id = 1) or create default if missing
		if err := lib.Database.First(&setting, 1).Error; err != nil {
			setting = models.Setting{
				Barangay:     "",
				Municipality: "",
				Province:     "",
				PhoneNumber:  "",
				Email:        "",
				ImageB:       "",
				ImageM:       "",
			}
			if err := lib.Database.Create(&setting).Error; err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
	}
	ctx.JSON(http.StatusOK, gin.H{"setting": setting})
}

// POST /settings
func (SettingController) Post(ctx *gin.Context) {
	var settingReq struct {
		Barangay     string `json:"Barangay" binding:"required"`
		Email        string `json:"Email" binding:"required"`
		ImageB       string `json:"ImageB" binding:"required"`
		ImageM       string `json:"ImageM" binding:"required"`
		Municipality string `json:"Municipality" binding:"required"`
		PhoneNumber  string `json:"PhoneNumber" binding:"required"`
		Province     string `json:"Province" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&settingReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	setting := models.Setting{
		Barangay:     settingReq.Barangay,
		Email:        settingReq.Email,
		ImageB:       settingReq.ImageB,
		ImageM:       settingReq.ImageM,
		Municipality: settingReq.Municipality,
		PhoneNumber:  settingReq.PhoneNumber,
		Province:     settingReq.Province,
	}
	fmt.Println(setting.PhoneNumber)
	if err := lib.Database.Create(&setting).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"setting": settingReq})
}

// PATCH /settings/:id
func (SettingController) Patch(ctx *gin.Context) {
	id := ctx.Param("id")
	var setting models.Setting
	if err := lib.Database.First(&setting, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Settings not found"})
		return
	}

	var patchData map[string]interface{}
	if err := ctx.ShouldBindJSON(&patchData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := lib.Database.Model(&setting).Updates(patchData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"setting": setting})
}

// DELETE /settings
func (SettingController) Delete(ctx *gin.Context) {
	var req struct {
		IDs []uint `json:"ids"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(req.IDs) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide IDs to delete"})
		return
	}

	if err := lib.Database.Delete(&models.Setting{}, req.IDs).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
}
