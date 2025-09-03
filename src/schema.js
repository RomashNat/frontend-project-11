import * as yup from 'yup' // настраиваем библиотеку для валидации схем

const createSchema = (url, existingUrls, i18n) => {
  yup.setLocale({ // Глобальные кастомные сообщения об ошибках - это пользовательские тексты ошибок, которые применяются ко всем схемам валидации во всем приложении.
    string: {
      url: i18n.t('form.errors.notValidUrl'), // .t() - метод "translate"
    },
    mixed: {
      required: i18n.t('form.errors.required'),
      notOneOf: i18n.t('form.errors.notUniqueUrl'),
    },
  })
  const schema = yup.string().required().url().notOneOf(existingUrls)
  return schema.validate(url) // Возвращает Promise, который разрешится при успешной валидации или отклонится с ошибками
}

export default createSchema
