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
        </article>
      </div>
    </section>

    <footer class="chat-footer" role="contentinfo" aria-label="消息输入区域">
      <div class="input-container-wrapper">
        <ElASender
          v-model="input"
          placeholder="hi 我是 Element AI 尽管问我吧～"
          class="custom-sender"
          @send="sendMessage"
          :loading="isLoading"
        >
          <template #top v-if="uploadedFiles.length > 0">
            <div class="uploaded-files-preview">
              <ElAFilesCard
                v-model="uploadedFiles"
                @update:modelValue="uploadedFiles = $event"
              />
            </div>
          </template>

          <template #prefix>
            <div
              class="sender-controls"
              role="toolbar"
              aria-label="消息发送选项"
            >
              <button
                class="deep-thinking-toggle"
                :class="{ active: enableDeepThinking }"
                @click.stop="enableDeepThinking = !enableDeepThinking"
                @mousedown.stop
                type="button"
                :aria-label="
                  enableDeepThinking ? '关闭深度思考' : '开启深度思考'
                "
                :aria-pressed="enableDeepThinking"
              >
                <SvgIcon name="thinking" :size="20" />
              </button>
            </div>
          </template>

          <template #suffix>
            <div class="file-upload-controls">
              <button
                class="file-upload-toggle"
                @click.stop="toggleFileUpload"
                @mousedown.stop
                type="button"
                aria-label="上传文件"
              >
                <SvgIcon name="image-upload" :size="20" />
              </button>
            </div>
          </template>
        </ElASender>
      </div>

      <p class="disclaimer" role="note" aria-label="免责声明">
        AI can make mistakes. Check important info.
      </p>
    </footer>

    <!-- 文件上传弹层 -->
    <div
      v-if="showFileUpload"
      class="file-upload-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      @click="showFileUpload = false"
    >
      <div class="file-upload-modal" @click.stop>
        <header class="file-upload-header">
          <h3 id="upload-modal-title">上传文件</h3>
          <button
            @click="showFileUpload = false"
            class="close-btn"
            type="button"
            aria-label="关闭上传对话框"
          >
            <el-icon :size="20">
              <Close />
            </el-icon>
          </button>
        </header>
        <section class="file-upload-content" aria-label="文件上传区域">
          <ElADragUpload
            v-model="uploadedFiles"
            :multiple="false"
            :accept="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
            :maxFileLength="1"
            :fileSizeLimit="10 * 1024 * 1024"
            @onUpload="handleFileUpload"
            @onErrorMessage="handleFileError"
          >
            <div class="upload-area">
              <el-icon :size="48">
                <UploadFilled />
              </el-icon>
              <p class="upload-text">拖拽图片到这里，或点击上传</p>
              <p class="upload-hint">
                支持 JPG、PNG、GIF、WebP 格式，最大 10MB
              </p>
            </div>
          </ElADragUpload>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  ElASender,
  ElABubble,
  ElAThinking,
  ElADragUpload,
  ElAFilesCard,
  type FilesUploadItem,
} from "element-ai-vue";
import { Close, UploadFilled } from "@element-plus/icons-vue";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useThemeStore } from "../stores/theme";
import SvgIcon from "../components/SvgIcon.vue";

useThemeStore();
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
const showFileUpload = ref(false);

// 文件上传相关函数
const handleFileUpload = async (files: FilesUploadItem[]) => {
  const file = files[0]; // 只处理第一个文件
  if (!file || !file.elementFile) return;

  try {
    const formData = new FormData();
    formData.append("file", file.elementFile);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("文件上传失败");
    }

    const result = await response.json();

    // 更新文件状态为成功
    file.uploadingStatus = "success";
    file.fileId = result.data.fileId;
    file.fileUrl = result.data.fileUrl;
    file.progress = 100;

    uploadedFiles.value = [file]; // 只保留一个文件

    ElMessage.success("文件上传成功");
  } catch (error: any) {
    if (file) {
      file.uploadingStatus = "error";
    }
    ElMessage.error(error.message || "文件上传失败");
  }
};

const handleFileError = (error: any) => {
  ElMessage.error(error.message || "文件处理失败");
};

const toggleFileUpload = () => {
  showFileUpload.value = !showFileUpload.value;
};

const sendMessage = async (text: string) => {
  if (!text.trim() || isLoading.value) return;

  // 获取已上传的文件信息
  const attachedFile = uploadedFiles.value.find(
    (f) => f.uploadingStatus === "success"
  );

  messages.value.push({
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
  });

  input.value = "";
  isLoading.value = true;

  // 清除已上传的文件
  uploadedFiles.value = [];

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
  padding: 20px;
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

.sender-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.deep-thinking-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-color-secondary);
  transition: all 0.2s ease;
  position: relative;
  z-index: 20;
  pointer-events: auto;

  &:hover {
    color: var(--text-color);
    background-color: var(--fill-color-light);
    transform: translateY(-1px);
  }

  &.active {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(0);
  }
}

.file-upload-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-upload-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-color-secondary);
  transition: all 0.2s ease;
  position: relative;
  z-index: 20;
  pointer-events: auto;

  &:hover {
    color: var(--text-color);
    background-color: var(--fill-color-light);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(0);
  }
}

:deep(.el-a-sender) {
  --el-a-sender-bg-color: transparent;
  padding: 0;
  border: none;
  background: transparent;

  .el-textarea__inner {
    padding: 32px 12px 48px 12px;
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

:deep(.el-ai-thinking__content) {
  padding: 15px;
}

// 文件上传弹层样式
.file-upload-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.file-upload-modal {
  background-color: var(--app-bg-color);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid var(--input-border-color);
}

.file-upload-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    color: var(--text-color);
    font-size: 18px;
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-color-secondary);
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: var(--text-color);
      background-color: var(--fill-color-light);
    }
  }
}

.file-upload-content {
  :deep(.el-a-drag-upload) {
    border: 2px dashed var(--input-border-color);
    border-radius: 12px;
    background-color: var(--input-bg-color);
    transition: border-color 0.3s;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;

  .el-icon {
    color: var(--text-color-secondary);
    margin-bottom: 16px;
  }

  .upload-text {
    color: var(--text-color);
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 8px 0;
  }

  .upload-hint {
    color: var(--text-color-secondary);
    font-size: 14px;
    margin: 0;
  }
}

// 文件预览样式
.uploaded-files-preview {
  padding: 12px 0;
  border-bottom: 1px solid var(--input-border-color);
  margin-bottom: 12px;

  :deep(.el-a-files-card) {
    background-color: transparent;
    border: none;
    padding: 0;
  }
}
</style>
