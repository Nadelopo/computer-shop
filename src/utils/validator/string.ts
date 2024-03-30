type This = {
  required: () => This
  email: () => This
  valid: () => string[] | true
  equal: (this: This, _value: string) => This
  min: (this: This, min: number) => This
  max: (this: This, max: number) => This
  onlyLetters: () => This
  phone: (this: This) => This
}

export function string(value?: string | null) {
  let isValid = true
  const errorMessages: string[] = []

  const setErrorMessage = (message: string) => {
    isValid = false
    if (!errorMessages.includes('Обязательное поле')) {
      errorMessages.push(message)
    }
  }

  function required(this: This) {
    if (
      value?.replaceAll(' ', '') === '' ||
      value === null ||
      value === undefined
    ) {
      setErrorMessage('Обязательное поле')
    }
    return this
  }

  function email(this: This) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9]{1,}$/
    if (!re.test(value ?? '') || value?.includes('..')) {
      setErrorMessage('Укажите полный адрес электронной почты')
    }
    return this
  }

  function equal(this: This, _value: string) {
    if (value !== _value) {
      setErrorMessage('Значения не совпадают')
    }
    return this
  }

  function notEqual(this: This, _value: string) {
    if (value === _value) {
      setErrorMessage('Значения не совпадают')
    }
    return this
  }

  function min(this: This, min: number) {
    if (!value || value.length < min) {
      setErrorMessage(`Минимальная длина ${min}`)
    }
    return this
  }

  function max(this: This, max: number) {
    if (!value || value.length > max) {
      setErrorMessage(`Максимальная длина ${max}`)
    }
    return this
  }

  function onlyLetters(this: This) {
    const re = /^[A-Za-zА-Яа-я]+$/
    if (!re.test(value ?? '')) {
      isValid = false
      setErrorMessage('Разрешены только буквы')
    }

    return this
  }

  function phone(this: This) {
    if (value?.length !== 17) {
      setErrorMessage('Поле должно содержать 11 цифр')
    }
    return this
  }

  function valid(this: This) {
    if (isValid) return true
    return errorMessages
  }

  return {
    required,
    email,
    valid,
    equal,
    notEqual,
    min,
    max,
    onlyLetters,
    phone
  }
}
