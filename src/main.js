import initView from './view.js';
import createSchema from './schema.js';
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

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
  };

  const watchState = initView(elements, state);

  elements.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const url = elements.input.value
    const feedsList = watchState.feeds.map(feed => feed.url)
    console.log(url)
    try {
      createSchema(url, feedsList);
      watchState.form.processState = 'sending'
    } catch (error) {
      watchState.form.processState = 'failed'
      watchState.form.error = error.message
      console.log(error.message)
    }
  })
};



