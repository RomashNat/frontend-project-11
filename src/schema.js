import * as yup from 'yup';

const createSchema= (url, existingUrls) => {
  const schema = yup.string().required().url().notOneOf(existingUrls);
// создает schema для строки, поле обязательно, должен быть валидный URL, не должен быть в списке существующих URL
  return schema
    .validate(url) // проверяет конкретное значение против schema
    .then(() => null); // разрешается в null при успехе
};

export default createSchema;