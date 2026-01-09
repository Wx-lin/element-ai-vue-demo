<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElASender } from "element-ai-vue";

const router = useRouter();
const input = ref("");
const enableDeepThinking = ref(false);

const handleSend = async (text: string) => {
  if (!text.trim()) return;
  router.push({ name: "chat", query: { q: text.trim() } });
};
</script>

<template>
  <div class="home-page">
    <div class="content-wrapper">
      <!-- Title -->
      <h1 class="main-title">Element AI Vue</h1>

      <!-- Input Area -->
      <div class="input-section">
        <div class="input-container-wrapper">
          <ElASender
            v-model="input"
            placeholder="有什么可以帮助你的吗"
            variant="updown"
            class="custom-sender"
            @send="handleSend"
          >
            <template #prefix>
              <div
                class="deep-thinking-toggle"
                :class="{ active: enableDeepThinking }"
                @click.stop="enableDeepThinking = !enableDeepThinking"
                @mousedown.stop
                title="Toggle Deep Thinking"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </div>
            </template>
          </ElASender>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  color: var(--text-color);
  background-color: var(--app-bg-color);
  transition: background-color 0.3s, color 0.3s;
}

.content-wrapper {
  max-width: 800px;
  width: 100%;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 40px;
  letter-spacing: 2px;
  color: var(--text-color);
}

.input-section {
  width: 100%;
  margin-bottom: 24px;
}

.input-container-wrapper {
  background-color: var(--input-bg-color);
  border: 1px solid var(--input-border-color);
  border-radius: 16px;
  padding: 8px;
  transition: border-color 0.3s;
  position: relative;

  &:focus-within {
    border-color: var(--text-color-secondary);
  }
}

.deep-thinking-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-color-secondary);
  transition: all 0.2s;
  margin-right: 8px;
  position: relative;
  z-index: 20;
  pointer-events: auto;

  &:hover {
    background-color: var(--fill-color-light);
    color: var(--text-color);
  }

  &.active {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }
}

:deep(.el-ai-sender) {
  height: 100px;

  background-color: transparent;
  border: none;
  padding: 0;
  --el-a-sender-bg-color: transparent;
  --el-a-sender-text-color: var(--text-color);
  --el-a-sender-placeholder-text-color: var(--text-color-secondary);

  .el-textarea__inner {
    color: var(--text-color);
    box-shadow: none;
    resize: none;
  }
}
</style>
