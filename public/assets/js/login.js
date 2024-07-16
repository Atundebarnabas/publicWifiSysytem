import { handleSubmit } from '../js/modules/formHandler.js';

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', handleSubmit);
});