import { fetchPayees } from "@/utilities/fetch";
import { addPayee } from "@/utilities/api";

export const payeeStore = {
  namespaced: true,
  state() {
    return {
      all: [],
    };
  },
  getters:{
    sortedAll: state => {
      if(state.all && state.all.length > 0){
        return state.all.sort((a, b) => a.name.localeCompare(b.name));
      }
      else{
        return [];
      }
    },
  },
  mutations: {
    setPayees(state, payees) {
      state.all = payees ?? [];
    },
    addPayee(state, payee) {
      state.all.push(payee);
    },
  },
  actions: {
    async fetchPayees(ctx) {
      const json = await fetchPayees();

      ctx.commit("setPayees", json);
    },
    async addPayee(
      ctx,
      { payee_system_description, payee_bank_description, category }
    ) {
      const json = await addPayee(
        payee_system_description,
        payee_bank_description,
        category
      );

      ctx.commit("addPayee", json);

      return json;
    },
  },
};
