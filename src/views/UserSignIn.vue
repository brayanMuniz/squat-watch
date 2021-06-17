<template>
  <div>
    <form action="" @submit.prevent="signInUser">
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

      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
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
    signInUser() {
      if (this.password.length < 6) {
        alert("Password must be longer than 6 characters. ");
      } else {
        firebaseApp
          .auth()
          .signInWithEmailAndPassword(this.email, this.password)
          .then((userCredential: any) => {
            console.log(userCredential.user);
          })
          .catch((error: any) => {
            if (error.code === "auth/wrong-password") {
              alert("Wrong password.");
            } else {
              alert("There was a problem. ");
            }
          });
      }
    },
  },
});
</script>
