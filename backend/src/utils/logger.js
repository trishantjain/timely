// Minimal structured logger. Kept intentionally small (no Winston/Pino)
// since this app doesn't otherwise use a logging library -- this just
// gives consistent, greppable prefixes instead of bare console.log
// scattered around, and a single place to plug in a real logger later.

const timestamp = () => new Date().toISOString();

const info = (scope, message, meta = {}) => {
  console.log(`[${timestamp()}] [INFO] [${scope}] ${message}`, meta && Object.keys(meta).length ? meta : "");
};

const warn = (scope, message, meta = {}) => {
  console.warn(`[${timestamp()}] [WARN] [${scope}] ${message}`, meta && Object.keys(meta).length ? meta : "");
};

// Never logs full error objects that might carry secrets (e.g. API
// client internals) -- just message/stack, which is what's useful for
// debugging without risking credential exposure in logs.
const error = (scope, message, err) => {
  console.error(
    `[${timestamp()}] [ERROR] [${scope}] ${message}`,
    err?.message || err
  );
};

export default { info, warn, error };
