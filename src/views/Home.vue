<template>
  <div>
    <Navbar />

    <!-- TODO: move btn to right side -->
    <!-- Button trigger modal -->
    <button
      type="button"
      class="btn btn-primary fixed-bottom"
      data-bs-toggle="modal"
      data-bs-target="#calendarPopUp"
    >
      <i class="bi bi-calendar2-range-fill"></i>
    </button>

    <!-- Calendar Modal -->
    <div
      class="modal fade"
      id="calendarPopUp"
      tabindex="-1"
      aria-labelledby="calendarPopUp"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="calendarPopUp">calendar</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <FunctionalCalendar
              v-model="calendarData"
              :configs="calendarConfigs"
              v-on:choseDay="getDateRange($event)"
            ></FunctionalCalendar>
          </div>
        </div>
      </div>
    </div>

    <!-- Workout plan -->
    <div>
      <h4>Workout Plan:</h4>
      <div class="row" v-if="userWorkoutPlan.length > 0">
        <div class="col"></div>
      </div>
      <div v-else>
        <button type="button" class="btn btn-primary">
          Create A Workout Plan
        </button>
      </div>
    </div>

    <!-- Line Chart, Table, Video Component -->
    <div class="container-fluid" v-if="dataReady">
      <ExerciseChartTableVideo
        v-for="exercise in allExerciseChartData"
        :key="exercise.exerciseName"
        :exerciseData="exercise"
      />
    </div>

    <!-- History of Workouts -->
    <div
      class="container-fluid mb-1 row row-cols-1 row-cols-md-4 row-cols-xl-5"
    >
      <WorkoutCard
        class="col mx-1"
        v-for="(workout, workoutIdx) in allWorkouts"
        :key="workoutIdx"
        :propWorkoutData="workout"
      />
    </div>

    <div v-if="noDataInThisDateRange">No Data In This Date Range</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import moment from "moment";
import {
  covertWorkoutDataToChartData,
  ExerciseChartData,
  Workout,
} from "@/interfaces/workout.interface";
import {
  generateArrayOfDates,
  getMissingDates,
} from "@/interfaces/dates.interface";
import { ChartData } from "chart.js";
import store from "@/store";
import Navbar from "@/components/Navbar.vue";
import WorkoutCard from "@/components/WorkoutCard.vue";
import ExerciseChartTableVideo from "@/components/ExerciseChartTableVideo.vue";
// @ts-expect-error Import errors are fine
import { FunctionalCalendar } from "vue-functional-calendar";
import router from "@/router";

export default Vue.extend({
  name: "Home",
  data() {
    return {
      dataReady: false,
      dataCollection: Object() as ChartData,
      allWorkouts: Array<Workout>(),
      allExerciseChartData: Array<ExerciseChartData>(), // this is the workout data that is aggragated into exercise data
      // Todo: let the user will be able to select what exercise they wish to view
      currentlySelectedExercise: "Squat",
      noDataInThisDateRange: false,
      startDate: moment()
        .subtract(1, "month")
        .format("MM-DD-YYYY"),
      endDate: moment().format("MM-DD-YYYY"),
      // Calendar Component
      calendarData: {},
      calendarConfigs: {
        sundayStart: true,
        dateFormat: "mm/dd/yyyy",
        isDatePicker: false,
        isDateRange: true,
        disabledDates: ["afterToday"],
        isDark: true,
        // markedDates: ["6/15/2021"],
      },
      pickedDates: Array<string>(),
      userWorkoutPlan: Array<Workout>(),
    };
  },
  async created() {
    if (store.getters.getMyUID !== "") {
      // Get Initial Workout Data For Week
      const myUID: string = store.getters.getMyUID;
      let workoutData: Array<Workout> = [];
      if (getMissingDates(this.startDate, this.endDate).length === 0) {
        workoutData = store.getters.getSavedWorkoutData.workoutData;
      } else {
        let dates: Array<string> = [];
        if (this.startDate && this.endDate) {
          dates = generateArrayOfDates(this.startDate, this.endDate);
        } else {
          dates = generateArrayOfDates(
            moment()
              .subtract(1, "week")
              .format("MM-DD-YYYY"),
            moment().format("MM-DD-YYYY")
          );
        }
        await store
          .dispatch("retriveWorkoutData", {
            dates: dates,
            uid: myUID,
          })
          .then((res) => {
            workoutData = res;
          })
          .catch((err) => {
            this.dataReady = false;
            console.error(err);
          });
      }
      this.allWorkouts = workoutData.reverse();
      let convertedData:
        | Array<ExerciseChartData>
        | undefined = covertWorkoutDataToChartData(workoutData);
      if (convertedData.length > 0) {
        this.currentlySelectedExercise = convertedData[0].exerciseName;
        this.dataCollection = convertedData[0].chartData;
        this.allExerciseChartData = convertedData;
        this.dataReady = true;

        store.commit("updateSavedWorkoutData", {
          startDate: this.startDate,
          endDate: this.endDate,
          workoutData: workoutData,
        });
      } else {
        this.noDataInThisDateRange = true;
      }

      console.log(store.getters.getUserData);
    } else router.push("/createAccount");
  },
  methods: {
    async getDateRange(event: any) {
      console.log(event);
      if (event.date) {
        this.pickedDates.push(event.date);

        // remove the last two pairs in the date range
        if (this.pickedDates.length > 2) {
          this.pickedDates.shift();
          this.pickedDates.shift();
        }

        // there are two dates in the date range
        if (this.pickedDates.length > 1) {
          let dateA = moment(this.pickedDates[0]);
          let dateB = moment(this.pickedDates[1]);
          let diff: number = dateA.diff(dateB, "days");
          // if diff is posotive, dateA is more recent
          if (diff > 0) {
            this.endDate = dateA.format("MM-DD-YYYY");
            this.startDate = dateB.format("MM-DD-YYYY");
          } else {
            this.startDate = dateA.format("MM-DD-YYYY");
            this.endDate = dateB.format("MM-DD-YYYY");
          }

          console.log(this.startDate, this.endDate);
          let dates: Array<string> = generateArrayOfDates(
            this.startDate,
            this.endDate
          );

          await store
            .dispatch("retriveWorkoutData", {
              dates: dates,
              uid: store.getters.getMyUID,
            })
            .then((res) => {
              let convertedData:
                | Array<ExerciseChartData>
                | undefined = covertWorkoutDataToChartData(res);
              if (convertedData.length > 0) {
                let selectedExerciseIdx = -1;
                convertedData.forEach((data, idx) => {
                  if (data.exerciseName === this.currentlySelectedExercise)
                    selectedExerciseIdx = idx;
                });

                if (selectedExerciseIdx !== -1) {
                  this.dataCollection =
                    convertedData[selectedExerciseIdx].chartData;
                  this.allExerciseChartData = convertedData;
                  this.dataReady = true;
                } else {
                  console.error("FIX ME!");
                }
              } else {
                console.log("No Data in this date range ");
                this.dataReady = false;
                this.noDataInThisDateRange = true;
              }
            })
            .catch((err) => {
              this.dataReady = false;
              console.error(err);
            });
        }
      }
    },
  },
  components: {
    FunctionalCalendar,
    Navbar,
    WorkoutCard,
    ExerciseChartTableVideo,
  },
});
</script>
