<template>
  <div class="form-group">
    <br />

    <div class="container-fluid">
      <div class="row mb-1">
        <div class="col-sm-6">
          <label for="Exercise">
            <i
              class="bi bi-x-circle-fill hoverable"
              style="font-size: 1rem;"
              @click="removeExercise"
            ></i
            >Exercise Name:

            <i
              class="bi bi-journal-plus"
              v-if="!userWantsToAddNote"
              @click="changeExerciseNote(false)"
            ></i>

            <i
              class="bi bi-journal-minus"
              v-if="userWantsToAddNote"
              @click="changeExerciseNote(true)"
            ></i>
          </label>
          <input
            class="form-control"
            type="text"
            list="exercises"
            v-model="exerciseData.exerciseName"
          />

          <datalist id="exercises">
            <option
              v-for="(exerciseName, idx) in getExerciseSuggestions"
              :key="idx"
              :value="exerciseName"
              >{{ exerciseName }}</option
            >
          </datalist>

          <div v-if="userWantsToAddNote">
            <label for="workoutNote" class="form-label">Exercise Note: </label>
            <textarea
              v-model.trim="exerciseData.exerciseNote"
              class="form-control"
              id="workoutNote"
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- TODO: add a label to the left that is the Exercise counter.  -->
    <!-- SETS ============== -->
    <div class="container-fluid">
      <div v-for="(set, index) in exerciseData.sets" :key="index" class="row">
        <div class="col">
          <label for="Exercise1">
            <i
              class="bi bi-x-circle-fill hoverable"
              @click="removeSet(index)"
            ></i
            >Weight
          </label>
          <input
            v-model="set.weight"
            min="0"
            type="number"
            class="form-control"
          />
        </div>
        <div class="col">
          <label for="Exercise1">Reps </label>
          <input
            v-model="set.reps"
            min="0"
            type="number"
            class="form-control"
          />
        </div>
        <div class="col image-upload">
          <label :for="returnUniqueId(index)" v-if="doesSetContainVideo(index)">
            <i
              class="bi bi-file-check-fill text-success hoverable custom-icon-fontsize"
            ></i>
          </label>

          <label :for="returnUniqueId(index)" v-else>
            <i
              class="bi bi-file-arrow-up-fill hoverable custom-icon-fontsize my-auto"
              style="color: cornflowerblue;"
            ></i>
          </label>

          <input
            :id="returnUniqueId(index)"
            ref="myFiles"
            name="file-upload"
            @change="previewFiles($event, index)"
            type="file"
            class="form-control"
          />
        </div>
      </div>

      <br />
    </div>

    <div class="container-fluid">
      <button @click="addNewSet" class="btn btn-info" type="button">
        <i class="bi bi-plus-circle-fill"></i> Set
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Exercise } from "@/interfaces/workout.interface";
import store from "@/store";
import Vue from "vue";

export default Vue.extend({
  name: "Exercise",
  props: {
    copiedExerciseData: {
      type: Object as () => Exercise,
    },
  },
  data() {
    return {
      exerciseData: {
        exerciseName: "",
        sets: [{ weight: 0, reps: 0, videoUrl: "" }],
        exerciseNote: "",
        videoData: Array<any>(), // Todo: update this
      },
      userWantsToAddNote: false,
      exerciseId:
        "_" +
        Math.random()
          .toString(36)
          .substr(2, 9),
    };
  },
  created() {
    if (this.copiedExerciseData) {
      console.log(this.copiedExerciseData);
      this.exerciseData.exerciseName = this.copiedExerciseData.exerciseName;
      this.exerciseData.sets = [];
      this.copiedExerciseData.sets.forEach((set) => {
        this.exerciseData.sets.push({
          weight: set.weight,
          reps: set.reps,
          videoUrl: "",
        });
      });
    }
    this.$emit("emitExerciseData", this.exerciseData);
  },
  methods: {
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
    doesSetContainVideo(setIdx: number): boolean {
      let itDoes = false;
      if (this.exerciseData.sets[setIdx]) {
        this.exerciseData.videoData.forEach((vidData) => {
          if (vidData.setVideoIdx === setIdx) itDoes = true;
        });
      }
      return itDoes;
    },
    returnUniqueId(setVideoIdx: number) {
      return `${this.exerciseId}Set:${setVideoIdx}`;
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
      this.exerciseData.videoData.forEach((vidData, vidIdx) => {
        if (vidData.setVideoIdx === setIdx) {
          videoDataSetIdx = vidIdx;
        }
      });

      if (videoDataSetIdx !== -1) {
        this.exerciseData.videoData.splice(videoDataSetIdx, 1);
      }
    },
    changeExerciseNote(remove: boolean) {
      if (remove) {
        this.userWantsToAddNote = false;
        this.exerciseData.exerciseNote = "";
      } else this.userWantsToAddNote = true;
    },
  },
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
      return store.getters.getUserData.exercises;
    },
  },
});
</script>

<style scoped>
.custom-icon-fontsize {
  font-size: 2rem;
}

.image-upload > input {
  display: none;
}

/* * {
  outline: 1px solid red;
} */
</style>
