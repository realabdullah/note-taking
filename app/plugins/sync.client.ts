import { authClient } from "~/lib/auth-client"

export default defineNuxtPlugin(() => {
  const notes = useNotes()
  const session = authClient.useSession()

  watch(
    () => session.value.data?.user.id,
    async (userId) => {
      if (userId) await notes.initialize(userId)
    },
    { immediate: true },
  )

  const sync = () => void notes.sync()
  const onVisibility = () => {
    if (document.visibilityState === "hidden" || document.visibilityState === "visible") sync()
  }

  window.addEventListener("online", sync)
  window.addEventListener("focus", sync)
  document.addEventListener("visibilitychange", onVisibility)

  const interval = window.setInterval(sync, 30_000)

  return {
    provide: {
      stopSync: () => {
        window.clearInterval(interval)
        window.removeEventListener("online", sync)
        window.removeEventListener("focus", sync)
        document.removeEventListener("visibilitychange", onVisibility)
      },
    },
  }
})
