package controllers

import (
	"net/http"
	"server/lib"
	"server/src/models"
	"time"

	"github.com/gin-gonic/gin"
)

type ExpenseController struct{}

func (ExpenseController) Get(ctx *gin.Context) {
	id := ctx.Param("id")

	if id != "" {
		var expense models.Expense
		if err := lib.Database.First(&expense, id).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Expense not found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"expenses": expense})
	} else {
		var expenses []models.Expense
		if err := lib.Database.Find(&expenses).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"expenses": expenses})
	}
}

func (ExpenseController) Post(ctx *gin.Context) {
	expenseReq := struct {
		Category string    `json:"Category" binding:"required"`
		Type     string    `json:"Type" binding:"required"`
		Amount   float64   `json:"Amount" binding:"required"`
		OR       string    `json:"OR" binding:"required"`
		PaidTo   string    `json:"PaidTo" binding:"required"`
		PaidBy   string    `json:"PaidBy" binding:"required"`
		Date     time.Time `json:"Date" binding:"required"`
	}{}

	if err := ctx.ShouldBindJSON(&expenseReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	expense := models.Expense{
		Category: expenseReq.Category,
		Type:     expenseReq.Type,
		Amount:   expenseReq.Amount,
		OR:       expenseReq.OR,
		PaidTo:   expenseReq.PaidTo,
		PaidBy:   expenseReq.PaidBy,
		Date:     expenseReq.Date,
	}

	if err := lib.Database.Create(&expense).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"expense": expense})
}

func (ExpenseController) Patch(ctx *gin.Context) {
	var expense models.Expense

	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide expense id"})
		return
	}

	if err := lib.Database.First(&expense, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Expense not found"})
		return
	}

	var patchData map[string]interface{}
	if err := ctx.ShouldBindJSON(&patchData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if dateStr, ok := patchData["Date"].(string); ok {
		parsedData, err := time.Parse(time.RFC3339, dateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
		patchData["Date"] = parsedData
	}
	if err := lib.Database.Model(&expense).Updates(patchData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, expense)
}

func (ExpenseController) Delete(ctx *gin.Context) {
	expenseReq := struct {
		Expenses []int `json:"ids" binding:"required"`
	}{}

	if err := ctx.ShouldBindJSON(&expenseReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(expenseReq.Expenses) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please select an expense"})
		return
	}

	if err := lib.Database.Delete(&models.Expense{}, expenseReq.Expenses).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
}
