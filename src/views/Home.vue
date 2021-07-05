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

    <!-- Workout Chart, Table and video. -->
    <div class="container-fluid">
      <div class="row">
        <div
          class="col-xxl-6"
          v-for="exercise in allExerciseChartData"
          :key="exercise.exerciseName"
        >
          <div class="row">
            <div class="col-lg-5 col-sm-12">
              <div v-if="dataReady" class="container-fluid">
                <!-- :options prop needs to be passed in or there will be an error -->
                <LineChart
                  :chartData="exercise.chartData"
                  :options="chartOptions"
                  :workingSets="exercise.setsWithDates"
                  :exerciseName="exercise.exerciseName"
                  v-on:clickedPoint="changeVideoFromExercise($event)"
                />
              </div>
            </div>
            <!-- There are two ways to show this. Workout of day, with sets going down, or general overview of workouts throughout the days -->
            <div class="col-lg-3 col-sm-12">
              <table class="table container-fluid">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th>1 Rep Max</th>
                    <th scope="col">Best Set</th>
                    <th scope="col"># Of Sets</th>
                    <th scope="col">Video</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(e, idx) in exercise.setsWithDates" :key="idx">
                    <th scope="row">{{ e.date }}</th>
                    <td>{{ findBestOneRepMax(e.sets) }}</td>
                    <td>{{ getBestSetAsString(e.sets) }}</td>
                    <td>{{ e.sets.length }}</td>
                    <td v-if="getVideoUrlFromSets(e.sets)">
                      <i
                        class="bi bi-play-btn-fill hoverable"
                        @click="
                          changeVideoFromExercise({
                            exerciseName: exercise.exerciseName,
                            videoUrl: getVideoUrlFromSets(e.sets),
                          })
                        "
                      ></i>
                    </td>
                    <td v-else><i class="bi bi-slash-circle"></i></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              v-if="exercise.videoReady"
              class="col-lg-4 col-sm-12 container-fluid"
            >
              <div v-if="exercise.videoReady" class="container-fluid">
                <video
                  ref="videoPlayer"
                  width="320"
                  height="240"
                  autoplay
                  controls
                >
                  <source :src="exercise.videoUrl" />
                  Your browser does not support video.
                </video>
              </div>

              <div
                class="spinner-border d-flex justify-content-center col-lg-4 col-sm-12 "
                role="status"
                v-else-if="exercise.videoLoading"
              >
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- History of Workouts -->
    <div
      class="container-fluid mb-1 row row-cols-1 row-cols-md-4 row-cols-xl-5"
    >
      <WorkoutCard
        class="col mx-1"
        v-for="(workout, workoutIdx) in allWorkouts"
        :key="workoutIdx"
        :workoutData="workout"
      />
    </div>

    <div v-if="noDataInThisDateRange">No Data In This Date Range</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { firebaseApp } from "@/firebase";
import moment from "moment";
import {
  covertWorkoutDataToChartData,
  ChartWorkingSet,
  ExerciseChartData,
  WorkingSet,
  Workout,
} from "@/interfaces/workout.interface";
import { ChartData } from "chart.js";
import store from "@/store";
import LineChart from "@/components/LineChart";
import Navbar from "@/components/Navbar.vue";
import WorkoutCard from "@/components/WorkoutCard.vue";
// @ts-expect-error Import errors are fine
import { FunctionalCalendar } from "vue-functional-calendar";

