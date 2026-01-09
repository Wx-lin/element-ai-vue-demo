<template>
  <main class="home-page" role="main" aria-label="主页">
    <div class="content-wrapper">
      <!-- Title -->
      <h1 class="main-title">Element AI Vue</h1>

      <!-- Input Area -->
      <section class="input-section" aria-label="消息输入区域">
        <CommonSender
          v-model="input"
          placeholder="有什么可以帮助你的吗"
          variant="updown"
          file-upload-position="prefix"
          :use-button-wrapper="false"
          :enable-error-message="false"
          @send="handleSend"
          @update:enableDeepThinking="enableDeepThinking = $event"
          @update:uploadedFiles="uploadedFiles = $event"
          ref="senderRef"
        />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { type FilesUploadItem } from "element-ai-vue";
import CommonSender from "../components/CommonSender.vue";

const router = useRouter();
const input = ref("");
const enableDeepThinking = ref(false);
const uploadedFiles = ref<FilesUploadItem[]>([]);
const senderRef = ref();

const handleSend = async (text: string) => {
  if (!text.trim()) return;

  const query: any = { q: text.trim() };
  if (enableDeepThinking.value) {
    query.reasoning = "true";
  }

  router.push({ name: "chat", query });

  // 清除已上传的文件
  senderRef.value?.clearUploadedFiles();
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

// Home 页面特有的 sender 样式
:deep(.common-sender-wrapper) {
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
</style>
