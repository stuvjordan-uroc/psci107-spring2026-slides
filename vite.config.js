import { defineConfig } from "vite";
import { resolve } from "path";
import { sync } from "glob";

const presentations = sync("presentations/*.html").reduce((acc, file) => {
  const name = file.replace("presentations/", "").replace(".html", "");
  acc[name] = resolve(__dirname, file);
  return acc;
}, {});

export default defineConfig({
  base: "/psci107-spring2026-slides/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        ...presentations,
      },
    },
  },
});
