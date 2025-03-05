/**
 * Lviv RP HUD Controller
 * This file controls the HUD display and synchronization with CEF
 */

// Include necessary headers
#include <a_samp>
#include <YSI_Coding\y_hooks> // If you use YSI
// Include your CEF plugin header here
// #include <cef>

// Constants
#define HUD_UPDATE_INTERVAL 1000 // Update interval in ms
#define BROWSER_NAME "lviv_rp_hud"
#define HUD_URL "file:///your_cef_path/index.html" // Local path to your HUD files

// Hook when player connects
hook OnPlayerConnect(playerid)
{
    // Disable default HUD components
    DisableDefaultHUD(playerid);
    
    // Create CEF browser for HUD
    CreatePlayerHUD(playerid);
    
    // Start timer for HUD updates
    SetTimerEx("UpdatePlayerHUD", HUD_UPDATE_INTERVAL, true, "i", playerid);
    return 1;
}

// Hook when player spawns
hook OnPlayerSpawn(playerid)
{
    // Disable default HUD components
    DisableDefaultHUD(playerid);
    
    // Force update HUD data
    UpdatePlayerHUD(playerid);
    return 1;
}

// Disable default SAMP HUD elements
DisableDefaultHUD(playerid)
{
    // Hide default HUD elements
    ShowPlayerHud(playerid, false);
    
    // Disable radar/map (you may want to keep this and just style your own)
    SetPlayerHudComponentEnabled(playerid, HUD_COMPONENT_RADAR, false);
    
    // Disable health and armor bars
    SetPlayerHudComponentEnabled(playerid, HUD_COMPONENT_HEALTH, false);
    SetPlayerHudComponentEnabled(playerid, HUD_COMPONENT_ARMOUR, false);
    
    // Disable weapon and ammo display
    SetPlayerHudComponentEnabled(playerid, HUD_COMPONENT_WEAPON, false);
    SetPlayerHudComponentEnabled(playerid, HUD_COMPONENT_AMMO, false);
    
    // Disable money display
    SetPlayerHudComponentEnabled(playerid, HUD_COMPONENT_MONEY, false);
    
    // Disable breath meter (when underwater)
    SetPlayerHudComponentEnabled(playerid, HUD_COMPONENT_BREATH, false);
    
    // You might need to use togglePlayerHudComponent or other functions
    // depending on your SAMP version and plugins
    
    return 1;
}

// Create CEF browser for HUD
CreatePlayerHUD(playerid)
{
    // Create browser (adjust based on your CEF plugin)
    // For SAMPSON:
    // sampson_create_browser(playerid, BROWSER_NAME, HUD_URL, 0, 0, 1920, 1080, true, true);
    
    // For CEFOF:
    // cef_create_browser(playerid, BROWSER_NAME, HUD_URL, false, true);
    
    // For SAMP-CEF:
    // cef_create(playerid, BROWSER_NAME, HUD_URL, 0, 0, 1920, 1080, true);
    
    // Generic example (replace with your CEF plugin's function):
    CreateBrowser(playerid, BROWSER_NAME, HUD_URL, 0, 0, 1920, 1080, true);
    
    return 1;
}

// Update player HUD data
forward UpdatePlayerHUD(playerid);
public UpdatePlayerHUD(playerid)
{
    // Get current player data
    new Float:health, Float:armor;
    new money, wanted;
    
    // Get player stats
    GetPlayerHealth(playerid, health);
    GetPlayerArmour(playerid, armor);
    money = GetPlayerMoney(playerid);
    wanted = GetPlayerWantedLevel(playerid);
    
    // Get weapon data
    new weapon = GetPlayerWeapon(playerid);
    new ammo = GetPlayerAmmo(playerid);
    new bool:hasWeapon = (weapon > 0 && ammo > 0);
    
    // Get custom data (implement these functions based on your roleplay system)
    new hunger = GetPlayerHunger(playerid); // Your custom function
    new playerId = playerid;
    new onlinePlayers = GetOnlinePlayers(); // Your function to count players
    
    // Format JSON data to send to browser
    new data[512];
    format(data, sizeof(data), 
        "{\"type\":\"playerUpdate\",\"payload\":{"
        "\"health\":%d,"
        "\"armor\":%d,"
        "\"hunger\":%d,"
        "\"money\":%d,"
        "\"ammo\":%d,"
        "\"hasWeaponInHand\":%s,"
        "\"wanted\":%d,"
        "\"playerId\":%d,"
        "\"onlinePlayers\":%d"
        "}}",
        floatround(health),
        floatround(armor),
        hunger,
        money,
        ammo,
        hasWeapon ? "true" : "false",
        wanted,
        playerId,
        onlinePlayers
    );
    
    // Send data to browser
    SendBrowserMessage(playerid, BROWSER_NAME, data);
    
    return 1;
}

// Function to send data to browser (adjust for your CEF plugin)
SendBrowserMessage(playerid, const browserName[], const data[])
{
    // For CEFOF:
    // cef_emit_event(playerid, browserName, "window.postMessage", data, "*");
    
    // For SAMPSON:
    // sampson_eval(playerid, browserName, "window.postMessage('%s', '*');", data);
    
    // For SAMP-CEF:
    // cef_emitjs(playerid, browserName, "window.postMessage('%s', '*');", data);
    
    // Generic example (replace with your CEF plugin's function):
    EvalBrowserJS(playerid, browserName, "window.postMessage('%s', '*');", data);
    
    return 1;
}

// Hook for any other event that should update the HUD
// Example for health change:
hook OnPlayerHealthChange(playerid, Float:oldHealth, Float:newHealth)
{
    new data[128];
    format(data, sizeof(data), "{\"type\":\"playerUpdate\",\"payload\":{\"health\":%d}}", floatround(newHealth));
    SendBrowserMessage(playerid, BROWSER_NAME, data);
    return 1;
}

// Similar hooks for armor, money, wanted level, etc.
// You'll need to implement these based on your server's events

// Function to send notifications to HUD
stock SendHUDNotification(playerid, const message[], const type[] = "info")
{
    new data[512];
    format(data, sizeof(data), 
        "{\"type\":\"notification\","
        "\"message\":\"%s\","
        "\"notificationType\":\"%s\"}",
        message,
        type
    );
    
    SendBrowserMessage(playerid, BROWSER_NAME, data);
    return 1;
}

