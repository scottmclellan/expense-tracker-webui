import {
  fetchPayeeByBankDescription,
  searchEntry,
  currentUri,
} from "./fetch"


export const checkExistingPayee = async (payee) => {
  const result = await fetchPayeeByBankDescription(payee);

  if (result && result.length > 0) return result[0];

  return {};
};

export const checkExistingEntry = async (entry_date, amount, payee) => {
  if ((amount ?? 0) === 0) return {};
  const result = await searchEntry(entry_date, amount, payee);

  if (result && result.length > 0) return result[0];

  return {};
};

export const addEntryUsers = async (entryUsers, entry_id) => {
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

export const clearEntryUsers = async(entry_id)=>{
    //clear out existing entry_users
    await fetch(`${currentUri}/api/entryuser/entry/${entry_id}`, {
      method: "DELETE",
    });
}

export const addPayee = async (
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

export const addEntry = async (
  bank_entry_id,
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
      bank_entry_id: bank_entry_id,
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

export const addBankEntry = async (
  account_id,
  entry_date,
  amount,
  payee_name, 
) => {
  const entryResponse = await fetch(`${currentUri}/api/bankentry/`, {
    method: "POST",
    body: JSON.stringify({
      account_id: account_id,
      entry_date:entry_date,
      amount:amount,
      payee_name: payee_name, 
    }),
    headers: { "Content-Type": "application/json" },
  });

  const entryJson = await entryResponse.json();

  return entryJson[0];
};

export const updateEntry = async (
  entry_id,
  bank_entry_id,
  payee_id,
  amount,
  category_id,
  entry_date,
  memo,
) => {
  const entryResponse = await fetch(`${currentUri}/api/entry/${entry_id}`, {
    method: "PUT",
    body: JSON.stringify({
      bank_entry_id: bank_entry_id,
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



