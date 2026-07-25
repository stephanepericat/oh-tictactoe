<script setup lang="ts">
const title = 'Oh! Tic-Tac-Toe'
const description = 'A quick, clever game of tic-tac-toe against an Easy or unbeatable Hard opponent.'
const colorMode = useColorMode()
const themeColor = computed(() => (
  colorMode.value === 'dark' ? '#1d1e1a' : '#f7f3e8'
))

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: themeColor }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary'
})
</script>

<template>
  <UApp>
    <UHeader
      :toggle="false"
      class="border-b border-[var(--game-border)] bg-[var(--game-paper)]"
    >
      <template #left>
        <NuxtLink
          to="/"
          aria-label="Oh! Tic-Tac-Toe home"
          class="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--game-accent)]"
        >
          <AppLogo />
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton
          color="neutral"
          variant="ghost"
          size="lg"
          class="rounded-md text-[var(--game-text-secondary)] hover:bg-[var(--game-surface-strong)] hover:text-[var(--game-ink)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--game-accent)]"
        />

        <UBadge
          color="neutral"
          variant="soft"
          size="lg"
          class="gap-2 rounded-md bg-[var(--game-surface-strong)] px-4 py-2 font-mono text-xs font-semibold tracking-[0.18em] text-[var(--game-text-secondary)]"
        >
          <span
            class="size-2 rounded-full bg-[var(--game-accent)]"
            aria-hidden="true"
          />
          LOCAL
        </UBadge>
      </template>
    </UHeader>

    <UMain class="bg-[var(--game-paper)]">
      <NuxtPage />
    </UMain>
  </UApp>
</template>
