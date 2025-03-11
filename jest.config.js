module.exports = {
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!drizzle-orm/node-postgres)", // Ensure specific subdirectory is transformed
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"], // Add this line
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1", // Add this line to handle ES module imports
  },
};
