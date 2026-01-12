import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { chatHistoryDB, type Conversation, type ChatMessage } from "../utils/chatHistoryDB";

export const useChatHistoryStore = defineStore("chatHistory", () => {
  const conversations = ref<Conversation[]>([]);
  const currentConversationId = ref<string | null>(null);
  const isLoading = ref(false);

  // 初始化数据库并加载会话列表
  const init = async () => {
    try {
      isLoading.value = true;
      await chatHistoryDB.init();
      await loadConversations();
    } catch (error) {
      console.error("Failed to initialize chat history:", error);
    } finally {
      isLoading.value = false;
    }
  };

  // 加载所有会话
  const loadConversations = async () => {
    try {
      conversations.value = await chatHistoryDB.getAllConversations();
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  // 创建新会话
  const createConversation = async (title: string, initialMessages: ChatMessage[] = []): Promise<string> => {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const conversation: Conversation = {
      id,
      title,
      messages: initialMessages,
      createdAt: now,
      updatedAt: now,
    };

    await chatHistoryDB.saveConversation(conversation);
    await loadConversations();
    currentConversationId.value = id;

    return id;
  };

  // 保存消息到当前会话
  const saveMessage = async (message: ChatMessage) => {
    if (!currentConversationId.value) {
      // 如果没有当前会话，创建新会话
      const title = message.isUser ? message.text.slice(0, 30) : "新会话";
      await createConversation(title, [message]);
      return;
    }

    const conversation = await chatHistoryDB.getConversation(currentConversationId.value);
    if (!conversation) {
      console.error("Conversation not found");
      return;
    }

    conversation.messages.push(message);
    conversation.updatedAt = Date.now();

    // 如果第一条消息是用户消息，更新标题
    if (conversation.messages.length === 1 && message.isUser) {
      conversation.title = message.text.slice(0, 30);
    }

    await chatHistoryDB.saveConversation(conversation);
    await loadConversations();
  };

  // 更新会话的所有消息
  const updateConversationMessages = async (conversationId: string, messages: ChatMessage[]) => {
    const conversation = await chatHistoryDB.getConversation(conversationId);
    if (!conversation) {
      console.error("Conversation not found");
      return;
    }

    conversation.messages = messages;
    conversation.updatedAt = Date.now();

    await chatHistoryDB.saveConversation(conversation);
    await loadConversations();
  };

  // 加载会话
  const loadConversation = async (id: string): Promise<Conversation | null> => {
    try {
      const conversation = await chatHistoryDB.getConversation(id);
      if (conversation) {
        currentConversationId.value = id;
        return conversation;
      }
      return null;
    } catch (error) {
      console.error("Failed to load conversation:", error);
      return null;
    }
  };

  // 删除会话
  const deleteConversation = async (id: string) => {
    try {
      await chatHistoryDB.deleteConversation(id);
      if (currentConversationId.value === id) {
        currentConversationId.value = null;
      }
      await loadConversations();
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  // 清空所有会话
  const clearAllConversations = async () => {
    try {
      await chatHistoryDB.clearAllConversations();
      conversations.value = [];
      currentConversationId.value = null;
    } catch (error) {
      console.error("Failed to clear conversations:", error);
    }
  };

  // 获取当前会话
  const currentConversation = computed(() => {
    if (!currentConversationId.value) return null;
    return conversations.value.find(c => c.id === currentConversationId.value) || null;
  });

  return {
    conversations,
    currentConversationId,
    currentConversation,
    isLoading,
    init,
    loadConversations,
    createConversation,
    saveMessage,
    updateConversationMessages,
    loadConversation,
    deleteConversation,
    clearAllConversations,
  };
});
