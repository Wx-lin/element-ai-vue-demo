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
          <div
            v-if="!msg.isUser && msg.reasoning_content"
            class="thinking-container"
          >
            <ElAThinking
              title="深度思考"
              style="width: 600px; margin-bottom: 30px"
            >
              {{ msg.reasoning_content }}
            </ElAThinking>
          </div>
          <ElABubble
            :content="msg.text"
            variant="filled"
            class="custom-bubble"
            :is-markdown="!msg.isUser"
            :placement="msg.isUser ? 'end' : 'start'"
          />
        </div>
      </div>
    </div>

    <div class="chat-footer">
      <div class="input-container-wrapper">
        <ElASender
          v-model="input"
          placeholder="hi 我是 Element AI 尽管问我吧～"
          class="custom-sender"
          @send="sendMessage"
          :loading="isLoading"
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

      <div class="disclaimer">AI can make mistakes. Check important info.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ElASender, ElABubble, ElAThinking } from "element-ai-vue";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useThemeStore } from "../stores/theme";

useThemeStore();
const route = useRoute();
const router = useRouter();

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  reasoning_content?: string;
}

const messages = ref<Message[]>([]);
const input = ref("");
const isLoading = ref(false);
const enableDeepThinking = ref(false);

const typingOver = ref(true);

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
    messages.value.push({
      id: Date.now() + 1,
      text: "",
      isUser: false,
      reasoning_content: enableDeepThinking.value ? "" : undefined,
    });

    const lastMsg = messages.value[messages.value.length - 1];
    if (!lastMsg) throw new Error("Message initialization failed");

    const ctrl = new AbortController();

    await fetchEventSource("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: text.trim(),
        isReasoningEnabled: enableDeepThinking.value,
      }),
      signal: ctrl.signal,
      onopen(response) {
        console.log("Connection opened", response);
        if (response.ok) {
          return Promise.resolve();
        } else {
          return Promise.reject(
            new Error(`Failed to send message: ${response.status}`)
          );
        }
      },
      onmessage(msg) {
        if (msg.data === "[DONE]") {
          console.log("Stream finished");
          isLoading.value = false;
          return;
        }

        try {
          const parsed = JSON.parse(msg.data);
          const delta = parsed.choices[0]?.delta;

          if (delta?.reasoning_content) {
            if (lastMsg.reasoning_content === undefined) {
              lastMsg.reasoning_content = "";
            }
            lastMsg.reasoning_content += delta.reasoning_content;
          }

          if (delta?.content) {
            lastMsg.text += delta.content;
          }
        } catch (e) {
          console.error("Error parsing JSON:", e);
        }
      },
      onerror(err) {
        console.error("Stream error:", err);
        throw err;
      },
    });
  } catch (error: any) {
    console.error("Chat Error:", error);
    ElMessage.error(error.message || "发送失败，请稍后重试");
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
  const reasoning = route.query.reasoning as string;

  if (reasoning === "true") {
    enableDeepThinking.value = true;
  }

  if (query) {
    input.value = query;
    sendMessage(query);
    // Clear query param
    router.replace({ query: {} });
  }
});
</script>

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
  flex-direction: column;

  &.is-user {
    align-items: flex-end;
  }

  &:not(.is-user) {
    align-items: flex-start;
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
  gap: 12px;
  background-color: var(--app-bg-color);
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
    color: var(--text-color);
  }

  &.active {
    color: var(--el-color-primary);
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

.custom-sender {
  width: 100%;
}

.disclaimer {
  text-align: center;
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-top: 12px;
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

.custom-sender {
  width: 100%;
}

.disclaimer {
  text-align: center;
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-top: 12px;
}

:deep(.el-ai-thinking__content ) {
  padding: 15px;
}
</style>
