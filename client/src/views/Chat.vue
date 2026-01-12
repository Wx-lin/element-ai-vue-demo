<template>
  <main class="chat-page" role="main" aria-label="聊天页面">
    <section class="chat-body" aria-label="聊天记录">
      <div
        class="bubbles-container"
        role="log"
        aria-live="polite"
        aria-label="聊天消息列表"
      >
        <article
          v-for="msg in messages"
          :key="msg.id"
          class="message-wrapper"
          :class="{ 'is-user': msg.isUser }"
          :aria-label="msg.isUser ? '用户消息' : 'AI回复'"
          role="article"
        >
          <div
            v-if="!msg.isUser && msg.reasoning_content"
            class="thinking-container"
          >
            <ElAThinking
              title="深度思考"
              style="margin-bottom: 30px; width: 800px"
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
        </article>
      </div>
    </section>

    <footer class="chat-footer" role="contentinfo" aria-label="消息输入区域">
      <CommonSender
        v-model="input"
        placeholder="hi 我是 Element AI 尽管问我吧～"
        :loading="isLoading"
        variant="updown"
        file-upload-position="prefix"
        :use-button-wrapper="false"
        :enable-error-message="false"
        @send="sendMessage"
        @update:enableDeepThinking="enableDeepThinking = $event"
        @update:uploadedFiles="uploadedFiles = $event"
        ref="senderRef"
      />

      <p class="disclaimer" role="note" aria-label="免责声明">
        AI can make mistakes. Check important info.
      </p>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElABubble, ElAThinking, type FilesUploadItem } from "element-ai-vue";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useThemeStore } from "../stores/theme";
import { useChatHistoryStore } from "../stores/chatHistory";
import { type ChatMessage } from "../utils/chatHistoryDB";
import CommonSender from "../components/CommonSender.vue";

useThemeStore();
const chatHistoryStore = useChatHistoryStore();
const route = useRoute();
const router = useRouter();

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  reasoning_content?: string;
  attachedFile?: {
    fileId: string;
    fileName: string;
    fileUrl: string;
  };
}

const messages = ref<Message[]>([]);
const input = ref("");
const isLoading = ref(false);
const enableDeepThinking = ref(false);
const uploadedFiles = ref<FilesUploadItem[]>([]);
const senderRef = ref();

// 将 Message 转换为 ChatMessage 并保存
const saveMessageToHistory = async (message: Message) => {
  const chatMessage: ChatMessage = {
    id: message.id,
    text: message.text,
    isUser: message.isUser,
    reasoning_content: message.reasoning_content,
    attachedFile: message.attachedFile,
    createdAt: Date.now(),
  };

  await chatHistoryStore.saveMessage(chatMessage);
};

// 保存所有消息到历史记录
const saveAllMessagesToHistory = async () => {
  if (messages.value.length === 0) return;

  const chatMessages: ChatMessage[] = messages.value.map((msg) => ({
    id: msg.id,
    text: msg.text,
    isUser: msg.isUser,
    reasoning_content: msg.reasoning_content,
    attachedFile: msg.attachedFile,
    createdAt: Date.now(),
  }));

  if (chatHistoryStore.currentConversationId) {
    await chatHistoryStore.updateConversationMessages(
      chatHistoryStore.currentConversationId,
      chatMessages
    );
  } else {
    // 创建新会话
    const title = messages.value[0]?.text.slice(0, 30) || "新会话";
    await chatHistoryStore.createConversation(title, chatMessages);
  }
};

const sendMessage = async (text: string) => {
  if (!text.trim() || isLoading.value) return;

  // 如果没有当前会话，创建新会话
  if (!chatHistoryStore.currentConversationId) {
    await chatHistoryStore.createConversation(text.trim().slice(0, 30));
  }

  // 获取已上传的文件信息
  const attachedFile = uploadedFiles.value.find(
    (f) => f.uploadingStatus === "success"
  );

  const userMessage: Message = {
    id: Date.now(),
    text: text.trim(),
    isUser: true,
    attachedFile: attachedFile
      ? {
          fileId: attachedFile.fileId,
          fileName: attachedFile.fileName,
          fileUrl: attachedFile.fileUrl,
        }
      : undefined,
  };

  messages.value.push(userMessage);

  // 立即保存用户消息
  await saveMessageToHistory(userMessage);

  input.value = "";
  isLoading.value = true;

  // 清除已上传的文件
  senderRef.value?.clearUploadedFiles();

  try {
    const aiMessage: Message = {
      id: Date.now() + 1,
      text: "",
      isUser: false,
      reasoning_content: enableDeepThinking.value ? "" : undefined,
    };

    messages.value.push(aiMessage);

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
        isReasoningEnabled: true,
        attachedFile: attachedFile,
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
          // 流式响应完成后保存AI回复
          saveAllMessagesToHistory();
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

    // 动态导入 ElMessage
    const { ElMessage } = await import("element-plus");
    ElMessage.error(error.message || "发送失败，请稍后重试");

    const errorMessage: Message = {
      id: Date.now() + 1,
      text: "抱歉，出错了，请稍后再试。",
      isUser: false,
    };

    messages.value.push(errorMessage);
    isLoading.value = false;

    // 保存错误消息
    await saveMessageToHistory(errorMessage);
  }
};

// 加载会话
const loadConversationById = async (id: string) => {
  const conversation = await chatHistoryStore.loadConversation(id);
  if (conversation) {
    // 将 ChatMessage 转换为 Message
    messages.value = conversation.messages.map((msg) => ({
      id: msg.id,
      text: msg.text,
      isUser: msg.isUser,
      reasoning_content: msg.reasoning_content,
      attachedFile: msg.attachedFile,
    }));
  }
};

// 处理会话加载
const handleConversationLoad = async () => {
  const conversationId = route.query.conversationId as string;
  const query = route.query.q as string;
  const reasoning = route.query.reasoning as string;

  if (reasoning === "true") {
    enableDeepThinking.value = true;
  }

  // 如果有关联ID，加载会话
  if (conversationId) {
    await loadConversationById(conversationId);
    // 清除 query param
    router.replace({ query: {} });
    return;
  }

  // 如果有查询参数，发送新消息
  if (query) {
    input.value = query;
    sendMessage(query);
    // Clear query param
    router.replace({ query: {} });
  }
};

// 监听路由参数变化（特别是 conversationId）
watch(
  () => route.query.conversationId,
  async (newId, oldId) => {
    // 只有当 conversationId 真正变化时才处理
    if (newId && newId !== oldId) {
      await loadConversationById(newId as string);
      // 清除 query param
      router.replace({ query: {} });
    }
  }
);

onMounted(async () => {
  // 初始化历史记录存储
  await chatHistoryStore.init();
  // 处理初始加载
  await handleConversationLoad();
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

// Chat 页面特有的 sender 样式
:deep(.common-sender-wrapper) {
  width: 100%;
  max-width: 800px;

  .input-container-wrapper {
    padding: 16px;
  }

  .el-a-sender {
    height: 100px;

    .el-textarea__inner {
      padding: 20px 12px;
    }
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

:deep(.el-ai-thinking__content) {
  padding: 15px;
}
</style>
