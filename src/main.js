import axios from 'axios';
import initView from './view.js';
import createSchema from './schema.js';
import './style.css'
import javascriptLogo from './javascript.svg'
import { setupCounter } from './counter.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

export default () => {

  const elements = {
    form: document.querySelector('.rss-form'),
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
    },
    feeds: [], // Список RSS-фидов, массив добавленных RSS-лент
    posts: [], // писок постов из всех фидов, массив всех полученных постов
    viewedPosts: new Set(), // Множество ID просмотренных постов
  };
};

 document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`

setupCounter(document.querySelector('#counter'))


