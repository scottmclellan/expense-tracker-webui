import {
  fetchPayeeByBankDescription,
  searchEntry,
  currentUri,
} from "@/utilities/fetch"

import {useStore} from "vuex"

const store = useStore();

const checkExistingPayee = async (payee) => {
  const result = await fetchPayeeByBankDescription(payee);

  if (result && result.length > 0) return result[0];

  return {};
};

const checkExistingEntry = async (entry_date, amount, payee) => {
  if ((amount ?? 0) === 0) return {};
  const result = await searchEntry(entry_date, amount, payee);

  if (result && result.length > 0) return result[0];

  return {};
};

const addEntryUsers = async (entryUsers, entry_id) => {
  await Promise.all(
    entryUsers.map(async (entry_user_id) => {
      await fetch(`${currentUri}/api/entryuser/entry/`, {
        method: "POST",
        body: JSON.stringify({
          entry_id: entry_id,
          entry_user_id: entry_user_id,
        }),
        headers: { "Content-Type": "application/json" },
      });
    })
  );
};

const clearEntryUsers = async(entry_id)=>{
    //clear out existing entry_users
    await fetch(`${currentUri}/api/entryuser/entry/${entry_id}`, {
      method: "DELETE",
    });
}

const addPayee = async (
  payee_system_description,
  payee_bank_description,
  default_category_id,
  memo
) => {
  const payeeResponse = await fetch(`${currentUri}/api/payee/`, {
    method: "POST",
    body: JSON.stringify({
      name: payee_system_description,
      memo: memo,
      default_category_id: default_category_id,
      bank_description: payee_bank_description,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const newPayee = await payeeResponse.json();

  return newPayee[0];
};

const addEntry = async (
  accountId,
  payee_id,
  amount,
  category_id,
  entry_date,
  memo,
  entry_users
) => {
  const entryResponse = await fetch(`${currentUri}/api/entry/`, {
    method: "POST",
    body: JSON.stringify({
      account_id: accountId,
      payee_id: payee_id,
      amount: amount,
      category_id: category_id,
      entry_date: entry_date,
      memo: memo,
      entry_user_ids: entry_users,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const entryJson = await entryResponse.json();

  return entryJson[0];
};

const updateEntry = async (
  entry_id,
  accountId,
  payee_id,
  amount,
  category_id,
  entry_date,
  memo,
) => {
  const entryResponse = await fetch(`${currentUri}/api/entry/${entry_id}`, {
    method: "PUT",
    body: JSON.stringify({
      account_id: accountId,
      payee_id: payee_id,
      amount: amount,
      category_id: category_id,
      entry_date: entry_date,
      memo: memo,
    }),
    headers: { "Content-Type": "application/json" },
  });
  const entryJson = await entryResponse.json();
  return entryJson[0];
};

const postEntry = async (row, accountId) => {
  //check if we need to create the payee
  if (row.payee_id === 0) {
    const newPayee = await addPayee(
      row.payee_system_description,
      row.payee_bank_description,
      row.category,
      ""
    );

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

module.exports = {
  addPayee,
  checkExistingEntry,
  checkExistingPayee,
  postEntry,
};
