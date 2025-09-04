console.log("main js loaded");

const currentUser = JSON.parse(localStorage.getItem("authorizedUser"));
console.log(currentUser);

if (!currentUser) {
    window.location.href = "auth.html";
} else {
    document.getElementById("username").textContent = `Hi, ${currentUser.name}`; 
}

const logout = document.getElementById("logoutBtn");
logout.addEventListener("click", () => {
    localStorage.removeItem("authorizedUser");
    alert("Anda berhasil log out");
    window.location.href = "auth.html";
})