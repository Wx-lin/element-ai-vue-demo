<script setup lang="ts">
import { ref, nextTick } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
// import { ElMarkdown } from 'element-ai-vue';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const messages = ref<Message[]>([
  { id: 1, text: '你好！我是 DeepSeek 聊天机器人，有什么可以帮你的吗？', isUser: false }
]);
const input = ref('');
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!input.value.trim() || isLoading.value) return;

  const userText = input.value.trim();
  messages.value.push({
    id: Date.now(),
    text: userText,
    isUser: true
  });
  
  input.value = '';
  isLoading.value = true;
  await scrollToBottom();

  try {
    const response = await axios.post('/api/chat', { message: userText });
    messages.value.push({
      id: Date.now() + 1,
      text: response.data.reply,
      isUser: false
    });
  } catch (error: any) {
    console.error('Chat Error:', error);
    ElMessage.error(error.response?.data?.message || '发送失败，请稍后重试');
    messages.value.push({
      id: Date.now() + 1,
      text: '抱歉，出错了，请稍后再试。',
      isUser: false
    });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};
</script>

<template>
  <div class="chat-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>DeepSeek AI Chat</span>
        </div>
      </template>
      
      <div class="messages" ref="messagesContainer">
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="message-wrapper"
          :class="{ 'user-message': msg.isUser, 'bot-message': !msg.isUser }"
        >
          <div class="message-content">
            <!-- <el-markdown :content="msg.text" /> -->
            {{ msg.text }}
          </div>
        </div>
      </div>

      <div class="input-area">
        <el-input
          v-model="input"
          placeholder="请输入消息..."
          @keyup.enter="sendMessage"
          :disabled="isLoading"
        >
          <template #append>
            <el-button @click="sendMessage" :loading="isLoading">发送</el-button>
          </template>
        </el-input>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.chat-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
  box-sizing: border-box;
}

.box-card {
  width: 100%;
  max-width: 800px;
  height: 80vh;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
  }
}

.card-header {
  font-weight: bold;
  text-align: center;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-wrapper {
  display: flex;
  width: 100%;
  
  &.user-message {
    justify-content: flex-end;
    .message-content {
      background-color: #409eff;
      color: white;
      border-radius: 12px 12px 0 12px;
    }
  }

  &.bot-message {
    justify-content: flex-start;
    .message-content {
      background-color: #f4f4f5;
      color: #303133;
      border-radius: 12px 12px 12px 0;
    }
  }
}

.message-content {
  padding: 10px 16px;
  max-width: 80%;
  line-height: 1.5;
  word-wrap: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.input-area {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  background-color: white;
}
</style>
