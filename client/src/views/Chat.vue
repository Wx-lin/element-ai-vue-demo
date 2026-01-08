<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import { ElASender, ElABubble, useTyperwriter } from "element-ai-vue";
import { useThemeStore } from "../stores/theme";

useThemeStore();
const route = useRoute();
const router = useRouter();

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isTyping?: boolean;
}

const messages = ref<Message[]>([]);
const input = ref("");
const isLoading = ref(false);

const {
  content: typingContent,
  start,
  stop,
  setText,
  getInfo,
  status: typingStatus,
} = useTyperwriter({
  typingSpeed: 1,
  interval: 20,
});

watch(typingContent, (newVal) => {
  const lastMsg = messages.value[messages.value.length - 1];
  if (lastMsg && !lastMsg.isUser && lastMsg.isTyping) {
    lastMsg.text = newVal;
    
    // Check if typing is complete
    const info = getInfo();
    console.log(`Typing: ${newVal.length}/${info.fullText.length}`, { current: newVal, full: info.fullText });
    
    // if (newVal.length >= info.fullText.length) {
    //   console.log("Typing complete, stopping...");
    //   stop();
    // }
  }
});

watch(typingStatus, (newStatus) => {
  if (newStatus === "stopped") {
    const lastMsg = messages.value[messages.value.length - 1];
    if (lastMsg && !lastMsg.isUser && lastMsg.isTyping) {
      lastMsg.isTyping = false;
      isLoading.value = false;
    }
  }
});

const sendMessage = async (text: string) => { 
  if (!text.trim() || isLoading.value) return;

  messages.value.push({
    id: Date.now(),
    text: text.trim(),
    isUser: true,
  });

  input.value = "";
  isLoading.value = true;

  try {
    const response = await axios.post("/api/chat", { message: text.trim() });
    messages.value.push({
      id: Date.now() + 1,
      text: "",
      isUser: false,
      isTyping: true,
    });
    console.log("Got response:", response.data.reply);
    setText(response.data.reply);
    start();
  } catch (error: any) {
    console.error("Chat Error:", error);
    ElMessage.error(error.response?.data?.message || "发送失败，请稍后重试");
    messages.value.push({
      id: Date.now() + 1,
      text: "抱歉，出错了，请稍后再试。",
      isUser: false,
    });
    isLoading.value = false;
  }
};

onMounted(() => {
  const query = route.query.q as string;
  if (query) {
    input.value = query;
    sendMessage(query);
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
            :is-markdown="!msg.isUser"
            :placement="msg.isUser ? 'end' : 'start'"
            :typing="msg.isTyping"
          />
        </div>
      </div>
    </div>

    <div class="chat-footer">
      <div class="input-container-wrapper">
        <ElASender
          v-model="input"
          placeholder=""
          class="custom-sender"
          @send="sendMessage"
          :loading="isLoading"
        >
        </ElASender>
      </div>

      <div class="disclaimer">AI can make mistakes. Check important info.</div>
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
    &:hover {
      color: var(--text-color);
    }
  }

  .action-icon {
    font-size: 18px;
    color: var(--text-color-secondary);
    cursor: pointer;
    &:hover {
      color: var(--text-color);
    }
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
