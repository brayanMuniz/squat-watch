<template>
  <div class="home">
    <button @click="signOut">Sign Out</button>

    <div>
      <!-- :options prop needs to be passed in or there will be an error -->
      <BarChart
        :chartData="dataCollection"
        :options="chartOptions"
        v-on:clickedPoint="pointClicked($event)"
      />
    </div>

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
import { ChartData, ChartPoint } from "chart.js";
// Since chartjs 3.0 came out i kept getting errors but this person fixed it for me lol thx
// https://github.com/apertureless/vue-chartjs/issues/695#issuecomment-813059967
import BarChart from "@/components/LineChart";
import { Moment } from "moment";

export default Vue.extend({
  name: "Home",
  data() {
    return {
      videoReady: false,
      videoUrl: "",
      fireStoreWorkouts: new Array<Workout>(),
      dataCollection: Object as ChartData,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },
  async created() {
    this.fillData();
    firebaseApp.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // await this.retriveWorkoutData("05/10/2021", "05/14/2021");
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
    // ! IF YOU HAVE MULTIPLE DATA SETS YOU ARE NOT ABLE TO TELL WHICH DATA POINT YOU PICKED, SO I WILL STICK TO ONE DATA POINT
    pointClicked(data: any) {
      let idx: number | undefined = data._index;
      let label:
        | string
        | number
        | string[]
        | Moment
        | Date
        | number[]
        | Date[]
        | Moment[] = 0;

      let dataPoint: number | number[] | ChartPoint | null | undefined = 0;

      if (idx !== undefined) {
        // Get the label
        if (this.dataCollection.labels) label = this.dataCollection.labels[idx];

        // Get the datapoint
        if (this.dataCollection.datasets !== undefined) {
          // since you will only be checking on one dataset you can just go to dataset 0. The first and only one
          if (this.dataCollection.datasets[0].data !== undefined)
            dataPoint = this.dataCollection.datasets[0].data[idx];
        }
      }
      console.log(`Label(x) is: ${label}. Datapoint(y) is: ${dataPoint}`);
    },

    fillData() {
      let data: ChartData = {
        labels: [1, 2, 3],
        datasets: [
          {
            label: "Data One",
            data: [
              this.getRandomInt(),
              this.getRandomInt(),
              this.getRandomInt(),
            ],
            fill: false,
            borderColor: "red",
          },
        ],
      };
      console.log("Chart Data below. ")
      console.log(data);

      this.dataCollection = data;
    },
    getRandomInt() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    },
    playVid() {
      this.$refs["videoPlayer"].play();
    },
    pauseVid() {
      this.$refs["videoPlayer"].pause();
    },
  },
  components: {
    BarChart,
  },
});
</script>
