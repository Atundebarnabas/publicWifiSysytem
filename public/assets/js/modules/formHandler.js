export function handleSubmit(event) {
  event.preventDefault();

  const loginIdInput = document.getElementById('loginId');
  const passkeyInput = document.getElementById('passkey');
  const errorMessageParent = document.querySelector('.error_parent');
  const errorMsg = document.querySelector('.errMsg');

  // Get trimmed values
  const loginId = loginIdInput.value;
  const passkey = passkeyInput.value;

  console.log('Login Id sent', loginId);
  console.log('Passkey sent', passkey);

  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({loginId, passkey})
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.href = '/pw/dashboard';
    } else {
      errorMessageParent.classList.add('active');
      errorMsg.textContent = data.error;
    }
  })
  .catch(error => {
    errorMessageParent.classList.add('active');
    errorMsg.textContent = 'An error occurred. Please try again later.';
    console.error('Error:', error);
  });
}