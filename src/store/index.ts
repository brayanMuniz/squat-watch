import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    myUID: "",
    userData: {},
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
  },
  actions: {},
  modules: {},
});
