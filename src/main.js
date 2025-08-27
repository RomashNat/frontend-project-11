import initView from './view.js';
import axios from 'axios'; // HTTP-клиент для запросов
import parseRSS from './DOMparser.js'; // Парсер RSS из XML в JS-объект
import uniqueId from 'lodash.uniqueid'; // Генератор уникальных ID из lodash
import createSchema from './schema.js';
import i18next from 'i18next';
import ru from './ru.js';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';


const fetchRSS = async (url) => {
 try {
    const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
    const response = await axios.get(proxyUrl);
    return response.data.contents;
  } catch (error) {
    throw new Error('Network error');
  }
};

export default () => {

  const elements = {
    form: document.querySelector('[aria-label="form"]'),
    input: document.getElementById('url-input'),
    button: document.querySelector('[aria-label="add"]'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
  };


  const state = {
    form: {
      processState: 'filling', // filling, sending, finished, error
      error: null,
      valid: true
    },
    feeds: [], // Список RSS-фидов, массив добавленных RSS-лент
    posts: [], // писок постов из всех фидов, массив всех полученных постов
    viewedPosts: new Set(), // Множество ID просмотренных постов
    modalPostId: null,
  };

  const i18n = i18next.createInstance()
  i18n.init({
    lng: 'ru',
    resources: { ru }
  })

  const watchState = initView(elements, state);

  elements.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const url = elements.input.value.trim();
    const feedsList = watchState.feeds.map(feed => feed.url)
    try {
      await createSchema(url, feedsList, i18n);
      watchState.form.error = null
      watchState.form.processState = 'sending'

      const xmlString = await fetchRSS(url);

      const { feed, posts } = parseRSS(xmlString);

      const feedWithId = {
        ...feed,
        url,
        id: uniqueId('feed_'),
      };

      const postsWithFeedId = posts.map(post => ({
        ...post,
        id: uniqueId('post_'),
        feedId: feedWithId.id,
      }));

      watchState.feeds = [...watchState.feeds, feedWithId];
      watchState.posts = [...watchState.posts, ...postsWithFeedId];
      watchState.form.processState = 'finished';

      elements.input.value = '';

    } catch (error) {
      watchState.form.processState = 'failed'
      watchState.form.error = error.message;
      switch (error.name) {
        case 'ValidationError':
          watchState.form.error = error.message;
          break;
        case 'ParseError':
          watchState.form.error = 'notRss';
          break;
        default:
          watchState.form.error = error.message.includes('network') ? 'network' : 'unknown';
          break;
      }
    }
  })

  elements.postsContainer.addEventListener('click', (event) => {
    const postElement = event.target.closest('[data-id]');
    if (!postElement) return;

    const postId = postElement.dataset.id;
    watchState.viewedPosts.add(postId);
    watchState.modalPostId = postId;
  });
};



