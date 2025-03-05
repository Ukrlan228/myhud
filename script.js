// Дані гравця (початкові значення)
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

// Масив сповіщень
let notifications = [
  { id: 1, message: "Ласкаво просимо на сервер Lviv RP!", time: "Щойно", type: "info", timestamp: Date.now() },
  {
    id: 2,
    message: "Ви отримали $500 від адміністратора",
    time: "2 хв тому",
    type: "money",
    timestamp: Date.now() - 120000,
  },
]

// Ініціалізація HUD
document.addEventListener("DOMContentLoaded", () => {
  // Оновлення початкових значень
  updatePlayerStats()
  updateWantedLevel()
  updateWeaponInfo()
  renderNotifications()
  updateClock()

  // Оновлення годинника кожну секунду
  setInterval(updateClock, 1000)

  // Видалення старих сповіщень кожні 5 секунд
  setInterval(removeOldNotifications, 5  1000);

  // Видалення старих сповіщень кожні 5 секунд
  setInterval(removeOldNotifications, 5000)

  // Налаштування обробника повідомлень від SAMP
  setupSampMessageHandler()
})
\
// Оновлення статистики гравця
function updatePlayerStats() {
  // Оновлення значень
  document.getElementById("player-id").textContent = playerData.playerId
  document.getElementById("online-players").textContent = playerData.onlinePlayers
  document.getElementById("health-value").textContent = playerData.health
  document.getElementById("armor-value").textContent = playerData.armor
  document.getElementById("hunger-value").textContent = playerData.hunger
  document.getElementById("money-value").textContent = playerData.money.toLocaleString()

  // Оновлення кілець прогресу
  updateProgressRing("health-ring", playerData.health)
  updateProgressRing("armor-ring", playerData.armor)
  updateProgressRing("hunger-ring", playerData.hunger)

  // Додавання анімації пульсації при низькому здоров'ї або голоді
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
}

// Оновлення кільця прогресу
function updateProgressRing(id, value) {
  const ring = document.getElementById(id)
  const circumference = 2 * Math.PI * 20 // 2πr, де r = 20
  const offset = circumference - (value / 100) * circumference
  ring.style.strokeDasharray = `${circumference} ${circumference}`
  ring.style.strokeDashoffset = offset
}

// Оновлення рівня розшуку (зірок)
function updateWantedLevel() {
  const container = document.getElementById("wanted-container")
  const starsContainer = document.getElementById("wanted-stars")

  // Показати/сховати контейнер розшуку
  if (playerData.wanted > 0) {
    container.style.display = "block"

    // Очистити контейнер зірок
    starsContainer.innerHTML = ""

    // Додати активні зірки
    for (let i = 0; i < playerData.wanted; i++) {
      const star = createStarElement(true)
      starsContainer.appendChild(star)
    }

    // Додати неактивні зірки
    for (let i = playerData.wanted; i < 6; i++) {
      const star = createStarElement(false)
      starsContainer.appendChild(star)
    }
  } else {
    container.style.display = "none"
  }
}

// Створення елемента зірки
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

// Оновлення інформації про зброю
function updateWeaponInfo() {
  const container = document.getElementById("weapon-container")
  const ammoCount = document.getElementById("ammo-count")

  // Показати/сховати контейнер зброї
  if (playerData.hasWeaponInHand) {
    container.style.display = "flex"
    ammoCount.textContent = playerData.ammo
  } else {
    container.style.display = "none"
  }
}

// Рендеринг сповіщень
function renderNotifications() {
  const container = document.getElementById("notifications-list")
  container.innerHTML = ""

  notifications.forEach((notification) => {
    const notificationElement = createNotificationElement(notification)
    container.appendChild(notificationElement)
  })
}

// Створення елемента сповіщення
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

// Додавання нового сповіщення
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
}

// Видалення старих сповіщень
function removeOldNotifications() {
  const now = Date.now()
  notifications = notifications.filter((notification) => now - notification.timestamp < 10000)
  renderNotifications()

  // Оновлення часу для існуючих сповіщень
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

// Оновлення годинника
function updateClock() {
  const now = new Date()
  const timeString = now.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
  document.getElementById("current-time").textContent = timeString
}

// Налаштування обробника повідомлень від SAMP
function setupSampMessageHandler() {
  window.addEventListener("message", (event) => {
    if (event.data && typeof event.data === "string") {
      try {
        const data = JSON.parse(event.data)

        // Обробка різних типів повідомлень
        switch (data.type) {
          case "playerUpdate":
            // Оновлення даних гравця
            playerData = { ...playerData, ...data.payload }
            updatePlayerStats()
            updateWantedLevel()
            updateWeaponInfo()
            break

          case "notification":
            // Додавання нового сповіщення
            addNotification(data.message, data.notificationType || "info")
            break

          case "ping":
            // Відповідь на пінг
            window.postMessage(JSON.stringify({ type: "pong" }), "*")
            break
        }
      } catch (e) {
        console.error("Помилка обробки повідомлення від SAMP:", e)
      }
    }
  })

  // Відправка сигналу готовності
  window.postMessage(JSON.stringify({ type: "hudReady" }), "*")
}

// Функція для відправки даних назад до SAMP
function sendToSamp(data) {
  window.postMessage(JSON.stringify(data), "*")
}

