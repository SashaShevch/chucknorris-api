if (!localStorage.getItem('ChuckJokes')) {
    localStorage.setItem('ChuckJokes', '[]');
}


async function loadCategories(url) {
    const response = await fetch(url);
    const categories = await response.json();
    const domCategories = document.getElementById('categories');
    domCategories.className = 'hidden categories';
    for (let categoria of categories) {
        let div = document.createElement('div');
        let label = document.createElement('label');
        label.setAttribute('for', categoria);
        label.textContent = categoria;
        label.className = 'categoria';
        let radio = document.createElement('input');
        radio.setAttribute('type', 'radio');
        radio.setAttribute('id', categoria);
        radio.setAttribute('name', 'categories');
        div.append(radio, label);
        domCategories.append(div);
    }
}

function createSearchInput() {
    const domSearchInput = document.getElementById('searchInputContainer');
    let input = document.createElement('input');
    domSearchInput.className = 'hidden';
    input.className = 'search_input';
    input.setAttribute('placeholder', 'Free text search')
    domSearchInput.append(input);

}

function showCategories() {
    let domCategories = document.getElementById('categories');
    domCategories.classList.remove('hidden')
}

function hideCategories() {
    let domCategories = document.getElementById('categories');
    domCategories.classList.add('hidden')
}

function showSearch() {
    let domSearchInput = document.getElementById('searchInputContainer');
    domSearchInput.classList.remove('hidden')
}

function hideSearch() {
    let domSearchInput = document.getElementById('searchInputContainer');
    domSearchInput.classList.add('hidden')
}


function onSelectedRandom() {
    hideCategories();
    hideSearch();
}

function onSelectedCategories() {
    showCategories();
    hideSearch();
}

function onSelectedSearch() {
    hideCategories();
    showSearch();
}


function renderFavouriteJokes(jokes) {
    for (let joke of jokes) {
        let favouriteJoke = createJoke(joke);
        favouriteJokesDom.append(favouriteJoke)
    }
}

async function renderJoke(url) {
    const response = await fetch(url);
    const jokeResponse = await response.json();
    jokeResponse.like = false;
    if (jokeResponse.id) {
        let joke = createJoke(jokeResponse);
        jokesDom.append(joke)
    }
}

function createJoke(jokeInformation, heartLink) {
    let joke = document.createElement('div');
    joke.className = 'joke'
    let heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = getPostLikeStatus(jokeInformation.like)
    let commentCircle = createJokeCommentCircle();
    let jokeContent = createJokeContent(jokeInformation);
    joke.append(heart, commentCircle, jokeContent)

    let possibleFavourite;
    heart.addEventListener('click', () => {
        jokeInformation.like = !jokeInformation.like;
        if (!jokeInformation.like) {
            if (heartLink) {
                heartLink.innerHTML = NOT_LIKE_POST_EMPTY_HEART;
            }
            heart.innerHTML = NOT_LIKE_POST_EMPTY_HEART;
            if (joke.parentNode.getAttribute('id') === 'favourite') {
                joke.remove();
            } else {
                favouriteJokesDom.removeChild(possibleFavourite);
            }
            removeFavouritePostFromStorage(jokeInformation);
        } else {
            heart.innerHTML = LIKE_POST_FULL_HEART;
            possibleFavourite = createJoke(jokeInformation, heart)
            favouriteJokesDom.append(possibleFavourite);
            addFavouritePostToStorage(jokeInformation);
        }
    })
    return joke;
}

function getPostLikeStatus(like) {
    if (!like) {
        return NOT_LIKE_POST_EMPTY_HEART;
    } else {
        return LIKE_POST_FULL_HEART;
    }
}

function addFavouritePostToStorage(post) {
    let items = localStorage.getItem('ChuckJokes');
    let jokes = JSON.parse(items);
    jokes.push(post);
    let newJokes = JSON.stringify(jokes);
    localStorage['ChuckJokes'] = newJokes;
}

function removeFavouritePostFromStorage(post) {
    let items = localStorage.getItem('ChuckJokes');
    let jokes = JSON.parse(items);
    let newJokes = JSON.stringify(jokes.filter(joke => joke.id !== post.id));
    localStorage['ChuckJokes'] = newJokes;
}

function createJokeCommentCircle() {
    let commentCircle = document.createElement('div');
    commentCircle.className = 'circle';
    commentCircle.innerHTML = COMMENT_SVG;
    return commentCircle;
}

function createJokeContent(jokeInformation) {
    let jokeContent = document.createElement('div');
    jokeContent.className = 'jokeContent';
    let id = document.createElement('div');
    id.className = 'postId';
    let text = document.createElement('div');
    text.className = 'postContent';
    let additionInformation = document.createElement('div');
    additionInformation.className = 'additionInformation';

    id.textContent = jokeInformation.id;
    text.textContent = jokeInformation.value;

    let lastUpdate = document.createElement('div');
    lastUpdate.className = 'lastUpdate';
    let categoria = document.createElement('div');
    let pastDate = new Date(jokeInformation.updated_at);
    pastDate = Date.now() - pastDate.getTime();
    pastDate = Math.floor(pastDate / 3600000);
    lastUpdate.textContent = `Last update: ${pastDate} hours ago`;
    jokeInformation.categories.forEach(category => {
        let c = document.createElement('div');
        c.textContent = category;
        c.className = 'categoria';
        categoria.append(c);
    });

    additionInformation.append(lastUpdate, categoria);
    jokeContent.append(id, text, additionInformation);
    return jokeContent;
}

function getCheckedValue(groupName) {
    let radios = document.getElementsByName(groupName);
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i];
        }
    }
    return radios[0];
}



randomButton.addEventListener('change', () => {
    onSelectedRandom();
})
categoriesButton.addEventListener('change', () => {
    onSelectedCategories();
})
searchButton.addEventListener('change', () => {
    onSelectedSearch();
})

const getJoke = document.getElementById('getJoke');
getJoke.addEventListener('click', () => {
    if (randomButton.checked) {
        renderJoke('https://api.chucknorris.io/jokes/random');
    }
    if (categoriesButton.checked) {
        let category = getCheckedValue('categories').getAttribute('id');
        renderJoke(`https://api.chucknorris.io/jokes/random?category=${category}`);
    }
    if (searchButton.checked) {
        const domSearchInput = document.getElementById('searchInputContainer');

        renderJoke(`https://api.chucknorris.io/jokes/search?query=${domSearchInput.value}`);
    }
})


createSearchInput();
loadCategories('https://api.chucknorris.io/jokes/categories');
let jokesFromLocalStorage = JSON.parse(localStorage.getItem('ChuckJokes'));
renderFavouriteJokes(jokesFromLocalStorage);