#!/usr/bin/env node

const axios = require('axios');

/**
 * Script to periodically check the /scrapper/check endpoint
 * This helps keep the session alive and verify authentication
 */

// Configuration
const ENDPOINT = 'http://localhost:3000/scrapper/check';
const CHECK_INTERVAL_MINUTES = 30;
const CHECK_INTERVAL_MS = CHECK_INTERVAL_MINUTES * 60 * 1000;

// Format time for logging
function getTimeFormatted() {
  return new Date().toISOString();
}

// Perform the check
async function performCheck() {
  console.log(`[${getTimeFormatted()}] Performing scheduled check...`);
  
  try {
    const response = await axios.get(ENDPOINT);
    console.log(`[${getTimeFormatted()}] Check successful! Status: ${response.status}`);
    console.log(`[${getTimeFormatted()}] Response: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error(`[${getTimeFormatted()}] Check failed!`);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`[${getTimeFormatted()}] Status: ${error.response.status}`);
        console.error(`[${getTimeFormatted()}] Response: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error(`[${getTimeFormatted()}] No response received. Is the server running?`);
      } else {
        console.error(`[${getTimeFormatted()}] Error: ${error.message}`);
      }
    } else {
      console.error(`[${getTimeFormatted()}] Unexpected error:`, error);
    }
  }
  
  console.log(`[${getTimeFormatted()}] Next check in ${CHECK_INTERVAL_MINUTES} minutes.`);
}

// Start the scheduler
async function startScheduler() {
  console.log(`[${getTimeFormatted()}] Starting check scheduler`);
  console.log(`[${getTimeFormatted()}] Endpoint: ${ENDPOINT}`);
  console.log(`[${getTimeFormatted()}] Check interval: ${CHECK_INTERVAL_MINUTES} minutes`);
  
  // Perform initial check immediately
  await performCheck();
  
  // Set up recurring checks
  setInterval(performCheck, CHECK_INTERVAL_MS);
}

// Run the scheduler
startScheduler().catch(error => {
  console.error(`[${getTimeFormatted()}] Fatal error in scheduler:`, error);
  process.exit(1);
}); 