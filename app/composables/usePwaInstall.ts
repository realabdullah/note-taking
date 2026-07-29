export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean }

const deferredPrompt = shallowRef<InstallPromptEvent | null>(null)

export const usePwaInstall = () => {
  const installed = useState("pwa-installed", () => false)
  const initialized = useState("pwa-install-initialized", () => false)
  const bannerDismissed = useState("pwa-install-banner-dismissed", () => false)
  const installOutcome = useState<"accepted" | "dismissed" | null>("pwa-install-outcome", () => null)

  const isIos = computed(() => {
    if (!import.meta.client) return false
    return /iphone|ipad|ipod/i.test(navigator.userAgent)
  })

  const isSafari = computed(() => {
    if (!import.meta.client) return false
    return /safari/i.test(navigator.userAgent) && !/chrome|crios|android|edg/i.test(navigator.userAgent)
  })

  const canPrompt = computed(() => Boolean(deferredPrompt.value) && !installed.value)
  const shouldShowBanner = computed(
    () => initialized.value && canPrompt.value && !bannerDismissed.value,
  )

  const detectInstalled = () => {
    if (!import.meta.client) return
    installed.value =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as NavigatorWithStandalone).standalone)
  }

  const initialize = () => {
    if (!import.meta.client) return
    detectInstalled()
    bannerDismissed.value = sessionStorage.getItem("fieldnote-install-dismissed") === "1"
    initialized.value = true
  }

  const capturePrompt = (event: Event) => {
    event.preventDefault()
    deferredPrompt.value = event as InstallPromptEvent
    installOutcome.value = null
  }

  const markInstalled = () => {
    installed.value = true
    deferredPrompt.value = null
    installOutcome.value = "accepted"
  }

  const install = async () => {
    const event = deferredPrompt.value
    if (!event) return false

    await event.prompt()
    const choice = await event.userChoice
    installOutcome.value = choice.outcome
    deferredPrompt.value = null

    if (choice.outcome === "accepted") installed.value = true
    return choice.outcome === "accepted"
  }

  const dismissBanner = () => {
    bannerDismissed.value = true
    sessionStorage.setItem("fieldnote-install-dismissed", "1")
  }

  return {
    installed,
    initialized,
    installOutcome,
    isIos,
    isSafari,
    canPrompt,
    shouldShowBanner,
    initialize,
    capturePrompt,
    markInstalled,
    install,
    dismissBanner,
  }
}
