<template>
  <nav class="navbar navbar-expand-sm navbar-dark bg-dark">
    <!-- Todo: make navbar go on the right side of logo -->
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">Squat-Watch</router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- TODO: make contents go on right side -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav text-end ms-auto">
          <li class="nav-item" v-if="userSignedIn">
            <router-link class="nav-link active" to="/upload"
              >Add Workout</router-link
            >
          </li>

          <li class="nav-item" v-if="userSignedIn">
            <router-link class="nav-link active" to="/history"
              >History</router-link
            >
          </li>

          <li class="nav-item" v-if="!userSignedIn">
            <router-link class="nav-link" to="/signIn">Sign In</router-link>
          </li>

          <li class="nav-item" v-if="userSignedIn">
            <router-link @click="signOut" class="nav-link" to="/"
              >Sign Out</router-link
            >
          </li>

          <!-- Todo: if dropdown toggle is activated, dont show this  -->
          <li class="nav-item" v-if="userSignedIn">
            <router-link class="nav-link" to="/profile"
              ><i class="bi bi-person-circle"> </i>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import store from "@/store";
import Vue from "vue";
import { firebaseApp } from "@/firebase";
export default Vue.extend({
  data() {
    return { profileImage: "" };
  },
  mounted() {
    if (this.userHasProfileImage)
      this.profileImage = store.getters.getUserData.profileImageUrl;
  },
  methods: {
    async signOut() {
      await firebaseApp
        .auth()
        .signOut()
        .then(() => {
          console.log("User was signed out");
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
  computed: {
    userSignedIn() {
      return (
        store.getters.getMyUID !== undefined && store.getters.getMyUID !== ""
      );
    },
    userHasProfileImage() {
      return (
        store.getters.getUserData.profileImageUrl != "" &&
        store.getters.getUserData.profileImageUrl
      );
    },
    onMobile(): boolean {
      // Bootstrap defined small breakpoint
      if (window.screen.width < 576) return true;
      return false;
    },
  },
});
</script>
