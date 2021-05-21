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

      <br />
      <!-- TODO: add a length type to show how long workout was  -->
      <!-- TODO: Figure out what time type is valid on all browsers-->

      <!-- TODO: programatically open new exercises  -->
      <!-- TODO: Make @addExercise, create a new object that will be added to exercise  -->
      <!-- ? How would i bind it to that?  -->

      <!-- EXERCISE ==================================== -->
      <div class="form-group">
        <label for="Exercise1">Exercise Name: </label>
        <input
          v-model.trim="tempExercise.exerciseName"
          type="text"
          class="form-control"
        />
        <br />
        <!-- SET ============== -->
        <div>
          <label for="Exercise1">Weight </label>
          <input
            v-model="tempExercise.sets[0].weight"
            type="number"
            class="form-control"
          />
          <label for="Exercise1">Reps </label>
          <input
            v-model="tempExercise.sets[0].reps"
            type="number"
            class="form-control"
          />
          <label for="Starting Amount">Select A Video to with Set.</label>
          <br />

          <input
            ref="upload"
            name="file-upload"
            @change="previewFiles"
            type="file"
            class="form-control"
            id="Profile Image"
          />
        </div>

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
      length: 0,
      workoutDate: "",
      tempExercise: {
        exerciseName: "",
        sets: [{ weight: 0, reps: 0, videoUrl: "" }],
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
    },
    async uploadVideoSet(myUid: string) {
      if (this.videoUpload) {
        let fileNamePlaceHolder = "testUpload";
        const imageUserRef = firebaseApp
          .storage()
          .ref(`users/${myUid}/${fileNamePlaceHolder}`);

        await imageUserRef.put(this.videoUpload).then((res) => {
          console.log(res.state);
        });
      }
    },
    // docLocation is essentially the date or docId
    // setLocation would have to be an obj to get good configuration
    async uploadWorkout() {
      const myUid: string | undefined = firebaseApp.auth().currentUser?.uid;
      if (myUid == undefined) {
        alert("You are not signed in.");
      } else {
        // With a batch multiple writes are able to be committed at once
        let batch = firebaseApp.firestore().batch();
        // Create workout object
        let workout: Workout = {
          name: this.workoutName,
          date: this.workoutDate,
          exercises: [this.tempExercise],
        };

        // Date in DD-MM-YYYY
        let formattedDate = moment(workout.date).format("MM-DD-YYYY");

        // Sets path to document
        const userFirestoreWorkoutPath = firebaseApp
          .firestore()
          .collection("users")
          .doc(myUid)
          .collection("workouts")
          .doc(formattedDate);

        // batch.set(userFirestoreWorkoutPath, workout);

        if (this.videoUpload) {
          let fileNamePlaceHolder = formattedDate;
          const imageUserRef = firebaseApp
            .storage()
            .ref(`users/${myUid}/${fileNamePlaceHolder}`);

          await imageUserRef.put(this.videoUpload);

          await imageUserRef
            .getDownloadURL()
            .then((downloadUrl) => {
              workout.exercises[0].sets[0].videoUrl = downloadUrl;
              batch.set(userFirestoreWorkoutPath, workout);
            })
            .catch((err) => {
              console.error(err);
            });

          batch
            .commit()
            .then(() => {
              console.log("It worked?");
            })
            .catch(() => {
              console.error("Batch no good SADGE :(");
            });
        }
      }
    },
  },
});
</script>