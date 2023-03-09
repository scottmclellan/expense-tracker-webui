const {
  fetchPayeeByBankDescription,
  searchEntry,
  currentUri,
} = require("@/utilities/fetch");

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

const postEntry = async (row, accountId) => {
  let payee_id = row.payee_id;
  //check if we need to create the payee
  if (payee_id === 0) {
    const payeeResponse = await fetch(`${currentUri}/api/payee/`, {
      method: "POST",
      body: JSON.stringify({
        name: row.payee_system_description,
        memo: "",
        default_category_id: row.category,
        bank_description: row.payee_bank_description,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const newPayee = await payeeResponse.json();

    payee_id = newPayee[0].id;
  }

  //are we updating or adding an entry
  if (row.entry_id === 0) {
    const entryResponse = await fetch(`${currentUri}/api/entry/`, {
      method: "POST",
      body: JSON.stringify({
        account_id: accountId,
        payee_id: payee_id,
        amount: row.amount,
        category_id: row.category,
        entry_date: row.entry_date,
        memo: row.memo,
        entry_user_ids: [],
      }),
      headers: { "Content-Type": "application/json" },
    });

    const entryJson = await entryResponse.json();

    row.entry_id = entryJson[0].id;

    await addEntryUsers(row.entry_users, entryJson[0].id);

    //add entry_users
  } else {
    const entryResponse = await fetch(
      `${currentUri}/api/entry/${row.entry_id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          account_id: accountId,
          payee_id: payee_id,
          amount: row.amount,
          category_id: row.category,
          entry_date: row.entry_date,
          memo: row.memo,
        }),
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(`update entry response: ${await entryResponse.json()}`);

    //clear out existing entry_users
    await fetch(`${currentUri}/api/entryuser/entry/${row.entry_id}`, {
      method: "DELETE",
    });

    await addEntryUsers(row.entry_users, row.entry_id);
  }
};

module.exports = {
  checkExistingEntry,
  checkExistingPayee,
  postEntry,
};
