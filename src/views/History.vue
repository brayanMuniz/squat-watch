<template>
  <div>
    <Navbar />

    <div
      class="container-fluid mb-1 row row-cols-1 row-cols-md-4 row-cols-xl-5"
    >
      <WorkoutCard
        class="col mx-1"
        v-for="(workout, workoutIdx) in historyOfWorkouts"
        :key="workoutIdx"
        :workoutData="workout"
      />
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import WorkoutCard from "@/components/WorkoutCard.vue";
import Navbar from "@/components/Navbar.vue";
export default Vue.extend({
  name: "History",
  data() {
    return {
      historyOfWorkouts: [],
    };
  },
  created() {
    this.historyOfWorkouts = this.$store.getters.getSavedWorkoutData.workoutData;
  },
  components: {
    WorkoutCard,
    Navbar,
  },
});
</script>
