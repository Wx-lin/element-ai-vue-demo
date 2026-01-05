<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import { ElASender, ElABubble } from "element-ai-vue";
import {
  Setting,
  Monitor,
  Paperclip,
  Box,
  ArrowUp
} from '@element-plus/icons-vue'
import { useThemeStore } from "../stores/theme";

useThemeStore();
const route = useRoute();
const router = useRouter();

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const messages = ref<Message[]>([
  {
    id: 1,
    text: "你好！我是 DeepSeek 聊天机器人，有什么可以帮你的吗？",
    isUser: false,
  },
]);
const input = ref("");
const isLoading = ref(false);

const sendMessage = async () => {
  if (!input.value.trim() || isLoading.value) return;

  const userText = input.value.trim();
  messages.value.push({
    id: Date.now(),
    text: userText,
    isUser: true,
  });

  input.value = "";
  isLoading.value = true;

  try {
    const response = await axios.post("/api/chat", { message: userText });
    messages.value.push({
      id: Date.now() + 1,
      text: response.data.reply,
      isUser: false,
    });
  } catch (error: any) {
    console.error("Chat Error:", error);
    ElMessage.error(error.response?.data?.message || "发送失败，请稍后重试");
    messages.value.push({
      id: Date.now() + 1,
      text: "抱歉，出错了，请稍后再试。",
      isUser: false,
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const query = route.query.q as string;
  if (query) {
    input.value = query;
    sendMessage();
    // Clear query param
    router.replace({ query: {} });
  }
});
</script>

<template>
  <div class="chat-page">
    <div class="chat-body">
      <div class="bubbles-container">
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="message-wrapper"
          :class="{ 'is-user': msg.isUser }"
        >
          <ElABubble 
            :content="msg.text" 
            variant="filled"
            class="custom-bubble"
          />
        </div>
      </div>
    </div>

    <div class="chat-footer">
      <div class="input-container-wrapper">
        <div class="input-counter">22</div>
        <ElASender
          v-model="input"
          placeholder=""
          class="custom-sender"
          @send="sendMessage"
          :loading="isLoading"
        >
          <template #prefix>
             <div class="bottom-left-controls">
               <div class="icon-btn circle-outline">
                 <el-icon><Setting /></el-icon>
               </div>
               <div class="pill-btn">
                 <el-icon><Monitor /></el-icon>
                 <span>OK Computer</span>
               </div>
             </div>
          </template>
          
          <template #suffix>
            <div class="bottom-right-controls">
              <span class="model-selector">K2 ▾</span>
              <el-icon class="action-icon"><Paperclip /></el-icon>
              <el-icon class="action-icon"><Box /></el-icon>
              <div class="divider"></div>
            </div>
          </template>

          <template #button>
             <div class="send-btn-wrapper" @click="sendMessage">
               <el-icon><ArrowUp /></el-icon>
             </div>
          </template>
        </ElASender>
      </div>
      
      <div class="disclaimer">
        DeepSeek can make mistakes. Check important info.
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--app-bg-color);
  color: var(--text-color);
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
  display: flex;
  justify-content: center;
  
  .bubbles-container {
    max-width: 800px;
    width: 100%;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

.message-wrapper {
  display: flex;
  width: 100%;
  
  &.is-user {
    justify-content: flex-end;
  }
  
  :deep(.el-a-bubble) {
    max-width: 80%;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 15px;
    line-height: 1.6;
    background-color: transparent;
  }
}

.chat-footer {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-container-wrapper {
  position: relative;
  width: 100%;
  max-width: 800px;
  background-color: var(--input-bg-color);
  border: 1px solid var(--input-border-color);
  border-radius: 16px;
  padding: 12px;
  transition: border-color 0.3s;
  
  &:focus-within {
    border-color: var(--text-color-secondary);
  }

  .input-counter {
    position: absolute;
    top: 12px;
    left: 16px;
    font-size: 12px;
    color: var(--text-color-secondary);
    z-index: 10;
  }
}

:deep(.el-a-sender) {
  --el-a-sender-bg-color: transparent;
  padding: 0;
  border: none;
  background: transparent;
  
  .el-textarea__inner {
    padding: 24px 4px 40px 4px;
    min-height: 80px !important;
    font-size: 16px;
    color: var(--text-color);
    box-shadow: none; 
    resize: none;
    
    &::placeholder {
      color: var(--text-color-secondary);
    }
  }
  
  .el-a-sender__actions {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    padding: 0 4px;
  }
}

.bottom-left-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .icon-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid var(--text-color-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color-secondary);
    cursor: pointer;
    font-size: 14px;
    
    &:hover {
      color: var(--text-color);
      border-color: var(--text-color);
    }
  }
  
  .pill-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border: 1px solid var(--text-color-secondary);
    border-radius: 16px;
    font-size: 12px;
    color: var(--text-color-secondary);
    cursor: pointer;
    height: 28px;
    
    &:hover {
      color: var(--text-color);
      border-color: var(--text-color);
    }
  }
}

.bottom-right-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  margin-right: 12px;
  
  .model-selector {
    font-size: 12px;
    color: var(--text-color-secondary);
    cursor: pointer;
    &:hover { color: var(--text-color); }
  }
  
  .action-icon {
    font-size: 18px;
    color: var(--text-color-secondary);
    cursor: pointer;
    &:hover { color: var(--text-color); }
  }
  
  .divider {
    width: 1px;
    height: 16px;
    background-color: var(--input-border-color);
  }
}

.send-btn-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #000;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  .el-icon {
    font-size: 16px;
    font-weight: bold;
  }
}

html.dark .send-btn-wrapper {
  background-color: #ededed;
  color: #000;
}

html:not(.dark) .send-btn-wrapper {
  background-color: #000;
  color: #fff;
}

.disclaimer {
  text-align: center;
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-top: 12px;
}
</style>
