<template>
  <div>
    <h1>This is where you will upload the Workout</h1>

    <form @submit.prevent="uploadWorkout">
      <div class="form-group">
        <label for="Workout Name">Workout Name: </label>
        <input
          v-model.trim="workoutName"
          type="text"
          class="form-control"
          id="workoutName"
        />
      </div>

      <div class="form-group">
        <label for="Workout Name">Date: </label>
        <input
          v-model.trim="workoutDate"
          type="date"
          class="form-control"
          id="workoutDate"
        />
      </div>

      <!-- TODO: add a length type -->
      <!-- TODO: Figure out what time type is valid on all browsers-->

      <!-- TODO: programatically open new exercises  -->
      <!-- TODO: Make @addExercise, create a new object that will be added to exercise  -->
      <!-- ? How would i bind it to that?  -->
      <div class="form-group">
        <label for="Exercise1">Exercise Name: </label>
        <input
          v-model.trim="tempExercise.ExerciseName"
          type="text"
          class="form-control"
        />
        <br />
        <label for="Exercise1">Weight </label>
        <input
          v-model="tempExercise.Sets[0].Weight"
          type="number"
          class="form-control"
        />
        <label for="Exercise1">Reps </label>
        <input
          v-model="tempExercise.Sets[0].Reps"
          type="number"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="Starting Amount">Select A Video to upload</label> <br />

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
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { firebaseApp } from "@/firebase";
import { Workout } from "@/interfaces/workout.interface";
import moment from "moment";
export default Vue.extend({
  data() {
    return {
      videoUpload: new Blob(),
      workoutName: "",
      Length: 0,
      workoutDate: new Date(),
      tempExercise: {
        ExerciseName: "",
        Sets: [{ Weight: 0, Reps: 0 }],
      },
    };
  },
  async mounted() {
    if (firebaseApp.auth().currentUser?.uid) {
      console.log("User is signed in ");
    }
  },
  methods: {
    previewFiles(event: any): void {
      this.videoUpload = event.target.files[0];
      console.log(this.videoUpload);
    },
    async uploadProfilePicture(myUid: string) {
      if (this.videoUpload) {
        // TODO: Update this later to have the correct data format
        let fileNamePlaceHolder = "testUpload";
        const imageUserRef = firebaseApp
          .storage()
          .ref(`users/${myUid}/${fileNamePlaceHolder}`);

        await imageUserRef.put(this.videoUpload).then((res) => {
          console.log(res.state);
        });
      }
    },
    uploadVideo() {
      const myUid: string | undefined = firebaseApp.auth().currentUser?.uid;
      if (myUid == undefined) {
        alert("Something is wrong. Hold up.");
      } else {
        this.uploadProfilePicture(myUid);
      }
    },
    async uploadWorkout() {
      const myUid: string | undefined = firebaseApp.auth().currentUser?.uid;
      if (myUid == undefined) {
        alert("You are not signed in.");
      } else {
        // Create workout object
        let workout: Workout = {
          Name: this.workoutName,
          Date: this.workoutDate,
          Exercises: [this.tempExercise],
        };

        // Date in DD-MM-YYYY
        let formattedDate = moment(workout.Date).format("MM-DD-YYYY");

        // Sets path to document
        const userFirestoreWorkoutPath = firebaseApp
          .firestore()
          .collection("users")
          .doc(myUid)
          .collection("workouts")
          .doc(formattedDate);

        // Sets object into document
        await userFirestoreWorkoutPath
          .set(workout)
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            console.error(err);
          });

        console.log(workout);
      }
    },
  },
});
</script>