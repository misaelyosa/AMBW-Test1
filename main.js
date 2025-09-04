console.log("main js loaded");

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

async function loadPost() {
    try{
        const resPosts = await fetch("http://localhost:3000/posts");
        const posts = await resPosts.json();

        const resComments = await fetch("http://localhost:3000/comments");
        const comments = await resComments.json();

        postContainer.innerHTML = "";
        posts.forEach(post => {
            //setup template
            const clonePost = postTemplate.content.cloneNode(true);

            //panggil element
            const displayPostTitle = clonePost.getElementById("displayPostTitle");
            const displayPostContent = clonePost.getElementById("displayPostContent");
            const postCommentUl = clonePost.getElementById("postCommentUl");
            const displayPostComment = clonePost.getElementById("displayPostComment");
            
            //set judul , konten
            displayPostTitle.textContent = post.title;
            displayPostContent.textContent = post.content;

            //filter komen per post
            const postComments = comments.filter(c => c.postId === post.id);
            postComments.forEach(c => {
                displayPostComment.textContent = c.content;
                postCommentUl.appendChild(displayPostComment);
            });

            postContainer.appendChild(clonePost);
        })
    } catch (e) {
        console.error("Post load error : ", e);
    }
}

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
                userId : currentUser.id
            })
        });

        if (!response.ok) alert ("Gagal menambahkan post");

        const newPost = await response.json();
        console.log("new post", newPost);
        alert("Post berhasil ditambahkan");

        loadPost();
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
});

loadPost();