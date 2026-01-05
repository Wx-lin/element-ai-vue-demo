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
body {
  margin: 0;
  padding: 0;
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  transition: background-color 0.3s, color 0.3s;
}
</style>
