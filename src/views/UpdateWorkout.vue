<template>
  <div>
    <Navbar />
    <div v-if="initialDataReady">
      <form @submit.prevent="updateWorkout">
        <div class="container-fluid">
          <div class="row">
            <div class="col-sm-6 col-md-4">
              <div class="form-group">
                <label for="Workout Name"
                  >Workout Name:
                  <i
                    class="bi bi-journal-plus"
                    v-if="!userWantsToAddNote"
                    @click="changeWorkoutNote(false)"
                  ></i>

                  <i
                    class="bi bi-journal-minus"
                    v-if="userWantsToAddNote"
                    @click="changeWorkoutNote(true)"
                  ></i
                ></label>
                <input
                  v-model.trim="workoutName"
                  type="text"
                  class="form-control"
                  id="workoutName"
                  required
                />
              </div>
            </div>
            <div class="col-sm-6 col-md-4">
              <div class="form-group">
                <label for="Workout Name">Date: </label>
                <input
                  disabled
                  v-model.trim="workoutDate"
                  type="date"
                  class="form-control"
                  id="workoutDate"
                  required
                />
              </div>
            </div>
            <div class="col-sm-12 col-md-4">
              <div v-if="userWantsToAddNote">
                <label for="workoutNote" class="form-label"
                  >Workout Note:
                </label>
                <textarea
                  v-model.trim="workoutNote"
                  class="form-control"
                  id="workoutNote"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="container-fluid">
          <div class="row row-cols-1 row-cols-xxl-2">
            <ExerciseComponent
              class="col"
              v-for="exercise in amountOfExercises.amount"
              :key="exercise"
              :copiedExerciseData="
                amountOfExercises.copiedExerciseData[exercise - 1]
              "
              v-on:emitExerciseData="watchForData($event)"
              v-on:removeExercise="removeExerciseComp($event)"
            />
          </div>
        </div>

        <div class="container-fluid">
          <div class="row mt-2">
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
        </div>

        <br />
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
</template>

<script lang="ts">
import Vue from "vue";
import Navbar from "@/components/Navbar.vue";
import { Exercise, Workout } from "@/interfaces/workout.interface";
import ExerciseComponent from "@/components/Exercise.vue";
import { firebaseApp } from "@/firebase";
import store from "@/store";
import moment from "moment";
import router from "@/router";

export default Vue.extend({
  props: {
    propWorkoutData: {
      type: Object as () => Workout,
    },
  },
  data() {
    return {
      workoutName: "",
      workoutDate: "",
      workoutNote: "",
      exercises: Array<Exercise>(),
      workoutData: {},
      initialDataReady: false,
      userWantsToAddNote: false,
      amountOfExercises: { amount: 0, copiedExerciseData: Array<Exercise>() },
      uploading: false,
      poggersUpload: "0%",
    };
  },
  // Todo: delete initalWorkout data because when new component is created, data is pushed to workoutsData
  async created() {
    // If you go into this page with a fresh reload, no prop data is given, so it gets it from firestore
    let workoutData: Workout = {
      name: "",
      date: "",
      exercises: [],
    };
    if (!this.propWorkoutData && router.currentRoute.params.date) {
      await store
        .dispatch("retriveWorkoutData", {
          uid: store.getters.getMyUID,
          dates: [router.currentRoute.params.date],
        })
        .then((gottenWorkoutData: Array<Workout>) => {
          console.log("Got workout Data from firestore");
          workoutData = gottenWorkoutData[0];
        })
        .catch((err) => {
          console.error(err);
        });
    } else workoutData = this.propWorkoutData;

    this.workoutName = workoutData.name;
    if (workoutData.workoutNote) this.workoutNote = workoutData.workoutNote;

    this.amountOfExercises.amount = workoutData.exercises.length;
    this.amountOfExercises.copiedExerciseData = workoutData.exercises;
    this.workoutDate = moment(workoutData.date).format("YYYY-MM-DD");
    this.initialDataReady = true;

    console.log(this.exercises);
  },
  methods: {
    async updateWorkout() {
      let refToDocument = firebaseApp
        .firestore()
        .collection("users")
        .doc(store.getters.getMyUID)
        .collection("workouts")
        .doc(this.workoutDate);
      console.log(this.workoutName);
      console.log(this.exercises);
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
    addExercise() {
      this.amountOfExercises.amount++; // A new component will be rendered off of this and data will sync up automotically
    },
    watchForData(changedData: any) {
      console.log(changedData.exerciseName);
      // When new data is pushed onto this.exercises, it will automotically update because there is a watcher on it
      if (!this.exercises.includes(changedData)) {
        console.log("Pushing new exercise");
        this.exercises.push(changedData);
      }
    },
  },
  components: {
    ExerciseComponent,
    Navbar,
  },
});
</script>
