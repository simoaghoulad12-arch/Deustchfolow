// The real `server-only` package throws unless bundled with Next.js's
// "react-server" module resolution condition, which Jest does not set.
// This no-op stand-in lets lib/auth modules be unit tested directly.
module.exports = {};
