<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ElAConfigProvider } from 'element-ai-vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <ElAConfigProvider :theme="themeStore.theme">
    <RouterView />
  </ElAConfigProvider>
</template>

<style>
:root {
  --app-bg-color: #ffffff;
  --sidebar-bg-color: #f7f7f8;
  --sidebar-border-color: #ececec;
  --text-color: #333333;
  --text-color-secondary: #666666;
  --item-hover-bg: #ececec;
  --card-bg-color: #f9f9f9;
  --card-hover-bg: #f0f0f0;
  --input-bg-color: #ffffff;
  --input-border-color: #e5e5e5;
  --chip-bg-color: #f0f0f0;
  --chip-border-color: #e0e0e0;
}

html.dark {
  --app-bg-color: #121212;
  --sidebar-bg-color: #0f0f0f;
  --sidebar-border-color: #1f1f1f;
  --text-color: #ededed;
  --text-color-secondary: #bdbdbd;
  --item-hover-bg: #1f1f1f;
  --card-bg-color: #1f1f1f;
  --card-hover-bg: #252525;
  --input-bg-color: #2c2c2c;
  --input-border-color: #3a3a3a;
  --chip-bg-color: #1f1f1f;
  --chip-border-color: #333333;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--app-bg-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
  overflow: hidden; /* Prevent body scroll */
}

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
