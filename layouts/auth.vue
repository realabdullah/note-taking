<script lang="ts" setup></script>

<template>
  <div
    class="h-screen w-screen bg-neutral-100 dark:bg-neutral-700 overflow-auto scheme-light-dark flex items-center justify-center p-4 md:p-8 lg:p-16"
  >
    <div
      class="w-full max-w-[540px] mx-auto bg-white dark:bg-neutral-950 min-h-[370px] rounded-12 border border-neutral-200 dark:border-neutral-800 shadow-large dark:shadow-transparent overflow-auto px-4 py-10 md:p-12 lg:p-12"
    >
      <div class="mb-6 flex items-center justify-center">
        <UIcon name="i-custom-logo" :customize="replaceIconColors" size="30" />
      </div>

      <NuxtPage />
    </div>
  </div>
</template>
