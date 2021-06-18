<template>
  <form @submit.prevent="makeNewUser">
    <div class="form-group">
      <label for="Email">User Name</label>
      <input type="text" class="form-control" v-model.trim="userName" />
    </div>

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
    <!-- Public, Friends Only, Private -->
    <select
      class="form-select"
      aria-label="Default select example"
      v-model="visibility"
    >
      <option value="Public">Public</option>
      <option value="Friends Only">Friends Only</option>
      <option value="Private">Private</option>
    </select>

    <!--Initial Lifts  -->
    <div>Current Poggers</div>
    <div
      class="form-group"
      v-for="(exercise, index) in initialLiftsData"
      :key="index"
    >
      <button @click="removeLift(index)" type="button">-R</button>

      <!-- Todo: Add a dropdown of suggested lifts, Squat, Bench, Deadlift etx  -->
      <label>Exercise Name</label>
      <input v-model="exercise.name" type="text" />

      <label>Weight </label>
      <input v-model="exercise.weight" type="number" class="form-control" />

      <label>Reps </label>
      <input v-model="exercise.reps" type="number" class="form-control" />
    </div>
    <button @click="addNewExercise" type="button">Add New Exercise</button>

    <!-- Upload a profile image -->
    <div class="form-group">
      <label for="Starting Amount">Profile Picture :</label>
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
      userName: "", // Todo: make sure userName is not taken
      email: "",
      password: "",
      visibility: "Public",
      profileImageUrl: "",
      initialLiftsData: [{ name: "Squat", weight: 0, reps: 5 }], // Todo: make sure every exercise is unique
      profileImage: new Blob(),
      userWantsProfileImage: false,
    };
  },
  methods: {
    async makeNewUser() {
      let userNameTakenCondition = false;
      let checkingFirebaseError = false;
      await this.isUserNameTaken()
        .then((userNameTaken: boolean) => {
          userNameTakenCondition = userNameTaken;
        })
        .catch((err) => {
          checkingFirebaseError = true;
          console.error(err);
        });

      if (checkingFirebaseError) {
        alert("Problem on our side");
      } else if (userNameTakenCondition) {
        alert("User Name is taken");
      } else if (this.password.length < 6) {
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
                  this.addUserNameToFireStore(this.userName, {
                    belongsTo: res.user?.uid,
                  }).then((res) => {
                    console.log("User Name was added to firestore");
                  });
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
      let exercises: Array<string> = [];
      this.initialLiftsData.forEach((exercise) => {
        exercises.push(exercise.name);
      });

      let initalUserData: any = {
        dateJoined: moment().format("MM-DD-YYYY"),
        initialLifts: this.initialLiftsData,
        userName: this.userName,
        visibility: this.visibility,
        exercises: exercises,
      };

      if (this.profileImageUrl !== "" || this.profileImageUrl !== undefined)
        initalUserData["profileImageUrl"] = this.profileImageUrl;

      return firebaseApp
        .firestore()
        .collection("users")
        .doc(userUID)
        .set(initalUserData);
    },
    async addUserNameToFireStore(userName: string, docData: any) {
      await firebaseApp
        .firestore()
        .collection("userNames")
        .doc(userName)
        .set(docData);
    },
    async isUserNameTaken() {
      let userNameTaken = false;
      let errorGettingName = false;
      let errData: any = {};
      await firebaseApp
        .firestore()
        .collection("userNames")
        .doc(this.userName)
        .get()
        .then((res) => {
          if (res.exists) userNameTaken = true;
        })
        .catch((err) => {
          errData = err;
          errorGettingName = true;
        });
      if (errorGettingName) return Promise.reject(errData);
      return Promise.resolve(userNameTaken);
    },
    addNewExercise() {
      this.initialLiftsData.push({ name: "", weight: 0, reps: 0 });
    },
    removeLift(idx: number) {
      if (this.initialLiftsData[idx]) {
        this.initialLiftsData.splice(idx, 1);
      }
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
