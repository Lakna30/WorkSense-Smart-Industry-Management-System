import mqtt from "mqtt";

class MQTTManager {
  constructor() {
    this.client = null;
    this.subscribers = new Map(); // topic -> Set of callbacks
    this.connectionState = {
      connected: false,
      connecting: false,
      error: null
    };
    this.listeners = new Set(); // connection state listeners
    this.messageQueue = []; // Queue messages when disconnected
    this.maxQueueSize = 100; // Maximum queued messages
  }

  connect(options = {}) {
    if (this.client && this.connectionState.connected) {
      return Promise.resolve();
    }

    if (this.connectionState.connecting) {
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (this.connectionState.connected) {
            resolve();
          } else if (!this.connectionState.connecting) {
            resolve();
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    this.connectionState.connecting = true;
    this.connectionState.error = null;

    return new Promise((resolve, reject) => {
      const defaultOptions = {
        clientId: "worksense-client-" + Math.random().toString(16).slice(2),
        keepalive: 60,
        reconnectPeriod: 30000,
        clean: true,
        protocol: 'wss',
        rejectUnauthorized: false,
        connectTimeout: 30000,
        username: '',
        password: '',
        // Additional stability options
        queueQoSZero: false, // Don't queue QoS 0 messages
        reschedulePings: true, // Reschedule pings on activity
        incomingStore: null, // Disable incoming message store
        outgoingStore: null, // Disable outgoing message store
      };

      this.client = mqtt.connect("wss://mqtt-dashboard.com:8884/mqtt", {
        ...defaultOptions,
        ...options
      });

      this.client.on("connect", () => {
        console.log("🔗 MQTT Manager Connected successfully");
        this.connectionState.connected = true;
        this.connectionState.connecting = false;
        
        // Resubscribe to all topics
        this.subscribers.forEach((callbacks, topic) => {
          this.client.subscribe(topic, { qos: 0 });
          console.log(`📡 MQTT Manager resubscribed to: ${topic}`);
        });
        
        // Process any queued messages
        this.processQueuedMessages();
        
        this.notifyListeners();
        resolve();
      });

      this.client.on("close", () => {
        console.log("🔌 MQTT Manager Connection closed");
        this.connectionState.connected = false;
        this.connectionState.connecting = false;
        this.notifyListeners();
      });

      this.client.on("error", (error) => {
        console.error("❌ MQTT Manager Connection error:", error);
        this.connectionState.error = error;
        this.connectionState.connected = false;
        this.connectionState.connecting = false;
        this.notifyListeners();
        reject(error);
      });

      this.client.on("reconnect", () => {
        console.log("🔄 MQTT Manager Reconnecting...");
        this.connectionState.connecting = true;
        this.notifyListeners();
      });

      this.client.on("offline", () => {
        console.log("📴 MQTT Manager Offline");
        this.connectionState.connected = false;
        this.notifyListeners();
      });

      this.client.on("message", (topic, message) => {
        console.log(`📨 MQTT Manager received message on topic: ${topic}`);
        this.processMessage(topic, message);
      });
    });
  }

  subscribe(topic, callback) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic).add(callback);

    if (this.client && this.connectionState.connected) {
      this.client.subscribe(topic, { qos: 0 });
      console.log(`📡 MQTT Manager subscribed to: ${topic}`);
    }

    return () => this.unsubscribe(topic, callback);
  }

  unsubscribe(topic, callback) {
    const callbacks = this.subscribers.get(topic);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscribers.delete(topic);
        if (this.client && this.connectionState.connected) {
          this.client.unsubscribe(topic);
          console.log(`📡 MQTT Manager unsubscribed from: ${topic}`);
        }
      }
    }
  }

  addConnectionListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  processMessage(topic, message) {
    const callbacks = this.subscribers.get(topic);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(topic, message);
        } catch (error) {
          console.error(`❌ Error in MQTT callback for topic ${topic}:`, error);
        }
      });
    }
  }

  queueMessage(topic, message) {
    if (this.messageQueue.length >= this.maxQueueSize) {
      this.messageQueue.shift(); // Remove oldest message
    }
    this.messageQueue.push({ topic, message, timestamp: Date.now() });
  }

  processQueuedMessages() {
    while (this.messageQueue.length > 0) {
      const { topic, message } = this.messageQueue.shift();
      this.processMessage(topic, message);
    }
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.connectionState);
      } catch (error) {
        console.error("❌ Error in connection listener:", error);
      }
    });
  }

  getConnectionState() {
    return { ...this.connectionState };
  }

  disconnect() {
    if (this.client) {
      this.client.end(true);
      this.client = null;
    }
    this.connectionState.connected = false;
    this.connectionState.connecting = false;
    this.subscribers.clear();
    this.listeners.clear();
  }
}

// Create a singleton instance
const mqttManager = new MQTTManager();

export default mqttManager;
