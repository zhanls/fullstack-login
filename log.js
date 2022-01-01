module.exports = async function (ctx, next) {
  const start = Date.now();
  next();
  const end = Date.now();
}