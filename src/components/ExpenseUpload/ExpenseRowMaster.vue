<template>
  <tr>
    <td>{{ formatDate(localRow.entry_date) }}</td>
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
      <div v-if="editMode === MODES.PRE_EDIT || splitEntryRows.length === 0">
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
        v-if="editMode === MODES.ADD || editMode === MODES.EDIT"
        :category="localRow.category"
        @categoryChanged="categoryChanged"
      />
      <div v-else>
        <label>{{ categoryDescription }}</label>
      </div>
    </td>
    <td>
      <el-button
        v-if="
          (editMode === MODES.ADD || editMode === MODES.EDIT) &&
          splitEntryRows.length === 0
        "
        type="primary"
        @click="splitEntry"
      >
        Split
      </el-button>
      <el-button
        v-if="editMode === MODES.ADD || editMode === MODES.EDIT"
        type="primary"
        @click="postExpense"
      >
        Post
      </el-button>
      <el-button
        v-if="editMode === MODES.EDIT"
        type="primary"
        @click="cancelEdit"
      >
        Cancel
      </el-button>
      <el-button
        v-if="editMode === MODES.PRE_EDIT"
        type="warning"
        @click="startEdit"
      >
        Edit
      </el-button>
    </td>
  </tr>
  <ExpenseRowDetail
    v-for="(entry, index) in splitEntryRows"
    :key="index"
    :index="index"
    :accountId="accountId"
    :entry="entry"
    :bank_entry="localBankEntry"
    :editMode="editMode"
    @changed="detailRowChanged"
    @deleteEntry="deleteDetailRow"
  />
  <tr
    v-if="
      splitEntryRows &&
      splitEntryRows.length > 0 &&
      (editMode === MODES.ADD || editMode === MODES.EDIT)
    "
  >
    <td colspan="7">
      <el-button type="primary" @click="addDetailRow">
        Add New Entry
      </el-button>
    </td>
  </tr>
</template>

<script>
import ExpenseRowDetail from "./ExpenseRowDetail.vue";
import ExpenseRowEntryUsers from "./ExpenseRowEntryUsers.vue";
import ExpenseRowPayee from "./ExpenseRowPayee.vue";
import ExpenseRowCategory from "./ExpenseRowCategory.vue";
import MoneyInput from "../Common/MoneyInput.vue";
import { reactive, ref, computed } from "vue";
import { useStore } from "vuex";
import { formatCurrency } from "@/utilities/money";
import { formatDate } from "@/utilities/date";
import{MODES, deepClone} from "@/components/common"
import {
  addEntry,
  addBankEntry,
  addEntryUsers,
  updateEntry,
  clearEntryUsers,
} from "../../utilities/api";

