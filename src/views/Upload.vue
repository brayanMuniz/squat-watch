<template>
  <div>
    <Navbar />
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-8">
          <div>
            <form @submit.prevent="uploadWorkout">
              <div class="container-fluid">
                <div class="row">
                  <div class="col-sm-6">
                    <div class="form-group">
                      <label for="Workout Name">Workout Name: </label>
                      <input
                        v-model.trim="workoutName"
                        type="text"
                        class="form-control"
                        id="workoutName"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-sm-6">
                    <div class="form-group">
                      <label for="Workout Name">Date: </label>
                      <input
                        v-model.trim="workoutDate"
                        type="date"
                        class="form-control"
                        id="workoutDate"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- TODO: add a length of workout type to show how long workout was  -->
              <!--         Figure out what time type is valid on all browsers-->

              <div v-for="exercise in amountOfExercises.amount" :key="exercise">
                <ExerciseComponent
                  :copiedExerciseData="
                    amountOfExercises.copiedExerciseData[exercise - 1]
                  "
                  v-on:emitExerciseData="watchForData($event)"
                  v-on:removeExercise="removeExerciseComp($event)"
                />
                <br />
              </div>

              <div class="row">
                <div class="col">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    @click="addExercise"
                  >
                    Add Exercise
                  </button>
                </div>
                <div class="col">
                  <button type="submit" class="btn btn-primary">Submit</button>
                </div>
              </div>

              <br />

              <!-- TODO: Have a progress bar so you can tell when the user upload the video and set to database -->
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
        </div>

        <div class="col-md-4 px-0">
          <div
            class="container-fluid row row-cols-1 row-cols-md-1 row-cols-xxl-2"
          >
            <div
              class="col"
              v-for="(workout, workoutIdx) in userPreviousWorkouts.workoutData"
              :key="workoutIdx"
            >
              <div class="card text-dark bg-light my-2">
                <div class="card-body">
                  <h5 class="card-title">
                    {{ workout.name }}
                    <i
                      @click="copyWorkoutToForm(workout)"
                      class="bi bi-clipboard hoverable"
                    ></i>
                  </h5>

                  <h6 class="card-subtitle mb-2 text-muted">
                    {{ dateToMonthDay(workout.date) }}
                  </h6>

                  <div class="row">
                    <div class="col">Exercise</div>
                    <div class="col text-end">Best Set</div>
                  </div>
                  <div
                    class="row lh-1"
                    v-for="(exercise, idx) in workout.exercises"
                    :key="idx"
                  >
                    <div class="col">
                      {{ exercise.sets.length }} x {{ exercise.exerciseName }}
                    </div>
                    <div class="col text-end">
                      {{ getBestSetAsString(exercise.sets) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
import {
  Exercise,
  VideoData,
  WorkingSet,
  Workout,
} from "@/interfaces/workout.interface";
import moment from "moment";
import store from "@/store";
import Navbar from "@/components/Navbar.vue";

export default Vue.extend({
  data() {
    return {
      workoutName: "",
      workoutDate: moment().format("YYYY-MM-DD"), // write it this way in order to not get error
      amountOfExercises: { amount: 0, copiedExerciseData: Array<Exercise>() },
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
      } else if (this.exercises.length < 1) {
        alert("Have at least one exercise");
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

        // Update user doc of what exercises user does
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

        // Update /users/exercises collection
        let pathToExercisesCollection = firebaseApp
          .firestore()
          .collection("users")
          .doc(myUid)
          .collection("exercises");

        for (let exercise in workout.exercises) {
          let workoutsDone: any = {};
          workoutsDone[this.workoutDate] = workout.exercises[exercise].sets;
          let exerciseName: string = workout.exercises[exercise].exerciseName;
          if (
            this.userHasExerciseLogged(workout.exercises[exercise].exerciseName)
          )
            batch.update(
              pathToExercisesCollection.doc(exerciseName),
              workoutsDone
            );
          else
            batch.set(
              pathToExercisesCollection.doc(exerciseName),
              workoutsDone
            );
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
      this.amountOfExercises.amount++; // A new component will be rendered off of this and data will sync up automotically
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
        this.amountOfExercises.amount--;
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
    // Visual helpers
    copyWorkoutToForm(workout: Workout) {
      this.amountOfExercises.amount = 0;
      this.amountOfExercises.copiedExerciseData = workout.exercises;
      this.workoutName = workout.name;
      this.amountOfExercises.amount = this.amountOfExercises.copiedExerciseData.length;
    },
    userHasExerciseLogged(exerciseName: string): boolean {
      let isLogged = false;
      if (this.$store.getters.getUserData.exercises.includes(exerciseName))
        isLogged = true;
      return isLogged;
    },
    calculateOneRepMax(weight: number, reps: number): number {
      return Math.round(weight * (1 + reps / 30));
    },
    getBestSetAsString(sets: Array<WorkingSet>): string {
      let bestSet = `${sets[0].weight} x ${sets[0].reps}`;
      let bestSetCalculated: number = this.calculateOneRepMax(
        sets[0].weight,
        sets[0].reps
      );

      sets.forEach((set) => {
        if (this.calculateOneRepMax(set.weight, set.reps) > bestSetCalculated) {
          bestSet = `${set.weight} x ${set.reps}`;
          bestSetCalculated = this.calculateOneRepMax(set.weight, set.reps);
        }
      });
      return bestSet;
    },
    dateToMonthDay(date: string): string {
      return moment(date).format("MMM DD");
    },
  },
  computed: {
    userPreviousWorkouts() {
      return this.$store.getters.getSavedWorkoutData;
    },
  },
  components: {
    ExerciseComponent,
    Navbar,
  },
});
</script>

<style scoped>
.hoverable {
  cursor: pointer;
}
</style>
