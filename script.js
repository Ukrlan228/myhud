// Initial player data (will be overwritten by server data)
let playerData = {
  health: 75,
  armor: 50,
  hunger: 65,
  money: 25000,
  weapon: "Desert Eagle",
  ammo: 42,
  hasWeaponInHand: true,
  wanted: 3,
  playerId: 145,
  onlinePlayers: 87,
}

// Array for notifications
let notifications = [
  { id: 1, message: "Ласкаво просимо на сервер Lviv RP!", time: "Щойно", type: "info", timestamp: Date.now() },
]

// Debug mode - set to true to see messages in browser console
const DEBUG = true

// Declare cef variable if it's not already defined (e.g., by the game environment)
let cef

// Initialize HUD
document.addEventListener("DOMContentLoaded", () => {
  // Update initial values
  updatePlayerStats()
  updateWantedLevel()
  updateWeaponInfo()
  renderNotifications()
  updateClock()

  // Update clock every second
  setInterval(updateClock, 1000)

  // Remove old notifications every 5 seconds
  setInterval(removeOldNotifications, 5000)

  // Setup SAMP message handler
  setupSampMessageHandler()

  // Log readiness if debug is on
  if (DEBUG) {
    console.log("Lviv RP HUD initialized and ready")
  }

  // Send ready signal to SAMP using CEF API
  if (typeof cef !== "undefined") {
    cef.emit("hudEvent", "hudReady")
    if (DEBUG) console.log("Sent hudReady event using CEF API")
  } else {
    // Fallback for testing in browser
    window.postMessage(JSON.stringify({ type: "hudReady" }), "*")
    if (DEBUG) console.log("Sent hudReady event using postMessage (browser testing)")
  }
})

// Update player stats
function updatePlayerStats() {
  // Update values
  document.getElementById("player-id").textContent = playerData.playerId
  document.getElementById("online-players").textContent = playerData.onlinePlayers
  document.getElementById("health-value").textContent = playerData.health
  document.getElementById("armor-value").textContent = playerData.armor
  document.getElementById("hunger-value").textContent = playerData.hunger
  document.getElementById("money-value").textContent = playerData.money.toLocaleString()

  // Update progress rings
  updateProgressRing("health-ring", playerData.health)
  updateProgressRing("armor-ring", playerData.armor)
  updateProgressRing("hunger-ring", playerData.hunger)

  // Add pulse animation for low health or hunger
  if (playerData.health < 30) {
    document.querySelector(".stat-health").classList.add("pulse")
  } else {
    document.querySelector(".stat-health").classList.remove("pulse")
  }

  if (playerData.hunger < 30) {
    document.querySelector(".stat-hunger").classList.add("pulse")
  } else {
    document.querySelector(".stat-hunger").classList.remove("pulse")
  }

  if (DEBUG) {
    console.log("Stats updated:", playerData)
  }
}

// Update progress ring
function updateProgressRing(id, value) {
  const ring = document.getElementById(id)
  if (!ring) return

  const circumference = 2 * Math.PI * 20 // 2πr, where r = 20
  const offset = circumference - (value / 100) * circumference
  ring.style.strokeDasharray = `${circumference} ${circumference}`
  ring.style.strokeDashoffset = offset
}

// Update wanted level (stars)
function updateWantedLevel() {
  const container = document.getElementById("wanted-container")
  const starsContainer = document.getElementById("wanted-stars")

  if (!container || !starsContainer) return

  // Show/hide wanted container
  if (playerData.wanted > 0) {
    container.style.display = "block"

    // Clear stars container
    starsContainer.innerHTML = ""

    // Add active stars
    for (let i = 0; i < playerData.wanted; i++) {
      const star = createStarElement(true)
      starsContainer.appendChild(star)
    }

    // Add inactive stars
    for (let i = playerData.wanted; i < 6; i++) {
      const star = createStarElement(false)
      starsContainer.appendChild(star)
    }
  } else {
    container.style.display = "none"
  }
}

// Create star element
function createStarElement(active) {
  const star = document.createElement("svg")
  star.classList.add("star")
  if (active) {
    star.classList.add("active")
  } else {
    star.classList.add("inactive")
  }
  star.setAttribute("viewBox", "0 0 24 24")
  star.setAttribute("fill", active ? "currentColor" : "none")
  star.setAttribute("stroke", "currentColor")
  star.setAttribute("stroke-width", "2")
  star.setAttribute("stroke-linecap", "round")
  star.setAttribute("stroke-linejoin", "round")

  const path = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
  path.setAttribute(
    "points",
    "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",
  )
  star.appendChild(path)

  return star
}

