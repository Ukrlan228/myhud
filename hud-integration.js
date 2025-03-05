// This code should be added to your main script.js file

// Minimap integration
let minimapVisible = true

// Function to toggle minimap visibility
function toggleMinimap() {
  minimapVisible = !minimapVisible

  // Find minimap container
  const minimapContainer = document.querySelector(".minimap-container")
  if (minimapContainer) {
    minimapContainer.style.display = minimapVisible ? "block" : "none"
  }
}

// Listen for minimap toggle key (M key)
document.addEventListener("keydown", (event) => {
  if (event.key === "m" || event.key === "M") {
    toggleMinimap()
  }
})

// Listen for messages from minimap
window.addEventListener("message", (event) => {
  if (event.data && typeof event.data === "string") {
    try {
      const data = JSON.parse(event.data)

      // Handle minimap ready message
      if (data.type === "minimapReady") {
        console.log("Minimap is ready")

        // Send initial player data to minimap
        sendToMinimap({
          type: "minimapUpdate",
          payload: {
            position: {
              x: 0,
              y: 0,
              z: 0,
              rotation: 0,
            },
            zone: "Завантаження...",
            otherPlayers: [],
          },
        })
      }
    } catch (e) {
      console.error("Error parsing message from minimap:", e)
    }
  }
})

// Function to send data to minimap
function sendToMinimap(data) {
  // Find minimap iframe
  const minimapFrame = document.querySelector('iframe[src*="minimap.html"]')
  if (minimapFrame) {
    minimapFrame.contentWindow.postMessage(JSON.stringify(data), "*")
  }
}

// Assuming playerData is available globally or imported
// If not, you'll need to define or import it here.
// Example:
// let playerData = {}; // Initialize playerData if it's not already defined

// Update minimap when player data changes
function updateMinimapWithPlayerData() {
  // This function should be called whenever player position changes
  // For example, in the updatePlayerStats function

  // Convert HUD player data to minimap format
  const minimapData = {
    type: "minimapUpdate",
    payload: {
      position: {
        x: playerData.x || 0,
        y: playerData.y || 0,
        z: playerData.z || 0,
        rotation: playerData.rotation || 0,
      },
      zone: playerData.zone || "Невідомо",
      otherPlayers: playerData.nearbyPlayers || [],
    },
  }

  sendToMinimap(minimapData)
}

