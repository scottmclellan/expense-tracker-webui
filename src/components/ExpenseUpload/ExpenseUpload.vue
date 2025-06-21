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
          <!-- <ExpenseRow
            v-for="(bank_entry, index) in bank_entries"
            :key="index"
            :bank_entry="bank_entry"           
            :accountId="accountId"
          /> -->
          <ExpenseRowMaster
            v-for="(bank_entry, index) in bank_entries"
            :key="index"
            :bank_entry="bank_entry"
            :accountId="accountId"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { usePayeeStore } from "../../common/stores/payeeStore";
import { useCategoryStore } from "../../common/stores/categoryStore";
import { useEntryUsersStore } from "../../common/stores/entryUsersStore";
// import ExpenseRow from "./ExpenseRow.vue";
import ExpenseRowMaster from "./ExpenseRowMaster.vue";
import { fetchAccounts, fetchAccountUploadConfig } from "@/utilities/fetch";
import { checkExistingEntry, checkExistingPayee } from "@/utilities/api";

export default {
  name: "ExpenseUpload",
  components: {
    ExpenseRowMaster,
  },
  setup() {
    const payeeStore = usePayeeStore();
    const categoryStore = useCategoryStore();
    const entryUsersStore = useEntryUsersStore();
    const accountId = ref(0);
    const bank_entries = ref([]);
    const accounts = ref([]);
    const accountUploadConfig = ref({});
    const fileInput = ref(null);
    const isLoading = ref(false);

    watch(
      () => accountId.value,
      async (newValue) => {
        //clear the entry rows
        bank_entries.value = [];

        //clear upload file
        fileInput.value.value = "";

        //retrieve account upload config
        const uploadConfig = await fetchAccountUploadConfig(newValue);
        if (uploadConfig) accountUploadConfig.value = uploadConfig[0];
      }
    );

    const handleFileUpload = (event) => {
      const file = event.target.files[0];

      isLoading.value = true;

      const reader = new FileReader();
      reader.onload = async () => {
        const text = reader.result;
        const data = text
          .split("\n")
          .map((row) => row.split(","))
          .map((row) =>
            row.map((value) => {
              const firstChar = value.charAt(0);
              const lastChar = value.charAt(value.length - 1);
              if (
                firstChar === lastChar &&
                !firstChar.match(/^[a-zA-Z0-9]+$/) &&
                !lastChar.match(/^[a-zA-Z0-9]+$/)
              ) {
                return value.slice(1, -1).trim();
              }
              return value;
            })
          )
          .filter((row) => row.length > 1);

        bank_entries.value = await Promise.all(
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
              return {
                account_id: entryResult.account_id,
                bank_entry_id: entryResult.id,
                entry_date: entryResult.entry_date,
                payee_name: entryResult.payee_name,
                amount: entryResult.amount,
                entries: entryResult.entries,
              };
            } else {
              const payeeResult = await checkExistingPayee(payee);

              return {
                bank_entry_id: 0,
                account_id: accountId.value,
                entry_date: entry_date,
                payee_name: payee,
                amount: amount,
                entries: [
                  {
                    entry_id: 0,                    
                    payee: {
                      payee_id: payeeResult.id ?? 0,
                      payee_system_description: payeeResult.name ?? payee,
                      payee_bank_description: payee,
                    },
                    entry_date: entry_date,
                    amount: amount * -1,
                    category: payeeResult.default_category_id,
                    entry_users: [],
                  },
                ],
              };
            }
          })
        );
        isLoading.value = false;
      };
      reader.readAsText(file);
    };

    onMounted(async () => {
      accounts.value = await fetchAccounts();
      await payeeStore.fetchPayees();
      await categoryStore.fetchCategories();
      await entryUsersStore.fetchEntryUsers();
    });

    return {
      accountId,
      accounts,
      bank_entries,
      handleFileUpload,
      isLoading,
      fileInput,
    };
  },
};
</script>

