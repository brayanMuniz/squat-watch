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

    <!-- Lifts  -->
    <div class="form-group">
      <label for="Password">Squat </label>
      <input
        v-model.trim="initialLifts.Squat"
        type="number"
        class="form-control"
        id="Password"
      />
    </div>

    <div class="form-group">
      <label for="Password">Bench</label>
      <input
        v-model.trim="initialLifts.Bench"
        type="number"
        class="form-control"
        id="Password"
      />
    </div>

    <div class="form-group">
      <label for="Password">Deadlift</label>
      <input
        v-model.trim="initialLifts.Deadlift"
        type="number"
        class="form-control"
        id="Password"
      />
    </div>

    <!-- Upload a profile image -->
    <div class="form-group">
      <label for="Starting Amount">Profile Image:</label>
      <input
        ref="upload"
        name="file-upload"
        @change="previewFiles"
        type="file"
        class="form-control"
        id="Profile Image"
      />
    </div>

    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
</template>

<script lang="ts">
import Vue from "vue";
import { firebaseApp } from "@/firebase";
import moment from "moment";

export default Vue.extend({
  data() {
    return {
      email: "",
      password: "",
      profileImageUrl: "",
      initialLifts: {
        Squat: 0,
        Bench: 0,
        Deadlift: 0,
      },
      profileImage: new Blob(),
      userWantsProfileImage: false,
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
            // add user to firestore
            if (res.user?.uid !== undefined) {
              // Upload profile image to firebase storage
              if (this.userWantsProfileImage) {
                let profileImageUpload = await firebaseApp
                  .storage()
                  .ref(`users/${res.user?.uid}/profileImage`);
                await profileImageUpload.put(this.profileImage);
                await profileImageUpload
                  .getDownloadURL()
                  .then((downloadUrl) => {
                    this.profileImageUrl = downloadUrl;
                  })

                  .catch((err) => {
                    console.error(err);
                    alert("We were not able to upload your profile picture .");
                  });
              }

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
      let initalUserData: any = {
        dateJoined: moment().format("MM-DD-YYYY"),
        initialLifts: this.initialLifts,
      };
      if (this.profileImageUrl !== "" || this.profileImageUrl !== undefined)
        initalUserData["profileImageUrl"] = this.profileImageUrl;

      return firebaseApp
        .firestore()
        .collection("users")
        .doc(userUID)
        .set(initalUserData);
    },
    previewFiles(event: any): void {
      if (event.target.files[0]) {
        this.profileImage = event.target.files[0];
        this.userWantsProfileImage = true;
      } else {
        this.userWantsProfileImage = false;
      }
    },
  },
});
</script>
