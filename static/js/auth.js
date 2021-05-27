const authbutton = document.querySelector('#authbutton');
const login12 = document.querySelector('#login12');

authbutton.onsubmit('click', () => {
  localStorage.setItem('Login', login12.value);
});
