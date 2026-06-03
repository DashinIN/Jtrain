import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/variables.css";
import "./styles/global.css";

function registerServiceWorker() {
  const isDevServer = Boolean(document.querySelector('script[type="module"][src^="/src/"]'));
  if (isDevServer || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/service-worker.js").then(async () => {
      const registration = await navigator.serviceWorker.ready;
      const loadedUrls = performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((url) => new URL(url).origin === window.location.origin);

      registration.active?.postMessage({
        type: "CACHE_URLS",
        urls: [window.location.href, ...loadedUrls],
      });
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
