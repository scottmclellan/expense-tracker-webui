<template>
  <tr>
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
      <div v-if="splitEntryRows.length === 0">
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
      <ExpenseRowCategory
        :category="localRow.category"
        @categoryChanged="categoryChanged"
      />
    </td>
    <td>
      <el-button
        v-if="
          (editMode === MODES.ADD || editMode === MODES.EDIT) &&
          splitEntryRows.length > 0
        "
        type="primary"
        @click="addDetailRow"
      >
        Add
      </el-button>
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
    @changed="detailRowChanged"
    @deleteEntry="deleteDetailRow"
  />
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
import {
  addEntry,
  addBankEntry,
  addEntryUsers,
  updateEntry,
  clearEntryUsers,
} from "../../utilities/api";

const MODES = { PRE_EDIT: "preedit", EDIT: "edit", ADD: "add" };

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
    const editMode = ref("");
    const entryUsers = computed(() => store.state.entryUsersStore.all);
    const payees = computed(() => store.getters["payeeStore/sortedAll"]);
    const categoriesOrganized = computed(
      () => store.getters["categoryStore/organized"]
    );

    //determine initial edit mdoe
    if (state.bank_entry.bank_entry_id === 0) {
      editMode.value = MODES.ADD;
    } else {
      editMode.value = MODES.PRE_EDIT;
    }

    //create expense entry
    const postExpense = async () => {

      let bank_entry = state.bank_entry;
      //create bank_entry
      if(state.bank_entry.bank_entry_id ===0){
        bank_entry = await addBankEntry(bank_entry.account_id, bank_entry.entry_date, bank_entry.amount * -1, bank_entry.payee_name);

        bank_entry.bank_entry_id = bank_entry.id;
      }


      const postExpensePromises = state.entries.forEach(async (row) => {

        row.bank_entry_id = bank_entry.id;

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
        state.entries[0] = await postEntry(row, bank_entry.account_id);
        editMode.value = MODES.PRE_EDIT;
      });

      try{
      await Promise.all(postExpensePromises);
      }
      catch(error)
      {
        console.log(error)
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
      var payee = store.state.payeeStore.all.find(
        (x) => x.id === parseInt(e.payee_id)
      );
      state.entries[0].category = payee.default_category_id;
    };
    const addDetailRow = () => {
      state.entries.push({ ...state.entries[0] });
    };
    const deleteDetailRow = (e) => {
      state.entries.splice(e.index, 1);
    };
    const detailRowChanged = (e) =>{
      state.entries[e.index] = e.entry;
    }
    const splitEntry = () => {
      addDetailRow();
    };
    const cancelEdit = () => {
      editMode.value = MODES.PRE_EDIT;
    };
    const startEdit = () => {
      editMode.value = MODES.EDIT;
    };

    return {
      payees,
      entryUsers,
      MODES,
      localRow: computed(() => state.entries[0]),
      splitEntryRows: computed(() => state.entries.slice(1)),
      localBankEntry: computed(() => state.bank_entry),
      editMode,
      categoriesOrganized,
      formatCurrency,
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
