<template>
  <div class="card text-dark bg-light px-0">
    <div class="card-header">
      {{ cardWorkoutData.name }}

      <router-link
        v-if="ableToEditWorkout"
        class="btn btn-primary btn-sm"
        :to="{
          name: 'Update Workout',
          params: {
            date: cardWorkoutData.date,
            workoutData: cardWorkoutData,
          },
        }"
        ><i class="bi bi-pen-fill"></i
      ></router-link>

      <button
        type="button"
        class="btn btn-danger btn-sm"
        @click="deleteWorkout"
        v-if="ableToDeleteWorkout"
      >
        <i class="bi bi-x-square"></i>
      </button>
      <button
        @click="makeCardExpanded = !makeCardExpanded"
        v-if="expandable"
        class="btn btn-primary btn-sm"
      >
        <i class="bi bi-arrows-expand"></i>
      </button>
    </div>
    <div class="card-body">
      <h6 class="card-subtitle mb-2 text-muted">
        {{ dateToMonthDay(cardWorkoutData.date) }}
      </h6>

      <div class="row" v-if="makeCardExpanded">
        <div class="col">Exercise</div>
        <div class="col me-auto text-end">1RM</div>
      </div>

      <div class="row" v-else>
        <div class="col">Exercise</div>
        <div class="col me-auto text-end">Best Set</div>
      </div>

      <div v-if="makeCardExpanded">
        <div
          class="row lh-1 mb-1"
          v-for="(exercise, idx) in cardWorkoutData.exercises"
          :key="idx"
        >
          <div class="col-12">{{ exercise.exerciseName }}</div>

          <div v-for="(set, setIdx) in exercise.sets" class="row" :key="setIdx">
            <div class="col text-truncate">
              {{ setIdx + 1 }} {{ formatText(set.weight, set.reps) }}
            </div>

            <div class="col me-auto text-end">
              {{ calculateOneRepMax(set.weight, set.reps) }}
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <div
          class="row lh-1"
          v-for="(exercise, idx) in cardWorkoutData.exercises"
          :key="idx"
        >
          <div class="col-8 text-truncate">
            {{ exercise.sets.length }} x {{ exercise.exerciseName }}
          </div>
          <div class="col-4 text-end">
            {{ getBestSetAsString(exercise.sets) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import moment from "moment";
import {
  Workout,
  WorkingSet,
  getBestSetAsString,
  calculateOneRepMax,
} from "@/interfaces/workout.interface";
import { firebaseApp } from "@/firebase";
import firebase from "firebase";
import store from "@/store";
export default Vue.extend({
  props: {
    propWorkoutData: {
      type: Object as () => Workout,
    },
    ableToEditWorkout: {
      type: Boolean,
      default: false,
    },
    ableToDeleteWorkout: {
      type: Boolean,
      default: false,
    },
    expandable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      cardWorkoutData: this.propWorkoutData,
      showModalDialog: false,
      makeCardExpanded: false,
    };
  },
  created() {
    console.log(this.cardWorkoutData);
  },
  methods: {
    async deleteWorkout() {
      let batch = firebaseApp.firestore().batch();

      // Delete from exercise collection =================================
      for (let exercise in this.propWorkoutData.exercises) {
        let exerciseData = this.propWorkoutData.exercises[exercise];
        let refToExerciseDoc = firebaseApp
          .firestore()
          .collection("users")
          .doc(store.getters.getMyUID)
          .collection("exercises")
          .doc(exerciseData.exerciseName);

        let deleteMeData: any = {};
        deleteMeData[
          this.propWorkoutData.date
        ] = firebase.firestore.FieldValue.delete();
        console.log(deleteMeData);
        batch.update(refToExerciseDoc, deleteMeData);
      }

      // Delete Videos From Workout ===========================================
      let workoutStorageRef = firebaseApp
        .storage()
        .ref(`users/${store.getters.getMyUID}/workouts/exercises`);

      for (const exercise in this.propWorkoutData.exercises) {
        let exerciseData = this.propWorkoutData.exercises[exercise];
        let doesExerciseHaveVideos = false;
        exerciseData.sets.forEach((set) => {
          if (set.videoUrl) doesExerciseHaveVideos = true;
        });

        if (doesExerciseHaveVideos)
          await workoutStorageRef
            .child(exerciseData.exerciseName)
            .child(this.propWorkoutData.date)
            .delete()
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              console.error(err);
            });
      }

      // Delete workout document =================================================
      let workoutDocRef = firebaseApp
        .firestore()
        .collection("users")
        .doc(store.getters.getMyUID)
        .collection("workouts")
        .doc(this.propWorkoutData.date);
      batch.delete(workoutDocRef);

      // Commit the batch ================================================
      batch
        .commit()
        .then(() => {
          alert("Your workout has been deleted.");
        })
        .catch((err) => {
          console.error(err);
          alert("There was a problem deleting your workout.");
        });

      // Since the document can not be "caught" empty after batch update, another loop is needed
      for (let exercise in this.propWorkoutData.exercises) {
        let exerciseData = this.propWorkoutData.exercises[exercise];
        let refToExerciseDoc = firebaseApp
          .firestore()
          .collection("users")
          .doc(store.getters.getMyUID)
          .collection("exercises")
          .doc(exerciseData.exerciseName);

        // Delete exercise document if it is empty =================================
        let docIsEmpty = false;

        await refToExerciseDoc
          .get()
          .then(async (doc) => {
            if (doc.exists) {
              let count = 0;
              for (var k in doc.data()) {
                count++;
              }
              if (count == 0) {
                docIsEmpty = true;
                // Get exercises [] from userData and delete the one not in use anymore
                let newArrayWithRemovedExercise: Array<string> =
                  store.getters.getUserData.exercises;
                let removedIdx = -1;

                newArrayWithRemovedExercise.forEach((exercise, idx) => {
                  if (exercise == exerciseData.exerciseName) {
                    removedIdx = idx;
                  }
                });
                if (removedIdx !== -1)
                  newArrayWithRemovedExercise.splice(removedIdx, 1);
                // Replace exercises[] in userData
                let userDocRef = firebaseApp
                  .firestore()
                  .collection("users")
                  .doc(store.getters.getMyUID);
                userDocRef.update({
                  exercises: newArrayWithRemovedExercise,
                });
              }
            }
          })
          .catch((err) => {
            console.error(err);
          });

        if (docIsEmpty) await refToExerciseDoc.delete();
      }
    },
    getBestSetAsString(sets: Array<WorkingSet>): string {
      return getBestSetAsString(sets);
    },
    dateToMonthDay(date: string): string {
      return moment(date).format("MMM DD");
    },
    formatText(weight: number, reps: number): string {
      if (weight === 0) return `${reps} Reps`;
      return `${weight} lbs x ${reps}`;
    },
    calculateOneRepMax(weight: number, reps: number): number {
      return calculateOneRepMax(weight, reps);
    },
  },
});
</script>

<style scoped>
.card:hover {
  transform: scale(1.03);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06);
}
</style>
