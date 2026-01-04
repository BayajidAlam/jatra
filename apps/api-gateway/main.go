package main

import (
	"log"

	"github.com/BayajidAlam/jatra/api-gateway/config"
	"github.com/BayajidAlam/jatra/api-gateway/middleware"
	"github.com/BayajidAlam/jatra/api-gateway/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Set Gin mode
	gin.SetMode(config.AppConfig.GinMode)

	// Create Gin router
	router := gin.New()

	// Global middleware
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.RateLimiter())

	// CORS configuration
	corsConfig := cors.Config{
		AllowOrigins:     config.AppConfig.CORSAllowedOrigins,
		AllowMethods:     config.AppConfig.CORSAllowedMethods,
		AllowHeaders:     config.AppConfig.CORSAllowedHeaders,
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}
	router.Use(cors.New(corsConfig))

	// Setup routes
	routes.SetupRoutes(router)

	// Start server
	log.Printf("🚀 API Gateway starting on port %s", config.AppConfig.Port)
	log.Printf("📚 Health check available at: http://localhost:%s/health", config.AppConfig.Port)
	log.Println("🔐 JWT authentication enabled")
	log.Println("⚡ Rate limiting enabled")
	log.Println("🌐 CORS enabled")

	if err := router.Run(":" + config.AppConfig.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
