<template>
  <nav class="flex">
    <router-link to="/">Squat-Watch</router-link>
    <button @click="signOut" v-if="userSignedIn">Sign Out</button>

    <div>
      <img
        v-if="userHasProfileImage"
        :src="profileImage"
        class="img-thumbnail"
        width="100px"
        height="100px"
      />
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
        store.getters.getMyUID !== undefined || store.getters.getMyUID !== ""
      );
    },
    userHasProfileImage() {
      return (
        store.getters.getUserData.profileImageUrl != "" &&
        store.getters.getUserData.profileImageUrl
      );
    },
  },
});
</script>

<style scoped>
.flex {
  display: flex;
}
</style>
