/**
 * SAMP CEF Bridge
 * This file provides the JavaScript bridge between the CEF browser and SAMP
 *
 * How to use:
 * 1. Include this file in your HTML/JS project
 * 2. Call initSampCefBridge() to initialize the bridge
 * 3. Use the provided functions to communicate with SAMP
 */

// Global bridge object
window.sampCef = {
  // Flag to check if bridge is initialized
  initialized: false,

  // Callbacks for different message types
  callbacks: {
    playerUpdate: [],
    notification: [],
    init: [],
    custom: {},
  },

  // Debug mode
  debug: false,
}

/**
 * Initialize the SAMP CEF bridge
 * @param {Object} options - Configuration options
 * @param {boolean} options.debug - Enable debug mode
 */
function initSampCefBridge(options = {}) {
  if (window.sampCef.initialized) {
    console.warn("SAMP CEF Bridge already initialized")
    return
  }

  // Set options
  window.sampCef.debug = options.debug || false

  // Set up message listener
  window.addEventListener("message", handleSampMessage)

  // Send ready signal
  sendToSamp({ type: "hudReady" })

  // Set initialized flag
  window.sampCef.initialized = true

  if (window.sampCef.debug) {
    console.log("SAMP CEF Bridge initialized")
  }

  // Start ping interval
  startPingInterval()
}

/**
 * Handle messages from SAMP
 * @param {MessageEvent} event - Message event
 */
function handleSampMessage(event) {
  if (!event.data || typeof event.data !== "string") return

  try {
    const data = JSON.parse(event.data)

    if (window.sampCef.debug) {
      console.log("Received message from SAMP:", data)
    }

    // Handle different message types
    switch (data.type) {
      case "playerUpdate":
        window.sampCef.callbacks.playerUpdate.forEach((callback) => callback(data.payload))
        break

      case "notification":
        window.sampCef.callbacks.notification.forEach((callback) =>
          callback({
            message: data.message,
            type: data.notificationType || "info",
          }),
        )
        break

      case "init":
        window.sampCef.callbacks.init.forEach((callback) => callback(data.payload))
        break

      case "ping":
        sendToSamp({ type: "pong" })
        break

      default:
        // Handle custom message types
        if (window.sampCef.callbacks.custom[data.type]) {
          window.sampCef.callbacks.custom[data.type].forEach((callback) => callback(data))
        }
    }
  } catch (e) {
    console.error("Failed to parse message from SAMP:", e)
  }
}

/**
 * Send data to SAMP
 * @param {Object} data - Data to send
 */
function sendToSamp(data) {
  if (window.sampCef.debug) {
    console.log("Sending message to SAMP:", data)
  }

  window.postMessage(JSON.stringify(data), "*")
}

/**
 * Start ping interval to keep connection alive
 */
function startPingInterval() {
  setInterval(() => {
    sendToSamp({ type: "ping" })
  }, 5000)
}

/**
 * Register a callback for player updates
 * @param {Function} callback - Callback function
 */
function onPlayerUpdate(callback) {
  window.sampCef.callbacks.playerUpdate.push(callback)
}

/**
 * Register a callback for notifications
 * @param {Function} callback - Callback function
 */
function onNotification(callback) {
  window.sampCef.callbacks.notification.push(callback)
}

/**
 * Register a callback for initialization
 * @param {Function} callback - Callback function
 */
function onInit(callback) {
  window.sampCef.callbacks.init.push(callback)
}

/**
 * Register a callback for a custom message type
 * @param {string} type - Message type
 * @param {Function} callback - Callback function
 */
function onCustomMessage(type, callback) {
  if (!window.sampCef.callbacks.custom[type]) {
    window.sampCef.callbacks.custom[type] = []
  }

  window.sampCef.callbacks.custom[type].push(callback)
}

// Export functions
window.initSampCefBridge = initSampCefBridge
window.sendToSamp = sendToSamp
window.onPlayerUpdate = onPlayerUpdate
window.onNotification = onNotification
window.onInit = onInit
window.onCustomMessage = onCustomMessage

