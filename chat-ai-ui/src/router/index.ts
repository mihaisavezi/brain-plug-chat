import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/home-view.vue";
console.log("🚀 ~ HomeView:", HomeView)
import ChatView from "../views/chat-view.vue";
console.log("🚀 ~ ChatView:", ChatView)


const routes = [
    {
        path: "/",
        component: HomeView,
    },
    {
        path: "/chat",
        component: ChatView,
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
