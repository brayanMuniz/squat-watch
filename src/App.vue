<template>
  <div>
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { firebaseApp } from "@/firebase";
import store from "./store";

export default Vue.extend({
  name: "App",
  async mounted() {
    firebaseApp.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // Get userData
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

        // Pushes the user to the home page
        if (this.$router.currentRoute.fullPath !== "/") {
          this.$router.push("/");
        }
      } else {
        // The user is not sigend in. Pushes user to create an account.
        if (this.$router.currentRoute.fullPath !== "/createAcccount")
          this.routeToCreateAcconut();
      }
    });
  },
  methods: {
    routeToCreateAcconut() {
      this.$router.push("/createAccount");
    },
    routeToHome() {
      this.$router.push("/");
    },
  },
});
</script>

<style lang="scss">
@import "~bootstrap-icons/font/bootstrap-icons.css";
@import "~bootstrap/scss/bootstrap";
</style>
