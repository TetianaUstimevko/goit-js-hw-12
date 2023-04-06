import './sass/index.scss';
import NewsApiService from './js/api-service';
import { lightbox } from './js/lightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';


const refs = {
  searchForm: document.querySelector('.search-form'),
  galleryContainer: document.querySelector('.gallery'),
};

let isShown = 0;
let isLoading = false;

const newsApiService = new NewsApiService();

refs.searchForm.addEventListener('submit', onSearch);

const options = {
  rootMargin: '50px',
  root: null,
  threshold: 0.3,
};
const observer = new IntersectionObserver(onLoadMore, options);

function onSearch(e) {
  e.preventDefault();

  refs.galleryContainer.innerHTML = '';
  newsApiService.query = e.currentTarget.elements.searchQuery.value.trim();
  newsApiService.resetPage();

  if (newsApiService.query === '') {
    Notify.warning('Please, fill the main field');
    return;
  }

  isShown = 0;
  fetchGallery();
  observer.observe(refs.galleryContainer.lastElementChild);
}

async function fetchGallery() {
  isLoading = true;

  const r = await newsApiService.fetchGallery();
  const { hits, total } = r;

  if (!hits.length) {
    Notify.failure(
      `Sorry, there are no images matching your search query. Please try again.`
    );
    return;
  }

  onRenderGallery(hits);
  isShown += hits.length;

  if (isShown < total) {
    Notify.success(`Hooray! We found ${total} images.`);
    isLoading = false;
    observer.observe(refs.galleryContainer.lastElementChild);
  } else {
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
}

function onRenderGallery(elements) {
  const markup = elements
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
    <a href="${largeImageURL}">
      <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${downloads}
      </p>
    </div>
    </div>`;
      }
    )
    .join('');
  refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

function onLoadMore(entries) {
entries.forEach((entry) => {
if (entry.isIntersecting && !isLoading) {
fetchGallery();
}
});
}


// Нескінченний скрол

// window.addEventListener('scroll', () => {
  
//   if (window.scrollY > document.documentElement.scrollHeight - window.innerHeight * 0.8) {
//     loadMore();
//   }
// });

// function loadMore() {
//   const xhr = new XMLHttpRequest();
//   xhr.open('GET', `https://pixabay.com/data?page=${page}&PER_PAGE=${PER_PAGE}`);
//   xhr.onload = () => {
//     const data = JSON.parse(xhr.responseText);
//     data.forEach(item => {
//       const element = document.createElement('div');
//       element.textContent = item.text;
//       document.querySelector('.gallery').appendChild(element);
//     });
//     page++;
//   };
//   xhr.send();
// }

