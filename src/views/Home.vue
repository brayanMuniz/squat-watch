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
    {{ fireStoreWorkouts }}

    <div>Stats</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { firebaseApp } from "@/firebase";
import moment from "moment";
import { Workout } from "@/interfaces/workout.interface";

export default Vue.extend({
  name: "Home",
  data() {
    return {
      videoReady: false,
      videoUrl: "",
      fireStoreWorkouts: new Array<Workout>(),
    };
  },
  async created() {
    firebaseApp.auth().onAuthStateChanged(async (user) => {
      if (user) {
        await this.retriveWorkoutData("05/10/2021", "05/14/2021");
      }
    });

    // this is the actual name of the video NOT the url link
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

    async retriveWorkoutData(startDate?: string, endDate?: string) {
      let dates: Array<string> = [];

      // if startDate not provided, gets data from one week ago to now
      if (startDate && endDate) {
        dates = this.generateArrayOfDates(startDate, endDate);
      } else {
        dates = this.generateArrayOfDates(
          moment().subtract(1, "week").format("MM-DD-YYYY"),
          moment().format("MM-DD-YYYY")
        );
      }

      const myUID: string | undefined = firebaseApp.auth().currentUser?.uid;
      if (myUID != undefined) {
        let workoutPath = firebaseApp
          .firestore()
          .collection("users")
          .doc(myUID)
          .collection("workouts");

        // ? Do i place custom workout object in workout interface or make a new file for it ?
        let workoutConverter = {
          toFirestore: function (workout: Workout) {
            return {
              name: workout.name,
              date: workout.date,
              exercises: workout.exercises,
              length: workout.length,
            };
          },
          fromFireStore: function (doc: any) {
            const data = doc.data();
            console.log(data);
            return new Workout(data.name, doc.id, data.exercises, data.length);
          },
        };

        dates.forEach(async (date) => {
          await workoutPath
            .doc(date)
            .get()
            .then((doc) => {
              if (doc.exists) {
                this.fireStoreWorkouts.push(
                  workoutConverter.fromFireStore(doc)
                );
              }
            })
            .catch((err) => {
              console.error(err);
            });
        });
      }
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
