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

  const sync = () => void notes.sync({ pull: true })
  window.addEventListener("online", sync)

  return {
    provide: {
      stopSync: () => {
        window.removeEventListener("online", sync)
      },
    },
  }
})
