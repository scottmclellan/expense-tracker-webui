<template>
  <tr>
    <td></td>
    <td></td>
    <td>
      <ExpenseRowPayee
        v-if="editMode === MODES.ADD || editMode === MODES.EDIT"
        :payee="state.entry.payee"
        @payeeUpdated="payeeUpdated"
      />
      <div v-else>
        {{ state.entry.payee.payee_system_description }}
      </div>
    </td>
    <td>
      <MoneyInput v-model="state.entry.amount" />
    </td>
    <td>
      <ExpenseRowEntryUsers
        v-if="editMode === MODES.ADD || editMode === MODES.EDIT"
        :entry_users="state.entry.entry_users"
        @entryUsersChanged="entryUsersChanged"
      />
      <div v-else>
        <label
          v-for="(entryUser, index) in entryUsers
            .filter((x) => state.entry.entry_users.includes(x.id))
            .map(
              (entry_user, index) =>
                `${entry_user.first_name} ${entry_user.last_name}${
                  index === state.entry.entry_users.length - 1 ? '' : ', '
                }`
            )"
          :key="index"
        >
          {{ entryUser }}
        </label>
      </div>
    </td>
    <td>
      <ExpenseRowCategory
        :category="state.entry.category"
        @categoryChanged="categoryChanged"
      />     
    </td>
    <td>
      <el-button type="warning" @click="deleteEntry"> Delete </el-button>
    </td>
  </tr>
</template>

<script>
import ExpenseRowEntryUsers from "./ExpenseRowEntryUsers.vue";
import ExpenseRowPayee from "./ExpenseRowPayee.vue";
import ExpenseRowCategory from "./ExpenseRowCategory.vue";
import MoneyInput from "../Common/MoneyInput.vue";
import { reactive, ref, computed, watch } from "vue";
import { useStore } from "vuex";
import { formatCurrency } from "@/utilities/money";
import { MODES } from "../common";

export default {
  props: {
    bank_entry: Object,
    entry: Object,
    accountId: Number,
    index: Number,
  },
  setup(props, { emit }) {
    const store = useStore();

    const state = reactive({
      bank_entry: props.bank_entry,
      entry: props.entry,
      original_payee_system_description: props.bank_entry.payee_name,
    });

    const editMode = ref("");

    if (state.bank_entry.bank_entry_id === 0) {
      editMode.value = MODES.ADD;
    } else {
      editMode.value = MODES.PRE_EDIT;
    }

    // Add a watcher for state.entry
    watch(
      () => state.entry,
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          emit("changed", { index: props.index, entry: state.entry });
        }
      },
      { deep: true }
    );

    const entryUsersChanged = (e) => {
      state.entry.entry_users = e.selected;
    };
    const categoryChanged = (e) => {
      state.entry.category = e.selected;
    };

    const payeeUpdated = (e) => {
      state.entry.payee = e;
      var payee = store.state.payeeStore.all.find(
        (x) => x.id === parseInt(e.payee_id)
      );
      state.entry.category = payee.default_category_id;
    };

    const deleteEntry = () => {
      emit("deleteEntry", { index: props.index });
    };

    return {
      MODES,
      state,
      editMode,
      categoriesOrganized: computed(
        () => store.getters["categoryStore/organized"]
      ),
      formatCurrency,
      payeeUpdated,
      categoryChanged,
      entryUsersChanged,
      deleteEntry,
    };
  },
  components: { ExpenseRowEntryUsers, ExpenseRowPayee, ExpenseRowCategory, MoneyInput },
};
</script>

<style scoped>
select option:disabled {
  font-weight: 800;
  color: black;
}
</style>
