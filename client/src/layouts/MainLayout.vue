<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  Plus,
  Moon,
  Sunny,
  Link,
} from "@element-plus/icons-vue";
import { useThemeStore } from "../stores/theme";
import { useChatHistoryStore } from "../stores/chatHistory";
import ChatHistoryList from "../components/ChatHistoryList.vue";

const themeStore = useThemeStore();
const chatHistoryStore = useChatHistoryStore();
const router = useRouter();
const route = useRoute();
const isSidebarCollapsed = ref(false);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const handleNewChat = () => {
  // 如果当前在首页，不做任何处理
  if (route.name === "home") {
    return;
  }
  // 如果当前在聊天页面，跳转到首页
  if (route.name === "chat") {
    chatHistoryStore.currentConversationId = null;
    router.push({ name: "home" });
  }
};

onMounted(async () => {
  // 初始化历史记录存储
  await chatHistoryStore.init();
});
</script>

<template>
  <div class="app-layout">
    <!-- Left Sidebar -->
    <aside class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <!-- Logo Area -->
      <div class="sidebar-header">
        <div class="logo-icon" v-show="!isSidebarCollapsed">
          <img
            style="width: 40px; height: 40px"
            src="https://element-ai-vue.com/logo.svg"
            alt="Element AI"
          />
        </div>
        <div class="sidebar-toggle" @click="toggleSidebar" v-show="!isSidebarCollapsed">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 1024 1024"
            class="zhedie-icon"
          >
            <path
              d="M725.333333 132.266667A166.4 166.4 0 0 1 891.733333 298.666667v426.666666c0 91.904-74.496 166.4-166.4 166.4H298.666667A166.442667 166.442667 0 0 1 132.266667 725.333333V298.666667A166.4 166.4 0 0 1 298.666667 132.266667h426.666666z m-281.6 682.666666H725.333333a89.6 89.6 0 0 0 89.6-89.6V298.666667A89.6 89.6 0 0 0 725.333333 209.066667h-281.6v605.866666zM298.666667 209.066667A89.6 89.6 0 0 0 209.066667 298.666667v426.666666c0 49.493333 40.106667 89.6 89.6 89.6h68.266666V209.066667H298.666667z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      <!-- New Chat Button -->
      <div class="new-chat-btn">
        <el-button
          class="btn-block"
          round
          :class="{ 'icon-only': isSidebarCollapsed }"
          @click="handleNewChat"
        >
          <el-icon :class="{ 'mr-2': !isSidebarCollapsed }"><Plus /></el-icon>
          <template v-if="!isSidebarCollapsed">
            新建会话
            <span class="shortcut">⌘ K</span>
          </template>
        </el-button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav" v-show="!isSidebarCollapsed">
        <ChatHistoryList />
      </nav>

      <div class="sidebar-spacer"></div>

      <!-- Bottom Utils -->
      <div class="sidebar-footer">
        <div class="nav-item" @click="themeStore.toggleTheme">
          <el-icon v-if="themeStore.isDark"><Moon /></el-icon>
          <el-icon v-else><Sunny /></el-icon>
          <span v-show="!isSidebarCollapsed">
            {{ themeStore.isDark ? "深色模式" : "浅色模式" }}
          </span>
        </div>

        <a
          class="nav-item"
          href="https://element-ai-vue.com/zh/"
          target="_blank"
          style="text-decoration: none"
        >
          <el-icon><Link /></el-icon>
          <span v-show="!isSidebarCollapsed">官网地址</span>
        </a>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Collapsed Sidebar Toggle Button -->
      <div class="collapsed-toggle-btn" @click="toggleSidebar" v-show="isSidebarCollapsed">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 1024 1024"
          class="zhedie-icon"
        >
          <path
            d="M725.333333 132.266667A166.4 166.4 0 0 1 891.733333 298.666667v426.666666c0 91.904-74.496 166.4-166.4 166.4H298.666667A166.442667 166.442667 0 0 1 132.266667 725.333333V298.666667A166.4 166.4 0 0 1 298.666667 132.266667h426.666666z m-281.6 682.666666H725.333333a89.6 89.6 0 0 0 89.6-89.6V298.666667A89.6 89.6 0 0 0 725.333333 209.066667h-281.6v605.866666zM298.666667 209.066667A89.6 89.6 0 0 0 209.066667 298.666667v426.666666c0 49.493333 40.106667 89.6 89.6 89.6h68.266666V209.066667H298.666667z"
            fill="currentColor"
          />
        </svg>
      </div>
      <router-view />
    </main>
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--app-bg-color);
  color: var(--text-color);
  overflow: hidden;
}

.sidebar {
  width: 260px;
  background-color: var(--sidebar-bg-color);
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-right: 1px solid var(--sidebar-border-color);
  flex-shrink: 0;
  transition: width 0.3s ease, background-color 0.3s, border-color 0.3s;

  &.collapsed {
    width: 0;
    padding: 0;
    border: none;
    overflow: hidden;
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 8px;
    height: 32px;

    .logo-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: var(--text-color);
    }

    .sidebar-toggle {
      color: var(--text-color-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 4px;

      &:hover {
        background-color: var(--item-hover-bg);
        color: var(--text-color);
      }

      .zhedie-icon {
        width: 20px;
        height: 20px;
        color: inherit;
      }
    }
  }

  .new-chat-btn {
    margin-bottom: 20px;
    .btn-block {
      width: 100%;
      background-color: var(--item-hover-bg);
      border: 1px solid var(--sidebar-border-color);
      color: var(--text-color);
      justify-content: flex-start;
      padding: 10px 16px;
      height: 44px;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;

      &:hover {
        background-color: var(--card-hover-bg);
      }

      .shortcut {
        margin-left: 10px;
        font-size: 12px;
        color: var(--text-color-secondary);
        background: var(--app-bg-color);
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-color-secondary);
    transition: background-color 0.2s, color 0.2s;
    white-space: nowrap;

    &:hover {
      background-color: var(--item-hover-bg);
      color: var(--text-color);
    }

    &.active {
      background-color: var(--item-hover-bg);
      color: var(--text-color);
    }

    .el-icon {
      font-size: 18px;
      flex-shrink: 0;
    }
  }

  .sidebar-spacer {
    flex: 1;
  }

  .sidebar-footer {
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-top: 1px solid var(--sidebar-border-color);
    padding-top: 10px;
    width: 100%;
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background-color: var(--app-bg-color);
  transition: background-color 0.3s;

  .collapsed-toggle-btn {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 100;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    cursor: pointer;
    color: var(--text-color-secondary);
    background-color: transparent;
    transition: background-color 0.2s, color 0.2s;

    &:hover {
      background-color: var(--item-hover-bg);
      color: var(--text-color);
    }

    .zhedie-icon {
      width: 20px;
      height: 20px;
      color: inherit;
    }
  }
}

.mr-2 {
  margin-right: 8px;
}
</style>
