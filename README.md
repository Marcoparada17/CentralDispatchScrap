# Central Dispatch Scraper

## Setup

Make all the scripts executable first:

```bash
chmod +x scripts/launch-chrome.sh
chmod +x scripts/launch-chrome-ubuntu.sh
chmod +x scripts/check-scheduler.js
```

## Authentication Process

To authenticate with Central Dispatch, follow these steps:

### Step 1: Launch Chrome with Debugging Enabled

#### macOS
Run the following command in a terminal:

```bash
npm run chrome
```

#### Ubuntu
For Ubuntu, run:

```bash
npm run chrome:ubuntu
```

Or you can execute the script directly:

```bash
./scripts/launch-chrome-ubuntu.sh
```

This will launch Chrome with remote debugging enabled on port 9222. **Keep this terminal window open** during the entire authentication process.

### Step 2: Run the Authentication Script

In a separate terminal window, run:

```bash
npm run auth
```

This will:
1. Connect to the Chrome instance launched in Step 1
2. Navigate to the login page
3. Enter your credentials (from your .env file)
4. Guide you through the 2FA verification process

### Step 3: Keep the Session Active (Optional)

To keep your authentication session active, you can run the checker script which will periodically call the API:

```bash
npm run checker
```

Or directly:
```bash
./scripts/check-scheduler.js
```

This script will call the `/scrapper/check` endpoint every 30 minutes to ensure your session stays active.

## Environment Variables

Create a `.env` file in the root directory with:

```
USERNAME=your_username
PASSWORD=your_password
```

## Development

- `npm run build` - Build the TypeScript code
- `npm run dev` - Run the development server
- `npm run start` - Start the production server

### How to Deploy
---
1. **Install Chrome in a Ubuntu server**
```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
```
2. **Install .deb file:**
```bash
sudo dpkg -i google-chrome-stable_current_amd64.deb
```
3. **Install necessary dependencies**
```bash
sudo apt-get install -f
```
4. **Clone the repository**
```bash
git clone https://github.com/DevOpsLP/central-dispatch-scrapper.git
```
5. If Puppeteer dependencies are missing run this command
```bash
sudo apt-get install -y fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcairo2 libcups2 libgbm1 libgtk-3-0 libpango-1.0-0 libvulkan1 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 xdg-utils.
```
or this:
```bash
sudo apt-get install -f
```
5. **Install NodeJS v20+**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

```bash
sudo apt install -y nodejs
```
Check installation:
```bash
node -v
npm -v
```
6. **Install and build the script**
Run the following commands:

```bash
cd central-dispatch-scrapper
```
```bash
npm i
```
```bash
npm run build
```
> [!WARNING]
> Don't Run the code until you finish the next config of Google Chrome

9.	**Create a new profile folder for chrome:**
```bash
mkdir -p ~/.config/google-chrome/NewProfile
```
Fix permisions:
```bash
chmod -R 755 ~/.config/google-chrome/NewProfile
chown -R ubuntu:ubuntu ~/.config/google-chrome/NewProfile
```
Test if it runs properly:
```bash
google-chrome --headless --no-sandbox --disable-gpu --disable-dev-shm-usage --remote-debugging-port=9222 --remote-allow-origins=* --user-data-dir=$HOME/.config/google-chrome --profile-directory="NewProfile" --no-first-run --no-default-browser-check
```
10. **Run the authentication file at src/lib**
```bash
npx ts-node src/lib/auth.ts
```
> [!NOTE]
> Make sure to edit it with your credentials user / password

Follow the prompt
Input your 2-step code

*Expected output:*
```bash
🚀 Starting ChromeManager...
✅ Page loaded: https://app.centraldispatch.com/price-check
✅ Username entered.
✅ Password entered.
✅ Remember Login checked.
✅ SIGN IN button clicked.
⏳ Waiting 3 seconds before sending code...
✅ SEND CODE button clicked.
📩 Enter the verification code from your email: █ █ █ █ █ █
✅ Verification code entered.
✅ Verification complete!
🟢 Keeping browser open for manual review...
```
10. **Install PM2 globally**
```bash
sudo npm i pm2 -g
```
11. **Run the code**
```bash
pm2 start npm --name "central-dispatch" -- run start
```

---
### Test authentication

In order to check if the authentication is valid, you need to call this endpoint:

```bash
curl GET http://localhost:3000/scrapper/check
```
---
