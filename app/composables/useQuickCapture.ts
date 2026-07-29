export const useQuickCapture = () => {
  const requestId = useState("quick-capture-request", () => 0)
  const isPending = useState("quick-capture-pending", () => false)
  const route = useRoute()

  const requestQuickCapture = async () => {
    isPending.value = true
    requestId.value += 1
    if (route.path !== "/") await navigateTo("/")
  }

  return { isPending, requestId, requestQuickCapture }
}
