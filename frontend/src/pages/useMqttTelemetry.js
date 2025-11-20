import { useEffect, useState } from "react";
import mqttManager from "../lib/mqttManager.js";

/**
 * Subscribes to `esp32c3/sensors` on an MQTT WebSocket endpoint and
 * adapts the payload to your dashboard shape.
 */
export function useMqttTelemetry({
  topic = "esp32c3/sensors",
}) {
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState({
    // Default fallbacks shown until first packet arrives
    temp: 0,
    humidity: 0,
    toxic: 0,        // mapped from toxicIdx (0–100 if you prefer; see mapper)
    lightPct: 0,
    lightCat: 0,
    gasCat: 0,
    deviceId: "-",
    ts: new Date().toISOString(),
  });

  useEffect(() => {
    // Connect to MQTT if not already connected
    mqttManager.connect().catch(error => {
      console.error("Failed to connect to MQTT:", error);
    });

    // Listen to connection state changes
    const removeConnectionListener = mqttManager.addConnectionListener((state) => {
      setConnected(state.connected);
    });

    // Subscribe to sensor data
    const removeMessageListener = mqttManager.subscribe(topic, (t, buf) => {
      // Expecting the JSON you sent above
      let pkt;
      try {
        pkt = JSON.parse(buf.toString());
        console.log("Received MQTT message:", pkt);
      } catch (error) {
        console.error("Failed to parse MQTT message:", error);
        return;
      }

      // ---- Map device payload -> dashboard state ----
      // toxicIdx is in your packet (looks like index 0–?); keep as-is or scale to 0–100 if needed.
      const mapped = {
        temp: Number(pkt.temp) ?? 0,
        humidity: Number(pkt.humidity) ?? 0,
        toxic: Number(pkt.toxicIdx) ?? 0,
        lightPct: Number(pkt.lightPct) ?? 0,
        lightCat: Number(pkt.lightCat) ?? 0,
        gasCat: Number(pkt.gasCat) ?? 0,
        deviceId: String(pkt.deviceId || "unknown"),
        ts: pkt.ts || new Date().toISOString(),
      };

      console.log("Mapped data:", mapped);
      setData(mapped);
    });

    // Set initial connection state
    setConnected(mqttManager.getConnectionState().connected);

    return () => {
      removeConnectionListener();
      removeMessageListener();
    };
  }, [topic]);

  return { data, connected };
}
