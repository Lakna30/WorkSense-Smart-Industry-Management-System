import { useEffect, useState } from "react";
import mqttManager from "../lib/mqttManager.js";

/**
 * MQTT hook for attendance events
 * Subscribes to esp32c3/events topic and processes RFID attendance data
 */
export function useMqttAttendance({
  topic = "esp32c3/events",
}) {
  const [connected, setConnected] = useState(false);
  const [attendanceEvents, setAttendanceEvents] = useState([]);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    // Connect to MQTT if not already connected
    mqttManager.connect().catch(error => {
      console.error("Failed to connect to MQTT:", error);
    });

    // Listen to connection state changes
    const removeConnectionListener = mqttManager.addConnectionListener((state) => {
      setConnected(state.connected);
    });

    // Subscribe to attendance events
    const removeMessageListener = mqttManager.subscribe(topic, async (t, buf) => {
      try {
        const rawMessage = buf.toString();
        console.log("📨 Raw MQTT message received:", rawMessage);
        console.log("📨 Topic:", t);
        
        const eventData = JSON.parse(rawMessage);
        console.log("📨 Parsed attendance event:", eventData);
        
        // Validate required fields
        if (!eventData.uid || !eventData.employee) {
          console.warn("⚠️ Invalid attendance event - missing required fields:", eventData);
          return;
        }
        
        // Process the attendance event
        const processedEvent = await processAttendanceEvent(eventData);
        
        // Update state with the new event
        setLastEvent(processedEvent);
        setAttendanceEvents(prev => [processedEvent, ...prev.slice(0, 49)]); // Keep last 50 events
        
      } catch (error) {
        console.error("❌ Failed to parse attendance event:", error);
        console.error("❌ Raw message was:", buf.toString());
      }
    });

    // Set initial connection state
    setConnected(mqttManager.getConnectionState().connected);

    return () => {
      removeConnectionListener();
      removeMessageListener();
    };
  }, [topic]);

  // Process attendance event and send to backend
  const processAttendanceEvent = async (eventData) => {
    try {
      const { deviceId, ts, type, employee, uid } = eventData;
      
      console.log(`Processing attendance event for ${employee} (${uid})`);
      
      // Send to backend for processing - use full URL
      const response = await fetch('http://localhost:4000/api/attendance/process-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Attendance processed: ${result.data.action} for ${employee}`);
        return {
          ...eventData,
          processed: true,
          action: result.data.action,
          processedAt: new Date().toISOString()
        };
      } else {
        console.error('❌ Failed to process attendance event:', result.message);
        return {
          ...eventData,
          processed: false,
          error: result.message,
          processedAt: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('❌ Error processing attendance event:', error);
      return {
        ...eventData,
        processed: false,
        error: error.message,
        processedAt: new Date().toISOString()
      };
    }
  };

  return { 
    connected, 
    attendanceEvents, 
    lastEvent,
    processAttendanceEvent 
  };
}
