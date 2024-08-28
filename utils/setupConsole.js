//暫時隱藏react-color引發的錯誤訊息
const err = console.error;
console.error = (...args) => {
  if (/defaultProps/.test(args[0])) return;
  err(...args);
};
