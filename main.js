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
        console.log(postCache);

        const resComments = await fetch("http://localhost:3000/comments");
        commentCache = await resComments.json();
        console.log(commentCache);

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
            const postComments = commentCache.filter(c => Number(c.postId) === Number(post.id));
            postComments.forEach(c => {
                const commentLi = document.createElement("li"); 
                commentLi.textContent = c.content;
                postCommentUl.appendChild(commentLi);
            });
            
            //assign unique id buat input field komen 
            const commentInput = clonePost.querySelector("input[name='postComment']");
            commentInput.id = `postComment-${post.id}`;

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
        const maxId = postCache.length > 0 ? Math.max(...postCache.map(p => Number(p.id))) : 0;
        const newId = maxId + 1;

        const response = await fetch("http://localhost:3000/posts", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                id : Number(newId),
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
    title.textContent = "";
    content.textContent = "";
    loadPost();
});

//add comment
document.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && e.target.id.startsWith("postComment-")) {
        e.preventDefault();
        const comment = e.target.value.trim();
        if(!comment) {
            alert("field komen tidak terisi"); 
            return;
        } 

        const postId = parseInt(e.target.id.split("-")[1], 10);
        if(!currentUser) {
            alert("Login dulu baru komen yeah")
            return;
        }

        (async () => {
            try {
                const maxId = commentCache.length > 0 ? Math.max(...commentCache.map(c => Number(c.id))) : 0;
                const newId = maxId + 1;

                const response = await fetch("http://localhost:3000/comments", {
                    method : "POST",
                    headers : {"Content-Type" : "application/json"},
                    body : JSON.stringify({
                        id : Number(newId),
                        postId : Number(postId),
                        userId : Number(currentUser.id),
                        content : comment
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

