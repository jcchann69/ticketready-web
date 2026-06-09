(() => {
  const installButton = document.querySelector("#installAppBtn");
  let deferredInstallPrompt = null;

  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  if (installButton && isStandalone) {
    installButton.hidden = true;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (installButton) {
      installButton.hidden = false;
    }
  });

  installButton?.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    if (installButton) {
      installButton.hidden = true;
    }
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
})();
