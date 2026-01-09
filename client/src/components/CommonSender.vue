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
            <component
              :is="useButtonWrapper ? 'button' : 'div'"
              :class="[
                useButtonWrapper ? 'deep-thinking-toggle' : 'deep-thinking-icon',
                { active: enableDeepThinking }
              ]"
              @click.stop="enableDeepThinking = !enableDeepThinking"
              @mousedown.stop
              :type="useButtonWrapper ? 'button' : undefined"
              :aria-label="useButtonWrapper ? (enableDeepThinking ? '关闭深度思考' : '开启深度思考') : undefined"
              :aria-pressed="useButtonWrapper ? enableDeepThinking : undefined"
            >
              <SvgIcon name="thinking" :size="20" />
            </component>
          </div>

          <!-- 点击上传（prefix 位置） -->
          <div v-if="fileUploadPosition === 'prefix'" class="file-upload-controls">
            <ElAFilesUpload
              v-model="uploadedFiles"
              :multiple="false"
              :accept="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
              :maxFileLength="1"
              :fileSizeLimit="10"
              :onUpload="handleFileUpload"
              :onErrorMessage="handleFileError"
            >
              <component
                :is="useButtonWrapper ? 'button' : 'div'"
                :class="useButtonWrapper ? 'file-upload-toggle' : 'file-upload-icon'"
                :type="useButtonWrapper ? 'button' : undefined"
                :aria-label="useButtonWrapper ? '上传文件' : undefined"
              >
                <SvgIcon name="image-upload" :size="useButtonWrapper ? 20 : 18" />
              </component>
            </ElAFilesUpload>
          </div>
        </template>

        <template #suffix v-if="fileUploadPosition === 'suffix'">
          <!-- 点击上传（suffix 位置） -->
          <div class="file-upload-controls">
            <ElAFilesUpload
              v-model="uploadedFiles"
              :multiple="false"
              :accept="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
              :maxFileLength="1"
              :fileSizeLimit="10"
              :onUpload="handleFileUpload"
              :onErrorMessage="handleFileError"
            >
              <component
                :is="useButtonWrapper ? 'button' : 'div'"
                :class="useButtonWrapper ? 'file-upload-toggle' : 'file-upload-icon'"
                :type="useButtonWrapper ? 'button' : undefined"
                :aria-label="useButtonWrapper ? '上传文件' : undefined"
              >
                <SvgIcon name="image-upload" :size="useButtonWrapper ? 20 : 18" />
              </component>
            </ElAFilesUpload>
          </div>
        </template>
      </ElASender>
    </div>

    <!-- 拖拽上传区域 -->
    <ElADragUpload
      v-model="uploadedFiles"
      :multiple="false"
      :accept="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
      :maxFileLength="1"
      :fileSizeLimit="10"
      :onUpload="handleFileUpload"
      :onErrorMessage="handleFileError"
      class="drag-upload-overlay"
    >
      <template #default>
        <div class="drag-upload-content">
          <el-icon :size="48">
            <UploadFilled />
          </el-icon>
          <p class="upload-text">拖拽图片到这里上传</p>
          <p class="upload-hint">支持 JPG、PNG、GIF、WebP 格式，最大 10MB</p>
        </div>
      </template>
    </ElADragUpload>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  ElASender,
  ElADragUpload,
  ElAFilesUpload,
  ElAFilesCard,
  type FilesUploadItem,
  type FilesUploadErrorParams,
} from "element-ai-vue";
import { UploadFilled } from "@element-plus/icons-vue";
import SvgIcon from "./SvgIcon.vue";

interface Props {
  modelValue: string;
  placeholder?: string;
  variant?: "default" | "updown";
  loading?: boolean;
  fileUploadPosition?: "prefix" | "suffix";
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
  variant: undefined,
  loading: false,
  fileUploadPosition: "prefix",
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

  if (props.enableErrorMessage) {
    import("element-plus").then(({ ElMessage }) => {
      ElMessage.error(error.message);
    });
  }
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
  border-radius: 16px;
  padding: 16px;
  transition: border-color 0.3s;
  position: relative;

  &:focus-within {
    border-color: var(--text-color-secondary);
  }
}

.sender-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

// 深度思考按钮样式 - 图标版本 (Home.vue)
.deep-thinking-icon {
  cursor: pointer;
  color: var(--text-color-secondary);
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-color);
    background-color: var(--fill-color-light);
  }

  &.active {
    color: var(--el-color-primary);
  }
}

// 深度思考按钮样式 - 按钮版本 (Chat.vue)
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

// 文件上传图标版本 (Home.vue)
.file-upload-icon {
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
.drag-upload-overlay {
  // 移除自定义样式，让ElADragUpload组件自己处理
}

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