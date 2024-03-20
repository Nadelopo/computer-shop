type This = {
  required: () => This
  email: () => This
  valid: () => string | true
  equal: (this: This, _value: string) => This
  min: (this: This, min: number) => This
  max: (this: This, max: number) => This
}

export function string(value?: string | null) {
  let isValid = true
  let errorMessage = ''

  const setErrorMessage = (message: string) => {
    if (errorMessage === '') {
      errorMessage = message
    }
  }

  function required(this: This) {
    if (value === '' || value === null || value === undefined) {
      isValid = false
      setErrorMessage('Обязательное поле')
    }
    return this
  }

  function email(this: This) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9]{1,}$/
    if (!re.test(value ?? '') || value?.includes('..')) {
      isValid = false
      setErrorMessage('Укажите полный адрес электронной почты')
    }
    return this
  }

  function equal(this: This, _value: string) {
    if (value !== _value) {
      isValid = false
      setErrorMessage('Значения не совпадают')
    }
    return this
  }

  function notEqual(this: This, _value: string) {
    if (value === _value) {
      isValid = false
      setErrorMessage('Значения не совпадают')
    }
    return this
  }

  function min(this: This, min: number) {
    if (!value || value.length < min) {
      isValid = false
      setErrorMessage(`Минимальная длина ${min}`)
    }
    return this
  }

  function max(this: This, max: number) {
    if (!value || value.length > max) {
      isValid = false
      setErrorMessage(`Максимальная длина ${max}`)
    }
    return this
  }

  function valid(this: This) {
    if (isValid) return true
    return errorMessage
  }
  return { required, email, valid, equal, notEqual, min, max }
}
