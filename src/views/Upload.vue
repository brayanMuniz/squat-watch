<template>
  <div>
    <Navbar />
    <!-- https://getbootstrap.com/docs/5.0/forms/validation/ -->
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-7">
          <form @submit.prevent="uploadWorkout">
            <div class="row">
              <div class="col">
                <div class="form-group">
                  <label for="Workout Name">Workout Name: </label>
                  <input
                    v-model.trim="workoutName"
                    type="text"
                    class="form-control"
                    id="workoutName"
                  />
                </div>
              </div>
              <div class="col">
                <div class="form-group">
                  <label for="Workout Name">Date: </label>
                  <input
                    v-model.trim="workoutDate"
                    type="date"
                    class="form-control"
                    id="workoutDate"
                  />
                </div>
              </div>
            </div>

            <!-- TODO: add a length of workout type to show how long workout was  -->
            <!--         Figure out what time type is valid on all browsers-->

            <div v-for="exercise in amountOfExercises" :key="exercise">
              <ExerciseComponent
                v-on:emitExerciseData="watchForData($event)"
                v-on:removeExercise="removeExerciseComp($event)"
              />
              <br />
            </div>

            <button
              type="button"
              class="btn btn-secondary"
              @click="addExercise"
            >
              Add Exercise
            </button>
            <br />

            <!-- TODO: Have a progress bar so you can tell when the user upload the video and set to database -->
            <button type="submit" class="btn btn-primary">Submit</button>
          </form>
          <div class="progress" v-if="uploading">
            <div
              class="progress-bar"
              role="progressbar"
              :style="{ width: poggersUpload }"
              aria-valuenow="25"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>

        <div class="col"><div>History Of Workouts Here</div></div>
      </div>
    </div>

    <!-- TODO: the way video uploads will work is by getting % of videos uploaded -->
    <!-- So if you have 3 videos to upload and you got the videoURL for 2, percentage will be 66%  -->
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ExerciseComponent from "@/components/Exercise.vue";
import { firebaseApp } from "@/firebase";
import { Exercise, VideoData, Workout } from "@/interfaces/workout.interface";
import moment from "moment";
import store from "@/store";
import Navbar from "@/components/Navbar.vue";

export default Vue.extend({
  data() {
    return {
      workoutName: "",
      workoutDate: moment().format("YYYY-MM-DD"), // write it this way in order to not get error
      amountOfExercises: 1,
      exercises: Array<Exercise>(),
      uploading: false,
      poggersUpload: "0%",
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

        this.uploading = true;

        // With a batch multiple writes to the database are able to be committed at once, and none are commited if any fail
        let batch = firebaseApp.firestore().batch();

        // Create workout object
        let workout: Workout = {
          name: this.workoutName,
          date: formattedDate,
          exercises: this.exercises,
        };

        let addNewExerciseToUserData: Array<string> = [];

        // Sets path to document
        const userFirestoreWorkoutPath = firebaseApp
          .firestore()
          .collection("users")
          .doc(myUid)
          .collection("workouts")
          .doc(formattedDate);

        let uploadAmount = 0;
        for (const exercise in workout.exercises) {
          let exerciseName: string = workout.exercises[exercise].exerciseName;
          if (!this.userHasExerciseLogged(exerciseName))
            addNewExerciseToUserData.push(exerciseName);

          // Do not upload if the file exceeds the storage of 10 mb
          if (workout.exercises[exercise].videoData) {
            // Upload videos and get thier video url
            for (const setWithVideo in workout.exercises[exercise].videoData) {
              let setVideoData: VideoData =
                // @ts-expect-error Do not want to repeat the if property exist again
                workout.exercises[exercise].videoData[setWithVideo];

              // location in firebase storage as users/uid/workouts/exercises/exerciseName
              let location = `users/${myUid}/workouts/exercises/${this.exercises[exercise].exerciseName}/${formattedDate}`;
              const videoRef = firebaseApp.storage().ref(location);
              // Get video download and set it to workout.set field
              await videoRef
                .put(setVideoData.video)
                .then(async (res) => {
                  await res.ref
                    .getDownloadURL()
                    .then((downloadUrl) => {
                      console.log(downloadUrl);
                      workout.exercises[exercise].sets[
                        setVideoData.setVideoIdx
                      ].videoUrl = downloadUrl;
                    })
                    .catch((err) => {
                      console.error(err);
                    });
                })
                .catch((err) => {
                  console.error(err);
                });
            }
          }

          // If there are not videos for this set, delete em
          for (const set in this.exercises[exercise].sets) {
            if (workout.exercises[exercise].sets[set].videoUrl === "") {
              delete workout.exercises[exercise].sets[set].videoUrl;
            }
          }

          // Can not provide custom video object to firestore
          delete workout.exercises[exercise].videoData;

          // Show user progress of uploads
          uploadAmount++;
          this.poggersUpload = `${(uploadAmount / workout.exercises.length) *
            100}%`;
        }
        batch.set(userFirestoreWorkoutPath, workout);

        if (addNewExerciseToUserData.length > 0) {
          let newExercises: Array<string> = this.$store.getters.getUserData.exercises.concat(
            addNewExerciseToUserData
          );
          const userDataDoc = firebaseApp
            .firestore()
            .collection("users")
            .doc(myUid);

          batch.update(userDataDoc, {
            exercises: newExercises,
          });
        }

        batch
          .commit()
          .then(() => {
            alert("Your workout has been uploaded.");
            this.uploading = false;
          })
          .catch(() => {
            this.uploading = false;
            alert("There was a problem uploading your workout.");
            console.error("Batch no good SADGE :(");
          });
      }
    },
    // Component Data Sync ===================================
    addExercise() {
      this.amountOfExercises++; // A new component will be rendered off of this and data will sync up automotically
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
    userHasExerciseLogged(exerciseName: string): boolean {
      let isLogged = false;
      if (this.$store.getters.getUserData.exercises.includes(exerciseName))
        isLogged = true;
      return isLogged;
    },
  },
  components: {
    ExerciseComponent,
    Navbar,
  },
});
</script>
