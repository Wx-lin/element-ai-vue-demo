import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "../layouts/MainLayout.vue";
import Home from "../views/Home.vue";
import Chat from "../views/Chat.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: MainLayout,
      children: [
        {
          path: "",
          name: "home",
          component: Home,
        },
        {
          path: "chat",
          name: "chat",
          component: Chat,
        },
      ],
    },
  ],
});

export default router;
