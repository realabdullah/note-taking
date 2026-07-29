export default defineNuxtPlugin((nuxtApp) => {
  const { initialize, capturePrompt, markInstalled } = usePwaInstall()
  const displayMode = window.matchMedia("(display-mode: standalone)")

  const onDisplayModeChange = () => initialize()

  initialize()
  window.addEventListener("beforeinstallprompt", capturePrompt)
  window.addEventListener("appinstalled", markInstalled)
  displayMode.addEventListener("change", onDisplayModeChange)

  nuxtApp.hook("app:beforeMount", initialize)
})
