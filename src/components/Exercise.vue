<template>
  <div class="form-group">
    <!-- TODO: Have pre selected exercises that pop up(Squat, Bench, Deadlift) -->
    <button @click="removeExercise" type="button">
      Remove Exercise
    </button>
    <br />
    <label for="Exercise1">Exercise Name: </label>
    <input
      v-model.trim="exerciseData.exerciseName"
      type="text"
      class="form-control"
    />
    <br />
    <!-- SET ============== -->
    <div v-for="(set, index) in exerciseData.sets" :key="index">
      <button @click="removeSet(index)" type="button">Remove Set</button>
      <label for="Exercise1">Weight </label>
      <input v-model="set.weight" type="number" class="form-control" />
      <label for="Exercise1">Reps </label>
      <input v-model="set.reps" type="number" class="form-control" />
      <!-- <label for="Starting Amount">Video For Set:</label>
      <br />

      <input
        ref="upload"
        name="file-upload"
        @change="previewFiles"
        type="file"
        class="form-control"
        id="Profile Image"
      /> -->
    </div>
    <button @click="addNewSet" type="button">Add New Set</button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
// Todo: video upload

export default Vue.extend({
  name: "Exercise",
  data() {
    return {
      videoUpload: new Blob(),
      exerciseData: {
        exerciseName: "",
        sets: [{ weight: 0, reps: 0, videoUrl: "" }],
      },
    };
  },
  methods: {
    previewFiles(event: any): void {
      this.videoUpload = event.target.files[0];
      console.log(this.videoUpload);
    },
    addNewSet() {
      let setsLength: number = this.exerciseData.sets.length;
      if (setsLength > 0) {
        let lastSetData = this.exerciseData.sets[setsLength - 1];
        this.exerciseData.sets.push(lastSetData);
      } else {
        this.exerciseData.sets.push({ weight: 0, reps: 0, videoUrl: "" });
      }
    },
    removeExercise() {
      this.$emit("removeExercise", this.exerciseData);
    },
    removeSet(setIdx: number) {
      if (this.exerciseData.sets[setIdx]) {
        this.exerciseData.sets.splice(setIdx, 1);
      }
    },
  },
  // ? Might be able to add another watcher for videoUpload and have it emited to the parent with object {setLocation, videoUrl}
  watch: {
    exerciseData: {
      deep: true,
      handler(changedData) {
        this.$emit("emitExerciseData", changedData);
      },
    },
  },
});
</script>
