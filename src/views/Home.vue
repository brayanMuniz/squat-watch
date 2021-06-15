<template>
  <div class="home">
    <button @click="signOut">Sign Out</button>

    <!-- TODO: make this a button that collapses with 
isAutoCloseable	prop 
 -->
    <FunctionalCalendar
      v-model="calendarData"
      :configs="calendarConfigs"
      v-on:choseDay="getDateRange($event)"
    ></FunctionalCalendar>

    <div v-if="dataReady">
      <!-- :options prop needs to be passed in or there will be an error -->
      <LineChart
        :chartData="dataCollection"
        :options="chartOptions"
        v-on:clickedPoint="pointClicked($event)"
      />
    </div>

    <div v-if="noDataInThisDateRange">No Data In This Date Range</div>

    <div v-if="videoReady">
      <video ref="videoPlayer" width="320" height="240">
        <source :src="videoUrl" />
      </video>
      <button @click="playVid" type="button">Play</button>
      <button @click="pauseVid" type="button">Pause</button>
    </div>

    <div>Stats</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { firebaseApp } from "@/firebase";
import moment from "moment";
import {
  ChartWorkingSet,
  ExerciseChartData,
  WorkingSet,
  Workout,
} from "@/interfaces/workout.interface";
import { ChartData, ChartPoint } from "chart.js";
import { Moment } from "moment";
import store from "@/store";
import LineChart from "@/components/LineChart";
import { FunctionalCalendar } from "vue-functional-calendar";

