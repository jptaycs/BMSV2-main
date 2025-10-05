package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"server/lib"
	"server/src/models"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func strPtrToStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

type HouseholdController struct{}

type MemberDTO struct {
	ID   uint   `json:"id"`
	Role string `json:"role"`
}

type CreateHouseholdDTO struct {
	DateOfResidency time.Time   `json:"Date"`
	HouseholdNumber string      `json:"HouseNumber"`
	HouseholdType   string      `json:"Type"`
	Members         []MemberDTO `json:"Member"`
	Status          string      `json:"Status"`
	Zone            string      `json:"Zone"`
}

func (HouseholdController) Get(c *gin.Context) {
	var households []models.Household
	db := lib.Database

	if err := db.Preload("Residents.Resident").Find(&households).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch households", "error": err.Error()})
		return
	}

	// Format response including roles
	var result []gin.H
	for _, h := range households {
		residents := make([]gin.H, len(h.Residents))
		for i, rh := range h.Residents {
			residents[i] = gin.H{
				"id":        rh.Resident.ID,
				"firstname": rh.Resident.Firstname,
				"lastname":  rh.Resident.Lastname,
				"income":    rh.Resident.AvgIncome,
				"role":      rh.Role,
			}
		}

		result = append(result, gin.H{
			"id":                h.ID,
			"zone":              h.Zone,
			"type":              h.Type,
			"status":            h.Status,
			"date_of_residency": h.DateOfResidency,
			"household_number":  h.HouseholdNumber,
			"residents":         residents,
		})
	}

	c.JSON(http.StatusOK, gin.H{"households": result})
}

func (HouseholdController) GetOne(c *gin.Context) {
	id := c.Param("id") // assuming you pass /households/:id

	var household models.Household
	db := lib.Database

	// Find one household with preloaded residents
	if err := db.Preload("Residents.Resident").First(&household, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "Household not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch household", "error": err.Error()})
		}
		return
	}

	// Format residents
	residents := make([]gin.H, len(household.Residents))
	for i, rh := range household.Residents {
		residents[i] = gin.H{
			"id":        rh.Resident.ID,
			"firstname": rh.Resident.Firstname,
			"lastname":  rh.Resident.Lastname,
			"income":    rh.Resident.AvgIncome,
			"role":      rh.Role,
		}
	}

	// Format household response
	result := gin.H{
		"id":                household.ID,
		"zone":              household.Zone,
		"type":              household.Type,
		"status":            household.Status,
		"date_of_residency": household.DateOfResidency,
		"household_number":  household.HouseholdNumber,
		"residents":         residents,
	}

	c.JSON(http.StatusOK, gin.H{"household": result})
}

func (HouseholdController) Post(ctx *gin.Context) {
	var input CreateHouseholdDTO
	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Validation: prevent empty or invalid fields
	if input.HouseholdNumber == "" || input.HouseholdType == "" || input.Zone == "" || input.Status == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "All fields are required"})
		return
	}
	if input.DateOfResidency.IsZero() {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date of residency"})
		return
	}

	db := lib.Database

	err := db.Transaction(func(tx *gorm.DB) error {
		household := models.Household{
			HouseholdNumber: input.HouseholdNumber,
			Zone:            input.Zone,
			Type:            input.HouseholdType,
			Status:          input.Status,
			DateOfResidency: input.DateOfResidency,
		}

		if err := tx.Create(&household).Error; err != nil {
			return err
		}

		for _, m := range input.Members {
			var existing models.ResidentHousehold
			if err := tx.Where("resident_id = ?", m.ID).First(&existing).Error; err == nil {
				var resident models.Resident
				if err := tx.First(&resident, m.ID).Error; err != nil {
					return fmt.Errorf("resident with ID %d already belongs to a household", m.ID)
				}

				fullName := strPtrToStr(resident.Firstname) +
					" " + strPtrToStr(resident.Middlename) +
					" " + strPtrToStr(resident.Lastname) +
					" " + strPtrToStr(resident.Suffix)

				return fmt.Errorf("resident %s already belongs to a household", fullName)
			} else if err != gorm.ErrRecordNotFound {
				return err
			}

			rh := models.ResidentHousehold{
				HouseholdID: household.ID,
				ResidentID:  m.ID,
				Role:        m.Role,
			}
			if err := tx.Create(&rh).Error; err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "household created successfully",
	})
}

func (HouseholdController) Delete(ctx *gin.Context) {
	householdReq := struct {
		Households []uint `json:"ids" binding:"required"`
	}{}

	if err := ctx.ShouldBindJSON(&householdReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(householdReq.Households) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please select a household"})
		return
	}

	db := lib.Database
	err := db.Transaction(func(tx *gorm.DB) error {
		// delete child rows first
		if err := tx.Where("household_id IN ?", householdReq.Households).
			Delete(&models.ResidentHousehold{}).Error; err != nil {
			return err
		}

		// delete households
		if err := tx.Delete(&models.Household{}, householdReq.Households).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
}

func (HouseholdController) Patch(ctx *gin.Context) {
	id := ctx.Param("id")
	var input CreateHouseholdDTO
	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := lib.Database
	var household models.Household

	if err := db.First(&household, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Household not found"})
		} else {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		// update household fields
		household.HouseholdNumber = input.HouseholdNumber
		household.Zone = input.Zone
		household.Type = input.HouseholdType
		household.Status = input.Status
		household.DateOfResidency = input.DateOfResidency

		if err := tx.Save(&household).Error; err != nil {
			return err
		}

		// clear existing members
		if err := tx.Where("household_id = ?", household.ID).Delete(&models.ResidentHousehold{}).Error; err != nil {
			return err
		}

		// re-add members
		for _, m := range input.Members {
			rh := models.ResidentHousehold{
				HouseholdID: household.ID,
				ResidentID:  m.ID,
				Role:        m.Role,
			}
			if err := tx.Create(&rh).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "household updated successfully"})
}
