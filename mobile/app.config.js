const appJson = require('./app.json');

module.exports = () => {
  const expoConfig = appJson.expo ?? {};

  return {
    ...expoConfig,
    owner: process.env.EXPO_OWNER || expoConfig.owner,
    ios: {
      ...(expoConfig.ios ?? {}),
      bundleIdentifier:
        process.env.EXPO_IOS_BUNDLE_IDENTIFIER ||
        expoConfig.ios?.bundleIdentifier ||
        'com.currentshoppatna.currentshop',
    },
    android: {
      ...(expoConfig.android ?? {}),
      package:
        process.env.EXPO_ANDROID_PACKAGE ||
        expoConfig.android?.package ||
        'com.currentshoppatna.currentshop',
    },
    extra: {
      ...(expoConfig.extra ?? {}),
      appEnv: process.env.APP_ENV || 'development',
      eas: {
        ...(expoConfig.extra?.eas ?? {}),
        projectId:
          process.env.EXPO_PROJECT_ID ||
          expoConfig.extra?.eas?.projectId ||
          '996be187-8ee1-44ce-a3f9-9ff65a4edee4',
      },
    },
  };
};
