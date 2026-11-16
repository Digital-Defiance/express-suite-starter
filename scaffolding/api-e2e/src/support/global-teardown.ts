/* eslint-disable */
module.exports = async function () {
  // Nx stops the continuous `serve` dependency itself once the e2e task
  // finishes. Killing the port here makes Nx report that dependency as failed.
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
