
 const formatCurrency = (amount) => parseFloat(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
 
module.exports = {
formatCurrency
};
