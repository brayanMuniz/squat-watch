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
  actions: {},
  modules: {},
});
