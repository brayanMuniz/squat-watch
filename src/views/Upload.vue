<template>
  <div>
    <h1>Upload workout here</h1>

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
      <!-- TODO: add a length of workout type to show how long workout was  -->
      <!--         Figure out what time type is valid on all browsers-->

      <!-- In order for the component to behvae indepentinly you would just add it incrementally (amountOfExercises in this case) -->
      <div v-for="exercise in amountOfExercises" :key="exercise">
        <ExerciseComponent
          v-on:emitExerciseData="watchForData($event)"
          v-on:removeExercise="removeExerciseComp($event)"
        />
        <br />
      </div>

      <!-- Needs to be type="button", otherwise it would submit the form -->
      <button type="button" @click="addExercise">Add Exercise</button>
      <br />

      <!-- TODO: Have a progress bar so you can tell when the user upload the video and set to database -->
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>

<script lang="ts">
// Todo: only be able to upload one video per exercise
// Todo: Make video url on sets optional
// Todo: upload videos with workouts
import Vue from "vue";
import ExerciseComponent from "@/components/Exercise.vue";
import { firebaseApp } from "@/firebase";
import { Exercise, Workout } from "@/interfaces/workout.interface";
import moment from "moment";
import store from "@/store";
export default Vue.extend({
  data() {
    return {
      workoutName: "",
      workoutDate: moment().format("YYYY-MM-DD"), // write it this way in order to not get error
      amountOfExercises: 1,
      exercises: Array<Exercise>(),
      setVideos: [],
    };
  },
  async mounted() {
    if (store.getters.getMyUID === undefined) {
      this.$router.push("/");
    }
  },
  methods: {
    async uploadVideoSet(myUid: string, videoUpload: Blob) {
      if (videoUpload) {
        let fileNamePlaceHolder = "testUpload";
        const videoRef = firebaseApp
          .storage()
          .ref(`users/${myUid}/${fileNamePlaceHolder}`);

        await videoRef.put(videoUpload).then((res) => {
          console.log(res.state);
        });
      }
    },
    async uploadWorkout() {
      const myUid: string | undefined = store.getters.getMyUID;
      if (myUid === undefined) {
        alert("You are not signed in.");
      } else {
        // Date in MM-DD-YYYY
        let formattedDate = moment(this.workoutDate).format("MM-DD-YYYY");

        // With a batch multiple writes to the database are able to be committed at once, and none are commited if any fail
        let batch = firebaseApp.firestore().batch();
        // Create workout object
        let workout: Workout = {
          name: this.workoutName,
          date: formattedDate,
          exercises: this.exercises,
        };

        // Sets path to document
        const userFirestoreWorkoutPath = firebaseApp
          .firestore()
          .collection("users")
          .doc(myUid)
          .collection("workouts")
          .doc(formattedDate);

        // If any videos have to be uploaded, upload them, get their videoUrl and add to workout object
        if (this.setVideos.length > 0) {
          // location of where you will place the video in firebase.storage()
          // let fileNamePlaceHolder = formattedDate; // ? this woudl ahve to be the formattedDate.exerciseName.set or something likle that because if i have multiple it wourldnt work
          // const imageUserRef = firebaseApp
          //   .storage()
          //   .ref(`users/${myUid}/${fileNamePlaceHolder}`);
          // await imageUserRef.put(this.videoUpload);
          // await imageUserRef
          //   .getDownloadURL()
          //   .then((downloadUrl) => {
          //     workout.exercises[0].sets[0].videoUrl = downloadUrl;
          //   })
          //   .catch((err) => {
          //     console.error(err);
          //     // Todo: be able to remove video
          //     alert(
          //       "We were not able to upload your set, try removing your video"
          //     );
          //   });
        }
        batch.set(userFirestoreWorkoutPath, workout); // at this point every set should have their video url
        batch
          .commit()
          .then(() => {
            console.log("It worked");
          })
          .catch(() => {
            console.error("Batch no good SADGE :(");
          });
      }
    },

    // Component Data Sync ===================================
    addExercise() {
      // A new component will be rendered off of this and data will sync up automotically
      this.amountOfExercises++;
    },
    removeExerciseComp(exerciseData: Exercise) {
      let exerciseIdx: number | undefined = undefined;

      if (this.exercises.includes(exerciseData)) {
        this.exercises.forEach((exercise, idx) => {
          if (exercise === exerciseData) {
            exerciseIdx = idx;
          }
        });
      }
      if (exerciseIdx !== undefined) {
        this.exercises.splice(exerciseIdx, 1);
        this.amountOfExercises--;
      } else {
        console.error("Problem Removing Exercise.");
      }
    },
    watchForData(changedData: any) {
      // When new data is pushed onto this.exercises, it will automotically update because there is a watcher on it
      if (!this.exercises.includes(changedData)) {
        console.log("Pushing new exercise");
        this.exercises.push(changedData);
      }
    },
  },
  components: {
    ExerciseComponent,
  },
});
</script>
