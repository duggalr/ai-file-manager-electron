const axios = require('axios');
const url = require('url');
const envVariables = require('../env-variables');
const keytar = require('keytar');
const os = require('os');
// const jwtDecode = require('jwt-decode').default;
// import jwtDecode from "jwt-decode";
const jwtDecode = require('jwt-decode');

const {apiIdentifier, auth0Domain, clientId} = envVariables;

const redirectUri = 'http://localhost/callback';

const keytarService = 'electron-openid-oauth';
const keytarAccount = os.userInfo().username;

let accessToken = null;
let profile = null;
let refreshToken = null;

function getAccessToken() {
    return accessToken;
}

function getProfile() {
    return profile;
}

function getAuthenticationURL() {
    return (
        // "https://" +
        // auth0Domain +
        // "/authorize?" +
        // "scope=openid profile email offline_access&" +
        // "response_type=code&" +
        // "client_id=" +
        // clientId +
        // "&" +
        // "redirect_uri=" +
        // redirectUri

        "https://" +
        auth0Domain +
        "/authorize?" +
        "scope=openid profile email offline_access&" +
        "response_type=code&" +
        "client_id=" +
        clientId +
        "&" +
        "redirect_uri=" +
        redirectUri +
        "&" +
        "audience=" +
        apiIdentifier
    );
}

async function refreshTokens() {
    const refreshToken = await keytar.getPassword(keytarService, keytarAccount);
    if (refreshToken) {
        const refreshOptions = {
            method: 'POST',
            url: `https://${auth0Domain}/oauth/token`,
            headers: {'content-type': 'application/json'},
            data: {
                grant_type: 'refresh_token',
                client_id: clientId,
                refresh_token: refreshToken,
                audience: apiIdentifier,
            }
        };

        try {
            const response = await axios(refreshOptions);
            accessToken = response.data.access_token;
            // console.log('jwt-decode:', jwtDecode);
            // profile = jwtDecode(response.data.id_token);

        } catch (error) {
            await logout();

            throw error;
        }
    } else {
        throw new Error("No available refresh token.");
    }
}

async function loadTokens(callbackURL) {  // callback
    const urlParts = url.parse(callbackURL, true);
    const query = urlParts.query;
    
    const exchangeOptions = {
        'grant_type': 'authorization_code',
        'client_id': clientId,
        'code': query.code,
        'redirect_uri': redirectUri,
        'scope': 'openid profile email offline_access',
        'audience': apiIdentifier,
    };

    const options = {
        method: 'POST',
        url: `https://${auth0Domain}/oauth/token`,
        headers: {
            'content-type': 'application/json'
        },
        data: JSON.stringify(exchangeOptions),
    };

    try {
        const response = await axios(options);

        accessToken = response.data.access_token;
        profile = jwtDecode.jwtDecode(response.data.id_token);
        refreshToken = response.data.refresh_token;

        // Save the refresh token if it exists
        if (refreshToken) {
            await keytar.setPassword(keytarService, keytarAccount, refreshToken);
        }

        // Call Django API to save user profile
        await saveUserProfile(profile);

    } catch (error) {
        await logout();
        throw error;
    }
}


// Function to save user profile to Django backend
async function saveUserProfile(profile) {
    const apiOptions = {
        method: 'POST',
        url: 'http://127.0.0.1:8000/api/save_user_profile',
        // url: 'https://api.filecompanion.app/api/save_user_profile',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,  // Optional: Include the access token if needed for authentication
        },
        data: JSON.stringify(profile),
    };

    try {
        const response = await axios(apiOptions);
        console.log('User profile saved successfully:', response.data);
    } catch (error) {
        console.error('Error saving user profile:', error);
    }
}


async function logout() {
    await keytar.deletePassword(keytarService, keytarAccount);
    accessToken = null;
    profile = null;
    refreshToken = null;
}

function getLogOutUrl() {
    return `https://${auth0Domain}/v2/logout`;
}

module.exports = {
    getAccessToken,
    getAuthenticationURL,
    getLogOutUrl,
    getProfile,
    loadTokens,
    logout,
    refreshTokens,
};