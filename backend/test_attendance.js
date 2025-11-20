// Simple test script to verify attendance API endpoints
const testAttendanceAPI = async () => {
  const baseURL = 'http://localhost:4001/api';
  
  console.log('🧪 Testing Attendance API Endpoints...\n');
  
  try {
    // Test 1: Get today's attendance
    console.log('1. Testing GET /attendance/today');
    const todayResponse = await fetch(`${baseURL}/attendance/today`);
    const todayData = await todayResponse.json();
    console.log('✅ Today\'s attendance:', todayData);
    
    // Test 2: Process a sample MQTT event
    console.log('\n2. Testing POST /attendance/process-event');
    const sampleEvent = {
      deviceId: "WS-001",
      ts: "2025-10-23T15:42:33+05:30",
      type: "rfid",
      employee: "Test Employee",
      uid: "TEST123"
    };
    
    const processResponse = await fetch(`${baseURL}/attendance/process-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleEvent)
    });
    
    const processData = await processResponse.json();
    console.log('✅ Process event result:', processData);
    
    // Test 3: Get today's attendance again to see the new record
    console.log('\n3. Testing GET /attendance/today (after processing event)');
    const todayResponse2 = await fetch(`${baseURL}/attendance/today`);
    const todayData2 = await todayResponse2.json();
    console.log('✅ Updated today\'s attendance:', todayData2);
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testAttendanceAPI();
