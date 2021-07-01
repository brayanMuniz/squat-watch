<template>
  <div class="card text-dark bg-light">
    <div class="card-body">
      <h5 class="card-title">{{ cardWorkoutData.name }}</h5>
      <h6 class="card-subtitle mb-2 text-muted">
        {{ dateToMonthDay(cardWorkoutData.date) }}
      </h6>

      <p
        class="card-text my-0"
        v-for="(exercise, idx) in cardWorkoutData.exercises"
        :key="idx"
      >
        {{ exercise.sets.length }} x
        {{ exercise.exerciseName }}
        | Best Set :
        {{ getBestSetAsString(exercise.sets) }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import moment from "moment";
import { Workout, WorkingSet } from "@/interfaces/workout.interface";

export default Vue.extend({
  props: {
    workoutData: {
      type: Object as () => Workout,
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
    calculateOneRepMax(weight: number, reps: number): number {
      return Math.round(weight * (1 + reps / 30));
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
    dateToMonthDay(date: string): string {
      return moment(date).format("MMM DD");
    },
  },
});
</script>
