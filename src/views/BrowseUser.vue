<template>
  <div>
    <Navbar />
    <div class="row">
      <div class="col-lg-9">
        <div class="row container-fluid">
          <div class="col">@{{ userData.userName }}</div>
          <div class="col">Search Bar, For Exercise</div>
        </div>
        <div class="row container-fluid">
          <div class="col">Chart</div>
          <div class="col">Tables</div>
          <div class="col">Video</div>
        </div>
      </div>
      <div class="col-lg-3">
        <!-- TODO: make image smaller -->
        <img
          v-if="userData.profileImageUrl"
          :src="userData.profileImageUrl"
          class="card-img-top"
          alt="userProfileImage"
        />
        <div class="row">
          <div class="col">Age: {{ userData.age }}</div>
          <div class="col">Weight: {{ userData.weight }}</div>
        </div>
        <div class="row">History Of Workouts</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import Navbar from "@/components/Navbar.vue";
import { User } from "@/interfaces/user.infterface";

export default Vue.extend({
  props: {
    userData: {
      type: Object as () => User,
    },
    userUID: {
      type: String,
    },
  },
  mounted() {
    console.log(this.userUID);
  },
  components: {
    Navbar,
  },
});
</script>
