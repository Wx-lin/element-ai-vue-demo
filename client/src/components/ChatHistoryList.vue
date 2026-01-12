<template>
  <div class="chat-history-list">
    <div
      v-for="conversation in conversations"
      :key="conversation.id"
      class="history-item"
      :class="{ active: conversation.id === currentConversationId }"
      @click="handleConversationClick(conversation.id)"
    >
      <div class="history-item-content">
        <div class="history-item-title">{{ conversation.title }}</div>
        <div class="history-item-time">{{ formatTime(conversation.updatedAt) }}</div>
      </div>
      <button
        class="history-item-delete"
        @click.stop="handleDelete(conversation.id)"
        aria-label="删除会话"
      >
        <el-icon><Close /></el-icon>
      </button>
    </div>
    <div v-if="conversations.length === 0" class="empty-state">
      暂无历史记录
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Close } from "@element-plus/icons-vue";
import { useChatHistoryStore } from "../stores/chatHistory";
import { ElMessageBox } from "element-plus";

const router = useRouter();
const chatHistoryStore = useChatHistoryStore();

const conversations = computed(() => chatHistoryStore.conversations);
const currentConversationId = computed(() => chatHistoryStore.currentConversationId);

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    // 今天
    return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  } else if (days === 1) {
    return "昨天";
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  }
};

const handleConversationClick = (id: string) => {
  router.push({
    name: "chat",
    query: { conversationId: id },
  });
};

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm("确定要删除这条历史记录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await chatHistoryStore.deleteConversation(id);
  } catch (error) {
    // 用户取消，不做任何操作
  }
};
</script>

<style scoped lang="scss">
.chat-history-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-color-secondary);
  transition: background-color 0.2s, color 0.2s;
  position: relative;

  &:hover {
    background-color: var(--item-hover-bg);
    color: var(--text-color);

    .history-item-delete {
      opacity: 1;
    }
  }

  &.active {
    background-color: var(--item-hover-bg);
    color: var(--text-color);
  }
}

.history-item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item-title {
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-item-time {
  font-size: 12px;
  color: var(--text-color-secondary);
  opacity: 0.7;
}

.history-item-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-color-secondary);
  cursor: pointer;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s, background-color 0.2s;

  &:hover {
    background-color: var(--item-hover-bg);
    color: var(--text-color);
  }
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: var(--text-color-secondary);
  font-size: 14px;
}
</style>
