<template>
  <tr v-if="!isSplitEntry">
    <td>{{ localRow.entry_date }}</td>
    <td>{{ localRow.payee_bank_description }}</td>
    <td>
      <div v-if="editMode === MODES.ADD || editMode === MODES.EDIT">
        <p>{{ editMode === MODES.ADD ? "Enter" : "Update" }} payee description</p>
        <input type="text" v-model="localRow.payee_system_description" />
        <p>Or select existing payee</p>
        <select v-model="localRow.payee_id" @change="payeeSelected">
          <option v-for="payee in payees" :key="payee.id" :value="payee.id">
            {{ payee.name }}
          </option>
        </select>
      </div>
      <div v-else>
        {{ row.payee_system_description }}
      </div>
    </td>
    <td><p>{{ formatCurrency(localRow.amount) }}</p>
    <button v-if="editMode === MODES.EDIT || editMode ===MODES.ADD" @click="toggleSplitEntry">Split</button></td>
    <td>
      <div v-if="editMode === MODES.ADD || editMode === MODES.EDIT">
        <label v-for="(entryUser, index) in entryUsers" :key="index">
          <input
            type="checkbox"
            v-model="localRow.entry_users"
            :value="entryUser.id"
          />
          {{ `${entryUser.first_name} ${entryUser.last_name}` }}
        </label>
        <el-button type="primary" @click="selectAllUsers">
          Select All
        </el-button>
      </div>
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
    <td></td>
    <td>
      <el-button
        v-if="editMode === MODES.ADD || editMode === MODES.EDIT"
        type="primary"
        @click="postExpense(localRow)"
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
  <tr v-else v-for="(localRow, index) in splitEntryRows" :key="index" >
    <td>{{ localRow.entry_date }}</td>
    <td>{{ localRow.payee_bank_description }}</td>
    <td>
      <div v-if="editMode === MODES.ADD || editMode === MODES.EDIT">
        <p>{{ editMode === MODES.ADD ? "Enter" : "Update" }} payee description</p>
        <input type="text" v-model="localRow.payee_system_description" />
        <p>Or select existing payee</p>
        <select v-model="localRow.payee_id" @change="payeeSelected">
          <option v-for="payee in payees" :key="payee.id" :value="payee.id">
            {{ payee.name }}
          </option>
        </select>
      </div>
      <div v-else>
        {{ row.payee_system_description }}
      </div>
    </td>
    <td><input type="text" v-model="localRow.amount" />
    <button  @click="splitEntryRows.push({...localRow})">Add</button></td>
    <td>
      <div v-if="editMode === MODES.ADD || editMode === MODES.EDIT">
        <label v-for="(entryUser, index) in entryUsers" :key="index">
          <input
            type="checkbox"
            v-model="localRow.entry_users"
            :value="entryUser.id"
          />
          {{ `${entryUser.first_name} ${entryUser.last_name}` }}
        </label>
        <el-button type="primary" @click="selectAllUsers">
          Select All
        </el-button>
      </div>
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
    <td></td>
    <td>
      <el-button
        v-if="editMode === MODES.ADD || editMode === MODES.EDIT"
        type="primary"
        @click="postExpense(localRow)"
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
</template>

<script>
import { reactive, ref, computed } from "vue";
import {useStore} from "vuex";
import { formatCurrency } from "@/utilities/money";
import { addEntry, addEntryUsers, updateEntry, clearEntryUsers } from "../../utilities/api";
import { organizeCategories } from "./helpers";

const MODES = { PRE_EDIT: "preedit", EDIT: "edit", ADD: "add" };

export default {
  props: {
    row: Object,
    accountId: Number,
    categories: Array,    
    entryUsers: Array,
  },
  setup(props) {
    const store = useStore();

    const state = reactive({
      row : props.row,
      rows: [props.row],
      original_payee_system_description: props.row.payee_system_description,
    });
    const editMode = ref("");
    const isSplitEntry =ref(false);

    if (state.row.entry_id === 0) {
      editMode.value = MODES.ADD;
    } else {
      editMode.value = MODES.PRE_EDIT;
    }

    let categoriesOrganized = [];

    organizeCategories(props.categories, 0, categoriesOrganized);

    const postExpense = async (row) => {
      //user changed the payee for the row
      if (
        row.payee_system_description !=
          state.original_payee_system_description &&
        row.payee_id > 0
      ) {
        row.payee_id = 0;
      }

      if (row.payee_id > 0) {
        row.payee_system_description = store.state.payeeStore.all.find(
          (x) => x.id === row.payee_id
        )?.name;
      }

      state.row = await postEntry(row, props.accountId);
      editMode.value = MODES.PRE_EDIT;
    };

    const updateExpense = async (row) => {
      state.row = await postEntry(row, props.accountId);
      editMode.value = MODES.PRE_EDIT;
    };

    const postEntry = async (row, accountId) => {

  //check if we need to create the payee
  if (row.payee_id === 0) {
    const newPayee = await store.dispatch("payeeStore/addPayee", {...row});   

    row.payee_id = newPayee.id;
    row.payee_system_description = newPayee.name;
  }

  //are we updating or adding an entry
  if (row.entry_id === 0) {
    const newEntry = await addEntry(
      accountId,
      row.payee_id,
      row.amount,
      row.category,
      row.entry_date,
      row.memo,
      row.entry_users
    );

    row.entry_id = newEntry.id;
    
  } else {

    await updateEntry(row.entry_id, accountId, row.payee_id, row.amount, row.category, row.entry_date, row.memo);    
    
    await clearEntryUsers(row.entry_id);

    await addEntryUsers(row.entry_users, row.entry_id);
  }

  return row;
};

    const payeeSelected = (e) => {
      var payee = store.state.payeeStore.all.find((x) => x.id === parseInt(e.target.value));
      state.row.category = payee.default_category_id;
    };

    const selectAllUsers = () => {
      state.row.entry_users = props.entryUsers.map((x) => x.id);
    };

    const cancelEdit = () => {
      editMode.value = MODES.PRE_EDIT;
    };

    const startEdit = () => {
      editMode.value = MODES.EDIT;
    };

    const toggleSplitEntry =()=>{
      isSplitEntry.value = !isSplitEntry.value;
    }

    return {
      payees : computed(() => store.getters['payeeStore/sortedAll']),
      MODES,
      localRow: state.row,
      splitEntryRows : state.rows,
      editMode,
      isSplitEntry,
      categoriesOrganized,
      formatCurrency,
      postExpense,
      updateExpense,
      payeeSelected,
      cancelEdit,
      startEdit,
      selectAllUsers,
      toggleSplitEntry
    };
  },
};
</script>

<style scoped>
select option:disabled {
  font-weight: 800;
  color: black;
}

tr:nth-child(even) {
  background: #ccc;
}
tr:nth-child(odd) {
  background: #fff;
}
</style>
