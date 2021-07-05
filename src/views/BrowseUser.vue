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
          <div class="row container-fluid">
            <div class="col">Chart</div>
            <div class="col">Tables</div>
            <div class="col">Video</div>
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
} from "@/interfaces/workout.interface";
import WorkoutCard from "@/components/WorkoutCard.vue";
import store from "@/store";
import moment from "moment";

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
  },
  components: {
    Navbar,
    WorkoutCard,
  },
});
</script>
