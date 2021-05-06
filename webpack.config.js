const path = require("path");
// https://medium.com/jspoint/integrating-typescript-with-webpack-4534e840a02b

module.exports = {
  // bundling mode
  mode: "development",
  devtool: "source-map",

  // entry files
  entry: path.resolve(__dirname, "src/main.ts"),

  // output bundles (location)
  output: {
    path: path.resolve(__dirname, "dist/js"),
    filename: "main.bundle.js",
  },
  stats: {
    colors: true,
  },
  watch: false,
  watchOptions: {
    aggregateTimeout: 10000,
    ignored: ["node_modules/**"],
  },

  // file resolutions
  // When import statement used in program will search these.
  // import x from './y', will check "y.js" and "y.ts".
  resolve: {
    extensions: [".ts", ".js"],
  },

  // loaders
  // list of loader configuration rules, will be matched for all entry files.
  // If the path of the file matches test pattern, but not exclude.
  // Will be filtered through loaders specified by use.
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
