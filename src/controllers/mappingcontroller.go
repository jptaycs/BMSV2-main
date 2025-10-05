package controllers

import (
	"net/http"
	"server/lib"
	"server/src/models"

	"github.com/gin-gonic/gin"
)

type MappingController struct{}

func (MappingController) Get(ctx *gin.Context) {
	var mappings []models.Mapping
	if err := lib.Database.Preload("Household.Residents.Resident").Find(&mappings).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"mappings": mappings})
}

func (MappingController) Post(ctx *gin.Context) {
	mapReq := struct {
		HouseholdID *uint  `json:"HouseholdID" `
		MappingName string `json:"MappingName" binding:"required"`
		Type        string `json:"Type" binding:"required"`
		FID         uint   `json:"FID" binding:"required"`
	}{}

	if err := ctx.ShouldBindJSON(&mapReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if mapReq.HouseholdID != nil {
		var count int64
		if err := lib.Database.Model(&models.Household{}).Where("id = ?", *mapReq.HouseholdID).Count(&count).Error; err != nil || count == 0 {
			mapReq.HouseholdID = nil
		}
	}

	mapping := models.Mapping{
		MappingName: mapReq.MappingName,
		Type:        mapReq.Type,
		HouseholdID: mapReq.HouseholdID,
		FID:         mapReq.FID,
	}

	if err := lib.Database.Create(&mapping).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"mapping": mapping})
}

func (MappingController) Delete(ctx *gin.Context) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Provide Mapping id"})
		return
	}

	if err := lib.Database.Delete(&models.Mapping{}, "f_id = ?", id).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
}