// Update weapon info
function updateWeaponInfo() {
  const container = document.getElementById("weapon-container")
  const ammoCount = document.getElementById("ammo-count")

  if (!container || !ammoCount) return

  // Show/hide weapon container
  if (playerData.hasWeaponInHand) {
    container.style.display = "flex"
    ammoCount.textContent = playerData.ammo
  } else {
    container.style.display = "none"
  }
}

// Render notifications
function renderNotifications() {
  const container = document.getElementById("notifications-list")
  if (!container) return

  container.innerHTML = ""

  notifications.forEach((notification) => {
    const notificationElement = createNotificationElement(notification)
    container.appendChild(notificationElement)
  })
}

// Create notification element
function createNotificationElement(notification) {
  const element = document.createElement("div")
  element.classList.add("notification", notification.type)
  element.dataset.id = notification.id

  const dot = document.createElement("div")
  dot.classList.add("notification-dot")

  const content = document.createElement("div")
  content.classList.add("notification-content")

  const message = document.createElement("p")
  message.classList.add("notification-message")
  message.textContent = notification.message

  const time = document.createElement("p")
  time.classList.add("notification-time")
  time.textContent = notification.time

  content.appendChild(message)
  content.appendChild(time)

  element.appendChild(dot)
  element.appendChild(content)

  return element
}

// Add new notification
function addNotification(message, type = "info") {
  const notification = {
    id: Date.now(),
    message: message,
    time: "Щойно",
    type: type,
    timestamp: Date.now(),
  }

  notifications.unshift(notification)
  renderNotifications()

  if (DEBUG) {
    console.log("Added notification:", notification)
  }
}

// Remove old notifications
function removeOldNotifications() {
  const now = Date.now()
  notifications = notifications.filter((notification) => now - notification.timestamp < 10000)
  renderNotifications()

  // Update time for existing notifications
  notifications.forEach((notification) => {
    const seconds = Math.floor((now - notification.timestamp) / 1000)
    if (seconds < 60) {
      notification.time = "Щойно"
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      notification.time = `${minutes} хв тому`
    } else {
      const hours = Math.floor(seconds / 3600)
      notification.time = `${hours} год тому`
    }
  })
}

// Update clock
function updateClock() {
  const now = new Date()
  const timeString = now.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
  const timeElement = document.getElementById("current-time")
  if (timeElement) {
    timeElement.textContent = timeString
  }
}

// Setup SAMP message handler
function setupSampMessageHandler() {
  // Method 1: Using CEF API (for actual SAMP)
  if (typeof cef !== "undefined") {
    cef.on("window.postMessage", (data, origin) => {
      handleMessage(data)
    })

    if (DEBUG) console.log("Set up message handler using CEF API")
  }

  // Method 2: Using window.postMessage (for browser testing)
  window.addEventListener("message", (event) => {
    if (event.data && typeof event.data === "string") {
      try {
        const data = JSON.parse(event.data)
        handleMessage(data)
      } catch (e) {
        console.error("Error parsing message:", e)
      }
    }
  })
}

// Handle messages from SAMP
function handleMessage(data) {
  if (DEBUG) {
    console.log("Received message:", data)
  }

  // Handle different message types
  switch (data.type) {
    case "playerUpdate":
      // Update player data
      playerData = { ...playerData, ...data.payload }
      updatePlayerStats()
      updateWantedLevel()
      updateWeaponInfo()
      break

    case "notification":
      // Add new notification
      addNotification(data.message, data.notificationType || "info")
      break

    case "ping":
      // Respond to ping
      sendToSamp({ type: "pong" })
      break

    case "init":
      // Initialize with data
      playerData = { ...playerData, ...data.payload }
      updatePlayerStats()
      updateWantedLevel()
      updateWeaponInfo()
      addNotification("HUD з'єднано з сервером", "success")
      break
  }
}

// Function to send data back to SAMP
function sendToSamp(data) {
  if (typeof cef !== "undefined") {
    // Using CEF API
    cef.emit("hudEvent", JSON.stringify(data))
  } else {
    // Fallback for browser testing
    window.postMessage(JSON.stringify(data), "*")
  }

  if (DEBUG) {
    console.log("Sent to SAMP:", data)
  }
}

// Request update from server (can be called periodically)
function requestUpdate() {
  sendToSamp({ type: "requestUpdate" })
}

// Add error handling
window.onerror = (message, source, lineno, colno, error) => {
  console.error("HUD Error:", message, "at", source, ":", lineno, ":", colno)
  return true
}

