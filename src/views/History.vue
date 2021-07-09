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
import { getMissingDates } from "@/interfaces/dates.interface";
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
    const oneMonthAgo: string = moment()
      .subtract(1, "month")
      .format("MM-DD-YYYY");
    const today: string = moment().format("MM-DD-YYYY");
    let dates: Array<string> = getMissingDates(oneMonthAgo, today);

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
  components: {
    WorkoutCard,
    Navbar,
  },
});
</script>
