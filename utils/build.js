let webpack = require("webpack");
let config = require("../webpack.config");

delete config.chromeExtensionBoilerplate;

webpack(config, err => {
  if (err) throw err;
});