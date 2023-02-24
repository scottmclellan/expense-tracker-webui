const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const today = new Date();
console.log(today.getMonth())
const currentMonth = today.getMonth();
const currentMonthText = monthNames[currentMonth];
const currentYear = today.getFullYear()
 const getMonthText = (month ) =>{
    return monthNames[month];
 }
 const formatDate = (date) => new Date(date).toLocaleDateString("en-us");

module.exports = {
  currentMonth,
  currentMonthText,
  currentYear,
  getMonthText,
  formatDate
};