export default Vue.extend({
  name: "Home",
  data() {
    return {
      videoReady: false,
      videoUrl: "",
      dataReady: false,
      dataCollection: Object() as ChartData,
      allExerciseChartData: Array<ExerciseChartData>(),
      // Todo: let the user will be able to select what exercise they wish to view
      currentlySelectedExercise: "Squat",
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
      noDataInThisDateRange: false,
      startDate: moment()
        .subtract(1, "week")
        .format("MM-DD-YYYY"),
      endDate: moment().format("MM-DD-YYYY"),
      calendarData: {},
      calendarConfigs: {
        sundayStart: true,
        dateFormat: "mm/dd/yyyy",
        isDatePicker: false,
        isDateRange: true,
        disabledDates: ["afterToday"],
        isDark: true,
      },
      pickedDates: Array<string>(),
    };
  },
  async created() {
    await this.retriveWorkoutData(this.startDate, this.endDate)
      .then((res) => {
        let convertedData:
          | Array<ExerciseChartData>
          | undefined = this.covertWorkoutDataToChartData(res);
        if (convertedData.length > 0) {
          this.dataCollection = convertedData[0].chartData;
          this.allExerciseChartData = convertedData;
          this.dataReady = true;
        } else {
          this.noDataInThisDateRange = true;
        }
      })
      .catch((err) => {
        this.dataReady = false;
        console.error(err);
      });
  },
  methods: {
    async getDateRange(event: any) {
      console.log(event);
      if (event.date) {
        this.pickedDates.push(event.date);

        // remove the last two pairs in the date range
        if (this.pickedDates.length > 2) {
          this.pickedDates.shift();
          this.pickedDates.shift();
        }

        // there are two dates in the date range
        if (this.pickedDates.length > 1) {
          let dateA = moment(this.pickedDates[0]);
          let dateB = moment(this.pickedDates[1]);
          let diff: number = dateA.diff(dateB, "days");
          // if diff is posotive, dateA is more recent
          if (diff > 0) {
            this.endDate = dateA.format("MM-DD-YYYY");
            this.startDate = dateB.format("MM-DD-YYYY");
          } else {
            this.startDate = dateA.format("MM-DD-YYYY");
            this.endDate = dateB.format("MM-DD-YYYY");
          }

          console.log(this.startDate, this.endDate);

          await this.retriveWorkoutData(this.startDate, this.endDate)
            .then((res) => {
              let convertedData:
                | Array<ExerciseChartData>
                | undefined = this.covertWorkoutDataToChartData(res);
              if (convertedData.length > 0) {
                this.dataCollection = convertedData[0].chartData;
                this.allExerciseChartData = convertedData;
                this.dataReady = true;
              } else {
                console.log("No Data in this date range ");
                this.dataReady = false;
                this.noDataInThisDateRange = true;
              }
            })
            .catch((err) => {
              this.dataReady = false;
              console.error(err);
            });
        }
      }
    },

    // Firebase Methods ==========================
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
      return dates;
    },

    async retriveWorkoutData(startDate?: string, endDate?: string) {
      let dates: Array<string> = [];
      let workoutData: Array<Workout> = [];
      let error = false;

      // if startDate not provided, gets data from one week ago to now
      if (startDate && endDate) {
        dates = this.generateArrayOfDates(startDate, endDate);
      } else {
        dates = this.generateArrayOfDates(
          moment()
            .subtract(1, "week")
            .format("MM-DD-YYYY"),
          moment().format("MM-DD-YYYY")
        );
      }

      const myUID: string | undefined = store.getters.getMyUID;
      if (myUID !== undefined) {
        let workoutPath = firebaseApp
          .firestore()
          .collection("users")
          .doc(myUID)
          .collection("workouts");

        // ? Do i place custom workout object in workout interface or make a new file for it ?
        let workoutConverter = {
          toFirestore: function(workout: Workout) {
            return {
              name: workout.name,
              date: workout.date,
              exercises: workout.exercises,
              length: workout.length,
            };
          },
          fromFireStore: function(doc: any) {
            const data = doc.data();
            return new Workout(data.name, doc.id, data.exercises, data.length);
          },
        };

        // using for ... in instead of forEach becasue for of will use await properly
        for (const date in dates) {
          await workoutPath
            .doc(dates[date])
            .get()
            .then((doc) => {
              if (doc.exists) {
                workoutData.push(workoutConverter.fromFireStore(doc));
              }
            })
            .catch((err) => {
              console.error(err);
            });
        }

        if (error) {
          return Promise.reject("Error");
        } else {
          return Promise.resolve(workoutData);
        }
      } else {
        return Promise.reject("Not signed in ");
      }
    },
    // Converts every exercise into one set of ChartData obj.
    covertWorkoutDataToChartData(
      workoutData: Array<Workout>
    ): Array<ExerciseChartData> {
      // helps keep track what exercises i already have an object for
      let alreadyStartedExercises: Array<string> = [];
      let allExercises: Array<ExerciseChartData> = [];

      // ? Move these to workoutinterface
      function calculateOneRepMax(weight: number, reps: number): number {
        return Math.round(weight * (1 + reps / 30));
      }

      function findBestOneRepMax(sets: Array<WorkingSet>): number {
        let bestOneRepMax = 0;
        sets.forEach((set) => {
          let setOneRepMax = calculateOneRepMax(set.weight, set.reps);
          if (setOneRepMax > bestOneRepMax) {
            bestOneRepMax = setOneRepMax;
          }
        });
        return bestOneRepMax;
      }

      workoutData.forEach((workout) => {
        workout.exercises.forEach((exercise) => {
          if (alreadyStartedExercises.includes(exercise.exerciseName)) {
            allExercises.forEach((exerciseChartData) => {
              if (exerciseChartData.exerciseName === exercise.exerciseName) {
                // Configure Chart Data ==
                // x axis of dates
                if (exerciseChartData.chartData.labels)
                  exerciseChartData.chartData.labels.push(workout.date);

                // y axis of one rep max
                if (exerciseChartData.chartData.datasets) {
                  if (exerciseChartData.chartData.datasets[0].data)
                    exerciseChartData.chartData.datasets[0].data.push(
                      findBestOneRepMax(exercise.sets)
                    );
                }

                // Cofigures set data ==

                let formattedSets: ChartWorkingSet = {
                  date: workout.date,
                  sets: exercise.sets,
                };
                exerciseChartData.setsWithDates.push(formattedSets);
              }
            });
          } else {
            alreadyStartedExercises.push(exercise.exerciseName);

            let convertedDataToChart: ChartData = {
              labels: [workout.date], // x axis
              datasets: [
                {
                  label: `${exercise.exerciseName} One Rep Max`,
                  data: [findBestOneRepMax(exercise.sets)], // y axis
                  fill: false,
                  borderColor: "red",
                },
              ],
            };

            let formattedSets: ChartWorkingSet = {
              date: workout.date,
              sets: exercise.sets,
            };

            allExercises.push({
              exerciseName: exercise.exerciseName,
              chartData: convertedDataToChart,
              setsWithDates: [formattedSets],
            });
          }
        });
      });

      return allExercises;
    },

    // Chart Methods ==========================
    pointClicked(data: any) {
      // Figure out what point is clicked
      let idx: number | undefined = data._index;
      let label:
        | string
        | number
        | string[]
        | Moment
        | Date
        | number[]
        | Date[]
        | Moment[] = -1;

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

      // Get video Url if it exist
      let videoUrl: string | undefined = undefined;
      this.allExerciseChartData.forEach((exercise) => {
        if (exercise.exerciseName === this.currentlySelectedExercise) {
          exercise.setsWithDates.forEach((sets) => {
            if (sets.date === label) {
              sets.sets.forEach((set) => {
                if (set.videoUrl !== "" || set.videoUrl !== undefined)
                  videoUrl = set.videoUrl;
              });
            }
          });
        }
      });

      console.log(`Label(x) is: ${label}. Datapoint(y) is: ${dataPoint}`);

      if (videoUrl !== undefined) {
        this.videoUrl = videoUrl;
        this.videoReady = true;
        console.log(`Video URL for video is ${videoUrl}`);
      } else {
        this.videoReady = false;
      }
    },
    // Video Player Methods ==========================
    playVid() {
      this.$refs["videoPlayer"].play();
    },
    pauseVid() {
      this.$refs["videoPlayer"].pause();
    },
  },
  components: {
    LineChart,
    FunctionalCalendar,
  },
});
</script>
