import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import firebaseApp from "firebase";

Vue.config.productionTip = true;

let app: any = null;

firebaseApp.auth().onAuthStateChanged(async (user) => {
  if (user) {
    store.commit("updateMyUID", user.uid);
  } else {
    store.commit("updateMyUID", "");
  }

  if (!app) {
    app = new Vue({
      router,
      store,
      render: (h) => h(App),
    }).$mount("#app");
  }
});
