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
    const response = await axios.get(proxyUrl); // делаем запрос не напрямую к RSS, а к своему прокси-серверу
    return response.data.contents;
  } catch (error) {
    throw new Error('Network error');
  }
};

const createProxyUrl = (url) => { // создание URL, а не выполнение запроса
  return `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
};

export default () => {

  const elements = {
    form: document.querySelector('[aria-label="form"]'),
    input: document.getElementById('url-input'),
    button: document.querySelector('[aria-label="add"]'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modalContainer: document.querySelector('.modal-content'),
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

  const i18n = i18next.createInstance() // стартовая точка для системы интернационализации
  i18n.init({
    lng: 'ru',
    resources: { ru }
  })

  // Переменная для хранения ID интервала
  let intervalId = null;


  // Функция для запуска/перезапуска интервала обновления
  const startUpdateInterval = () => {
    // Очищаем предыдущий интервал
    // Механизм автоматического периодического обновления RSS-лент
    if (intervalId) {
      clearTimeout(intervalId); // старый таймер должен быть очищен
    }

    const updateFeeds = () => { // Запросы ко всем RSS-фидам, парсинг ответов, поиск новых постов, обновление состояния приложения
      const addedUrls = state.feeds.map((feed) => feed.url); // проверка на наличие добавленных фидов 
      if (addedUrls.length === 0) {
        intervalId = setTimeout(updateFeeds, 5000);
        return;
      }

      const axiosRequests = addedUrls.map((url) => { // создание массива запросов
        const proxyUrl = createProxyUrl(url);
        return axios.get(proxyUrl)
          .catch(error => {
            return null;
          });
      });

      Promise.all(axiosRequests) // обработка всех запросов
        .then((responses) => { // фильтрация и парсинг ответов
          const validResponses = responses.filter(response => response !== null);
          const results = validResponses.map((response) =>
            parseRSS(response.data.contents)
          );
          // поиск именно новых постов
          const allPosts = results.flatMap((result) => result.posts || []);
          const newPosts = allPosts.filter((post) =>
            !state.posts.some((addedPost) => addedPost.link === post.link)
          );
          // добавление новых постов в состояние
          if (newPosts.length > 0) {
            const newPostsWithId = newPosts.map((post) => ({
              ...post,
              id: uniqueId(),
              feedId: state.feeds.find(feed => feed.url === addedUrls[0])?.id
            }));

            // Обновляем состояние
            state.posts = [...newPostsWithId, ...state.posts];

            // Если watchState реактивный, обновляем его тоже
            if (watchState && typeof watchState.posts === 'object') {
              watchState.posts = [...newPostsWithId, ...watchState.posts];
            }
          }
        })
        .catch((error) => {
        })
        .finally(() => {
          intervalId = setTimeout(updateFeeds, 5000);
        });
    };

    // Запускаем обновление
    intervalId = setTimeout(updateFeeds, 5000);
  };

  const watchState = initView(elements, state); // реактивное представление, автоматически вызывают обновление пользовательского интерфейса.

  elements.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const url = elements.input.value.trim();
    const feedsList = state.feeds.map(feed => feed.url) // URL всех уже добавленных фидов
    try { // валидация по схеме
      await createSchema(url, feedsList, i18n);
      watchState.form.error = null
      watchState.form.processState = 'sending'

      const xmlString = await fetchRSS(url); //  Запрос к RSS-фиду через прокси
      watchState.form.processState = 'success'
      const { feed, posts } = parseRSS(xmlString); // Парсинг XML-данных

      const feedWithId = { //  Подготовка данных и добавление ID
        ...feed,
        url,
        id: uniqueId('feed_'),
      };

      const postsWithFeedId = posts.map(post => ({
        ...post,
        id: uniqueId('post_'),
        feedId: feedWithId.id,
      }));
      // Обновление состояния приложения
      watchState.feeds = [...watchState.feeds, feedWithId];
      watchState.posts = [...watchState.posts, ...postsWithFeedId];
      watchState.form.processState = 'finished';

      elements.input.value = ''; // очистка поля

      startUpdateInterval(); // запуск механизма автообновления

    } catch (error) { // обработка неудачного сценария
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
  // Добавляем обработчик для модального окна
  document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    if (modal) {
      modal.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget; // Кнопка, которая вызвала модальное окно
        const postId = button.getAttribute('data-id');

        // Находим пост по ID
        const post = state.posts.find(p => p.id === postId);

        if (post) {
          // Находим элементы модального окна
          const modalTitle = modal.querySelector('.modal-title');
          const modalBody = modal.querySelector('.modal-body');
          const fullArticleLink = modal.querySelector('.full-article');

          // Устанавливаем содержимое
          if (modalTitle) modalTitle.textContent = post.title;
          if (modalBody) modalBody.textContent = post.description;
          if (fullArticleLink) fullArticleLink.href = post.link;
        }
      });
    }
  });
};