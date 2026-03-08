const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver options for expo-router
config.resolver.assetExts.push('cjs');

module.exports = config;
