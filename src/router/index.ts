import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";
import Upload from "../views/Upload.vue";
import CreateAccount from "@/views/CreateAccount.vue";
import UserSignIn from "@/views/UserSignIn.vue";

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
    component: UserSignIn,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
