const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE = isLocalhost 
  ? 'http://localhost:3043/api' 
   : process.env.REACT_APP_API_BASE;
  
  // : 'https://apisurprise.dodunsoftsolutions.com/api';

export const BASE_URL = isLocalhost 
  ? 'http://localhost:3043' 
  : 'https://apisurprise.dodunsoftsolutions.com';
