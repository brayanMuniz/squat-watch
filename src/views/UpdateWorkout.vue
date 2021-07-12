<template>
  <div>
    <Navbar />
    <div>
      <form @submit.prevent="uploadWorkout">
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
                  v-model.trim="workoutData.name"
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
                  v-model.trim="workoutData.date"
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
                  v-model.trim="workoutData.workoutNote"
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

export default Vue.extend({
  props: {
    workoutData: {
      type: Object as () => Workout,
    },
  },
  data() {
    return {
      userWantsToAddNote: false,
      amountOfExercises: { amount: 0, copiedExerciseData: Array<Exercise>() },
      uploading: false,
      poggersUpload: "0%",
    };
  },
  async created() {
    //   Todo: set /history?date=>>> and get date from router then firebaseApp.firestore().get() data
    if (this.workoutData) {
      this.amountOfExercises.amount = this.workoutData.exercises.length;
      this.amountOfExercises.copiedExerciseData = this.workoutData.exercises;
    }
    console.log(this.workoutData);
  },
  methods: {
    removeExerciseComp(exerciseData: Exercise) {
      let exerciseIdx: number | undefined = undefined;

      if (this.workoutData.exercises.includes(exerciseData)) {
        this.workoutData.exercises.forEach((exercise, idx) => {
          if (exercise === exerciseData) {
            exerciseIdx = idx;
          }
        });
      }

      if (exerciseIdx !== undefined) {
        this.workoutData.exercises.splice(exerciseIdx, 1);
        this.amountOfExercises.amount--;
      } else {
        console.error("Problem Removing Exercise.");
      }
    },
    addExercise() {
      this.amountOfExercises.amount++; // A new component will be rendered off of this and data will sync up automotically
    },
    watchForData(changedData: any) {
      // When new data is pushed onto this.exercises, it will automotically update because there is a watcher on it
      if (!this.workoutData.exercises.includes(changedData)) {
        console.log("Pushing new exercise");
        this.workoutData.exercises.push(changedData);
      }
    },
  },
  components: {
    ExerciseComponent,
    Navbar,
  },
});
</script>
