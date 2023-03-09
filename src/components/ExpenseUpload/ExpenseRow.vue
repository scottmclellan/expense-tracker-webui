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
      <label v-for="(entryUser, index) in entryUsers" :key="index">
        <input type="checkbox" v-model="localRow.entry_users" :value="entryUser.id" />
        {{ `${entryUser.first_name} ${entryUser.last_name}` }}
      </label>
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
        v-if="mode === 'add' || mode === 'edit'"
        type="primary"
        @click="postExpense(localRow)"
      >
        Post
      </el-button>
      <el-button v-if="mode === 'edit'" type="primary" @click="cancelEdit()">
        Cancel
      </el-button>
      <el-button v-if="mode === 'preedit'" type="warning" @click="startEdit()">
        Edit
      </el-button>
    </td>
  </tr>
</template>

<script>
import { ref } from "vue";
import { formatCurrency } from "@/utilities/money";

function organizeCategories(categories, level, result) {
  level++;

  return categories.map((cat) => {
    const canSelect = !cat.subcategories || cat.subcategories.length === 0;

    var obj = {
      id: cat.id,
      canSelect: canSelect,
      level: level,
      description: cat.description,
    };

    result.push(obj);

    if (obj.canSelect) return;

    organizeCategories(cat.subcategories, level, result);
  });
}

export default {
  props: {
    row: Object,
    categories: Array,
    payees: Array,
    entryUsers: Array,
  },
  setup(props, { emit }) {
    const localRow = ref({
      ...props.row,
      original_payee_system_description: props.row.payee_system_description,
    });
    const mode = ref("");

    if (localRow.value.entry_id === 0) {
      mode.value = "add";
    } else {
      mode.value = "preedit";
    }

    let categoriesOrganized = [];

    organizeCategories(props.categories, 0, categoriesOrganized);

    const postExpense = async (row) => {
      //user changed the payee for the row
      if (
        row.payee_system_description != row.original_payee_system_description &&
        row.payee_id > 0
      ) {
        row.payee_id = 0;
      }

      emit("postExpense", row);
    };

    const updateExpense = async (row) => {
      emit("updateExpense", row);
    };

    const payeeSelected = (e) => {
      var payee = props.payees.find((x) => x.id === parseInt(e.target.value));
      localRow.value.category = payee.default_category_id;
    };

    const cancelEdit = () => {
      mode.value = "preedit";
    };

    const startEdit = () => {
      mode.value = "edit";
    };

    return {
      localRow,
      mode,
      categoriesOrganized,
      formatCurrency,
      postExpense,
      updateExpense,
      payeeSelected,
      cancelEdit,
      startEdit,
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
