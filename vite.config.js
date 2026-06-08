import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        login: "login.html",
        register: "register.html",
        admin: "admin-dashboard.html",
        driver: "driver-dashboard.html",
      },
    },
  },
});
