#!/bin/bash

# Step 1: Navigate to the Electron app directory
echo "Navigating to Electron app directory..."
cd electron-app-directory # Replace with the actual directory name of your Electron app

# Step 2: Install required Node.js packages
echo "Installing Node.js packages..."
npm install

# Step 3: Create env-variables.json file
echo "Creating env-variables.json file..."

read -p "Enter your Auth0 Domain: " auth0_domain
read -p "Enter your Auth0 Client ID: " auth0_client_id
read -p "Enter your Auth0 Client Secret: " auth_client_secret
read -p "Enter your Auth0 API Identifier: " api_identifier

cat <<EOT > env-variables.json
{
    "auth0Domain": $auth0_domain,
    "clientId": $auth0_client_id,
    "clientSecret": $auth_client_secret,
    "apiIdentifier": $auth_client_identifier
}
EOT

echo "env-variables.json file created successfully."

# Step 4: Start the Electron app
echo "Starting Electron app..."
npm start