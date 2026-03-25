const Constants = require("expo-constants");

const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};

function getApiBaseUrl() {
  const url = extra.API_URL || "http://localhost:3000";
  return String(url).replace(/\/$/, "");
}

function getWebSocketBaseUrl() {
  const explicit = extra.WEBSOCKET_URL;
  if (explicit && String(explicit).trim()) {
    return String(explicit).replace(/\/$/, "");
  }
  const api = getApiBaseUrl();
  if (api.startsWith("https://")) {
    return `wss://${api.slice("https://".length)}`;
  }
  if (api.startsWith("http://")) {
    return `ws://${api.slice("http://".length)}`;
  }
  return api;
}

module.exports = { getApiBaseUrl, getWebSocketBaseUrl };
