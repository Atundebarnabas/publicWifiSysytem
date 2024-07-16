let botheye, eye1, eye2, passKeyBox;

eye1 = document.querySelector('.eye-open');
eye2 = document.querySelector('.eye-close');
botheye = document.querySelectorAll('.eye_con svg');

passKeyBox = document.querySelector('.passkey-field');

botheye.forEach(eye => {
  eye.addEventListener('click', function() {
    let type = passKeyBox.getAttribute('type') === 'password' ? 'text' : 'password';
    passKeyBox.setAttribute('type', type);

    eye1.classList.toggle('active');
    eye2.classList.toggle('active');
  })
});