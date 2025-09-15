export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { useESM: true }],
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!react-gauge-component|d3|d3-array)",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    
    "\\.(css|less|scss|sass)$": "identity-obj-proxy", // Mock de estilos para evitar SyntaxError en imports de CSS
  },
};