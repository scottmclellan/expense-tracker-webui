<template>
  <tr v-if="!isSplitEntry">
    <td>{{ localRow.entry_date }}</td>
    <td>{{ localRow.payee.payee_bank_description }}</td>
    <td>
      <ExpenseRowPayee
        v-if="editMode === MODES.ADD || editMode === MODES.EDIT"
        :payee="localRow.payee"
        @payeeUpdated="payeeUpdated"
      />
      <div v-else>
        {{ localRow.payee.payee_system_description }}
      </div>
    </td>
    <td>
      <MoneyInput v-model="localRow.amount" />
    </td>
    <td>
      <ExpenseRowEntryUsers
        v-if="editMode === MODES.ADD || editMode === MODES.EDIT"
        :entry_users="localRow.entry_users"
        @entryUsersChanged="entryUsersChanged"
      />
      <div v-else>
        <label
          v-for="(entryUser, index) in entryUsers
            .filter((x) => localRow.entry_users.includes(x.id))
            .map(
              (entry_user, index) =>
                `${entry_user.first_name} ${entry_user.last_name}${
                  index === localRow.entry_users.length - 1 ? '' : ', '
                }`
            )"
          :key="index"
        >
          {{ entryUser }}
        </label>
      </div>
    </td>
    <td>
      <select v-model="localRow.category">
        <option
          v-for="category in categoriesOrganized"
          :key="category.id"
          :value="category.id"
          :disabled="!category.canSelect"
        >
          {{ category.description }}
        </option>
      </select>
    </td>
    <td>
      <el-button type="warning" @click="deleteEntry"> Delete </el-button>
    </td>
  </tr>
</template>

<script>
import ExpenseRowEntryUsers from "./ExpenseRowEntryUsers.vue";
import ExpenseRowPayee from "./ExpenseRowPayee.vue";
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

    const payeeSelected = (e) => {
      var payee = store.state.payeeStore.all.find(
        (x) => x.id === parseInt(e.target.value)
      );
      state.row.category = payee.default_category_id;
    };

    const deleteEntry = () => {
      emit("deleteEntry", { index: props.index });
    };

    return {
      MODES,
      localRow: computed(() => state.entry),
      editMode,
      categoriesOrganized: computed(
        () => store.getters["categoryStore/organized"]
      ),
      formatCurrency,
      payeeSelected,
      deleteEntry,
    };
  },
  components: { ExpenseRowEntryUsers, ExpenseRowPayee, MoneyInput },
};
</script>

<style scoped>
select option:disabled {
  font-weight: 800;
  color: black;
}
</style>
