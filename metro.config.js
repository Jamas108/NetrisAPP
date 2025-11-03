const { getDefaultConfig } = require('expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver = {
  ...defaultConfig.resolver,
  extraNodeModules: {
    'react-dom': require.resolve('react-native')
  }
};

// Or use this approach to mock react-dom completely:
defaultConfig.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = defaultConfig;