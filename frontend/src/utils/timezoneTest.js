// Timezone Testing Helper
// This script helps verify timezone conversions in the browser console

/**
 * Tests timezone conversions across multiple timezones for a given date
 * @param {string} dateTimeStr - ISO datetime string or "now" for current time
 */
function testTimezoneConversions(dateTimeStr = "now") {
  console.group("🌍 Timezone Conversion Test");
  
  // Get test date
  const testDate = dateTimeStr === "now" 
    ? new Date() 
    : new Date(dateTimeStr);
    
  console.log("📆 Test date (local):", testDate.toString());
  console.log("📆 Test date (ISO):", testDate.toISOString());
  console.log("🌐 Browser timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Test conversion across major timezones
  const timezones = [
    { tz: "America/Los_Angeles", name: "US Pacific" },
    { tz: "America/Denver", name: "US Mountain" },
    { tz: "America/Chicago", name: "US Central" },
    { tz: "America/New_York", name: "US Eastern" },
    { tz: "Europe/London", name: "London" },
    { tz: "Europe/Paris", name: "Paris" },
    { tz: "Asia/Dubai", name: "Dubai" },
    { tz: "Asia/Kolkata", name: "India" },
    { tz: "Asia/Tokyo", name: "Tokyo" },
    { tz: "Australia/Sydney", name: "Sydney" }
  ];
  
  console.log("\n🌐 Timezone Conversions:");
  timezones.forEach(({tz, name}) => {
    const options = { 
      timeZone: tz,
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    
    try {
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const formatted = formatter.format(testDate);
      console.log(`${name.padEnd(12)} (${tz.padEnd(20)}): ${formatted}`);
    } catch (err) {
      console.error(`Error formatting ${tz}:`, err);
    }
  });
  
  console.groupEnd();
  
  return "✅ Timezone test complete";
}

/**
 * Simulates creating and viewing an event across different timezones
 * This tests our application's timezone handling
 */
function simulateEventTimezoneScenario() {
  console.group("🔄 Event Timezone Scenario Test");
  
  // 1. Original event in Los Angeles timezone
  const eventStartLA = new Date("2025-10-20T15:00:00"); // 3pm in LA
  console.log("🏆 Event created in Los Angeles at 3:00 PM (Local)");
  console.log("   ISO time:", eventStartLA.toISOString());
  
  // 2. How would this appear in Tokyo? (17 hours ahead)
  const tokyoOptions = { 
    timeZone: 'Asia/Tokyo',
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  };
  const tokyoFormatter = new Intl.DateTimeFormat('en-US', tokyoOptions);
  console.log("\n👀 When viewed from Tokyo:");
  console.log("   Tokyo time:", tokyoFormatter.format(eventStartLA));
  
  // 3. What if event was created in Tokyo timezone?
  const eventStartTokyo = new Date("2025-10-21T13:00:00"); // 1pm in Tokyo
  console.log("\n🏆 Event created in Tokyo at 1:00 PM (Local)");
  console.log("   ISO time:", eventStartTokyo.toISOString());
  
  // 4. How would this appear in Los Angeles? (17 hours behind)
  const laOptions = { 
    timeZone: 'America/Los_Angeles',
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  };
  const laFormatter = new Intl.DateTimeFormat('en-US', laOptions);
  console.log("\n👀 When viewed from Los Angeles:");
  console.log("   Los Angeles time:", laFormatter.format(eventStartTokyo));
  
  console.groupEnd();
  
  return "✅ Event timezone scenario test complete";
}

// Export functions to window for console use
window.testTimezoneConversions = testTimezoneConversions;
window.simulateEventTimezoneScenario = simulateEventTimezoneScenario;

console.log("🧪 Timezone testing utilities loaded!");
console.log("Run testTimezoneConversions() to test current time in different timezones");
console.log("Run testTimezoneConversions('2025-10-20T15:00:00') to test a specific time");
console.log("Run simulateEventTimezoneScenario() to test LA <-> Tokyo timezone scenario");