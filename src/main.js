import { fetchImages } from './js/pixabay-api';
import { renderGallery } from './js/render-functions';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let totalHits = 0;

form.addEventListener('submit', onSubmit);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSubmit(event) {
  event.preventDefault();
  query = event.target.elements.searchQuery.value.trim();

  if (!query) {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search query.',
    });
    return;
  }

  page = 1;
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('is-hidden');
  document.querySelector('.loader').classList.remove('is-hidden'); // Показуємо завантажувач

  try {
    const data = await fetchImages(query, page);
    totalHits = data.totalHits;

    if (totalHits === 0) {
      iziToast.error({
        title: 'Error',
        message: 'No images found. Please try again.',
      });
      return;
    }

    renderGallery(data.hits);
    new SimpleLightbox('.gallery a').refresh();

    if (totalHits > 15) {
      loadMoreBtn.classList.remove('is-hidden');
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again.',
    });
  } finally {
    document.querySelector('.loader').classList.add('is-hidden'); // Приховуємо завантажувач
  }
}

async function onLoadMore() {
  page += 1;
  document.querySelector('.loader').classList.remove('is-hidden'); // Показуємо завантажувач

  try {
    const data = await fetchImages(query, page);
    renderGallery(data.hits);
    new SimpleLightbox('.gallery a').refresh();

    const totalPages = Math.ceil(totalHits / 15);
    if (page >= totalPages) {
      loadMoreBtn.classList.add('is-hidden');
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
      });
    }

    scrollPage();
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again.',
    });
  } finally {
    document.querySelector('.loader').classList.add('is-hidden'); // Приховуємо завантажувач
  }
}

function scrollPage() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
