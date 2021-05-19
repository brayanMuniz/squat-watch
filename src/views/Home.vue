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
import { Workout } from "@/interfaces/workout.interface";

export default Vue.extend({
  name: "Home",
  data() {
    return {
      videoReady: false,
      videoUrl: "",
    };
  },
  async mounted() {
    await this.retriveWorkoutData();

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

    // if startDate not provided, gets data from one week ago to now
    async retriveWorkoutData(startDate?: string, endDate?: string) {
      let workouts: Array<Workout> = [];
      let dates: Array<string> = this.generateArrayOfDates(
        "05/10/2021",
        "05/14/2021"
      );

      // Todo: Make a custom workout object to be able to convert from firebase data to my formatted data
      // ? Do i place custom workout object in workout interface or make a new file for it ?

      const myUID: string | undefined = firebaseApp.auth().currentUser?.uid;
      if (myUID != undefined) {
        let workoutPath = firebaseApp
          .firestore()
          .collection("users")
          .doc(myUID)
          .collection("workouts");

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
            console.log(data)
            return new Workout(
              data.name,
              doc.id,
              data.exercises,
              data.length
            );
          },
        };

        for (let date in dates) {
          await workoutPath
            .doc(dates[date])
            .get()
            .then((doc) => {
              if (doc.exists) {
                workouts.push(workoutConverter.fromFireStore(doc));
              }
            })
            .catch((err) => {
              console.error(err);
            });
        }
        console.log(workouts);
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
