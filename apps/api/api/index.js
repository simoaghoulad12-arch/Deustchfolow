// Vercel function: every request is rewritten here (see vercel.json) and
// served by the compiled Nest app. `nest build` must run first.
module.exports = require('../dist/serverless').default;
