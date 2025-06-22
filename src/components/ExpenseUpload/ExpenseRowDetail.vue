<template>
  <tr>
    <td></td>
    <td></td>
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
      <div v-if="editMode === MODES.PRE_EDIT">
        {{ formatCurrency(localRow.amount) }}
      </div>
      <MoneyInput v-else v-model="localRow.amount" />
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
            .filter((x) => localRow.entry_users.find((y) => y.id === x.id))
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
      <ExpenseRowCategory
      v-if="editMode === MODES.EDIT || editMode === MODES.ADD"
        :category="localRow.category"
        @categoryChanged="categoryChanged"
      />     
      <div v-else>
        <label>{{ categoryDescription }}</label>
      </div>
    </td>
    <td>
      <el-button v-if="editMode === MODES.EDIT || editMode === MODES.ADD" type="warning" @click="deleteEntry"> Delete </el-button>
    </td>
  </tr>
</template>

<script>
import ExpenseRowEntryUsers from "./ExpenseRowEntryUsers.vue";
import ExpenseRowPayee from "./ExpenseRowPayee.vue";
import ExpenseRowCategory from "./ExpenseRowCategory.vue";
import MoneyInput from "../Common/MoneyInput.vue";
import { reactive, computed, watch } from "vue";
import { useStore } from "vuex";
import { formatCurrency } from "@/utilities/money";
import { MODES } from "../common";

export default {
  props: {
    bank_entry: Object,
    entry: Object,
    accountId: Number,
    index: Number,
    editMode: String,
  },
  setup(props, { emit }) {
    const store = useStore();

    const state = reactive({
      bank_entry: props.bank_entry,
      entry: props.entry,
      original_payee_system_description: props.bank_entry.payee_name,
    });
    
    const entryUsers = computed(() => store.state.entryUsersStore.all);

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
      localRow : computed(()=> state.entry),
      categoryDescription: computed(() =>
        state.entry.category_id > 0
          ? store.getters["categoryStore/organized"].find(
              (x) => x.id === state.entry.category_id
            )?.description
          : ""
      ),
      entryUsers,
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


</style>
