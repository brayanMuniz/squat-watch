<template>
  <form @submit.prevent="makeNewUser">
    <div class="form-group">
      <label for="Email">Email address</label>
      <input
        type="email"
        class="form-control"
        id="Email"
        aria-describedby="emailHelp"
        v-model.trim="email"
      />
    </div>

    <div class="form-group">
      <label for="Password">Password</label>
      <input
        v-model.trim="password"
        type="password"
        class="form-control"
        id="Password"
      />
    </div>

    <!-- Upload a profile image -->
    <!-- <div class="form-group">
      <label for="Starting Amount">Select A File for Profile Image:</label>
      <input
        ref="upload"
        name="file-upload"
        @change="previewFiles"
        type="file"
        class="form-control"
        id="Profile Image"
      />
    </div> -->

    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
</template>

<script lang="ts">
import Vue from "vue";
import { firebaseApp } from "@/firebase";

export default Vue.extend({
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    async makeNewUser() {
      if (this.password.length < 6) {
        alert("Make sure your password is at least 6 characters");
      } else {
        console.log("Making new user...");
        await firebaseApp
          .auth()
          .createUserWithEmailAndPassword(this.email, this.password)
          .then(async (res) => {
            console.log(res.user?.uid);
          })
          .catch((err) => {
            console.error(err.code, err.message);
          });
      }
    },
  },
});
</script>