import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";
import Upload from "../views/Upload.vue";
import CreateAccount from "@/views/CreateAccount.vue";
import SignIn from "@/views/SignIn.vue";
import History from "@/views/History.vue";
import Browse from "@/views/Browse.vue";
import BrowseUser from "@/views/BrowseUser.vue";

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
    path: "/history",
    name: "History",
    component: History,
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
  {
    path: "/browse/:userName",
    name: "BrowseUser",
    component: BrowseUser,
    props: true
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
