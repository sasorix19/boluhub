// ELEMENTOS
const postButton = document.getElementById('postButton');
const postContent = document.getElementById('postContent');
const postMedia = document.getElementById('postMedia');
const feed = document.getElementById('feed');

const profilePicInput = document.getElementById('profilePicInput');
const profilePic = document.getElementById('profilePic');
const fullNameInput = document.getElementById('fullName');
const userNameInput = document.getElementById('userName');
const bioInput = document.getElementById('bio');
const saveProfileBtn = document.getElementById('saveProfile');
const userFeed = document.getElementById('userFeed');
const editProfileBtn = document.getElementById('editProfileBtn');
const profileDisplay = document.getElementById('profileDisplay');
const profileEdit = document.getElementById('profileEdit');
const displayFullName = document.getElementById('displayFullName');
const displayUserName = document.getElementById('displayUserName');
const displayBio = document.getElementById('displayBio');
const editPicLabel = document.getElementById('editPicLabel');

const sections = document.querySelectorAll('main section');
const navLinks = document.querySelectorAll('nav a');

// NAVEGACIÓN
navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = link.textContent.toLowerCase();
        sections.forEach(sec => sec.style.display = 'none');
        document.getElementById(target).style.display = 'block';
    });
});

// --- USUARIOS ---
let users = JSON.parse(localStorage.getItem('users')) || {};
let currentUser = localStorage.getItem('currentUser') || "user1";

// Si es primer usuario, inicializar
if (!users[currentUser]) {
    users[currentUser] = {
        pic: "https://via.placeholder.com/100",
        fullName: "Nombre completo",
        userName: "@usuario",
        bio: "Biografía",
        posts: []
    };
    localStorage.setItem('users', JSON.stringify(users));
}

// MOSTRAR PERFIL
function mostrarPerfil() {
    const user = users[currentUser];
    profilePic.src = user.pic;
    displayFullName.textContent = user.fullName;
    displayUserName.textContent = user.userName;
    displayBio.textContent = user.bio;
    profileDisplay.style.display = 'block';
    profileEdit.style.display = 'none';
    editPicLabel.style.display = 'none';
    renderUserFeed();
}

// EDITAR PERFIL
function editarPerfil() {
    const user = users[currentUser];
    profileEdit.style.display = 'block';
    profileDisplay.style.display = 'none';
    editPicLabel.style.display = 'block';
    fullNameInput.value = user.fullName;
    userNameInput.value = user.userName.replace("@", "");
    bioInput.value = user.bio;
}

editProfileBtn.addEventListener('click', editarPerfil);

saveProfileBtn.addEventListener('click', () => {
    const user = users[currentUser];
    user.fullName = fullNameInput.value.trim() || user.fullName;
    user.userName = userNameInput.value.trim() ? "@" + userNameInput.value.trim() : user.userName;
    user.bio = bioInput.value.trim() || user.bio;
    users[currentUser] = user;
    localStorage.setItem('users', JSON.stringify(users));
    mostrarPerfil();
});

// CAMBIAR FOTO PERFIL
profilePicInput.addEventListener('change', () => {
    const file = profilePicInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            users[currentUser].pic = e.target.result;
            profilePic.src = users[currentUser].pic;
            localStorage.setItem('users', JSON.stringify(users));
        };
        reader.readAsDataURL(file);
    }
});

// --- POSTS ---
postButton.addEventListener('click', () => {
    const content = postContent.value.trim();
    if (content === "" && postMedia.files.length === 0) {
        alert("No podés publicar un post vacío");
        return;
    }
    const mediaFile = postMedia.files[0];
    const user = users[currentUser];

    if (mediaFile) {
        const reader = new FileReader();
        reader.onload = e => {
            const postData = { content, media: e.target.result, likes: [], comments: [], user: currentUser };
            user.posts.unshift(postData);
            users[currentUser] = user;
            localStorage.setItem('users', JSON.stringify(users));
            crearPost(postData);
        };
        reader.readAsDataURL(mediaFile);
    } else {
        const postData = { content, media: null, likes: [], comments: [], user: currentUser };
        user.posts.unshift(postData);
        users[currentUser] = user;
        localStorage.setItem('users', JSON.stringify(users));
        crearPost(postData);
    }

    postContent.value = "";
    postMedia.value = "";
});

