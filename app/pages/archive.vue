<script setup lang="ts">
definePageMeta({ middleware: "auth" })
useSeoMeta({ title: "Archive · Fieldnote" })

const { archivedNotes, isReady } = useNotes()
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header__copy">
        <p class="eyebrow">Out of the way, not gone</p>
        <h1 class="page-title">Archive.</h1>
        <p class="page-header__description">Finished pages live here until they become useful again.</p>
      </div>
    </header>

    <NoteList v-if="archivedNotes.length" :notes="archivedNotes" />
    <EmptyState
      v-else-if="isReady"
      title="The archive is quiet."
      description="When a note no longer needs your attention, archive it without losing the page."
    />
  </div>
</template>
