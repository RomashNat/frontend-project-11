export default (xmlString) => {
    const parser = new DOMParser(); // Создает объект для преобразования строк в DOM-дерево
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml'); //  преобразует XML строку в DOM-документ

    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
        const error = new Error(parseError.textContent);
        error.name = 'ParseError';
        throw error;
    }

    const channel = xmlDoc.querySelector('channel'); // основной контейнер RSS
    if (!channel) {
        throw new Error('Channel not found in RSS');
    }

    const titleElement = channel.querySelector('title'); // элемент с заголовком RSS-ленты
    const descriptionElement = channel.querySelector('description'); // элемент с описанием RSS-ленты

    const feed = { // Создает объект с информацией о RSS-ленте
        title: titleElement ? titleElement.textContent : '',
        description: descriptionElement ? descriptionElement.textContent : '',
    };

    const items = xmlDoc.querySelectorAll('item'); // находит все элементы <item> (посты в RSS)
    const posts = Array.from(items).map((item) => { // Преобразование элементов в посты
        const itemTitleElement = item.querySelector('title'); // .map() - преобразует каждый элемент в объект поста
        const itemDescriptionElement = item.querySelector('description');
        const itemLinkElement = item.querySelector('link');
        const itemPubDateElement = item.querySelector('pubDate');
        // Для каждого item находим элементы один раз и сохраняем в переменные
        return {
            title: itemTitleElement ? itemTitleElement.textContent : '',
            description: itemDescriptionElement ? itemDescriptionElement.textContent : '',
            link: itemLinkElement ? itemLinkElement.textContent : '',
            pubDate: itemPubDateElement ? itemPubDateElement.textContent : '',
        // Создаем объект поста с безопасными проверками на существование элементов
        };
    });

    return { feed, posts };
}; // feed -  информация о RSS-ленте (заголовок и описание);
   // post -  массив постов (каждый с title, description, link, pubDate);