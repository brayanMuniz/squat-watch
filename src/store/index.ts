import { Workout } from "@/interfaces/workout.interface";
import moment from "moment";
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    myUID: "",
    userData: {},
    savedExerciseData: {
      startDate: String(),
      endDate: String(),
      exerciseData: Array<Workout>(),
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
    getSavedExerciseData: (state) => {
      return state.savedExerciseData;
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
    updateSavedExerciseData(
      state,
      newExerciseData: {
        startDate: string;
        endDate: string;
        exerciseData: Array<Workout>;
      }
    ) {
      newExerciseData.exerciseData.forEach((workout) => {
        if (!state.savedExerciseData.exerciseData.includes(workout))
          state.savedExerciseData.exerciseData.push(workout);
      });

      // if startDate is further back replace date
      if (state.savedExerciseData.startDate) {
        const startDate1 = moment(state.savedExerciseData.startDate);
        const startDate2 = moment(newExerciseData.startDate);
        const startDateDiff: number = startDate2.diff(startDate1, "days");
        if (startDateDiff < 0)
          state.savedExerciseData.startDate = newExerciseData.startDate;
      } else state.savedExerciseData.startDate = newExerciseData.startDate;

      // if endDate is more recent replace it
      if (state.savedExerciseData.endDate) {
        const endDate1 = moment(state.savedExerciseData.endDate);
        const endDate2 = moment(newExerciseData.endDate);
        const endDateDiff: number = endDate1.diff(endDate2, "days");
        if (endDateDiff < 0)
          state.savedExerciseData.endDate = newExerciseData.endDate;
      } else state.savedExerciseData.endDate = newExerciseData.endDate;
    },
  },
  actions: {},
  modules: {},
});
