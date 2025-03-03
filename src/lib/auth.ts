import ChromeManager from './page-manager';
import readlineSync from 'readline-sync';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const { USERNAME, PASSWORD } = process.env;

// Exit if USERNAME or PASSWORD is not set
if (!USERNAME || !PASSWORD) {
  console.error("❌ Error: USERNAME and/or PASSWORD environment variables are not set in the .env file.");
  process.exit(1);
}

const usernameEnv: string = USERNAME;
const passwordEnv: string = PASSWORD;

async function login() {
  console.log("🚀 Starting ChromeManager...");

  try {
    // Initialize ChromeManager using the NewProfile session
    const chromeManager = await ChromeManager.getInstance('https://app.centraldispatch.com/price-check');

    // Get the active page
    const page = await chromeManager.getActivePage();
    console.log("✅ Page loaded:", page.url());

    // Ensure the Username field exists before typing
    const usernameField = await page.waitForSelector('#Username', { timeout: 5000 }).catch(() => null);
    if (!usernameField) {
      console.error("❌ Username input field not found.");
      await chromeManager.close();
      return;
    }
    await usernameField.type(usernameEnv);
    console.log("✅ Username entered.");

    // Ensure the Password field exists before typing
    const passwordField = await page.waitForSelector('#password', { timeout: 5000 }).catch(() => null);
    if (!passwordField) {
      console.error("❌ Password input field not found.");
      await chromeManager.close();
      return;
    }
    await passwordField.type(passwordEnv);
    console.log("✅ Password entered.");

    // Ensure the "Remember Login" checkbox exists before clicking
    const rememberLogin = await page.waitForSelector('#RememberLogin', { timeout: 5000 }).catch(() => null);
    if (rememberLogin) {
      await rememberLogin.click();
      console.log("✅ Remember Login checked.");
    } else {
      console.error("❌ Remember Login checkbox not found.");
    }

    // Ensure the "SIGN IN" button exists before clicking
    const signInButton = await page.waitForSelector('#loginButton', { timeout: 5000 }).catch(() => null);
    if (signInButton) {
      await signInButton.click();
      console.log("✅ SIGN IN button clicked.");
    } else {
      console.error("❌ SIGN IN button not found.");
      await chromeManager.close();
      return;
    }

    // Wait 3 seconds before clicking SEND CODE
    console.log("⏳ Waiting 3 seconds before sending code...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Ensure the "SEND CODE" button exists before clicking
    const sendCodeButton = await page.waitForSelector('#sendCodeButton', { timeout: 5000 }).catch(() => null);
    if (sendCodeButton) {
      await sendCodeButton.click();
      console.log("✅ SEND CODE button clicked.");
    } else {
      console.error("❌ SEND CODE button not found.");
      await chromeManager.close();
      return;
    }

    // Wait for user input for verification code
    const verificationCode = readlineSync.question("📩 Enter the verification code from your email: ");

    // Ensure the verification code input exists before typing
    const verificationInput = await page.waitForSelector('#VerificationCode', { timeout: 5000 }).catch(() => null);
    if (!verificationInput) {
      console.error("❌ Verification input field not found.");
      await chromeManager.close();
      return;
    }
    await verificationInput.type(verificationCode);
    console.log("✅ Verification code entered.");

    // Submit the verification code
    await verificationInput.press('Enter');
    console.log("✅ Verification complete!");

    // Keep the browser open for review
    console.log("🟢 Keeping browser open for manual review...");
  } catch (error) {
    console.error("❌ Error running ChromeManager login test:", error);
  }
}

// Run the login function
login();