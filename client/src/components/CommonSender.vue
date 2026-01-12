<template>
  <div class="common-sender-wrapper">
    <div class="input-container-wrapper">
      <ElASender
        v-model="inputValue"
        :placeholder="placeholder"
        :variant="variant"
        :loading="loading"
        class="custom-sender"
        @send="handleSend"
      >
        <template #action-list v-if="uploadedFiles.length > 0">
          <div class="uploaded-files-preview">
            <ElAFilesCard
              v-model="uploadedFiles"
              @update:modelValue="uploadedFiles = $event"
            />
          </div>
        </template>

        <template #prefix>
          <div class="prefix-controls">
            <div class="file-upload-controls">
              <ElAFilesUpload
                v-model="uploadedFiles"
                :multiple="false"
                :accept="['.pdf', '.docx', '.doc', '.png', '.jpg']"
                :maxFileLength="1"
                :fileSizeLimit="10"
                :onUpload="handleFileUpload"
                :onErrorMessage="handleFileError"
              >
                <button
                  v-if="useButtonWrapper"
                  class="file-upload-toggle"
                  type="button"
                  aria-label="上传文件"
                >
                  <SvgIcon name="attachment" :size="18" />
                </button>
                <div v-else class="file-upload-icon">
                  <SvgIcon name="attachment" :size="18" />
                </div>
              </ElAFilesUpload>
            </div>

            <div class="control-separator"></div>

            <div
              class="sender-controls"
              role="toolbar"
              aria-label="消息发送选项"
            >
              <button
                v-if="useButtonWrapper"
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
                <span class="deep-thinking-text">深度思考</span>
              </button>
              <div
                v-else
                class="deep-thinking-icon"
                :class="{ active: enableDeepThinking }"
                @click.stop="enableDeepThinking = !enableDeepThinking"
                @mousedown.stop
              >
                <SvgIcon name="thinking" :size="20" />
                <span class="deep-thinking-text">深度思考</span>
              </div>
            </div>
          </div>
        </template>
      </ElASender>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  ElASender,
  ElAFilesUpload,
  ElAFilesCard,
  type FilesUploadItem,
  type FilesUploadErrorParams,
} from "element-ai-vue";
import SvgIcon from "./SvgIcon.vue";

interface Props {
  modelValue: string;
  placeholder?: string;
  variant?: "default" | "updown";
  loading?: boolean;
  useButtonWrapper?: boolean;
  enableErrorMessage?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
  (e: "send", text: string): void;
  (e: "update:enableDeepThinking", value: boolean): void;
  (e: "update:uploadedFiles", files: FilesUploadItem[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "有什么可以帮助你的吗",
  loading: false,
  useButtonWrapper: false,
  enableErrorMessage: false,
});

const emit = defineEmits<Emits>();

// 本地状态
const enableDeepThinking = ref(false);
const uploadedFiles = ref<FilesUploadItem[]>([]);

// 计算属性
const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// 监听变化并向外发射事件
watch(enableDeepThinking, (newVal) => {
  emit("update:enableDeepThinking", newVal);
});

watch(
  uploadedFiles,
  (newVal) => {
    emit("update:uploadedFiles", newVal);
  },
  { deep: true }
);

// 文件上传处理函数
const handleFileUpload = async (files: FilesUploadItem[]) => {
  const file = files[0];
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

    if (props.enableErrorMessage) {
      const { ElMessage } = await import("element-plus");
      ElMessage.success("文件上传成功");
    }
  } catch (error: any) {
    if (file) {
      file.uploadingStatus = "error";
    }
    console.error("文件上传失败:", error);

    if (props.enableErrorMessage) {
      const { ElMessage } = await import("element-plus");
      ElMessage.error(error.message || "文件上传失败");
    }
  }
};

// 文件错误处理
const handleFileError = (error: FilesUploadErrorParams) => {
  console.error("文件处理失败:", error);
};

const handleSend = (text: string) => {
  emit("send", text);
};

// 暴露给父组件的方法和状态
defineExpose({
  enableDeepThinking,
  uploadedFiles,
  clearUploadedFiles: () => {
    uploadedFiles.value = [];
  },
});
</script>

<style scoped lang="scss">
.common-sender-wrapper {
  width: 100%;
  position: relative;
}

.input-container-wrapper {
  background-color: var(--input-bg-color);
  border: 1px solid var(--input-border-color);
  border-radius: 24px;
  padding: 16px;
  transition: border-color 0.3s;
  position: relative;

  &:focus-within {
    border-color: var(--text-color-secondary);
  }
}

.prefix-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 8px;
}

.control-separator {
  width: 1px;
  height: 16px;
  background-color: #e5e7eb;
  margin: 0 8px;
}

.sender-controls {
  display: flex;
  align-items: center;
}

// 深度思考按钮样式 - 图标版本 (Home.vue)
.deep-thinking-icon {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 16px;
  cursor: pointer;
  color: var(--text-color);
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }

  &.active {
    color: var(--el-color-primary);
  }

  .deep-thinking-text {
    white-space: nowrap;
  }
}

// 深度思考按钮样式 - 按钮版本 (Chat.vue)
.deep-thinking-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  height: 32px;
  border-radius: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-color-secondary);
  transition: all 0.2s ease;
  position: relative;
  z-index: 20;
  pointer-events: auto;
  gap: 4px;
  font-size: 14px;

  .deep-thinking-text {
    white-space: nowrap;
  }

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
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
}

// 文件上传图标版本 (Home.vue)
.file-upload-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-color-secondary);
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-color);
    background-color: var(--fill-color-light);
  }
}

// 文件上传按钮版本 (Chat.vue)
.file-upload-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
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

    &::placeholder {
      color: var(--text-color-secondary);
    }
  }
}

// 拖拽上传区域样式 - 让组件自己控制显示逻辑
.drag-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;

  .el-icon {
    color: var(--el-color-primary);
  }

  .upload-text {
    color: var(--text-color);
    font-size: 16px;
    font-weight: 500;
    margin: 0;
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

// ElAFilesUpload 样式 - 保持正常的盒子模型以支持点击
:deep(.el-a-files-upload) {
  display: inline-block;
}

:deep(.el-a-drag-upload) {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
}
</style>
