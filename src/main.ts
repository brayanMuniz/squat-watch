import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import firebaseApp from "firebase";
import "bootstrap";

Vue.config.productionTip = false;

let app: any = null;

firebaseApp.auth().onAuthStateChanged(async (user) => {
  if (user) {
    store.commit("updateMyUID", user.uid);
    await firebaseApp
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get()
      .then((res) => {
        if (res.exists) {
          store.commit("updateUserData", res.data());
        }
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    store.commit("updateMyUID", "");
    store.commit("updateUserData", {});
  }

  if (!app) {
    app = new Vue({
      router,
      store,
      render: (h) => h(App),
    }).$mount("#app");
  }
});
