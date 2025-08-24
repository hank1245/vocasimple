module.exports = function (api) {
  api.cache(true);

  const plugins = [require.resolve("expo-router/babel")];

  if (process.env.NODE_ENV === "production") {
    plugins.push(["transform-remove-console", { exclude: ["error", "warn"] }]);
  }

  // Reanimated plugin must be listed last
  plugins.push("react-native-reanimated/plugin");

  return {
    presets: ["babel-preset-expo"],
    plugins,
  };
};