export default {
  props: {
    bank_entry: Object,
    accountId: Number,
  },
  setup(props) {
    const store = useStore();
    const state = reactive({
      bank_entry: props.bank_entry,
      entries: props.bank_entry.entries,
      original_payee_system_description: props.bank_entry.payee_name,
    });

    let originalState = deepClone(state);
    const editMode = ref("");
    const entryUsers = computed(() => store.state.entryUsersStore.all);
    const payees = computed(() => store.getters["payeeStore/sortedAll"]);    

    //determine initial edit mdoe
    if (state.bank_entry.bank_entry_id === 0) {
      editMode.value = MODES.ADD;
    } else {
      editMode.value = MODES.PRE_EDIT;
    }

    //create expense entry
    const postExpense = async () => {
      //create bank_entry
      if (state.bank_entry.bank_entry_id === 0) {
        const bank_entry = await addBankEntry(
          bank_entry.account_id,
          bank_entry.entry_date,
          bank_entry.amount * -1,
          bank_entry.payee_name
        );

        state.bank_entry = { ...bank_entry, bank_entry_id: bank_entry.id };
      }

      const postExpensePromises = state.entries.forEach(async (row, index) => {
        row.bank_entry_id = state.bank_entry.id;

        //user changed the payee for the row
        if (
          row.payee.payee_system_description !=
            state.original_payee_system_description &&
          row.payee.payee_id > 0
        ) {
          row.payee.payee_id = 0;
        }
        if (row.payee.payee_id > 0) {
          row.payee.payee_system_description = store.state.payeeStore.all.find(
            (x) => x.id === row.payee.payee_id
          )?.name;
        }

        state.entries[index] = await postEntry(row, state.bank_entry.account_id);
        editMode.value = MODES.PRE_EDIT;
      });

      try {
        await Promise.all(postExpensePromises);

        originalState = deepClone(state);
      } catch (error) {
        console.log(error);
      }
    };

    const updateExpense = async (row) => {
      state.entries[0] = await postEntry(row, props.accountId);
      editMode.value = MODES.PRE_EDIT;
    };

    const postEntry = async (row, accountId) => {
      //check if we need to create the payee
      if (row.payee.payee_id === 0) {
        const newPayee = await store.dispatch("payeeStore/addPayee", {
          ...row.payee,
        });
        row.payee.payee_id = newPayee.id;
        row.payee.payee_system_description = newPayee.name;
      }
      //are we updating or adding an entry
      if (!row.entry_id || row.entry_id === 0) {
        const newEntry = await addEntry(
          row.bank_entry_id,
          row.payee.payee_id,
          row.amount,
          row.category,
          row.entry_date,
          row.memo,
          row.entry_users
        );
        row.entry_id = newEntry.id;
      } else {
        await updateEntry(
          row.entry_id,
          accountId,
          row.payee.payee_id,
          row.amount,
          row.category,
          row.entry_date,
          row.memo
        );
        await clearEntryUsers(row.entry_id);
        await addEntryUsers(row.entry_users, row.entry_id);
      }
      return row;
    };

    const entryUsersChanged = (e) => {
      state.entries[0].entry_users = e.selected;
    };
    const categoryChanged = (e) => {
      state.entries[0].category = e.selected;
    };
    const payeeUpdated = (e) => {
      state.entries[0].payee = e;

      if (e.payee_id && e.payee_id > 0) {
        var payee = store.state.payeeStore.all.find(
          (x) => x.id === parseInt(e.payee_id)
        );
        state.entries[0].category = payee.default_category_id;
      } else {
        state.entries[0].category = null;
      }
    };
    const addDetailRow = () => {
      state.entries.push({ ...state.entries[0] });
    };
    const deleteDetailRow = (e) => {
      state.entries.splice(e.index, 1);
    };
    const detailRowChanged = (e) => {
      state.entries[e.index] = e.entry;
    };
    const splitEntry = () => {
      addDetailRow();
    };
    const cancelEdit = () => {      
      editMode.value = MODES.PRE_EDIT;
      console.log(state.entries.length);
      console.log(originalState.entries.length)
      state.bank_entry = originalState.bank_entry;
      state.entries = originalState.entries;
      state.original_payee_system_description = originalState.original_payee_system_description;

      console.log(state.entries.length);
    };
    const startEdit = () => {
      editMode.value = MODES.EDIT;
    };

    return {
      payees,
      entryUsers,
      MODES,
      originalState,
      localRow: computed(() => state.entries[0]),
      splitEntryRows: computed(() => state.entries.slice(1)),
      localBankEntry: computed(() => state.bank_entry),
      editMode,
      categoryId: computed(() => state.entries[0].category_id),
      categoryDescription: computed(() =>
        state.entries[0].category_id > 0
          ? store.getters["categoryStore/organized"].find(
              (x) => x.id === state.entries[0].category_id
            )?.description
          : ""
      ),
      formatCurrency,
      formatDate,
      postExpense,
      updateExpense,
      entryUsersChanged,
      payeeUpdated,
      categoryChanged,
      cancelEdit,
      startEdit,
      addDetailRow,
      deleteDetailRow,
      detailRowChanged,
      splitEntry,
    };
  },
  components: {
    ExpenseRowEntryUsers,
    ExpenseRowPayee,
    ExpenseRowDetail,
    ExpenseRowCategory,
    MoneyInput,
  },
};
</script>

<style scoped>
select option:disabled {
  font-weight: 800;
  color: black;
}
</style>
