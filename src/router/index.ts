import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";
import Upload from "../views/Upload.vue";
import CreateAccount from "@/views/CreateAccount.vue";
import SignIn from "@/views/SignIn.vue";
import Browse from "@/views/Browse.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/upload",
    name: "Upload",
    component: Upload,
  },
  {
    path: "/createAccount",
    name: "Create Account",
    component: CreateAccount,
  },
  {
    path: "/signIn",
    name: "Sign In",
    component: SignIn,
  },
  {
    path: "/browse",
    name: "Browse",
    component: Browse,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
