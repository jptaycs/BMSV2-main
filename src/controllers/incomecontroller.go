package controllers

import (
	"net/http"
	"server/lib"
	"server/src/models"
	"time"

	"github.com/gin-gonic/gin"
)

type IncomeController struct{}

func (IncomeController) Get(ctx *gin.Context) {
	id := ctx.Param("id")

	if id != "" {
		var income models.Income
		if err := lib.Database.First(&income, id).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Income not found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"incomes": income})
	} else {
		var incomes []models.Income
		if err := lib.Database.Find(&incomes).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"incomes": incomes})
	}
}

func (IncomeController) Post(ctx *gin.Context) {
	incomeReq := struct {
		Category     string    `json:"Category" binding:"required"`
		Type         string    `json:"Type" binding:"required"`
		Amount       float64   `json:"Amount" binding:"required"`
		OR           string    `json:"OR" binding:"required"`
		ReceivedFrom string    `json:"ReceivedFrom" binding:"required"`
		ReceivedBy   string    `json:"ReceivedBy" binding:"required"`
		DateReceived time.Time `json:"DateReceived" binding:"required"`
	}{}

	if err := ctx.ShouldBindJSON(&incomeReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	income := models.Income{
		Category:     incomeReq.Category,
		Type:         incomeReq.Type,
		Amount:       incomeReq.Amount,
		OR:           incomeReq.OR,
		ReceivedFrom: incomeReq.ReceivedFrom,
		ReceivedBy:   incomeReq.ReceivedBy,
		DateReceived: incomeReq.DateReceived,
	}

	if err := lib.Database.Create(&income).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"income": income})
}

func (IncomeController) Patch(ctx *gin.Context) {
	var income models.Income

	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide income id"})
		return
	}

	if err := lib.Database.First(&income, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Income not found"})
		return
	}

	var patchData map[string]interface{}
	if err := ctx.ShouldBindJSON(&patchData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if dateStr, ok := patchData["DateReceived"].(string); ok {
		parsedData, err := time.Parse(time.RFC3339, dateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
		patchData["DateReceived"] = parsedData
	}
	if err := lib.Database.Model(&income).Updates(patchData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, income)
}

func (IncomeController) Delete(ctx *gin.Context) {
	incomeReq := struct {
		Incomes []int `json:"ids" binding:"required"`
	}{}

	if err := ctx.ShouldBindJSON(&incomeReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(incomeReq.Incomes) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please select an income"})
		return
	}

	if err := lib.Database.Delete(&models.Income{}, incomeReq.Incomes).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}
	ctx.JSON(http.StatusNoContent, gin.H{})
}
