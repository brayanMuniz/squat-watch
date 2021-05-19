<template>
  <div class="home">
    <button @click="signOut">Sign Out</button>

    <div>Chart</div>
    <div v-if="videoReady">
      <video ref="videoPlayer">
        <source :src="videoUrl" />
      </video>
      <button @click="playVid" type="button">Play Vid</button>
      <button @click="pauseVid" type="button">Pause Vid</button>
    </div>

    <div>Stats</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { firebaseApp } from "@/firebase";
import moment from "moment";

export default Vue.extend({
  name: "Home",
  data() {
    return {
      videoReady: false,
      videoUrl: "",
    };
  },
  async mounted() {


    // this is the actual name of the video NOT the url link
    this.retriveWorkoutData();
    // const testVideo = "redditsave.com_numa_numa-t8vuqusl0fm61.mp4";
    // let testVideRef = firebaseApp.storage().ref(testVideo);
    // await testVideRef
    //   .getDownloadURL()
    //   .then((url) => {
    //     this.videoUrl = url;
    //     this.videoReady = true;
    //   })
    //   .catch((err) => {
    //     this.videoUrl = "";
    //     this.videoReady = false;
    //     console.error(err);
    //   });
  },
  methods: {
    async signOut() {
      await firebaseApp
        .auth()
        .signOut()
        .then(() => {
          console.log("User was signed out");
        })
        .catch((err) => {
          console.error(err);
        });
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
      console.log(dates);
      return dates;
    },
    // if startDate not provided, gets data from one week ago to now
    async retriveWorkoutData(startDate?: string, endDate?: string) {
      let dates: Array<string> = this.generateArrayOfDates(
        "05/10/2021",
        "05/14/2021"
      );
      firebaseApp.firestore().collection("users").doc()

    },
    playVid() {
      this.$refs["videoPlayer"].play();
    },
    pauseVid() {
      this.$refs["videoPlayer"].pause();
    },
  },
});
</script>
