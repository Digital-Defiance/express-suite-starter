import axios from 'axios';

// global-setup started the API on a free port and published its address.
const baseURL = process.env['E2E_BASE_URL'];
if (!baseURL) {
  throw new Error(
    'E2E_BASE_URL is not set: global-setup did not start the API',
  );
}
axios.defaults.baseURL = baseURL;
