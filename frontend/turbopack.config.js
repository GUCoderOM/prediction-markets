export default {
  resolve: {
    alias: {},
  },
  experimental: {
    moduleLoaders: {
      // allow mjs in node_modules
      ".mjs": ["mjs"],
    },
  },
};