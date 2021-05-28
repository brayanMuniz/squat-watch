import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    myUID: "",
  },
  getters: {
    getMyUID: (state) => {
      return state.myUID;
    },
  },
  mutations: {
    updateMyUID(state, newUID: string) {
      state.myUID = newUID;
    },
  },
  actions: {},
  modules: {},
});
