console.log("cek auth loaded");
const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("error");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`http://localhost:3000/users?email=${email}`);
        const users = await response.json();

        if (users.length === 0){
            errorMsg.innerHTML = "User tidak ditemukan";
            return;
        }

        const user = users[0];
        if (user.password !== password) {
            errorMsg.innerHTML = "Invalid password";
            return;
        } 
        else {
            localStorage.setItem("authorizedUser", JSON.stringify({
                id: Number(user.id),
                name : user.name,
                email : user.email
            })); 
            console.log("data user masuk local")
        }

        alert("Login berhasil")
        window.location.href = "index.html";
    } catch (e) {
        console.log(e);
        errorMsg.textContent = "Login gagal."
    }
})