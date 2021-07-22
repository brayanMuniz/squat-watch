<template>
  <div class="card text-center">
    <div class="card-header">
      <ul class="nav nav-pills card-header-pills">
        <li class="nav-item">
          <button
            class="btn btn-primary"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="getRandomIdWithHash()"
            aria-expanded="false"
            :aria-controls="randomId"
          >
            {{ exerciseData.exerciseName }}
          </button>
        </li>
        
        <li class="nav-item" v-if="isThisExerciseFavorite">
          <i
            class="bi bi-star-fill hoverable"
            @click="changeFavoriteExercise(false)"
          ></i>
        </li>

        <li class="nav-item" v-else>
          <i
            class="bi bi-star hoverable"
            @click="changeFavoriteExercise(true)"
          ></i>
        </li>
      </ul>
    </div>

    <div
      class="card-body row border border-1 m-2 rounded bg-light text-dark collapse"
      :id="randomId"
    >
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
        <div
          v-if="exerciseData.videoReady"
          class="container-fluid ratio ratio-1x1"
        >
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
import { firebaseApp } from "@/firebase";
import store from "@/store";

function makeRandomid(): string {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  for (var i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

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
      randomId: makeRandomid(),
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
    async changeFavoriteExercise(makeExerciseFavorite: boolean) {
      let refToMyDoc = firebaseApp
        .firestore()
        .collection("users")
        .doc(store.getters.getMyUID);
      let changeHappend = false;
      let myFavoriteExercises: Array<string> =
        store.getters.getUserData.favoriteExercises;

      // Add or remove from myFavoriteExercises
      if (makeExerciseFavorite) {
        myFavoriteExercises.push(this.exerciseData.exerciseName);
        changeHappend = true;
      } else {
        let idxOfExercise: number | -1 = myFavoriteExercises.indexOf(
          this.exerciseData.exerciseName
        );
        if (idxOfExercise !== -1) {
          myFavoriteExercises = myFavoriteExercises.splice(idxOfExercise, 1);
        }
        changeHappend = true;
      }

      if (changeHappend)
        await refToMyDoc.update({
          favoriteExercises: myFavoriteExercises,
        });
    },
    getRandomIdWithHash(): string {
      return "#" + this.randomId;
    },
  },
  computed: {
    isThisExerciseFavorite(): boolean {
      let myFavoriteExercises: Array<string> =
        store.getters.getUserData.favoriteExercises;
      return myFavoriteExercises.includes(this.exerciseData.exerciseName);
    },
  },
  components: {
    LineChart,
  },
});
</script>
