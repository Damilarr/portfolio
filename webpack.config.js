const Dotenv = require("dotenv-webpack");

module.exports = {
  plugins: [
    new Dotenv({
      path: "./.env", // Path to .env file
      safe: false, // Set to true if you want to use .env.example
      systemvars: true, // Load system environment variables
      defaults: false, // Don't load .env.example as defaults
    }),
  ],
};
