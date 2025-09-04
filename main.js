console.log("main js loaded");

//cek auth
const currentUser = JSON.parse(localStorage.getItem("authorizedUser"));
console.log(currentUser);

if (!currentUser) {
    alert("Anda harus login dulu")
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

//load post
const postContainer = document.getElementById("postContainer");
const postTemplate = document.getElementById("postTemplate");
let postCache = [];
let commentCache = [];

async function loadPost() {
    try{
        const resPosts = await fetch("http://localhost:3000/posts");
        postCache = await resPosts.json();
        // console.log(postCache);

        const resComments = await fetch("http://localhost:3000/comments");
        commentCache = await resComments.json();
        // console.log(commentCache);

        postContainer.innerHTML = "";
        postCache.forEach(post => {
            //setup template
            const clonePost = postTemplate.content.cloneNode(true);

            //panggil element
            const displayPostTitle = clonePost.querySelector(".displayPostTitle");
            const displayPostContent = clonePost.querySelector(".displayPostContent");
            const postCommentUl = clonePost.querySelector(".postCommentUl");
            
            //set judul , konten
            displayPostTitle.textContent = post.title;
            displayPostContent.textContent = post.content;

            //filter komen per post
            const postComments = commentCache.filter(c => c.postId === post.id);
            postComments.forEach(c => {
                const commentLi = document.createElement("li"); 
                commentLi.textContent = c.body;
                postCommentUl.appendChild(commentLi);
            });
            
            //assign unique id buat input field komen 
            const commentInput = clonePost.querySelector("input[name='postComment']");
            commentInput.id = post.id;

            postContainer.appendChild(clonePost);
        })
    } catch (e) {
        console.error("Post load error : ", e);
    }
}

loadPost();

//add post
async function createPost(title, content) {
    //cek input udah ada di layer ui
    try {
        const response = await fetch("http://localhost:3000/posts", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                title,
                content,
                userId : Number(currentUser.id)
            })
        });

        if (!response.ok) alert ("Gagal menambahkan post");

        const newPost = await response.json();
        postCache.push(newPost);
        console.log("new post", newPost);
        alert("Post berhasil ditambahkan");
    } catch (error){
        console.error("Error create post", error);
        alert("gagal menambahkan post.")
    }
}

const postForm = document.getElementById("postForm");
postForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;

    createPost(title, content);
    loadPost();
});

//add comment
document.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && e.target.name === "postComment" ) {
        e.preventDefault();
        const comment = e.target.value.trim();
        if(!comment) {
            alert("field komen tidak terisi"); 
            return;
        } 

        const postId = e.target.id;
        if(!currentUser) {
            alert("Login dulu baru komen yeah")
            return;
        }

        (async () => {
            try {
                const response = await fetch("http://localhost:3000/comments", {
                    method : "POST",
                    headers : {"Content-Type" : "application/json"},
                    body : JSON.stringify({
                        postId : String(postId),
                        body : comment
                    })
                });
    
                if (response.ok){
                    e.target.value = "";
                    const newComment = await response.json();
                    commentCache.push(newComment);
                    loadPost();
                } else {
                    alert("Komentar gagal ditambahkan");
                }
            } catch (error) {
                console.error("Gagal menambahkan komentar", error)
                alert("Komentar gagal ditambahkan");
            }
        })();
    }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(reg => {
      console.log("Service Worker registered:", reg.scope);
    })
    .catch(err => {
      console.error("Service Worker registration failed:", err);
    });
}

//cek backend
async function checkServerStatus() {
  try {
    const res = await fetch("http://localhost:3000/posts", { method: "HEAD" });
    return res.ok; 
  } catch {
    return false; 
  }
}

async function updateInputs() {
  const notice = document.getElementById("notice");
  const postForm = document.getElementById("postForm");
  const commentInputs = document.querySelectorAll("input[name='postComment']");

  const serverUp = await checkServerStatus();

  if (!navigator.onLine || !serverUp) { //offline
    if (notice) notice.classList.remove("hidden");
    if (postForm) postForm.classList.add("hidden");
    commentInputs.forEach(input => input.classList.add("hidden"));
  } else {
    if (notice) notice.classList.add("hidden");
    if (postForm) postForm.classList.remove("hidden");
    commentInputs.forEach(input => input.classList.remove("hidden"));
  }
}
updateInputs();
window.addEventListener("online", updateInputs);
window.addEventListener("offline", updateInputs);