// CREAR POST
function crearPost(postData) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';

    let mediaHTML = '';
    if (postData.media) {
        if (postData.media.startsWith('data:image')) mediaHTML = `<img src="${postData.media}" class="post-media">`;
        else if (postData.media.startsWith('data:video')) mediaHTML = `<video src="${postData.media}" class="post-media" controls></video>`;
    }

    const userPic = users[postData.user].pic;
    const userName = users[postData.user].userName;

    postDiv.innerHTML = `
        <div class="post-header">
            <img src="${userPic}" class="post-mini-pic" data-user="${postData.user}">
            <h3 class="post-user" data-user="${postData.user}">${userName}</h3>
        </div>
        <p>${postData.content}</p>
        ${mediaHTML}
        <div class="post-buttons">
            <button class="like-btn">❤️ (${postData.likes.length})</button>
            <button class="comment-btn">Comentarios</button>
        </div>
        <div class="comment-section">
            <input type="text" placeholder="Escribe un comentario">
            <button class="add-comment-btn">Enviar</button>
            <div class="comments-list"></div>
        </div>
        <span class="delete-btn">🗑️</span>
    `;

    feed.prepend(postDiv);
    agregarFuncionalidadPost(postDiv, postData);
    renderUserFeed();
}

// FUNCIONALIDAD POST
function agregarFuncionalidadPost(postDiv, postData) {
    const likeBtn = postDiv.querySelector('.like-btn');
    const commentBtn = postDiv.querySelector('.comment-btn');
    const commentSection = postDiv.querySelector('.comment-section');
    const addCommentBtn = postDiv.querySelector('.add-comment-btn');
    const commentInput = postDiv.querySelector('input');
    const commentsList = postDiv.querySelector('.comments-list');
    const deleteBtn = postDiv.querySelector('.delete-btn');

    // Ir a perfil al tocar foto o nombre
    postDiv.querySelectorAll('[data-user]').forEach(el => {
        el.addEventListener('click', () => {
            currentUser = el.dataset.user;
            localStorage.setItem('currentUser', currentUser);
            mostrarPerfil();
            sections.forEach(sec => sec.style.display = 'none');
            document.getElementById('perfil').style.display = 'block';
        });
    });

    likeBtn.addEventListener('click', () => {
        if (!postData.likes.includes(currentUser)) {
            postData.likes.push(currentUser);
            likeBtn.textContent = `❤️ (${postData.likes.length})`;
            users[postData.user].posts = users[postData.user].posts.map(p => p === postData ? postData : p);
            localStorage.setItem('users', JSON.stringify(users));
        } else {
            alert("Solo se permite 1 like por usuario.");
        }
    });

    commentBtn.addEventListener('click', () => {
        commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';
    });

    postData.comments.forEach(c => {
        const cDiv = document.createElement('div');
        cDiv.className = 'comment';
        cDiv.textContent = c;
        commentsList.appendChild(cDiv);
    });

    addCommentBtn.addEventListener('click', () => {
        const commentText = commentInput.value.trim();
        if (commentText === "") return;
        postData.comments.push(commentText);
        users[postData.user].posts = users[postData.user].posts.map(p => p === postData ? postData : p);
        localStorage.setItem('users', JSON.stringify(users));
        const cDiv = document.createElement('div');
        cDiv.className = 'comment';
        cDiv.textContent = commentText;
        commentsList.appendChild(cDiv);
        commentInput.value = "";
    });

    deleteBtn.addEventListener('click', () => {
        if (postData.user !== currentUser) return alert("No podés borrar posts de otros usuarios");
        if (confirm("¿Seguro que querés borrar este post?")) {
            users[currentUser].posts = users[currentUser].posts.filter(p => p !== postData);
            localStorage.setItem('users', JSON.stringify(users));
            postDiv.remove();
            renderUserFeed();
        }
    });
}

// RENDER FEED USUARIO
function renderUserFeed() {
    userFeed.innerHTML = '';
    const userPosts = users[currentUser].posts;
    userPosts.forEach(postData => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';

        let mediaHTML = '';
        if (postData.media) {
            if (postData.media.startsWith('data:image')) mediaHTML = `<img src="${postData.media}" class="post-media">`;
            else if (postData.media.startsWith('data:video')) mediaHTML = `<video src="${postData.media}" class="post-media" controls></video>`;
        }

        const userPic = users[postData.user].pic;
        const userName = users[postData.user].userName;

        postDiv.innerHTML = `
            <div class="post-header">
                <img src="${userPic}" class="post-mini-pic" data-user="${postData.user}">
                <h3 class="post-user" data-user="${postData.user}">${userName}</h3>
            </div>
            <p>${postData.content}</p>
            ${mediaHTML}
            <div class="post-buttons">
                <button class="like-btn">❤️ (${postData.likes.length})</button>
                <button class="comment-btn">Comentarios</button>
            </div>
            <div class="comment-section">
                <input type="text" placeholder="Escribe un comentario">
                <button class="add-comment-btn">Enviar</button>
                <div class="comments-list"></div>
            </div>
            <span class="delete-btn">🗑️</span>
        `;
        userFeed.appendChild(postDiv);
        agregarFuncionalidadPost(postDiv, postData);
    });
}

mostrarPerfil();