<template>
  <div>
    <form @submit.prevent="signInUser" class="container-fluid">
      <div class="row">
        <div class="col">
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
        </div>
        <div class="col">
          <div class="form-group">
            <label for="Password">Password</label>
            <input
              v-model.trim="password"
              type="password"
              class="form-control"
              id="Password"
            />
          </div>
        </div>
        <div><button type="submit" class="btn btn-primary">Submit</button></div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { firebaseApp } from "@/firebase";
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    signInUser() {
      firebaseApp
        .auth()
        .signInWithEmailAndPassword(this.email, this.password)
        .then((res) => {
          this.$router.push("/");
          console.log(res);
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
});
</script>
