<template>
  <div>
    <select v-model="accountId">
      <option v-for="account in accounts" :key="account.id" :value="account.id">
        {{ account.name }}
      </option>
    </select>

    <input type="file" ref="fileInput" @change="handleFileUpload" />
    <div v-if="isLoading">Loading File..</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Bank Payee</th>
            <th>System Payee</th>
            <th>Amount</th>
            <th>Entry For</th>           
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <ExpenseRow
            v-for="(row, index) in rows"
            :key="index"
            :row="row"
            :categories="categories"
            :payees="payees"
            :accountId="accountId"
            :entryUsers="entryUsers"           
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onBeforeMount, watch } from "vue";
import ExpenseRow from "./ExpenseRow.vue";
import {
  fetchAccounts,
  fetchAccountUploadConfig,
  fetchEntryUsers,
  fetchEntryUsersForEntry,
  fetchPayees,
  fetchCategories,
} from "@/utilities/fetch";
import { checkExistingEntry, checkExistingPayee } from "./api";

export default {
  name: "ExpenseUpload",
  components: {
    ExpenseRow,
  },
  setup() {
    const accountId = ref(0);
    const rows = ref([]);
    const categories = ref([]);
    const accounts = ref([]);
    const accountUploadConfig = ref({})
    const payees = ref([]);
    const entryUsers = ref([]);
    const fileInput = ref(null);
    const isLoading = ref(false);

    watch(()=>accountId.value, async (newValue)=>{

      //clear the entry rows
      rows.value = [];

      //clear upload file
      fileInput.value.value = "";
   
      //retrieve account upload config
      const uploadConfig = await fetchAccountUploadConfig(newValue);
        if (uploadConfig) accountUploadConfig.value = uploadConfig[0];
    })

    const handleFileUpload = (event) => {


      const file = event.target.files[0];

      isLoading.value = true;

      const reader = new FileReader();
      reader.onload = async () => {
        const text = reader.result;
        const data = text
          .split("\n")
          .map((row) => row.split(","))
          .filter((row) => row.length > 1);

        rows.value = await Promise.all(
          data.map(async (row) => {

            const entry_date = row[accountUploadConfig.value.entry_date_index];
            const amount = row[accountUploadConfig.value.amount_index];
            const payee = row[accountUploadConfig.value.payee_name_index];

            const entryResult = await checkExistingEntry(
              entry_date,
              amount * -1,
              payee
            );

            if (entryResult && entryResult.id > 0) {

              const entryUsers = await fetchEntryUsersForEntry(entryResult.id);
             
              return {
                entry_id: entryResult.id,
                entry_date,
                payee_id: entryResult.payee_id,
                payee_system_description: entryResult.payee_name,
                payee_bank_description: payee,
                amount: entryResult.amount,
                category: entryResult.category_id,
                entry_users: entryUsers && entryUsers.length > 0 ? entryUsers.map(user => user.id) : []
              };
            } else {
             
              const payeeResult = await checkExistingPayee(payee);

              return {
                entry_id: 0,
                entry_date,
                payee_id: payeeResult.id ?? 0,
                payee_system_description: payeeResult.name ?? payee,
                payee_bank_description: payee,
                amount: amount * -1,
                category: payeeResult.default_category_id,
                entry_users: []
              };
            }
          })
        );
        isLoading.value = false;
      };
      reader.readAsText(file);
    };   

    onBeforeMount(async () => {
      categories.value = await fetchCategories();
      accounts.value = await fetchAccounts();
      payees.value = await fetchPayees();
      entryUsers.value = await fetchEntryUsers();
    });

    return {
      accountId,
      accounts,
      rows,
      categories,
      payees,
      entryUsers,
      handleFileUpload,     
      isLoading,
      fileInput,
    };
  },
};
</script>
