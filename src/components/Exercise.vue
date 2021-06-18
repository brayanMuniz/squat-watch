<template>
  <div class="form-group">
    <!-- TODO: Have pre selected exercises that pop up(Squat, Bench, Deadlift) -->
    <button @click="removeExercise" type="button">
      -R Exercise
    </button>
    <br />
    <label for="Exercise">Exercise Name: </label>
    <!-- https://www.npmjs.com/package/vue-autosuggest -->
    <vue-autosuggest
      :suggestions="getExerciseSuggestions"
      :input-props="{
        id: 'autosuggest__input',
        placeholder: 'Exercise Name',
      }"
      @selected="selectHandler"
      v-model.trim="exerciseData.exerciseName"
    >
    <!-- TODO: dont show suggestions, until first letter is inputed and it matches it -->
      <template slot-scope="{ suggestion }">
        <span class="my-suggestion-item">{{ suggestion.item }}</span>
      </template>
    </vue-autosuggest>

    <br />

    <!-- TODO: add a label to the left that is the Exercise counter.  -->
    <!-- SETS ============== -->
    <div v-for="(set, index) in exerciseData.sets" :key="index">
      <button @click="removeSet(index)" type="button">-R</button>
      <label for="Exercise1">Weight </label>
      <input v-model="set.weight" type="number" class="form-control" />
      <label for="Exercise1">Reps </label>
      <input v-model="set.reps" type="number" class="form-control" />

      <br />

      <input
        ref="myFiles"
        name="file-upload"
        @change="previewFiles($event, index)"
        type="file"
        class="form-control"
        id="Profile Image"
        multiple
      />
    </div>
    <button @click="addNewSet" type="button">Add New Set</button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { VueAutosuggest } from "vue-autosuggest"; // ? Same problem with calendar component. When creating .d.ts file, it says there is no exported member

export default Vue.extend({
  name: "Exercise",
  data() {
    return {
      videoUpload: new Blob(),
      videoReady: false,
      // Todo: make user fill out at least exerciseName and one set
      exerciseData: {
        exerciseName: "",
        sets: [{ weight: 0, reps: 0, videoUrl: "" }],
        videoData: Array<any>(), // Todo: update this
      },
    };
  },
  methods: {
    selectHandler(event: any) {
      if (event !== null) this.exerciseData.exerciseName = event.item;
    },
    previewFiles(event: any, setIdx: number): void {
      if (this.exerciseData.sets[setIdx] !== undefined) {
        let video = event.target.files[0];
        // If you are replacing the video for the set
        let foundVideo = false;
        this.exerciseData.videoData.forEach((vidData) => {
          if (vidData.setVideoIdx === setIdx) {
            vidData.video = video;
            foundVideo = true;
          }
        });
        // else place new video data object
        if (!foundVideo)
          this.exerciseData.videoData.push({
            setVideoIdx: setIdx,
            video: video,
          });
      }
    },
    addNewSet() {
      let setsLength: number = this.exerciseData.sets.length;
      if (setsLength > 0) {
        let lastSetData = {
          weight: this.exerciseData.sets[setsLength - 1].weight,
          reps: this.exerciseData.sets[setsLength - 1].reps,
          videoUrl: this.exerciseData.sets[setsLength - 1].videoUrl,
        };
        this.exerciseData.sets.push(lastSetData);
      } else {
        this.exerciseData.sets.push({ weight: 0, reps: 0, videoUrl: "" });
      }
    },
    removeExercise() {
      this.$emit("removeExercise", this.exerciseData);
    },
    removeSet(setIdx: number) {
      // Remove set
      if (this.exerciseData.sets[setIdx]) {
        this.exerciseData.sets.splice(setIdx, 1);
      }
      // remove video data from this.exerciseData
      let videoDataSetIdx = -1;
      this.exerciseData.videoData.forEach((vidData) => {
        if (vidData.setVideoIdx == setIdx) {
          videoDataSetIdx = setIdx;
        }
      });

      if (videoDataSetIdx !== -1) {
        this.exerciseData.videoData.splice(setIdx, 1);
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
  computed: {
    getExerciseSuggestions() {
      return [
        {
          data: this.$store.getters.getUserData.exercises,
        },
      ];
    },
  },
  components: {
    VueAutosuggest,
  },
});
</script>
