export type ThemePreference = "light" | "dark" | "system"

export const useTheme = () => {
  const preference = useCookie<ThemePreference>("fieldnote-theme", {
    default: () => "system",
    sameSite: "lax",
  })

  const applyTheme = () => {
    if (!import.meta.client) return
    const resolved =
      preference.value === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : preference.value

    document.documentElement.dataset.theme = resolved
  }

  const setTheme = (next: ThemePreference) => {
    if (preference.value === next) return

    const update = () => {
      preference.value = next
      applyTheme()
    }

    if (!import.meta.client || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      update()
      return
    }

    const documentWithTransitions = document as Document & {
      startViewTransition?: (callback: () => void) => unknown
    }
    if (documentWithTransitions.startViewTransition) {
      documentWithTransitions.startViewTransition(update)
      return
    }

    update()
  }

  onMounted(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    applyTheme()
    media.addEventListener("change", applyTheme)
    onBeforeUnmount(() => media.removeEventListener("change", applyTheme))
  })

  return { preference, setTheme }
}
