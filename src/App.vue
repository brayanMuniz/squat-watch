<template>
  <div id="app">
    <div id="nav">
      <router-link to="/upload">Upload Video</router-link>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { firebaseApp } from "@/firebase";

export default Vue.extend({
  name: "App",
  async mounted() {
    firebaseApp.auth().onAuthStateChanged(async (user) => {
      if (user) {
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
</style>
