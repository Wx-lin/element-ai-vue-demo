<script setup lang="ts">
import { ref, nextTick } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
// @ts-ignore
import { ElASender, ElABubbleList, ElABubble } from "element-ai-vue";

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
    </div>

    <div class="chat-body">
      <ElABubbleList class="bubble-list-container">
        <div class="bubbles-wrapper">
          <ElABubble
            v-for="msg in messages"
            :key="msg.id"
            :content="msg.text"
            :variant="msg.isUser ? 'user' : 'ai'"
          />
        </div>
      </ElABubbleList>
    </div>

    <div class="chat-footer">
      <div class="sender-wrapper">
        <ElASender
          v-model="input"
          placeholder="请输入消息..."
          variant
          @send="sendMessage"
        />
      </div>
      <div class="disclaimer">
        DeepSeek can make mistakes. Check important info.
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff; /* ChatGPT style white background */
  overflow: hidden;
  font-family: "Söhne", "ui-sans-serif", "system-ui", "-apple-system",
    "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif,
    "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";
}

.chat-header {
  height: 40px;
  background-color: transparent; /* Cleaner header */
  display: flex;
  align-items: center;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 18px;
  color: #202123;
  flex-shrink: 0;
}

.chat-body {
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.bubble-list-container {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  /* 强制给 element-ai-vue 的列表容器设样式 */
  :deep(.el-a-bubble-list) {
    height: 100%;
  }
}

.bubbles-wrapper {
  padding: 24px 0;
  max-width: 768px; /* ChatGPT standard width */
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

.chat-footer {
  background-color: transparent;
  padding: 0 20px 20px;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sender-wrapper {
  max-width: 768px;
  margin: 0 auto;
  width: 100%;
  background-color: #f4f4f4; /* Light gray input background */
  border-radius: 26px;
  padding: 8px; /* Padding for the input container */
  box-shadow: none; /* Flat style initially */
  transition: border-color 0.1s ease-in-out, box-shadow 0.1s ease-in-out;

  &:focus-within {
    background-color: #f4f4f4;
  }

  /* Deep selector to customize ElASender styles if needed */
  :deep(.el-a-sender) {
    background: transparent;
    border: none;
    box-shadow: none;
    --el-a-sender-bg-color: transparent;
  }
}

.disclaimer {
  text-align: center;
  font-size: 12px;
  color: #6e6e80;
  margin-top: 8px;
  padding-bottom: 8px;
}
</style>
