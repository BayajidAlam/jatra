package routes

import (
	"github.com/BayajidAlam/jatra/api-gateway/config"
	"github.com/BayajidAlam/jatra/api-gateway/middleware"
	"github.com/BayajidAlam/jatra/api-gateway/proxy"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy", "service": "api-gateway"})
	})

	api := router.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", proxy.ProxyRequest(config.AppConfig.AuthServiceURL))
			auth.POST("/login", proxy.ProxyRequest(config.AppConfig.AuthServiceURL))
			auth.POST("/refresh-token", proxy.ProxyRequest(config.AppConfig.AuthServiceURL))
			auth.POST("/logout", middleware.JWTAuth(), proxy.ProxyRequest(config.AppConfig.AuthServiceURL))
		}

		users := api.Group("/users")
		users.Use(middleware.JWTAuth())
		{
			users.GET("/me", proxy.ProxyRequest(config.AppConfig.AuthServiceURL))
			users.PATCH("/me", proxy.ProxyRequest(config.AppConfig.AuthServiceURL))
		}

		trains := api.Group("/trains")
		{
			trains.GET("", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			trains.GET("/:id", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			trains.GET("/number/:trainNumber", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			trains.POST("", middleware.JWTAuth(), proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
		}

		stations := api.Group("/stations")
		{
			stations.GET("", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			stations.GET("/:id", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			stations.GET("/code/:code", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			stations.POST("", middleware.JWTAuth(), proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
		}

		routes := api.Group("/routes")
		{
			routes.GET("", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			routes.GET("/:id", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			routes.POST("", middleware.JWTAuth(), proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
		}

		journeys := api.Group("/journeys")
		{
			journeys.GET("/search", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			journeys.GET("/:id", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			journeys.GET("/train/:trainId", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			journeys.POST("", middleware.JWTAuth(), proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
		}

		bookings := api.Group("/bookings")
		bookings.Use(middleware.JWTAuth())
		{
			bookings.POST("/create", proxy.ProxyRequest(config.AppConfig.BookingServiceURL))
			bookings.GET("", proxy.ProxyRequest(config.AppConfig.BookingServiceURL))
			bookings.GET("/:id", proxy.ProxyRequest(config.AppConfig.BookingServiceURL))
			bookings.POST("/:id/confirm", proxy.ProxyRequest(config.AppConfig.BookingServiceURL))
			bookings.POST("/:id/cancel", proxy.ProxyRequest(config.AppConfig.BookingServiceURL))
		}

		tickets := api.Group("/tickets")
		tickets.Use(middleware.JWTAuth())
		{
			tickets.GET("/:id", proxy.ProxyRequest(config.AppConfig.TicketServiceURL))
			tickets.GET("/:id/pdf", proxy.ProxyRequest(config.AppConfig.TicketServiceURL))
		}
	}
}
