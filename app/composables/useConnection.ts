export const useConnection = () => {
  const isOnline = useState("connection-online", () => true)

  onMounted(() => {
    const update = () => {
      isOnline.value = navigator.onLine
    }

    update()
    window.addEventListener("online", update)
    window.addEventListener("offline", update)

    onBeforeUnmount(() => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    })
  })

  return { isOnline }
}
