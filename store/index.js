import Vue from "vue";
import Vuex from "vuex";
import { ZOHO } from "../assets/ZohoEmbededAppSDK.min.js";

Vue.use(Vuex);

export default new Vuex.Store({
  // strict: true,
  state: {
    entity: {},
    user: {},
    record: {},
  },
  getters: {
    getEntity: (state) => {
      return state.entity;
    },
    getUser: (state) => {
      return state.user;
    },
    getRecord: (state) => {
      return state.record;
    },
  },
  mutations: {
    SET_ENTITY(state, payload) {
      state.entity = payload;
    },
    SET_USER(state, payload) {
      state.user = payload;
    },
    SET_RECORD(state, payload) {
      state.record = payload;
    },
  },
  actions: {
    async setEntity({ commit }) {
      /* Fetch the Module Name (Entity) and record id (EntityId) */
      ZOHO.embeddedApp.on("PageLoad", function(data) {
        commit("SET_ENTITY", data);
        ZOHO.CRM.CONFIG.getCurrentUser().then(function(user_data){
          commit("SET_USER",user_data.users[0]);
        });
      });
    },
    async setRecord({ commit, getters }) {
      /* Fetch all the record fields for the related page */
      let e = getters.getEntity;
      return ZOHO.CRM.API.getRecord({ Entity: e.Entity, RecordID: e.EntityId })
        .then((record) => {
          commit("SET_RECORD", record.data[0]);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
});
