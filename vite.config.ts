import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // prefer path-based matching (works on Windows and POSIX)
            const normalized = id.replace(/\\/g, "/");

            // lucide icons
            if (/node_modules\/(?:@?lucide|lucide-react)/.test(normalized)) return 'vendor_lucide';

            // recharts and common transitive d3/recharts-scale deps
            if (/node_modules\/(?:recharts|recharts-scale|recharts-scale-.*|d3|d3-array|d3-shape)/.test(normalized))
              return 'vendor_recharts';

            // react-query
            if (/node_modules\/@tanstack\/(?:react-query|query-core)/.test(normalized) || normalized.includes('@tanstack/react-query'))
              return 'vendor_react_query';

            // router
            if (/node_modules\/(?:react-router-dom|history)/.test(normalized)) return 'vendor_router';

            // date pickers
            if (/node_modules\/(?:react-day-picker)/.test(normalized)) return 'vendor_daypicker';

            // date-fns (often pulled in by many libs)
            if (/node_modules\/(?:date-fns)/.test(normalized)) return 'vendor_datefns';

            // sonner (toast library)
            if (/node_modules\/(?:sonner)/.test(normalized)) return 'vendor_sonner';

            return 'vendor';
          }
        },
      },
      plugins: [
        // generate a visual report to analyze bundle composition
        visualizer({ filename: 'dist/bundle-report.html', open: false }),
      ],
    },
  },
}));
