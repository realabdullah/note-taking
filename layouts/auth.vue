<script lang="ts" setup>
const isDark = useIsDark();
</script>

<template>
  <div
    class="h-dvh w-dvw bg-neutral-100 dark:bg-neutral-700 overflow-auto scheme-light-dark flex items-center justify-center p-4 md:p-8 lg:p-16"
  >
    <div
      class="w-full max-w-[540px] mx-auto bg-white dark:bg-neutral-950 min-h-[370px] rounded-12 border border-neutral-200 dark:border-neutral-800 shadow-large dark:shadow-transparent overflow-auto px-4 py-10 md:p-12 lg:p-12"
    >
      <div class="mb-6 flex items-center justify-center">
        <CustomIcon name="logo" width="95" height="28" :fill="isDark ? '#FFFFFF' : undefined" />
      </div>

      <NuxtPage />
    </div>
  </div>
</template>
