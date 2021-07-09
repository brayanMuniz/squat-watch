<template>
  <div class="card text-dark bg-light px-0">
    <div class="card-body">
      <h5 class="card-title">
        {{ cardWorkoutData.name }}
        <button type="button" v-if="ableToEditWorkout" class="btn btn-primary">
          <i v-if="ableToEditWorkout" class="bi bi-pen-fill"></i>
        </button>
      </h5>
      <h6 class="card-subtitle mb-2 text-muted">
        {{ dateToMonthDay(cardWorkoutData.date) }}
      </h6>

      <div class="row">
        <div class="col">Exercise</div>
        <div class="col me-auto text-end">Best Set</div>
      </div>

      <div
        class="row lh-1"
        v-for="(exercise, idx) in cardWorkoutData.exercises"
        :key="idx"
      >
        <div class="col-8 text-truncate">
          {{ exercise.sets.length }} x {{ exercise.exerciseName }}
        </div>
        <div class="col-4 text-end">
          {{ getBestSetAsString(exercise.sets) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import moment from "moment";
import {
  Workout,
  WorkingSet,
  getBestSetAsString,
} from "@/interfaces/workout.interface";

export default Vue.extend({
  props: {
    workoutData: {
      type: Object as () => Workout,
    },
    ableToEditWorkout: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      cardWorkoutData: {},
    };
  },
  created() {
    this.cardWorkoutData = this.workoutData;
  },
  methods: {
    getBestSetAsString(sets: Array<WorkingSet>): string {
      return getBestSetAsString(sets);
    },
    dateToMonthDay(date: string): string {
      return moment(date).format("MMM DD");
    },
  },
});
</script>
