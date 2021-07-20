<template>
  <div>
    <Navbar />
    <div class="container-fluid" v-if="userDataReady">
      <div class="row">
        <div class="col-lg-9">
          <div
            class="row container-fluid border border-1 m-2 rounded bg-light text-dark"
          >
            <div class="col fw-bold fs-3">@{{ userDataWrite.userName }}</div>
            <!-- <div class="col d-flex">
              <input
                class="form-control me-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
              <button class="btn btn-outline-success" type="submit">
                Search
              </button>
            </div> -->
          </div>

          <!-- Line Chart, Table, Video Component -->
          <div class="container-fluid" v-if="dataReady">
            <ExerciseChartTableVideo
              v-for="exercise in allExerciseChartData"
              :key="exercise.exerciseName"
              :exerciseData="exercise"
            />
          </div>
        </div>
        <div class="col-lg-3">
          <!-- TODO: make image smaller -->
          <div class="container-fluid">
            <div class="card" style="width: 18rem;">
              <img
                v-if="userDataWrite.profileImageUrl"
                :src="userDataWrite.profileImageUrl"
                class="card-img-top"
                alt="userProfileImage"
              />
              <div class="card-body">
                <h5 class="card-title">
                  <div class="row">
                    <div class="col">Age: {{ userDataWrite.age }}</div>
                    <div class="col">Weight: {{ userDataWrite.weight }}</div>
                  </div>
                </h5>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <WorkoutCard
                class="my-2"
                v-for="(workout, idx) in allWorkouts"
                :key="idx"
                :propWorkoutData="workout"
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
} from "@/interfaces/workout.interface";
import { generateArrayOfDates } from "@/interfaces/dates.interface";
import WorkoutCard from "@/components/WorkoutCard.vue";
import store from "@/store";
import moment from "moment";
import ExerciseChartTableVideo from "@/components/ExerciseChartTableVideo.vue";
import router from "@/router";

export default Vue.extend({
  props: {
    userData: {
      type: Object as () => User,
    },
    userUID: {
      type: String,
    },
    userName: {
      type: String,
    },
  },
  data() {
    return {
      allWorkouts: Array<Workout>(),
      userDataReady: false,
      userDataWrite: this.userData,
      userNameWrite: this.userName,
      userUIDWrite: this.userUID,
      dataReady: false,
      allExerciseChartData: Array<ExerciseChartData>(), // this is the workout data that is aggragated into exercise data
      noDataInThisDateRange: false,
      startDate: moment()
        .subtract(1, "month")
        .format("MM-DD-YYYY"),
      endDate: moment().format("MM-DD-YYYY"),
    };
  },
  async created() {
    let dates: Array<string> = [];
    // Generates array with given dates, if no dates, list of dates for month
    if (this.startDate && this.endDate) {
      dates = generateArrayOfDates(this.startDate, this.endDate);
    } else {
      dates = generateArrayOfDates(
        moment()
          .subtract(1, "month")
          .format("MM-DD-YYYY"),
        moment().format("MM-DD-YYYY")
      );
    }

    let workoutData: Array<Workout> = [];

    if (!this.userUIDWrite) {
      await store
        .dispatch("getUserUidFromUserName", router.currentRoute.params.userName)
        .then((res) => {
          this.userUIDWrite = res.belongsTo;
        })
        .catch((err) => {
          console.error(err);
        });
    }

    if (!this.userDataWrite) {
      await store
        .dispatch("getUserData", this.userUIDWrite)
        .then((res) => {
          this.userDataWrite = res;
          this.userDataReady = true;
        })
        .catch((err) => {
          console.error(err);
        });
    }

    await store
      .dispatch("retriveWorkoutData", {
        dates: dates,
        uid: this.userUIDWrite,
      })
      .then((res) => {
        workoutData = res;
      })
      .catch((err) => {
        this.dataReady = false;
        console.error(err);
      });

    let convertedData: Array<ExerciseChartData> = covertWorkoutDataToChartData(
      workoutData
    );
    if (convertedData.length > 0) {
      this.allExerciseChartData = convertedData;
      this.allWorkouts = workoutData;
      this.dataReady = true;
    } else {
      this.noDataInThisDateRange = true;
    }
  },
  components: {
    Navbar,
    WorkoutCard,
    ExerciseChartTableVideo,
  },
});
</script>
