<template>
  <div>
    <Navbar />
    <div class="row row-cols-1 row-cols-md-4 container-fluid">
      <div class="col">
        <div class="card" v-for="(user, idx) in usersData" :key="idx">
          <img
            :src="user.profileImageUrl"
            class="card-img-top"
            alt="userProfileImage"
          />
          <div class="card-body">
            <h5 class="card-title">{{ user.userName }}</h5>
            <h6 class="card-subtitle mb-2 text-muted">
              {{ user.description }}
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
            console.log(doc.data());
            this.usersData.push(doc.data());
          });
        });
    },
  },
  components: {
    Navbar,
  },
});
</script>
