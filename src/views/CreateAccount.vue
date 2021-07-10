<template>
  <div>
    <Navbar />
    <form @submit.prevent="makeNewUser" class="container-fluid">
      <div class="row">
        <div class="col-sm-12 col-md-6 col-lg-3">
          <div class="form-group">
            <label class="form-label" for="userName">User Name</label>
            <input
              type="text"
              class="form-control"
              required
              v-model.trim="userName"
            />
          </div>
        </div>
        <div class="col-sm-12 col-md-6 col-lg-3">
          <div class="form-group">
            <label class="form-label" for="Email">Email address</label>
            <input
              type="email"
              class="form-control"
              id="Email"
              aria-describedby="emailHelp"
              v-model.trim="email"
              required
            />
          </div>
        </div>
        <div class="col-sm-12 col-md-6 col-lg-3">
          <div class="form-group">
            <label class="form-label" for="Password">Password</label>
            <input
              v-model.trim="password"
              type="password"
              class="form-control"
              id="Password"
              required
            />
          </div>
        </div>
        <div class="col-sm-12 col-md-6 col-lg-3">
          <label class="form-label" for="visibility">Visibility</label>

          <select
            class="form-select"
            aria-label="Default select example"
            v-model="visibility"
          >
            <option value="Public">Public</option>
            <option value="Friends Only">Friends Only</option>
            <option value="Private">Private</option>
          </select>
        </div>
      </div>

      <!-- Age, weight, describe yourself -->
      <div class="row">
        <div class="col-sm-6 col-md-3">
          <label class="form-label">Age: </label>
          <input v-model="age" type="number" class="form-control" min="0" />
        </div>
        <div class="col-sm-6 col-md-3">
          <label class="form-label">Weight (LBS):</label>
          <input v-model="weight" type="number" class="form-control" min="0" />
        </div>
        <div class="col-sm-12 col-md-6">
          <label for="description" class="form-label">Describe Yourself</label>
          <textarea
            class="form-control"
            id="exampleFormControlTextarea1"
            rows="3"
            v-model.trim="description"
          ></textarea>
        </div>
      </div>

      <!--Initial Lifts  -->
      <div class="form-label">Current Poggers:</div>
      <div
        class="form-group"
        v-for="(exercise, index) in initialLiftsData"
        :key="index"
      >
        <div class="row mb-3">
          <div class="col-sm-8">
            <label class="form-label">
              <i
                class="bi bi-x-circle-fill hoverable"
                @click="removeLift(index)"
              ></i>
              Exercise Name</label
            >
            <input
              class="form-control"
              type="text"
              list="exercises"
              v-model="exercise.name"
            />
            <datalist id="exercises">
              <option>Squat</option>
              <option>Bench Press (Barbell)</option>
              <option>Deadlift</option>
              <option>Overhead Press (Barbell)</option>
            </datalist>
          </div>

          <div class="col-sm-4 row">
            <div class="col">
              <label class="form-label">Weight (LBS)</label>
              <input
                v-model="exercise.weight"
                type="number"
                class="form-control"
                min="0"
              />
            </div>

            <div class="col">
              <label class="form-label">Reps </label>
              <input
                v-model="exercise.reps"
                type="number"
                class="form-control"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      <button @click="addNewExercise" class="btn btn-info" type="button">
        Add New Exercise
      </button>

      <div class="container-fluid">
        <div class="row">
          <div class="col">
            <div class="form-group image-upload">
              <label for="Starting Amount">Profile Picture :</label>

              <label for="Profile Image">
                <i
                  class="bi bi-file-arrow-up-fill hoverable custom-icon-fontsize my-auto"
                  style="color: cornflowerblue;"
                ></i>
              </label>

              <input
                ref="upload"
                name="file-upload"
                @change="previewFiles"
                type="file"
                class="form-control"
                id="Profile Image"
              />
              <img
                class="img-fluid"
                v-if="userWantsProfileImage"
                :src="profileImagePreview"
                alt="usersProfileImage"
              />
            </div>
          </div>
          <div class="col">
            <button type="submit" class="btn btn-primary">Submit</button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { firebaseApp } from "@/firebase";
import moment from "moment";
import Navbar from "@/components/Navbar.vue";

export default Vue.extend({
  data() {
    return {
      userName: "",
      email: "",
      password: "",
      age: "",
      weight: "",
      description: "",
      visibility: "Public",
      profileImageUrl: "",
      initialLiftsData: [{ name: "", weight: "", reps: "" }], // Todo: make sure every exercise is unique
      profileImage: new Blob(),
      profileImagePreview: "",
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
        age: this.age,
        weight: this.weight,
        description: this.description,
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
      if (this.initialLiftsData.length > 10) {
        alert("No more than 10");
      } else {
        this.initialLiftsData.push({ name: "", weight: "", reps: "" });
      }
    },
    removeLift(idx: number) {
      if (this.initialLiftsData[idx]) {
        this.initialLiftsData.splice(idx, 1);
      }
    },
    previewFiles(event: any): void {
      if (event.target.files[0]) {
        this.profileImage = event.target.files[0];
        this.profileImagePreview = URL.createObjectURL(event.target.files[0]);
        this.userWantsProfileImage = true;
      } else {
        this.userWantsProfileImage = false;
        this.profileImagePreview = "";
      }
    },
  },
  components: {
    Navbar,
  },
});
</script>

<style scoped>
.image-upload > input {
  display: none;
}
</style>
