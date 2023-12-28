// vite.config.js
import InspectPlugin from "vite-plugin-inspect";
import { resolve } from "path";

export default {
  plugins: [InspectPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        biblia: resolve(__dirname, "biblia/index.html"),
      },
    },
  },
};
