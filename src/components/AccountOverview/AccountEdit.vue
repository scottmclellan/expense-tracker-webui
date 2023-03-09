<template>
  <div>
    <label>Account Name</label>
    <input type="text" v-model="account.name" />
    <label>Description</label>
    <input type="text" v-model="account.description" />

    <h2>Transaction Upload Config</h2>

    <label>Please choose a sample file to upload</label>
    <input type="file" @change="handleSampleFileUpload" />

    <table
      v-if="
        accountUploadConfig?.sample_file &&
        accountUploadConfig?.sample_file.length > 0
      "
    >
      <tr
        v-for="(sampleFileRow, rowIndex) in accountUploadConfig.sample_file"
        :key="rowIndex"
      >
        <td
          v-for="(sampleFileColumn, columnIndex) in sampleFileRow"
          :key="columnIndex"
        >
          <select
            v-if="rowIndex === 0"
            @change="uploadFieldChanged"
            v-model="sampleFileColumns[columnIndex]"
            :key="columnIndex"
          >
            <option
              v-for="(uploadField, key) in availableUploadFields"
              :key="key"
              :value="uploadField.value"
            >
              {{ uploadField.label }}
            </option>
          </select>

          <label v-if="rowIndex > 0">{{ sampleFileColumn }}</label>
        </td>
        <td></td>
        <td></td>
      </tr>
    </table>
    <button @click="saveAccount">
      {{ mode === "add" ? "Add" : "Save" }}
    </button>
    <button @click="cancel">Cancel</button>
  </div>
</template>

<script>
import { useRoute, useRouter } from "vue-router";
import { ref, watch, onMounted, computed } from "vue";
import {
  currentUri,
  fetchAccount,
  fetchAccountUploadConfig,
} from "@/utilities/fetch";

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const accountId = ref(route.params.id);
    const account = ref({});
    const accountUploadConfig = ref({ sample_file: [] });
    const mode = ref("add");

    const sampleFileRows = computed(
      () => accountUploadConfig.value?.sample_file
    );
    const sampleFileColumns = ref([]);

    const uploadFields = [
      { label: "Entry Date", value: "entry_date_index" },
      { label: "Amount", value: "amount_index" },
      { label: "Payee", value: "payee_name_index" },
    ];

    const availableUploadFields = ref(uploadFields);

    const uploadFieldChanged = (e) => {
      console.log(e.target.value);
    };

    const handleSampleFileUpload = (event) => {
      const file = event.target.files[0];

      const reader = new FileReader();
      reader.onload = async () => {
        const text = reader.result;
        accountUploadConfig.value.sample_file = text
          .split("\n")
          .map((row) => row.split(","))
          .slice(0, 5);

        //clear the existing index values
        accountUploadConfig.value.entry_date_index = undefined;
        accountUploadConfig.value.payee_name_index = undefined;
        accountUploadConfig.value.amount_index = undefined;
      };
      reader.readAsText(file);
    };

    onMounted(async () => {
      await populateAccount(route.params.id);
    });

    watch(
      () => route.params.id,
      async (newValue) => {
        await populateAccount(newValue);
      }
    );

    watch(
      () => accountUploadConfig.value?.sample_file,
      (newValue) => {
        const columns = newValue?.slice(0, 1).map((row) => {
          return row.map((col, index) => {
            return getSampleFileColumnMapping(index);
          });
        });

        sampleFileColumns.value?.push(...columns.flat());
      }
    );

    const populateAccount = async (id) => {
      if ((id ?? 0 )> 0) {
        mode.value = "edit";
        accountId.value = id;
        const result = await fetchAccount(id);
        account.value = result && result[0];
        const uploadConfig = await fetchAccountUploadConfig(id);
        if (uploadConfig) accountUploadConfig.value = uploadConfig[0];
      }
    };

    const getSampleFileColumnMapping = (index) => {
      if (accountUploadConfig.value?.entry_date_index === index) {
        return "entry_date_index";
      }

      if (accountUploadConfig.value?.payee_name_index === index) {
        return "payee_name_index";
      }

      if (accountUploadConfig.value?.amount_index === index) {
        return "amount_index";
      }

      return undefined;
    };

    const saveAccount = async () => {
      sampleFileColumns.value.map((val, index) => {
        if (val) accountUploadConfig.value[val] = index;
      });

      if (mode.value === "add") {
        const newAccount = await addAccount(account.value);

        accountUploadConfig.value.account_id = newAccount.id;

        await addAccountUploadConfig(accountUploadConfig.value);
      } else {
        await updateAccount(account.value);       

        if ((accountUploadConfig.value?.id ?? 0) === 0) {
          accountUploadConfig.value.account_id = account.value.id;
          await addAccountUploadConfig(accountUploadConfig.value);
        } else {
          await updateAccountUploadConfig(accountUploadConfig.value);
        }
      }

      router.push("/account-overview");
    };

    const addAccount = async (account) => {
      const response = await fetch(`${currentUri}/api/account/`, {
        method: "POST",
        body: JSON.stringify(account),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const json = await response.json();
        return json[0];
      } else {
        console.log(response);
        return undefined;
      }
    };

    const addAccountUploadConfig = async (accountUploadConfig) => {
      // add account upload config
      const response = await fetch(`${currentUri}/api/account/uploadconfig/`, {
        method: "POST",
        body: JSON.stringify(accountUploadConfig),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const json = await response.json();
        return json[0];
      } else {
        console.log(response);
        return undefined;
      }
    };

    const updateAccount = async (account) => {
      const response = await fetch(`${currentUri}/api/account/${account.id}`, {
        method: "PUT",
        body: JSON.stringify(account),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const json = await response.json();
        return json[0];
      } else {
        console.log(response);
        return undefined;
      }
    };

    const updateAccountUploadConfig = async (accountUploadConfig) => {
      // add account upload config
      const response = await fetch(`${currentUri}/api/account/uploadconfig/${accountUploadConfig.id}`, {
        method: "PUT",
        body: JSON.stringify(accountUploadConfig),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const json = await response.json();
        return json[0];
      } else {
        console.log(response);
        return undefined;
      }
    };

    const cancel = () => {
      router.push("/account-overview");
    };

    return {
      mode,
      account,
      accountUploadConfig,
      availableUploadFields,
      sampleFileRows,
      sampleFileColumns,
      handleSampleFileUpload,
      uploadFieldChanged,
      saveAccount,
      cancel,
    };
  },
};
</script>
