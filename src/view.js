import onChange from 'on-change';

export default (elements, state) => {
  const renderValidation = () => {
    const { error } = state.form;
    const feedback = elements.feedback;
    const input = elements.input;

    if (error) {
      input.classList.add('is-invalid');
      feedback.textContent = error;
      feedback.classList.add('text-danger');
      feedback.classList.remove('text-success');
    } else {
      input.classList.remove('is-invalid');
      feedback.textContent = '';
    }
  };

  const renderFormState = () => {
    const { processState } = state.form;
    const input = elements.input;
    const button = elements.button;
    const feedback = elements.feedback;

    switch (processState) {
      case 'processing':
        input.setAttribute('readonly', true);
        button.setAttribute('disabled', true);
        break;
      case 'success':
        input.removeAttribute('readonly');
        button.removeAttribute('disabled');
        elements.form.reset();
        input.focus();
        feedback.textContent = 'RSS успешно загружен';
        feedback.classList.remove('text-danger');
        feedback.classList.add('text-success');
        break;
      case 'failed':
        input.removeAttribute('readonly');
        button.removeAttribute('disabled');
        break;
      default:
        break;
    }
  };

  const renderFeeds = () => {
    const container = elements.feedsContainer;
    container.innerHTML = '';

    if (state.feeds.length === 0) return;

    const card = document.createElement('div');
    card.className = 'card border-0';
    container.appendChild(card);


    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    card.appendChild(cardBody);

    const title = document.createElement('h2');
    title.className = 'card-title h4';
    title.textContent = 'Фиды';

    cardBody.appendChild(title);
    card.appendChild(cardBody);

    const list = document.createElement('ul');
    list.className = 'list-group border-0 rounded-0';

    state.feeds.forEach(feed => {
      const item = document.createElement('li');
      item.className = 'list-group-item border-0 border-end-0';

      const itemTitle = document.createElement('h3');
      itemTitle.className = 'h6 m-0';
      itemTitle.textContent = feed.title;

      const itemDescription = document.createElement('p');
      itemDescription.className = 'm-0 small text-muted';
      itemDescription.textContent = feed.description;

      item.appendChild(itemTitle);
      item.appendChild(itemDescription);
      list.appendChild(item);
    });

    card.appendChild(list);
    container.appendChild(card);
  };

  const renderPosts = () => {
    const container = elements.postsContainer;
    container.innerHTML = '';

    if (state.posts.length === 0) return;

    const card = document.createElement('div');
    card.className = 'card border-0';
    container.appendChild(card);

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    card.appendChild(cardBody);

    const title = document.createElement('h2');
    title.className = 'card-title h4';
    title.textContent = 'Посты';

    cardBody.appendChild(title);
    card.appendChild(cardBody);

    const list = document.createElement('ul');
    list.className = 'list-group border-0 rounded-0';

    state.posts.forEach(post => {
      const item = document.createElement('li');
      item.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';

      const link = document.createElement('a');
      link.href = post.link;
      link.className = state.viewedPosts.has(post.id) ? 'fw-normal link-secondary' : 'fw-bold';
      link.setAttribute('data-id', post.id);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.textContent = post.title;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-outline-primary btn-sm';
      button.setAttribute('data-id', post.id);
      button.setAttribute('data-bs-toggle', 'modal');
      button.setAttribute('data-bs-target', '#modal');
      button.textContent = 'Просмотр';
      button.setAttribute('data-title', post.title);
      button.setAttribute('data-description', post.description);
      const modalTitle = document.createElement('modalTitle');
      const modalDescription = document.createElement('modalDescription');
      modalTitle.textContent = post.title;
      modalDescription.textContent = post.description;


      item.appendChild(link);
      item.appendChild(button);
      list.appendChild(item);
    });

    card.appendChild(list);
    container.appendChild(card);
  };

  return onChange(state, (path) => {
    switch (path) {
      case 'form.error':
        renderValidation();
        break;
      case 'form.processState':
        renderFormState();
        break;
      case 'feeds':
        renderFeeds();
        break;
      case 'posts':
        renderPosts();
        break;
      case 'viewedPosts':
        renderPosts();
        break;
      default:
        break;
    }
  });
};