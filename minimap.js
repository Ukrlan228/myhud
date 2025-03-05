// Minimap configuration
const config = {
  zoom: 1,
  maxZoom: 3,
  minZoom: 0.5,
  zoomStep: 0.5,
  updateInterval: 100, // ms
  playerBlipSize: 10,
  otherPlayerBlipSize: 6,
  worldSize: 6000, // SAMP world size in game units
  minimapSize: 250, // px
}

// Player data
const playerData = {
  x: 0,
  y: 0,
  z: 0,
  rotation: 0,
  zone: "Невідомо",
}

// Other players data
let otherPlayers = []

// Map elements
const playerMarker = document.getElementById("player-marker")
const playerDirection = document.getElementById("player-direction")
const playerRadius = document.getElementById("player-radius")
const otherPlayersContainer = document.getElementById("other-players")
const zoneInfo = document.getElementById("zone-info")
const zoomInBtn = document.getElementById("zoom-in")
const zoomOutBtn = document.getElementById("zoom-out")

// Initialize minimap
function initMinimap() {
  // Set initial player position (center of map)
  updatePlayerPosition(0, 0, 0)

  // Set up zoom controls
  zoomInBtn.addEventListener("click", () => {
    if (config.zoom < config.maxZoom) {
      config.zoom += config.zoomStep
      updateMinimap()
    }
  })

  zoomOutBtn.addEventListener("click", () => {
    if (config.zoom > config.minZoom) {
      config.zoom -= config.zoomStep
      updateMinimap()
    }
  })

  // Set up message handler for SAMP data
  setupMessageHandler()

  // Start update loop
  setInterval(updateMinimap, config.updateInterval)
}

// Update player position on minimap
function updatePlayerPosition(x, y, rotation) {
  playerData.x = x
  playerData.y = y
  playerData.rotation = rotation

  // Update minimap immediately
  updateMinimap()
}

// Update minimap display
function updateMinimap() {
  // Calculate position on minimap (convert world coordinates to minimap pixels)
  const scale = config.minimapSize / (config.worldSize / config.zoom)

  // Center of minimap
  const centerX = config.minimapSize / 2
  const centerY = config.minimapSize / 2

  // Player position (centered on minimap)
  playerMarker.style.left = `${centerX}px`
  playerMarker.style.top = `${centerY}px`

  // Player direction
  playerDirection.style.left = `${centerX}px`
  playerDirection.style.top = `${centerY}px`
  playerDirection.style.transform = `translate(-50%, -100%) rotate(${playerData.rotation}deg)`

  // Player radius
  playerRadius.style.left = `${centerX}px`
  playerRadius.style.top = `${centerY}px`

  // Update other players
  updateOtherPlayers(centerX, centerY, scale)

  // Update zone info
  zoneInfo.textContent = playerData.zone
}

// Update other players on minimap
function updateOtherPlayers(centerX, centerY, scale) {
  // Clear existing players
  otherPlayersContainer.innerHTML = ""

  // Add each player
  otherPlayers.forEach((player) => {
    // Calculate relative position to player
    const relX = player.x - playerData.x
    const relY = player.y - playerData.y

    // Convert to minimap coordinates
    const mapX = centerX + relX * scale
    const mapY = centerY + relY * scale

    // Check if player is within minimap bounds
    if (mapX >= 0 && mapX <= config.minimapSize && mapY >= 0 && mapY <= config.minimapSize) {
      // Create player marker
      const marker = document.createElement("div")
      marker.className = "other-player"
      marker.style.left = `${mapX}px`
      marker.style.top = `${mapY}px`

      // Add player ID as data attribute
      marker.dataset.id = player.id

      // Add to container
      otherPlayersContainer.appendChild(marker)
    }
  })
}

// Set up message handler for SAMP data
function setupMessageHandler() {
  window.addEventListener("message", (event) => {
    if (event.data && typeof event.data === "string") {
      try {
        const data = JSON.parse(event.data)

        // Handle different message types
        switch (data.type) {
          case "minimapUpdate":
            // Update player position
            if (data.payload.position) {
              updatePlayerPosition(
                data.payload.position.x,
                data.payload.position.y,
                data.payload.position.rotation || 0,
              )
            }

            // Update zone
            if (data.payload.zone) {
              playerData.zone = data.payload.zone
            }

            // Update other players
            if (data.payload.otherPlayers) {
              otherPlayers = data.payload.otherPlayers
            }
            break

          case "minimapZoom":
            // Update zoom level
            if (data.payload.zoom) {
              config.zoom = Math.max(config.minZoom, Math.min(config.maxZoom, data.payload.zoom))
            }
            break
        }
      } catch (e) {
        console.error("Error parsing message:", e)
      }
    }
  })

  // Send ready signal
  window.parent.postMessage(JSON.stringify({ type: "minimapReady" }), "*")
}

// Initialize minimap when DOM is loaded
document.addEventListener("DOMContentLoaded", initMinimap)

// Simulate player movement for testing (remove in production)
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  let testX = 0
  let testY = 0
  let testRotation = 0

  setInterval(() => {
    // Simulate movement
    testX += Math.sin((testRotation * Math.PI) / 180) * 5
    testY += Math.cos((testRotation * Math.PI) / 180) * 5
    testRotation += 1

    // Update position
    updatePlayerPosition(testX, testY, testRotation)

    // Simulate other players
    otherPlayers = [
      { id: 1, x: testX + 100, y: testY + 100 },
      { id: 2, x: testX - 150, y: testY - 50 },
      { id: 3, x: testX + 200, y: testY - 200 },
    ]
  }, 50)
}

