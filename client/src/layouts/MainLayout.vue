<script setup lang="ts">
import { ref } from 'vue'
import {
  Plus,
  Monitor,
  Search,
  DataAnalysis,
  Reading,
  Clock,
  Moon,
  Sunny,
  Link
} from '@element-plus/icons-vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
const isSidebarCollapsed = ref(false)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<template>
  <div class="app-layout">
    <!-- Left Sidebar -->
    <aside class="sidebar" :class="{ 'collapsed': isSidebarCollapsed }">
      <!-- Logo Area -->
      <div class="sidebar-header">
        <div class="logo-icon" v-show="!isSidebarCollapsed">
          <img style="width: 40px; height: 40px;" src="https://192.144.128.12/logo.svg" alt="Element AI" />
        </div>
        <div class="sidebar-toggle" @click="toggleSidebar">
          <el-icon><Monitor /></el-icon>
        </div>
      </div>

      <!-- New Chat Button -->
      <div class="new-chat-btn">
        <el-button class="btn-block" round :class="{ 'icon-only': isSidebarCollapsed }">
          <el-icon :class="{ 'mr-2': !isSidebarCollapsed }"><Plus /></el-icon>
          <template v-if="!isSidebarCollapsed">
            新建会话
            <span class="shortcut">⌘ K</span>
          </template>
        </el-button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-item active">
          <el-icon><Monitor /></el-icon>
          <span v-show="!isSidebarCollapsed">OK Computer</span>
        </div>
        <div class="nav-item">
          <el-icon><Search /></el-icon>
          <span v-show="!isSidebarCollapsed">深度研究</span>
        </div>
        <div class="nav-item">
          <el-icon><Reading /></el-icon>
          <span v-show="!isSidebarCollapsed">PPT</span>
        </div>
        <div class="nav-item">
          <el-icon><DataAnalysis /></el-icon>
          <span v-show="!isSidebarCollapsed">Kimi Code</span>
        </div>
        <div class="nav-item">
          <el-icon><Clock /></el-icon>
          <span v-show="!isSidebarCollapsed">历史会话</span>
        </div>
      </nav>

      <div class="sidebar-spacer"></div>

      <!-- Bottom Utils -->
      <div class="sidebar-footer">
        <div class="nav-item" @click="themeStore.toggleTheme">
           <el-icon v-if="themeStore.isDark"><Moon /></el-icon>
           <el-icon v-else><Sunny /></el-icon>
           <span v-show="!isSidebarCollapsed">
             {{ themeStore.isDark ? '深色模式' : '浅色模式' }}
           </span>
        </div>
        
        <div class="nav-item">
          <el-icon><Link /></el-icon>
          <span v-show="!isSidebarCollapsed">官网地址</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
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
    width: 80px;
    align-items: center;
    
    .sidebar-header {
      justify-content: center;
      padding: 0;
      .logo-icon { display: none; }
    }
    
    .new-chat-btn .btn-block {
      padding: 10px;
      justify-content: center;
      &.icon-only { width: 44px; }
    }
    
    .nav-item {
      justify-content: center;
      padding: 10px;
    }
    
    .sidebar-footer {
      align-items: center;
    }
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
        margin-left: auto;
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
}

.mr-2 {
  margin-right: 8px;
}
</style>