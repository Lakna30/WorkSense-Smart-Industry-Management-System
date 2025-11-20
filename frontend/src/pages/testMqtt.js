// Simple MQTT test script for debugging
import mqtt from "mqtt";

const testMqttConnection = () => {
  console.log("🧪 Testing MQTT Connection...");
  
  const client = mqtt.connect("wss://mqtt-dashboard.com:8884/mqtt", {
    clientId: "test-client-" + Math.random().toString(16).slice(2),
    keepalive: 60,
    reconnectPeriod: 5000,
    clean: true,
    protocol: 'wss',
    rejectUnauthorized: false,
    connectTimeout: 30000,
  });

  client.on("connect", () => {
    console.log("✅ MQTT Connected successfully");
    client.subscribe("esp32c3/events", { qos: 0 });
    console.log("✅ Subscribed to esp32c3/events");
  });

  client.on("close", () => {
    console.log("❌ MQTT Connection closed");
  });
  
  client.on("error", (error) => {
    console.error("❌ MQTT Connection error:", error);
  });

  client.on("reconnect", () => {
    console.log("🔄 MQTT Reconnecting...");
  });

  client.on("offline", () => {
    console.log("📴 MQTT Offline");
  });

  client.on("message", (topic, message) => {
    console.log("📨 Message received on topic:", topic);
    console.log("📨 Raw message:", message.toString());
    
    try {
      const data = JSON.parse(message.toString());
      console.log("📨 Parsed data:", data);
    } catch (error) {
      console.error("❌ Failed to parse message:", error);
    }
  });

  // Keep the connection alive for 30 seconds
  setTimeout(() => {
    console.log("🔌 Closing MQTT connection...");
    client.end();
  }, 30000);
};

export default testMqttConnection;
