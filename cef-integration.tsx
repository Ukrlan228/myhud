"use client"

// CEF Integration for Lviv RP HUD
// This file serves as the bridge between SAMP and our React HUD

import { useEffect } from "react"

// Types for SAMP data
export interface PlayerData {
  health: number
  armor: number
  hunger: number
  money: number
  weapon?: string
  ammo?: number
  hasWeaponInHand?: boolean
  wanted?: number
  playerId?: number
  onlinePlayers?: number
}

export interface Notification {
  id: number
  message: string
  time: string
  type: string
  timestamp: number
}

// Hook to handle SAMP-CEF integration
export const useSampCefIntegration = (
  setPlayerData: (data: Partial<PlayerData>) => void,
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "time">) => void,
) => {
  useEffect(() => {
    // Function to handle messages from SAMP
    const handleSampMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data)

          // Handle different message types from SAMP
          switch (data.type) {
            case "playerUpdate":
              // Update player stats
              setPlayerData(data.payload)
              break

            case "notification":
              // Add new notification
              addNotification({
                message: data.message,
                type: data.notificationType || "info",
              })
              break

            case "init":
              // Handle initial data
              console.log("CEF initialized with data:", data.payload)
              setPlayerData(data.payload)
              break

            case "ping":
              // Respond to ping messages (for connection testing)
              window.postMessage(JSON.stringify({ type: "pong" }), "*")
              break

            default:
              console.log("Unknown message type from SAMP:", data.type)
          }
        } catch (e) {
          console.error("Failed to parse message from SAMP:", e)
        }
      }
    }

    // Listen for messages from SAMP
    window.addEventListener("message", handleSampMessage)

    // Send ready signal to SAMP
    window.postMessage(JSON.stringify({ type: "hudReady" }), "*")

    // Send a ping every 5 seconds to ensure the connection is still active
    const pingInterval = setInterval(() => {
      window.postMessage(JSON.stringify({ type: "ping" }), "*")
    }, 5000)

    // Cleanup function
    return () => {
      window.removeEventListener("message", handleSampMessage)
      clearInterval(pingInterval)
    }
  }, [setPlayerData, addNotification])

  // Function to send data back to SAMP (if needed)
  const sendToSamp = (data: any) => {
    window.postMessage(JSON.stringify(data), "*")
  }

  return { sendToSamp }
}

