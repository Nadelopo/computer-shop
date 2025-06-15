import { setLocale, addMethod, string } from 'yup'

setLocale({
  string: {
    email: 'Укажите полный адрес электронной почты',
    min: (v) => {
      return `Минимальная длина ${v.min}`
    },
    max: (v) => {
      return `Максимальная длина ${v.max}`
    }
  },
  number: {
    min: (v) => {
      return `Значение должно быть больше или равно ${v.min}`
    },
    max: (v) => {
      return `Значение должно быть меньше или равно ${v.max}`
    }
  },
  mixed: {
    required: 'Обязательное поле'
  }
})

addMethod(string, 'phone', function () {
  return this.test('phone', 'Поле должно содержать 11 цифр', (value) => {
    if (value?.length !== 17) return false
    return true
  })
})

addMethod(string, 'onlyLetters', function () {
  return this.matches(/^[a-zA-Zа-яА-Я]+$/, 'Разрешены только буквы')
})

declare module 'yup' {
  interface StringSchema {
    phone(): this
    onlyLetters(): this
  }
}
