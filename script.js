const API_KEY = '?api_key=3f0aa6bef30871eddb785c39ee859020';
const BASE_URL = 'https://api.themoviedb.org/3/movie/';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

//model
movies = {
  movie: [],
  liked: [],
  select: 'popular',
  page: 1,
  modal: null,
};

//view
//create movie card view
const createCard = (movie, likedIndicator) => {
  let likedIconName = '';
  if (likedIndicator) {
    likedIconName = 'heart';
  } else {
    likedIconName = 'heart-outline';
  }

  const div = document.createElement('div');
  div.className = 'movie-card';
  div.id = `${movie.id}`;

  div.innerHTML = `
    <div class = "movie-card-img">
      <img src = "${getImg(movie)}" />
    </div>

    <h4 class="movie-card-title">${movie.title}</h4>

    <div class = "movie-card-rating">
      <ion-icon name="star"></ion-icon>
      <p class="rating">${movie.vote_average}</p>
      <ion-icon id="like-icon" name=${likedIconName}></ion-icon>
    </div>
  `;

  return div;
};

//create modal view
const createModal = (movieDetail) => {
  const modalImgContainer = document.querySelector('.modal-img-container');
  modalImgContainer.innerHTML = `
    <img src=${POSTER_BASE_URL}${movieDetail.poster_path} class="modal-img" />
  `;

  const modalTitle = document.querySelector('.modal-title');
  modalTitle.innerHTML = `${movieDetail.title}`;

  const modalOverview = document.querySelector('.modal-overview');
  modalOverview.innerHTML = `${movieDetail.overview}`;

  const modalRating = document.querySelector('.modal-rating');
  modalRating.innerHTML = `${movieDetail.vote_average}`;

  const reducedGenres = movieDetail.genres.map((v) => {
    return v.name;
  });
  const modalGenre = document.querySelector('.modal-genre');
  reducedGenres.forEach((genre) => {
    const genreBox = document.createElement('button');
    genreBox.className = 'genre-box';
    genreBox.innerHTML = `${genre}`;
    modalGenre.append(genreBox);
  });

  const production_companies = movieDetail.production_companies.filter(
    (prod) => {
      if (prod.logo_path) return prod;
    }
  );
  const modalProduction = document.querySelector('.modal-production');
  production_companies.forEach((prod) => {
    const productionLogo = document.createElement('img');
    productionLogo.src = `${POSTER_BASE_URL}${prod.logo_path}`;
    modalProduction.append(productionLogo);
  });
};

//search if movie is liked or not
const likedContains = (movie) => {
  let result = false;
  movies.liked.forEach((likedMovie) => {
    if (likedMovie.id === movie.id) {
      result = true;
    }
  });
  return result;
};

//render function
const renderView = () => {
  console.log('rendering');
  const pageNumber = document.querySelector('.page-number');
  pageNumber.innerHTML = `${movies.page}/500`;

  const grid = document
    .querySelector('div[name="HOME"]')
    .querySelector('.grid');
  const gridLiked = document
    .querySelector('div[name="LIKED-LIST"]')
    .querySelector('.grid');

  //clear current pages before rerendering
  grid.innerHTML = '';
  gridLiked.innerHTML = '';

  //render movies, if movie also exists in liked page render a filled heart for the like button
  movies.movie.forEach((v) => {
    if (likedContains(v)) {
      grid.append(createCard(v, true));
    } else {
      grid.append(createCard(v, false));
    }
  });
  //render liked movies
  movies.liked.forEach((v) => {
    gridLiked.append(createCard(v, true));
  });

  //render modal
  if (movies.modal) {
    const modalGenre = document.querySelector('.modal-genre');
    modalGenre.innerHTML = '';
    const modalProduction = document.querySelector('.modal-production');
    modalProduction.innerHTML = '';
    const modal = document.querySelector('#modal');
    createModal(movies.modal);
    modal.style = 'display: flex;';
  }
};

//fetch 20 movies of select sort method and page and save it in movies.movie
const getMovies = (select, page) => {
  return fetch(`${BASE_URL}${select}${API_KEY}&language=en_US&page=${page}`)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      movies.movie = data.results;
    });
};

//fetch a single movie based on movie id and save it in movies.modal
const getMovieDetail = (movieId) => {
  return fetch(`${BASE_URL}${movieId}${API_KEY}`)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      movies.modal = data;
    });
};

//fetch a single movie based on movie id and save it in movies.liked
const getMovieLiked = (movieId) => {
  return fetch(`${BASE_URL}${movieId}${API_KEY}`)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      movies.liked.push(data);
    });
};

//helper function to get image based on movie
const getImg = (movie) => {
  return `${POSTER_BASE_URL}${movie.poster_path}`;
};

//controller
const loadEvents = () => {
  //nav bar
  const divHome = document.querySelector('#movie-view');
  const divLiked = document.querySelector('#liked-view');
  const navBar = document.querySelector('.nav-bar');
  navBar.addEventListener('click', (e) => {
    if (e.target.className === 'nav-home') {
      divHome.style = 'display: block;';
      divLiked.style = 'display: none;';
    } else if (e.target.className === 'nav-liked') {
      divHome.style = 'display: none;';
      divLiked.style = 'display: block;';
    }
  });

  //select box
  const select = document.querySelector('#select');
  select.addEventListener('change', () => {
    movies.page = 1;
    movies.select = select.value;
    getMovies(movies.select, movies.page).then(() => {
      renderView();
    });
  });

  // page navigators
  const navNext = document.querySelector('.nav-button-next');
  navNext.addEventListener('click', () => {
    if (movies.page < 500) {
      movies.page = movies.page + 1;
      getMovies(movies.select, movies.page).then(() => {
        renderView();
      });
    }
  });
  const navPrev = document.querySelector('.nav-button-prev');
  navPrev.addEventListener('click', () => {
    if (movies.page > 1) {
      movies.page = movies.page - 1;
      getMovies(movies.select, movies.page).then(() => {
        renderView();
      });
    }
  });

  //title click that triggers modal page according to movie id
  //like icon to that adds movie to movie.liked accoding to movie id
  //if the movie already exists in movie.liked then remove it from movie.liked
  const movieContainers = document.querySelectorAll('.movie-container');
  movieContainers.forEach((movieContainer) => {
    movieContainer.addEventListener('click', (e) => {
      if (e.target.className === 'movie-card-title') {
        const movieId = e.target.closest('.movie-card').id;
        getMovieDetail(movieId).then(() => {
          renderView();
        });
      }
      if (e.target.id === 'like-icon') {
        const movieId = e.target.closest('.movie-card').id;
        if (e.target.name === 'heart-outline') {
          getMovieLiked(movieId).then(() => {
            renderView();
          });
        } else {
          movies.liked = movies.liked.filter((movie) => {
            return movie.id - movieId !== 0;
          });
          renderView();
        }
      }
    });
  });

  //modal component
  const closeModal = document.querySelector('.close-modal');
  const modal = document.querySelector('#modal');
  closeModal.addEventListener('click', () => {
    movies.modal = null;
    modal.style = 'display: none;';
  });

  //initial render
  getMovies(movies.select, movies.page).then(() => {
    renderView();
  });
};

loadEvents();
