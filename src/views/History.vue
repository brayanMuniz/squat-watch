<template>
  <div>
    <Navbar />

    <div
      class="container-fluid mb-1 row row-cols-1 row-cols-md-3 row-cols-xl-5"
    >
      <WorkoutCard
        class="col my-2 mx-1"
        v-for="(workout, workoutIdx) in historyOfWorkouts"
        :key="workoutIdx"
        :workoutData="workout"
        :ableToEditWorkout="true"
      />
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import moment from "moment";
import WorkoutCard from "@/components/WorkoutCard.vue";
import Navbar from "@/components/Navbar.vue";
import store from "@/store";
export default Vue.extend({
  name: "History",
  data() {
    return {
      historyOfWorkouts: [],
    };
  },
  async created() {
    this.historyOfWorkouts = store.getters.getSavedWorkoutData.workoutData;
    let dates: Array<string> = this.getMissingDates(
      moment()
        .subtract(1, "month")
        .format("MM-DD-YYYY"),
      moment().format("MM-DD-YYYY")
    );

    await store
      .dispatch("retriveWorkoutData", {
        dates: dates,
        uid: store.getters.getMyUID,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
      });
    console.log(store.getters.getSavedWorkoutData);
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
  },

  components: {
    WorkoutCard,
    Navbar,
  },
});
</script>
