// Test script for shared MQTT connection
import mqttManager from '../lib/mqttManager.js';

const testSharedMqtt = () => {
  console.log("🧪 Testing Shared MQTT Connection...");
  
  // Test connection
  mqttManager.connect().then(() => {
    console.log("✅ MQTT Manager connected successfully");
    
    // Test subscribing to both topics
    const removeSensors = mqttManager.subscribe("esp32c3/sensors", (topic, message) => {
      console.log("📊 Sensors data received:", topic, message.toString());
    });
    
    const removeEvents = mqttManager.subscribe("esp32c3/events", (topic, message) => {
      console.log("📋 Events data received:", topic, message.toString());
    });
    
    console.log("✅ Subscribed to both topics");
    
    // Test connection state
    const state = mqttManager.getConnectionState();
    console.log("📊 Connection state:", state);
    
    // Clean up after 30 seconds
    setTimeout(() => {
      console.log("🧹 Cleaning up test...");
      removeSensors();
      removeEvents();
      console.log("✅ Test completed");
    }, 30000);
    
  }).catch(error => {
    console.error("❌ MQTT Manager connection failed:", error);
  });
};

export default testSharedMqtt;
