package controllers

import (
	"net/http"
	"server/lib"
	"server/src/models"
	"time"

	"github.com/gin-gonic/gin"
)

type GovDocsController struct{}

func (GovDocsController) Get(ctx *gin.Context) {
	id := ctx.Param("id")

	if id != "" {
		var govDoc models.GovDocs
		if err := lib.Database.First(&govDoc, id).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "GovDoc not found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"gov_doc": govDoc})
	} else {
		var govDocs []models.GovDocs
		if err := lib.Database.Find(&govDocs).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"gov_docs": govDocs})
	}
}

func (GovDocsController) Post(ctx *gin.Context) {
	req := struct {
		Title       string `json:"Title" binding:"required"`
		Type        string `json:"Type" binding:"required"`
		Description string `json:"Description"`
		DateIssued  string `json:"DateIssued" binding:"required"`
		Image       string `json:"Image"`
	}{}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": true, "message": err.Error()})
		return
	}

	parsedDate, err := time.Parse("2006-01-02", req.DateIssued)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": true, "message": "Invalid DateIssued format"})
		return
	}

	govDoc := models.GovDocs{
		Title:       req.Title,
		Type:        req.Type,
		Description: req.Description,
		DateIssued:  parsedDate,
		Image:       req.Image,
	}

	if err := lib.Database.Create(&govDoc).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": true, "message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"error": false, "gov_doc": govDoc})
}

func (GovDocsController) Patch(ctx *gin.Context) {
	var govDoc models.GovDocs

	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide gov_doc id"})
		return
	}

	if err := lib.Database.First(&govDoc, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "GovDoc not found"})
		return
	}

	var patchData map[string]interface{}
	if err := ctx.ShouldBindJSON(&patchData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse DateIssued if present
	if dateIssuedStr, ok := patchData["DateIssued"].(string); ok {
		parsedDateIssued, err := time.Parse(time.RFC3339, dateIssuedStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid DateIssued format"})
			return
		}
		patchData["DateIssued"] = parsedDateIssued
	}

	if err := lib.Database.Model(&govDoc).Updates(patchData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, govDoc)
}

func (GovDocsController) Delete(ctx *gin.Context) {
	req := struct {
		GovDocs []int `json:"ids" binding:"required"`
	}{}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(req.GovDocs) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please select a gov_doc"})
		return
	}

	if err := lib.Database.Delete(&models.GovDocs{}, req.GovDocs).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
}
