const appJson = require("./app.json");

const PROJECT_ID = "996be187-8ee1-44ce-a3f9-9ff65a4edee4";

module.exports = () => {
  const expoConfig = appJson.expo ?? {};
  const projectId = process.env.EXPO_PROJECT_ID || expoConfig.extra?.eas?.projectId || PROJECT_ID;

  return {
    ...expoConfig,
    owner: process.env.EXPO_OWNER || expoConfig.owner,
    // Runtime version — determines OTA update compatibility.
    // "appVersion" policy ties it to the "version" field so a new native
    // build is only required when you bump the version string.
    runtimeVersion: expoConfig.runtimeVersion ?? { policy: "appVersion" },
    // EAS Update configuration
    updates: {
      ...(expoConfig.updates ?? {}),
      url: `https://u.expo.dev/${projectId}`,
      enabled: true,
    },
    ios: {
      ...(expoConfig.ios ?? {}),
      bundleIdentifier:
        process.env.EXPO_IOS_BUNDLE_IDENTIFIER ||
        expoConfig.ios?.bundleIdentifier ||
        "com.currentshoppatna.currentshop",
    },
    android: {
      ...(expoConfig.android ?? {}),
      package:
        process.env.EXPO_ANDROID_PACKAGE ||
        expoConfig.android?.package ||
        "com.currentshoppatna.currentshop",
    },
    extra: {
      ...(expoConfig.extra ?? {}),
      appEnv: process.env.APP_ENV || "development",
      eas: {
        ...(expoConfig.extra?.eas ?? {}),
        projectId,
      },
    },
  };
};
