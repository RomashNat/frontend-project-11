import * as yup from 'yup';

const createSchema = (url, existingUrls) => {
  yup.setLocale({
    string: {
      url: 'valid text',
    },
    mixed: {
      required: 'field',
      notOneOf: 'existingUrls'
    }
  })
  const schema = yup.string().required().url().notOneOf(existingUrls);
  return schema.validate(url)
};

export default createSchema;