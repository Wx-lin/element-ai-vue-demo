<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { ElASender, ElABubbleList, ElABubble } from "element-ai-vue";
import { useThemeStore } from "../stores/theme";

const themeStore = useThemeStore();

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
</script>

<template>
  <div class="chat-page">
    <div class="chat-header">
      <span>DeepSeek AI</span>
      <el-switch
        v-model="themeStore.isDark"
        active-text="Dark"
        inactive-text="Light"
        inline-prompt
      />
    </div>

    <div class="chat-body">
      <ElABubbleList>
        <ElABubble v-for="msg in messages" :key="msg.id" :content="msg.text" />
      </ElABubbleList>
    </div>

    <div class="chat-footer">
      <ElASender
        v-model="input"
        placeholder="请输入消息..."
        @send="sendMessage"
      />
      <div class="disclaimer">
        DeepSeek can make mistakes. Check important info.
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.chat-body {
  flex: 1;
  overflow: hidden;
}

.chat-footer {
  padding: 1rem;
}

.disclaimer {
  text-align: center;
  font-size: 12px;
  color: #909399;
  margin-top: 0.5rem;
}
</style>
