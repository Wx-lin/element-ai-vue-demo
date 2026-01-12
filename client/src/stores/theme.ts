import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

const THEME_STORAGE_KEY = "theme-preference";

// 从 localStorage 读取主题设置，默认为浅色
const getStoredTheme = (): boolean => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored !== null) {
      return stored === "dark";
    }
  } catch (error) {
    console.error("Failed to read theme from localStorage:", error);
  }
  // 默认为浅色（false）
  return false;
};

// 保存主题到 localStorage
const saveTheme = (isDark: boolean) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
  } catch (error) {
    console.error("Failed to save theme to localStorage:", error);
  }
};

export const useThemeStore = defineStore("theme", () => {
  const isDark = ref(getStoredTheme());

  const theme = computed(() => (isDark.value ? "dark" : "light"));

  const toggleTheme = () => {
    isDark.value = !isDark.value;
    // 保存到 localStorage
    saveTheme(isDark.value);
  };

  watch(
    isDark,
    (val) => {
      if (val) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      // 保存到 localStorage
      saveTheme(val);
    },
    { immediate: true }
  );

  return {
    isDark,
    theme,
    toggleTheme,
  };
});