export default Vue.extend({
  name: "Home",
  data() {
    return {
      videoReady: false,
      videoUrl: "",
      dataReady: false,
      dataCollection: Object() as ChartData,
      allWorkouts: Array<Workout>(),
      allExerciseChartData: Array<ExerciseChartData>(), // this is the workout data that is aggragated into exercise data
      // Todo: let the user will be able to select what exercise they wish to view
      currentlySelectedExercise: "Squat",
      chartOptions: {
        responsive: true,
        maintainAspectRatio: true,
        tooltips: {
          callbacks: {},
        },
      },
      noDataInThisDateRange: false,
      startDate: moment()
        .subtract(1, "week")
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
    };
  },
  async created() {
    if (store.getters.getMyUID !== "") {
      const myUID: string = store.getters.getMyUID;
      let workoutData: Array<Workout> = [];
      if (this.getMissingDates(this.startDate, this.endDate).length === 0) {
        workoutData = this.$store.getters.getSavedWorkoutData.workoutData;
      } else {
        let dates: Array<string> = [];
        if (this.startDate && this.endDate) {
          dates = this.generateArrayOfDates(this.startDate, this.endDate);
        } else {
          dates = this.generateArrayOfDates(
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
      this.allWorkouts = workoutData;
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
    } else this.$router.push("/createAccount");
  },
  methods: {
    getMissingDates(startDate: string, endDate: string): Array<string> {
      let wantedDates: Array<string> = this.generateArrayOfDates(
        startDate,
        endDate
      );
      let currentDates: Array<string> = this.generateArrayOfDates(
        this.$store.getters.getSavedWorkoutData.startDate,
        this.$store.getters.getSavedWorkoutData.endDate
      );
      return wantedDates.filter((date) => !currentDates.includes(date));
    },
    // Todo: remove retriveWorkoutData f(x) from here
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

          await this.retriveWorkoutData(this.startDate, this.endDate)
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
    generateArrayOfDates(startDate: string, endDate: string): Array<string> {
      let dates: Array<string> = [];
      let startDateMoment = moment(startDate);
      let endDateMoment = moment(endDate);

      // With +1 it will include the day of
      const diffInDays: number =
        endDateMoment.diff(startDateMoment, "days") + 1;

      // Populates array with dates
      for (let i = 0; i < diffInDays; i++) {
        let calculatedDay = moment(startDate).add(i, "days");
        dates.push(moment(calculatedDay).format("MM-DD-YYYY"));
      }
      return dates;
    },
    async retriveWorkoutData(startDate?: string, endDate?: string) {
      let dates: Array<string> = [];
      let workoutData: Array<Workout> = [];
      let error = false;

      // if startDate not provided, gets data from one week ago to now
      if (startDate && endDate) {
        dates = this.generateArrayOfDates(startDate, endDate);
      } else {
        dates = this.generateArrayOfDates(
          moment()
            .subtract(1, "week")
            .format("MM-DD-YYYY"),
          moment().format("MM-DD-YYYY")
        );
      }

      const myUID: string | undefined = store.getters.getMyUID;
      if (myUID !== undefined) {
        let workoutPath = firebaseApp
          .firestore()
          .collection("users")
          .doc(myUID)
          .collection("workouts");

        // ? Do i place custom workout object in workout interface or make a new file for it ?
        let workoutConverter = {
          toFirestore: function(workout: Workout) {
            return {
              name: workout.name,
              date: workout.date,
              exercises: workout.exercises,
              length: workout.length,
            };
          },
          fromFireStore: function(doc: any) {
            const data = doc.data();
            return new Workout(data.name, doc.id, data.exercises, data.length);
          },
        };

        // using for ... in instead of forEach becasue for of will use await properly
        for (const date in dates) {
          await workoutPath
            .doc(dates[date])
            .get()
            .then((doc) => {
              if (doc.exists) {
                workoutData.push(workoutConverter.fromFireStore(doc));
              }
            })
            .catch((err) => {
              console.error(err);
            });
        }

        if (error) {
          return Promise.reject("Error");
        } else {
          return Promise.resolve(workoutData);
        }
      } else {
        return Promise.reject("Not signed in ");
      }
    },
    // Chart Methods
    changeVideoFromExercise(videoData: any) {
      if (videoData.exerciseName) {
        // Figureout which exercise clicked from this.allExerciseChartData
        let exerciseIdx = -1;
        this.allExerciseChartData.forEach((exercise, idx) => {
          if (exercise.exerciseName == videoData.exerciseName) {
            exerciseIdx = idx;
          }
        });

        if (
          videoData.videoUrl !== undefined &&
          videoData.videoUrl !== "" &&
          exerciseIdx !== -1
        ) {
          this.allExerciseChartData[exerciseIdx].videoReady = false;
          this.allExerciseChartData[exerciseIdx].videoLoading = true;

          // This allows multiple videos to be played from one video player
          setTimeout(() => {
            this.allExerciseChartData[exerciseIdx].videoUrl =
              videoData.videoUrl;
            this.allExerciseChartData[exerciseIdx].videoReady = true;
            this.allExerciseChartData[exerciseIdx].videoLoading = false;
          }, 500);
        } else {
          this.allExerciseChartData[exerciseIdx].videoUrl = "";
          this.allExerciseChartData[exerciseIdx].videoReady = false;
        }
      }
    },
    // One Rep Max calculations ===============
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
    findBestOneRepMax(sets: Array<WorkingSet>): number {
      let bestOneRepMax = 0;
      sets.forEach((set) => {
        let setOneRepMax = this.calculateOneRepMax(set.weight, set.reps);
        if (setOneRepMax > bestOneRepMax) {
          bestOneRepMax = setOneRepMax;
        }
      });
      return bestOneRepMax;
    },
    calculateOneRepMax(weight: number, reps: number): number {
      return Math.round(weight * (1 + reps / 30)); // Todo Figure out wich one rep max formuala is the best
    },
    getVideoUrlFromSets(sets: Array<WorkingSet>): string {
      let videoUrl = "";
      sets.forEach((set) => {
        if (set.videoUrl) videoUrl = set.videoUrl;
      });
      return videoUrl;
    },
  },
  components: {
    LineChart,
    FunctionalCalendar,
    Navbar,
    WorkoutCard,
  },
});
</script>
