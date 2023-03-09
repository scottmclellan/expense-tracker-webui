<template>
  <div>
    <h1>Accounts</h1>
    <table>
      <tr>
        <th>Account Name</th>
        <th>Account Name</th>
        <th>Action</th>
      </tr>
      <tr v-for="(account, index) in accounts" :key="index">
        <td>{{ account.name }}</td>
        <td>{{ account.description }}</td>
        <td><button @click="editAccount(account)">Edit</button></td>
        <td><button @click="deleteAccount(account)">Delete</button></td>
      </tr>
    </table>
    <button  @click="addAccount">Add New Account</button>   
  </div>
</template>

<script>
import { ref, onBeforeMount } from "vue";
import {  useRouter } from "vue-router";
import { currentUri,fetchAccounts } from "@/utilities/fetch";

export default {
  setup() {   
    const router = useRouter();
    const accounts = ref([]);
    
    onBeforeMount(async () => {
      await loadAccounts();
    });

    const loadAccounts = async () => {
      accounts.value = await fetchAccounts();
    };

    const addAccount = () => {
      router.push("/account-overview/new");
    };

    const editAccount = (account) => {
      router.push(`/account-overview/${account.id}`);
    };

    const deleteAccount = async (account) => {
      if (
        confirm(
          `Are you sure you want to delete ${account.name}? All transactions will be deleted as well.`
        )
      ) {
        const response = await fetch(
          `${currentUri}/api/account/${account.id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          await loadAccounts();
        } else {
          console.log(response);
          alert(`${account.name} failed to delete successfully.`);
        }
      }
    };

    return {
      accounts,
      addAccount,
      editAccount,
      deleteAccount
    };
  },
};
</script>
