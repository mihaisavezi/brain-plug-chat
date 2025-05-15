import axios from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useUserStore } from "./user";


interface ChatMessage {
  message: string;
  reply: string;
}

interface FormattedMessage {
  role: 'user' | 'ai';
  content: string;
}


export const useChatStore = defineStore("chat", () => {
  const messages = ref<{role: stringifyQuery; content: string}[]>([]);
  const isLoading = ref(false);
  const userStore = useUserStore();


  // load previous chat messages
  const loadChatHistory = async () => {
    if(!userStore.userId) return

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/get-messages`, {
        userId: userStore.userId
      })

      messages.value = data.messages.flatMap((m: ChatMessage):FormattedMessage[] => [{
        role: 'user',
        content: m.message
      }, {
        role: 'ai',
        content: m.reply
      }]).filter((m: FormattedMessage) => m.content)

    } catch (error) {
      console.error("🚀 ~ error loading chat history:", error);
    }
  }

  // send new message to ai

  const sendMessage = async (message: string) => {
    if(!message.trim() || !userStore.userId) return

    messages.value.push({
      role: 'user',
      content: message  
    })

    isLoading.value = true

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/chat`, {
        userId: userStore.userId,
        message
      })

      messages.value.push({
        role: 'ai',
        content: data.reply
      })

    } catch (error) {
      console.error("🚀 ~ error sending message", error);
      messages.value.push({
        role: 'ai',
        content: 'Something went wrong'
      })
    } finally {
      isLoading.value = false
    }


  }

  return {
    loadChatHistory,
    messages,
    isLoading,
    sendMessage
  }

});
