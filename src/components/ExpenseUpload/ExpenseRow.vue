<template>
  <tr>
    <td>{{ localRow.entry_date }}</td>
    <td>{{ localRow.payee_bank_description }}</td>
    <td>
      <div v-if="mode === 'add' || mode === 'edit'">
        <p>{{ mode === "add" ? "Enter" : "Update" }} payee description</p>
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
    <td>{{ formatCurrency(localRow.amount) }}</td>
    <td>
      <div v-if="mode === MODES.ADD || mode === MODES.EDIT">
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
        v-if="mode === MODES.ADD || mode === MODES.EDIT"
        type="primary"
        @click="postExpense(localRow)"
      >
        Post
      </el-button>
      <el-button
        v-if="mode === MODES.EDIT"
        type="primary"
        @click="cancelEdit()"
      >
        Cancel
      </el-button>
      <el-button
        v-if="mode === MODES.PRE_EDIT"
        type="warning"
        @click="startEdit()"
      >
        Edit
      </el-button>
    </td>
  </tr>
</template>

<script>
import { reactive, ref } from "vue";
import { formatCurrency } from "@/utilities/money";
import { postEntry } from "./api";
import { organizeCategories } from "./helpers";

const MODES = { PRE_EDIT: "preedit", EDIT: "edit", ADD: "add" };

export default {
  props: {
    row: Object,
    accountId: Number,
    categories: Array,
    payees: Array,
    entryUsers: Array,
  },
  setup(props) {
    const state = reactive({
      row: props.row,
      original_payee_system_description: props.row.payee_system_description,
    });
    const mode = ref("");

    if (state.row.entry_id === 0) {
      mode.value = MODES.ADD;
    } else {
      mode.value = MODES.PRE_EDIT;
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
        row.payee_system_description = props.payees.find(
          (x) => x.id === row.payee_id
        )?.name;
      }

      state.row = await postEntry(row, props.accountId);
      mode.value = MODES.PRE_EDIT;
    };

    const updateExpense = async (row) => {
      state.row = await postEntry(row, props.accountId);
      mode.value = MODES.PRE_EDIT;
    };

    const payeeSelected = (e) => {
      var payee = props.payees.find((x) => x.id === parseInt(e.target.value));
      state.row.category = payee.default_category_id;
    };

    const selectAllUsers = () => {
      state.row.entry_users = props.entryUsers.map((x) => x.id);
    };

    const cancelEdit = () => {
      mode.value = "preedit";
    };

    const startEdit = () => {
      mode.value = "edit";
    };

    return {
      MODES,
      localRow: state.row,
      mode,
      categoriesOrganized,
      formatCurrency,
      postExpense,
      updateExpense,
      payeeSelected,
      cancelEdit,
      startEdit,
      selectAllUsers,
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
