const environments = {
  development: "http://localhost:3000",
  production: "https://uglybudget.ca",
};

const currentEnvironment = "development";

const currentUri = environments[currentEnvironment];

const fetchCategories = async () => {
  const response = await fetch(`${currentUri}/api/category/toplevel/all`);
  if (response.status === 200) {
    return await response.json();
  }
  return null;
};

const fetchAccounts = async () => {
  const response = await fetch(`${currentUri}/api/account`);
  if (response.status === 200) {
    return await response.json();
  }
  return null;
};

const fetchAccount = async (id) => {
  const response = await fetch(`${currentUri}/api/account/${id}`);
  if (response.status === 200) {
    return await response.json();
  }
  return null;
};

const fetchAccountUploadConfig = async (account_id) => {
  const response = await fetch(
    `${currentUri}/api/account/uploadconfig/${account_id}`
  );
  if (response.status === 200) {
    return await response.json();
  }
  return null;
};

const fetchPayees = async () => {
  const response = await fetch(`${currentUri}/api/payee`);
  if (response.status === 200) {
    return await response.json();
  }
  return null;
};

const fetchEntryUsers = async () => {
  const response = await fetch(`${currentUri}/api/entryuser`);
  if (response.status === 200) {
    return await response.json();
  }
  return null;
};

const fetchCategoryDetails = async (currentYear, currentMonth, categoryId) => {
  const response = await window.fetch(
    `${currentUri}/api/entry/category/${currentYear}/${currentMonth}/${categoryId}`
  );
  if (response.status === 200) {
    return await response.json();
  }
  return null;
};

const fetchMonthlySummary = async (year, month) => {
  const response = await window.fetch(
    `${currentUri}/api/summary/${year}/${month}`
  );
  if (response.status === 200) {
    return await response.json();
  }
  return null;
};

const fetchPayeeByBankDescription = async (payee) => {
  const response = await fetch(
    `${currentUri}/api/payee/bank_description/${encodeURIComponent(payee)}`
  );
  if (response.status === 200) {
    return await response.json();
  }
  return null;
};

const searchEntry = async (entry_date, amount, payee) => {
  const response = await fetch(
    `${currentUri}/api/bankentry/search/${encodeURIComponent(
      entry_date
    )}&${encodeURIComponent(amount)}&${encodeURIComponent(payee)}`
  );
 
  if (response.status === 200) {
    const json = await response.json();    
    return json;
  }
  return null;
};

const fetchEntryUsersForEntry = async(entry_id)=>{
  const response = await fetch(
    `${currentUri}/api/entryuser/entry/${entry_id}`
  );
  if (response.status === 200) {
    return await response.json();
  }
  return null;
}

module.exports = {
  currentUri,
  fetchCategories,
  fetchAccounts,
  fetchAccount,
  fetchAccountUploadConfig,
  fetchPayees,
  fetchPayeeByBankDescription,
  fetchEntryUsers,
  fetchEntryUsersForEntry,
  fetchMonthlySummary,
  fetchCategoryDetails,
  searchEntry,
};
