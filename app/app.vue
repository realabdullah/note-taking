<script setup lang="ts">
const themeInitScript = `(() => {
  try {
    const cookie = document.cookie.split("; ").find((entry) => entry.startsWith("fieldnote-theme="))
    const preference = cookie ? decodeURIComponent(cookie.slice(cookie.indexOf("=") + 1)) : "system"
    const theme = preference === "dark" || (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light"
    document.documentElement.dataset.theme = theme
  } catch {}
})()`

useHead({
  htmlAttrs: { lang: "en" },
  meta: [
    { name: "theme-color", content: "#1d4ed8" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "default" },
  ],
  link: [{ rel: "apple-touch-icon", href: "/icons/icon-192.svg.png" }],
  script: [
    {
      key: "fieldnote-theme-init",
      innerHTML: themeInitScript,
      tagPosition: "head",
      tagPriority: "critical",
    },
  ],
})
</script>

<template>
  <NuxtLoadingIndicator color="#1d4ed8" :height="2" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
