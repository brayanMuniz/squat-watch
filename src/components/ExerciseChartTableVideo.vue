<template>
  <div class="row border border-1 m-2 rounded bg-light text-dark">
    <!-- LineChart  -->
    <div class="col-lg-4 col-sm-12">
      <div class="container-fluid">
        <!-- :options prop needs to be passed in or there will be an error -->
        <LineChart
          :chartData="exerciseData.chartData"
          :options="chartOptions"
          :workingSets="exerciseData.setsWithDates"
          :exerciseName="exerciseData.exerciseName"
          v-on:clickedPoint="changeVideoFromExercise($event)"
        />
      </div>
    </div>
    <!-- Table -->
    <div class="col-lg-4 col-sm-12">
      <table class="table container-fluid">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th>1 Rep Max</th>
            <th scope="col">Best Set</th>
            <th scope="col"># Of Sets</th>
            <th scope="col">Video</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(e, idx) in exerciseData.setsWithDates" :key="idx">
            <th scope="row">{{ e.date }}</th>
            <td>{{ findBestOneRepMax(e.sets) }}</td>
            <td>{{ getBestSetAsString(e.sets) }}</td>
            <td>{{ e.sets.length }}</td>
            <td v-if="getVideoUrlFromSets(e.sets)">
              <i
                class="bi bi-play-btn-fill hoverable"
                @click="
                  changeVideoFromExercise({
                    exerciseName: exerciseData.exerciseName,
                    videoUrl: getVideoUrlFromSets(e.sets),
                  })
                "
              ></i>
            </td>
            <td v-else><i class="bi bi-slash-circle"></i></td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Video -->
    <div
      v-if="exerciseData.videoReady"
      class="col-lg-4 col-sm-12 container-fluid"
    >
      <div v-if="exerciseData.videoReady" class="container-fluid">
        <video ref="videoPlayer" width="320" height="240" autoplay controls>
          <source :src="exerciseData.videoUrl" />
          Your browser does not support video.
        </video>
      </div>

      <div
        class="spinner-border d-flex justify-content-center col-lg-4 col-sm-12 "
        role="status"
        v-else-if="exerciseData.videoLoading"
      >
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else class="col-lg-4 col-sm-12"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import LineChart from "@/components/LineChart";
import {
  WorkingSet,
  findBestOneRepMax,
  ExerciseChartData,
  getBestSetAsString,
} from "@/interfaces/workout.interface";
export default Vue.extend({
  props: {
    exerciseData: {
      type: Object as () => ExerciseChartData,
    },
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: true,
        tooltips: {
          callbacks: {},
        },
      },
    };
  },
  methods: {
    getBestSetAsString(sets: Array<WorkingSet>): string {
      return getBestSetAsString(sets);
    },
    findBestOneRepMax(sets: Array<WorkingSet>): number {
      return findBestOneRepMax(sets);
    },
    getVideoUrlFromSets(sets: Array<WorkingSet>): string {
      let videoUrl = "";
      sets.forEach((set) => {
        if (set.videoUrl) videoUrl = set.videoUrl;
      });
      return videoUrl;
    },
    changeVideoFromExercise(videoData: any) {
      if (videoData.exerciseName) {
        if (videoData.videoUrl !== undefined && videoData.videoUrl !== "") {
          this.exerciseData.videoReady = false;
          this.exerciseData.videoLoading = true;

          // This allows multiple videos to be played from one video player
          setTimeout(() => {
            this.exerciseData.videoUrl = videoData.videoUrl;
            this.exerciseData.videoReady = true;
            this.exerciseData.videoLoading = false;
          }, 500);
        } else {
          this.exerciseData.videoUrl = "";
          this.exerciseData.videoReady = false;
        }
      }
    },
  },
  components: {
    LineChart,
  },
});
</script>
