<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { ref } from "vue";
import { useUserStore } from "../stores/user"
import axios from "axios";
import { router } from "../router";



const userStore = useUserStore();


const name = ref("");
const email = ref("");
const loading = ref(false);
const error = ref("");


const createUser = async () => {
    if (!name.value || !email.value) {
        error.value = "Name and email are required";
        return
    }

    loading.value = true;
    error.value = ''

    try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/register-user`, {
            name: name.value,
            email: email.value
        });

        userStore.setUser({ userId: data.userId, name: data.name });
        router.push('/chat')
    } catch (err) {
        error.value = "Something went wrong. Please try again"
    } finally {
        loading.value = false;
    }
}

</script>

<template>
    <div class="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div class="p-8 bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <Icon icon="unjs:crossws" width="48" height="48" class="text-center mx-auto m-8" />
            <h1 class="text-2xl font-semibold mb-4 text-center">
                Welcome To Brain Plug
            </h1>

            <input type="text" class="w-full p-2 mb-2 bg-gray-700 text-white rounded-lg focus:outline-none"
                placeholder="Name" v-model="name" />
            <input type="email" class="w-full p-2 mb-2 bg-gray-700 text-white rounded-lg focus:outline-none"
                placeholder="Email" v-model="email" />

            <button @click="createUser" class="w-full p-2 bg-blue-500 rounded-lg" :disabled="loading">
                {{ loading ? 'Logging in...' : 'Start Chat' }}
            </button>

            <p v-if="error" class="text-red-400 text-center mt-2">{{ error }}</p>
        </div>
    </div>
</template>
