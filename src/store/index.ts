import { firebaseApp } from "@/firebase";
import { Workout } from "@/interfaces/workout.interface";
import moment from "moment";
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    myUID: "",
    userData: {},
    savedWorkoutData: {
      startDate: String(),
      endDate: String(),
      workoutData: Array<Workout>(),
    },
    profilePictureUrl: "",
  },
  getters: {
    getMyUID: (state) => {
      return state.myUID;
    },
    getUserData: (state) => {
      return state.userData;
    },
    getMyProfilePicture: (state) => {
      return state.profilePictureUrl;
    },
    getSavedWorkoutData: (state) => {
      return state.savedWorkoutData;
    },
  },
  mutations: {
    updateMyUID(state, newUID: string) {
      state.myUID = newUID;
    },
    updateUserData(state, newUserData: any) {
      state.userData = newUserData;
    },
    upateMyProfilePicture(state, newProfilePicture: string) {
      state.profilePictureUrl = newProfilePicture;
    },
    // Todo: add on dont totally replace
    updateSavedWorkoutData(
      state,
      newWorkoutData: {
        startDate: string;
        endDate: string;
        workoutData: Array<Workout>;
      }
    ) {
      newWorkoutData.workoutData.forEach((workout) => {
        if (!state.savedWorkoutData.workoutData.includes(workout))
          state.savedWorkoutData.workoutData.push(workout);
      });

      // if startDate is further back replace date
      if (state.savedWorkoutData.startDate) {
        const startDate1 = moment(state.savedWorkoutData.startDate);
        const startDate2 = moment(newWorkoutData.startDate);
        const startDateDiff: number = startDate2.diff(startDate1, "days");
        if (startDateDiff < 0)
          state.savedWorkoutData.startDate = newWorkoutData.startDate;
      } else state.savedWorkoutData.startDate = newWorkoutData.startDate;

      // if endDate is more recent replace it
      if (state.savedWorkoutData.endDate) {
        const endDate1 = moment(state.savedWorkoutData.endDate);
        const endDate2 = moment(newWorkoutData.endDate);
        const endDateDiff: number = endDate1.diff(endDate2, "days");
        if (endDateDiff < 0)
          state.savedWorkoutData.endDate = newWorkoutData.endDate;
      } else state.savedWorkoutData.endDate = newWorkoutData.endDate;
    },
  },
  actions: {
    async retriveWorkoutData({ commit }, details) {
      const workoutData: Array<Workout> = [];
      let error = false;
      const workoutPath = firebaseApp
        .firestore()
        .collection("users")
        .doc(details.uid)
        .collection("workouts");

      const workoutConverter = {
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

      for (const date in details.dates) {
        await workoutPath
          .doc(details.dates[date])
          .get()
          .then((doc) => {
            if (doc.exists) {
              workoutData.push(workoutConverter.fromFireStore(doc));
            }
          })
          .catch((err) => {
            error = true;
            console.error(err);
          });
      }
      if (error) return Promise.reject("Problem Getting Data For User");
      return Promise.resolve(workoutData);
    },
  },
  modules: {},
});
