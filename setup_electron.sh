#!/bin/bash

# Step 1: Navigate to the Electron app directory
echo "Navigating to Electron app directory..."
cd electron-app-directory # Replace with the actual directory name of your Electron app

# Step 2: Install required Node.js packages
echo "Installing Node.js packages..."
npm install

# Step 3: Create env-variables.json file
echo "Creating env-variables.json file..."

cat <<EOT > env-variables.json
{
    "auth0Domain": "dev-2qo458j0ehopg3ae.us.auth0.com",
    "clientId": "90h1RC5tiPllcxlEr0ECFN9mVpNDS8Rk",
    "clientSecret": "-LBO6Y3o2D1JJmL904mKD2V0UM24CL5yhfNw30OHKDru93ph3fbLFH9BB4fWIzSL",
    "apiIdentifier": "https://dev-2qo458j0ehopg3ae.us.auth0.com/api/v2/"
}
EOT

echo "env-variables.json file created successfully."

# Step 4: Start the Electron app
echo "Starting Electron app..."
npm start
