const authbutton = document.querySelector('#authbutton');
const login12 = document.querySelector('#login12');

authbutton.addEventListener('click', () => {
    localStorage.setItem("Login", login12.value);
});