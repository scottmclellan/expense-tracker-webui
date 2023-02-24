<template>
  <div>
    <input type="file" @change="handleFileUpload" />
    <div v-if="isLoading">Loading File..</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Payee</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="index">
            <td>{{ row.entry_date }}</td>
            <td>{{ row.payee }}</td>
            <td>{{ row.amount }}</td>
            <td>
              <el-tree-select
                :data="categories"
                :props="{ label: 'description', children: 'subcategories' }"
                node-key="id"
                v-model="row.category"
              />
            </td>
            <td>
              <el-button type="primary" @click="updateRow(row)">
                Update
              </el-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "CSVTable",

  setup() {
    const rows = ref([]);
    const categories = ref([]);
    const isLoading = ref(false);

    const handleFileUpload = (event) => {
      const file = event.target.files[0];

      isLoading.value = true;

      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        const data = text.split("\n").map((row) => row.split(","));
        rows.value = data.map(([entry_date, payee, amount]) => {
          return checkExistingPayee(payee).then(() => {
            return {
              entry_date,
              payee,
              amount,
              category: null,
            };
          }).result();
        });
        isLoading.value = false;
      };
      reader.readAsText(file);
    };

    const checkExistingPayee = async (payee) => {
      const response = await fetch(
        `http://localhost:3000/api/payee/bank_description/${encodeURIComponent(
          payee
        )}`
      );
      const data = await response.json();
      console.log(data);
    };

    const fetchCategories = async () => {
      const response = await fetch("http://localhost:3000/api/category/all");
      const data = await response.json();
      categories.value = data;
    };

    const updateRow = async (row) => {
      console.log(row);
      /*
      const response = await fetch(
        `http://localhost:3000/api/payee/`,
        {
          method: "POST",
          body: JSON.stringify(row),
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      console.log(data);
      */
    };

    fetchCategories();

    return { rows, categories, handleFileUpload, updateRow, isLoading };
  },
};
</script>
