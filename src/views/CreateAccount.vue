<template>
  <div>
    <button @click="goToSignInRoute" type="button">Sign In</button>
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
  </div>
</template>

<script lang="ts">
// TODO: ask the user about their initial lifts or enter 45 as default for sq, be, de
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

            // add user to firestore
            if (res.user?.uid !== undefined) {
              await this.addUserToFireStore(res.user?.uid)
                .then(() => {
                  console.log("User was added to firestore");
                })
                .catch((err) => {
                  console.error(err);
                });
            }
          })

          .catch((err) => {
            console.error(err.code, err.message);
          });
      }
    },
    async addUserToFireStore(userUID: string) {
      // Formats todays date
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, "0");
      var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
      var yyyy = today.getFullYear();
      let todaysDate = mm + "/" + dd + "/" + yyyy;

      let initalUserData = {
        dateJoined: todaysDate,
      };

      return firebaseApp
        .firestore()
        .collection("users")
        .doc(userUID)
        .set(initalUserData);
    },
    goToSignInRoute() {
      this.$router.push("/SignIn");
    },
  },
});
</script>
