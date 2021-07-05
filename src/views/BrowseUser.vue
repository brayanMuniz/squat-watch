<template>
  <div>
    <Navbar />
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-9">
          <div class="row container-fluid">
            <div class="col">@{{ userData.userName }}</div>
            <div class="col">Search Bar, For Exercise</div>
          </div>
          <div
            class="row container-fluid"
            v-for="exercise in allExerciseChartData"
            :key="exercise.exerciseName"
          >
            <div class="col-4">
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
            <div class="col-4">
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
              class="col-4 container-fluid"
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
        <div class="col-lg-3">
          <!-- TODO: make image smaller -->
          <img
            v-if="userData.profileImageUrl"
            :src="userData.profileImageUrl"
            class="card-img-top"
            alt="userProfileImage"
          />
          <div class="row">
            <div class="col">Age: {{ userData.age }}</div>
            <div class="col">Weight: {{ userData.weight }}</div>
          </div>
          <div class="row">
            <div class="col">
              <WorkoutCard
                v-for="(workout, idx) in allWorkouts"
                :key="idx"
                :workoutData="workout"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import Navbar from "@/components/Navbar.vue";
import { User } from "@/interfaces/user.infterface";
import {
  Workout,
  ExerciseChartData,
  covertWorkoutDataToChartData,
  WorkingSet,
} from "@/interfaces/workout.interface";
import WorkoutCard from "@/components/WorkoutCard.vue";
import store from "@/store";
import moment from "moment";
import LineChart from "@/components/LineChart";

export default Vue.extend({
  props: {
    userData: {
      type: Object as () => User,
    },
    userUID: {
      type: String,
    },
  },
  data() {
    return {
      allWorkouts: Array<Workout>(),
      dataReady: false,
      allExerciseChartData: Array<ExerciseChartData>(), // this is the workout data that is aggragated into exercise data
      noDataInThisDateRange: false,
      startDate: moment()
        .subtract(1, "week")
        .format("MM-DD-YYYY"),
      endDate: moment().format("MM-DD-YYYY"),
      chartOptions: {
        responsive: true,
        maintainAspectRatio: true,
        tooltips: {
          callbacks: {},
        },
      },
    };
  },
  async created() {
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

    let workoutData: Array<Workout> = [];

    await store
      .dispatch("retriveWorkoutData", {
        dates: dates,
        uid: this.userUID,
      })
      .then((res) => {
        workoutData = res;
      })
      .catch((err) => {
        this.dataReady = false;
        console.error(err);
      });

    console.log(workoutData);

    let convertedData:
      | Array<ExerciseChartData>
      | undefined = covertWorkoutDataToChartData(workoutData);
    if (convertedData.length > 0) {
      this.allExerciseChartData = convertedData;
      this.allWorkouts = workoutData;
      this.dataReady = true;
      console.log(this.allWorkouts);
    } else {
      this.noDataInThisDateRange = true;
    }
  },
  methods: {
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
    // Todo: move this to Exercise interface
    calculateOneRepMax(weight: number, reps: number): number {
      return Math.round(weight * (1 + reps / 30)); // Todo Figure out wich one rep max formuala is the best
    },
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
    getVideoUrlFromSets(sets: Array<WorkingSet>): string {
      let videoUrl = "";
      sets.forEach((set) => {
        if (set.videoUrl) videoUrl = set.videoUrl;
      });
      return videoUrl;
    },
  },
  components: {
    Navbar,
    WorkoutCard,
    LineChart,
  },
});
</script>
