<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();


const logout = () => {
    userStore.logout();
    router.push("/");
}
</script>

<template>
    <div class="py-4 px-6 bg-gray-800 shadow-md flex justify-between items-center">
        <Icon icon="unjs:crossws" width="48" height="48" />
        <h1 class="text-2xl font-semibold text-center">
            Brain Plug
        </h1>
        <button @click="logout" type="button" class="text-gray-400 hover:text-white">
            Logout
        </button>
    </div>
</template>
