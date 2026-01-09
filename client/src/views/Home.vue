<template>
  <main class="home-page" role="main" aria-label="主页">
    <div class="content-wrapper">
      <!-- Title -->
      <h1 class="main-title">Element AI Vue</h1>

      <!-- Input Area -->
      <section class="input-section" aria-label="消息输入区域">
        <div class="input-container-wrapper">
          <ElASender
            v-model="input"
            placeholder="有什么可以帮助你的吗"
            variant="updown"
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
                <SvgIcon
                  name="thinking"
                  :size="20"
                  :class="{ active: enableDeepThinking }"
                  @click.stop="enableDeepThinking = !enableDeepThinking"
                />
              </div>

              <div class="file-upload-controls">
                <SvgIcon
                  name="image-upload"
                  :size="18"
                  @click.stop="toggleFileUpload"
                />
              </div>
            </template>
          </ElASender>
        </div>
      </section>
    </div>

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
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  ElASender,
  ElADragUpload,
  ElAFilesCard,
  type FilesUploadItem,
} from "element-ai-vue";
import { Close, UploadFilled } from "@element-plus/icons-vue";
import SvgIcon from "../components/SvgIcon.vue";

const router = useRouter();
const input = ref("");
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
  } catch (error: any) {
    if (file) {
      file.uploadingStatus = "error";
    }
    console.error("文件上传失败:", error);
  }
};

const handleFileError = (error: any) => {
  console.error("文件处理失败:", error);
};

const toggleFileUpload = () => {
  showFileUpload.value = !showFileUpload.value;
};

const handleSend = async (text: string) => {
  if (!text.trim()) return;

  const query: any = { q: text.trim() };
  if (enableDeepThinking.value) {
    query.reasoning = "true";
  }

  router.push({ name: "chat", query });

  // 清除已上传的文件
  uploadedFiles.value = [];
};
</script>

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

.deep-thinking-toggle {
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
  cursor: pointer;

  &:hover {
    color: var(--text-color);
    background-color: var(--fill-color-light);
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
    padding: 20px 12px;
    color: var(--text-color);
    box-shadow: none;
    resize: none;
  }
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
