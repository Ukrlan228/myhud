"use client"

import { useState, useEffect, useCallback } from "react"
import { Heart, Shield, Clock, Users, Coffee, Star, Crosshair } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useSampCefIntegration, type PlayerData, type Notification } from "../cef-integration"

export default function HUD() {
  // Player data state
  const [playerData, setPlayerData] = useState<PlayerData>({
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
  })

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: "Ласкаво просимо на сервер Lviv RP!", time: "Щойно", type: "info", timestamp: Date.now() },
    {
      id: 2,
      message: "Ви отримали $500 від адміністратора",
      time: "2 хв тому",
      type: "money",
      timestamp: Date.now() - 2000,
    },
  ])

  // Function to update player data
  const updatePlayerData = useCallback((newData: Partial<PlayerData>) => {
    setPlayerData((prevData) => ({ ...prevData, ...newData }))
  }, [])

  // Function to add a notification
  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "time">) => {
    setNotifications((prev) => [
      {
        id: Date.now(),
        message: notification.message,
        time: "Щойно",
        type: notification.type,
        timestamp: Date.now(),
      },
      ...prev,
    ])
  }, [])

  // Initialize SAMP CEF integration
  const { sendToSamp } = useSampCefIntegration(updatePlayerData, addNotification)

  // Auto-remove notifications after 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setNotifications((prev) => prev.filter((notification) => now - notification.timestamp < 10000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Real-time clock
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" }),
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" }))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none font-sans text-white">
      {/* Logo and player info in top right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 right-6 pointer-events-auto"
      >
        <div className="flex items-center gap-3">
          {/* Player ID and Online Count */}
          <Card className="bg-black/60 border-none backdrop-blur-md rounded-lg overflow-hidden shadow-lg">
            <CardContent className="p-2 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Badge className="bg-amber-500 text-black text-xs h-5 px-1.5">ID: {playerData.playerId}</Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-green-400" />
                <span className="text-xs font-medium">{playerData.onlinePlayers}</span>
              </div>
            </CardContent>
          </Card>

          {/* Lviv RP Logo - Enhanced Design */}
          <div className="flex items-center">
            <div className="relative h-12 overflow-hidden rounded-lg shadow-2xl">
              {/* Background with dark theme and texture */}
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
              <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-amber-900/20 to-amber-700/30"></div>

              {/* Subtle glow effect */}
              <div className="absolute -inset-1 bg-amber-500/20 blur-md"></div>

              {/* Border effect */}
              <div className="absolute inset-0 border border-amber-500/40 rounded-lg"></div>

              {/* Logo content */}
              <div className="relative flex items-center px-4 py-2 z-10">
                <div className="flex items-center">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center border border-amber-400/50 mr-2 shadow-lg">
                    <span className="text-lg font-black text-white drop-shadow-md">L</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-amber-400 tracking-wider drop-shadow-md">LVIV</span>
                      <div className="ml-1 px-1 bg-black/60 border border-amber-500/50 text-amber-400 text-xs font-black rounded">
                        RP
                      </div>
                    </div>
                    <div className="h-0.5 w-full bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0 mt-0.5"></div>
                    <span className="text-[9px] text-amber-300/80 tracking-widest">UKRAINE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Left side - Map and Notifications */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-3 pointer-events-auto">
        {/* Notifications above map */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="w-64"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-300">Останні сповіщення</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`text-xs p-2 rounded-lg flex items-start gap-2 ${
                    notification.type === "info"
                      ? "bg-blue-500/70"
                      : notification.type === "money"
                        ? "bg-green-500/70"
                        : notification.type === "success"
                          ? "bg-purple-500/70"
                          : "bg-white/70"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      notification.type === "info"
                        ? "bg-blue-800"
                        : notification.type === "money"
                          ? "bg-green-800"
                          : notification.type === "success"
                            ? "bg-purple-800"
                            : "bg-gray-800"
                    }`}
                  ></div>
                  <div>
                    <p className="font-medium leading-tight text-black">{notification.message}</p>
                    <p className="text-black/70 text-[10px] mt-1">{notification.time}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Map on left */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-auto"
        >
          <Card className="w-64 h-64 bg-black/60 border border-white/20 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
            <CardContent className="p-0 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/70 to-gray-900/70">
                {/* Map grid lines */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={`v-${i}`}
                      className="absolute left-0 right-0 h-px bg-white/10"
                      style={{ top: `${i * (100 / 6)}%` }}
                    ></div>
                  ))}
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={`h-${i}`}
                      className="absolute top-0 bottom-0 w-px bg-white/10"
                      style={{ left: `${i * (100 / 6)}%` }}
                    ></div>
                  ))}
                </div>

                {/* Map content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* City blocks representation */}
                  <div className="w-full h-full p-4 relative">
                    {/* Roads */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-gray-600/80 transform -translate-x-1/2"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-600/80 transform -translate-y-1/2"></div>

                    {/* Buildings */}
                    <div className="absolute top-[20%] left-[20%] w-[25%] h-[25%] bg-amber-800/50 border border-amber-700/50 rounded-sm"></div>
                    <div className="absolute top-[20%] right-[20%] w-[20%] h-[30%] bg-amber-800/50 border border-amber-700/50 rounded-sm"></div>
                    <div className="absolute bottom-[20%] left-[25%] w-[20%] h-[20%] bg-amber-800/50 border border-amber-700/50 rounded-sm"></div>
                    <div className="absolute bottom-[25%] right-[25%] w-[15%] h-[15%] bg-amber-800/50 border border-amber-700/50 rounded-sm"></div>

                    {/* Player position */}
                    <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-glow animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 w-8 h-8 border-2 border-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

                    {/* Direction indicator */}
                    <div className="absolute top-[calc(50%-12px)] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[12px] border-l-transparent border-r-transparent border-b-white/80"></div>
                  </div>
                </div>

                {/* Map overlay UI - only time, no location */}
                <div className="absolute top-0 right-0 p-3 flex justify-end items-center bg-gradient-to-b from-black/60 to-transparent">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-amber-400" />
                    <span className="text-xs font-medium">{currentTime}</span>
                  </div>
                </div>

                {/* Compass at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                  <div className="relative w-full h-4 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center space-x-4">
                        <span className="text-[10px] font-bold text-amber-400">W</span>
                        <span className="text-[10px] font-bold text-amber-400">N</span>
                        <span className="text-[10px] font-bold text-amber-400">E</span>
                        <span className="text-[10px] font-bold text-amber-400">S</span>
                      </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-2 bg-white"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right side - Horizontal Health, Armor, Hunger, Money, Stars, Ammo */}
      <div className="absolute top-24 right-6 flex flex-col gap-3 items-end pointer-events-auto">
        {/* Health, Armor, Hunger in a row */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex gap-3"
        >
          {/* Health - Circular */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="4" fill="none" />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#ef4444"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${(2 * Math.PI * 20 * playerData.health) / 100} ${2 * Math.PI * 20 * (1 - playerData.health / 100)}`}
                className={playerData.health < 30 ? "animate-pulse" : ""}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Heart className="h-7 w-7 text-red-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white drop-shadow-md mt-0.5">{playerData.health}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Armor - Circular */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="4" fill="none" />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#3b82f6"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${(2 * Math.PI * 20 * playerData.armor) / 100} ${2 * Math.PI * 20 * (1 - playerData.armor / 100)}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Shield className="h-7 w-7 text-blue-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white drop-shadow-md mt-0.5">{playerData.armor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hunger - Circular */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="4" fill="none" />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#f59e0b"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${(2 * Math.PI * 20 * playerData.hunger) / 100} ${2 * Math.PI * 20 * (1 - playerData.hunger / 100)}`}
                className={playerData.hunger < 30 ? "animate-pulse" : ""}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Coffee className="h-7 w-7 text-amber-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white drop-shadow-md mt-0.5">{playerData.hunger}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Money with Hryvnia symbol - Enhanced */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 border border-green-500/30 flex items-center gap-2 shadow-lg"
        >
          <div className="text-green-400 font-bold text-lg drop-shadow-glow-green">₴</div>
          <span className="text-sm font-semibold bg-gradient-to-r from-green-400 to-emerald-300 text-transparent bg-clip-text">
            {playerData.money.toLocaleString()}
          </span>
        </motion.div>

        {/* Wanted level - 6 stars */}
        {playerData.wanted > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-black/60 border border-amber-500/30 backdrop-blur-md rounded-lg overflow-hidden shadow-lg px-2 py-1"
          >
            <div className="flex items-center gap-0.5">
              {[...Array(playerData.wanted)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
              ))}
              {[...Array(6 - playerData.wanted)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-white/20" />
              ))}
            </div>
          </motion.div>
        )}

        {/* Weapon - Only show when weapon in hand */}
        {playerData.hasWeaponInHand && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 border border-purple-500/30 flex items-center gap-2"
          >
            <Crosshair className="h-4 w-4 text-purple-500" />
            <Badge className="bg-purple-500/20 text-purple-200 border-none text-xs h-5 px-1.5">{playerData.ammo}</Badge>
          </motion.div>
        )}
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .shadow-glow {
          box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 8px 8px;
        }

        .drop-shadow-glow-red {
          filter: drop-shadow(0 0 2px rgba(248, 113, 113, 0.5));
        }

        .drop-shadow-glow-blue {
          filter: drop-shadow(0 0 2px rgba(96, 165, 250, 0.5));
        }

        .drop-shadow-glow-amber {
          filter: drop-shadow(0 0 2px rgba(251, 191, 36, 0.5));
        }

        .drop-shadow-glow-green {
          filter: drop-shadow(0 0 2px rgba(74, 222, 128, 0.5));
        }
      `}</style>
    </div>
  )
}

// Bell icon component since it's not imported from lucide-react
function Bell(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

