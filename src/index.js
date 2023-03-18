import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('input'),
  gallery: document.querySelector('.gallery'),
  loadMoreButton: document.querySelector('.load-more'),
};

let pageNumber = 1;

refs.loadMoreButton.style.display = 'none';
refs.form.addEventListener('submit', onFormSearch);
refs.loadMoreButton.addEventListener('click', onButtonLoadMore);

function onFormSearch(e) {
  e.preventDefault();

  pageNumber = 1;
  refs.gallery.innerHTML = '';

  const inputValue = refs.input.value.trim();

  if (inputValue !== '') {
    pixaApi(inputValue);
  } else {
    refs.loadMoreButton.style.display = 'none';

    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again'
    );
  }
}

function onButtonLoadMore() {
  const inputValue = refs.input.value.trim();
  pageNumber += 1;
  pixaApi(inputValue, pageNumber);
}

async function pixaApi(inputValue, pageNumber) {
  const API_URL = 'https://pixabay.com/api/';

  const options = {
    params: {
      key: '34440105-7ecf77165b6c4b9981842084e',
      q: inputValue,
      orientation: 'horizontal',
      safesearch: true,
      image_type: 'photo',
      per_page: 40,
      page: pageNumber,
    },
  };

  try {
    const response = await axios.get(API_URL, options);

    notifications(response.data.hits.length, response.data.total);
    createMarkup(response.data);
  } catch (error) {
    console.log(error);
  }
}

function createMarkup(arr) {
  const markup = arr.hits
    .map(
      image => `<a class="photo-link" href="${image.largeImageURL}">
  <div class="photo-card">
    <div class="photo">
     <img src="${image.webformatURL}" alt="${image.tags}" title="${image.tags}" loading="lazy"/>
    </div>
      <div class="info">
        <p class="info-item">
         <b>Likes</b>
         <span class="info-item-api"> ${image.likes}
         </span>
        </p>
        <p class="info-item">
          <b>Views</b>
          <span class="info-item-api">${image.views}
          </span>  
        </p>
        <p class="info-item">
          <b>Comments</b>
          <span class="info-item-api">${image.comments}</span>  
        </p>
        <p class="info-item">
          <b>Downloads</b>
          <span class="info-item-api">${image.downloads}
          </span> 
        </p>
    </div>
  </div>
  </a>`
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  simpleLightbox.refresh();
}

const simpleLightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

export function notifications(length, totalHits) {
  if (length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  if (pageNumber === 1) {
    refs.loadMoreButton.style.display = 'flex';

    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }

  if (length < 40) {
    refs.loadMoreButton.style.display = 'none';

    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}
