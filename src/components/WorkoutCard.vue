<template>
  <div class="card text-dark bg-light px-0">
    <div class="card-body">
      <h5 class="card-title">
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
      </h5>
      <h6 class="card-subtitle mb-2 text-muted">
        {{ dateToMonthDay(cardWorkoutData.date) }}
      </h6>

      <div class="row">
        <div class="col">Exercise</div>
        <div class="col me-auto text-end">Best Set</div>
      </div>

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
</template>

<script lang="ts">
import Vue from "vue";
import moment from "moment";
import {
  Workout,
  WorkingSet,
  getBestSetAsString,
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
  },
  data() {
    return {
      cardWorkoutData: this.propWorkoutData,
      showModalDialog: false,
    };
  },

  methods: {
    // Todo: Convert this into a batch
    async deleteWorkout() {
      let batch = firebaseApp.firestore().batch();
      let refToExerciseDoc = firebaseApp
        .firestore()
        .collection("users")
        .doc(store.getters.getMyUID)
        .collection("exercises")
        .doc(this.propWorkoutData.name);

      // Delete from exercise collection =================================
      let deleteMeData: any = {};
      deleteMeData[
        this.propWorkoutData.date
      ] = firebase.firestore.FieldValue.delete();
      batch.update(refToExerciseDoc, deleteMeData);

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
                if (exercise == this.propWorkoutData.name) {
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
              batch.update(userDocRef, {
                exercises: newArrayWithRemovedExercise,
              });
            }
          }
        })
        .catch((err) => {
          console.error(err);
        });

      if (docIsEmpty) await refToExerciseDoc.delete();

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
        .catch(() => {
          alert("There was a problem deleting your workout.");
          console.error("Batch no good SADGE :(");
        });
    },
    getBestSetAsString(sets: Array<WorkingSet>): string {
      return getBestSetAsString(sets);
    },
    dateToMonthDay(date: string): string {
      return moment(date).format("MMM DD");
    },
  },
});
</script>
