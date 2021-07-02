<template>
  <div>
    <Navbar />

    <div class="row row-cols-sm-1 row-cols-md-3">
      <div class="col" v-for="(user, idx) in usersData" :key="idx">
        <div class="card">
          <router-link
            :to="{
              name: 'BrowseUser',
              params: {
                userName: user.userName,
                userData: user.data,
                userUID: user.uid,
              },
            }"
          >
            <img
              v-if="user.data.profileImageUrl"
              :src="user.data.profileImageUrl"
              class="card-img-top"
              alt="userProfileImage"
          /></router-link>

          <div class="card-body">
            <h5 class="card-title">
              <router-link
                :to="{
                  name: 'BrowseUser',
                  params: {
                    userName: user.userName,
                    userData: user.data,
                    userUID: user.uid,
                  },
                }"
                >{{ user.data.userName }}</router-link
              >
            </h5>
            <h6 class="card-subtitle mb-2 text-muted text-truncate">
              {{ user.data.description }}
            </h6>
            <p class="card-text"></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Navbar from "@/components/Navbar.vue";
import { firebaseApp } from "@/firebase";

export default Vue.extend({
  data() {
    return {
      usersData: Array<any>(),
    };
  },
  mounted() {
    this.getRandomUserData();
  },
  methods: {
    async getRandomUserData() {
      await firebaseApp
        .firestore()
        .collection("users")
        .where("visibility", "==", "Public")
        .limit(8)
        .get()
        .then((res) => {
          res.docs.forEach((doc) => {
            this.usersData.push({
              data: doc.data(),
              uid: doc.id,
            });
          });
        });
    },
  },
  components: {
    Navbar,
  },
});
</script>
