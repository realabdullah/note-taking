<script setup lang="ts">
import { authClient } from "~/lib/auth-client"

useTheme()

const { data: session } = await authClient.useSession(useFetch)
</script>

<template>
  <AppShell v-if="session">
    <slot />
  </AppShell>
</template>
