type This = {
  required: () => This
  valid: () => string | true
  min: (this: This, _value: number) => This
  max: (this: This, _value: number) => This
}

export function number(value?: number | null) {
  let isValid = true
  let errorMessage = ''

  const setErrorMessage = (message: string) => {
    if (errorMessage === '') {
      errorMessage = message
    }
  }

  function required(this: This) {
    if (value === null || value === undefined) {
      isValid = false
      setErrorMessage('Обязательное поле')
    }
    return this
  }

  function min(this: This, _value: number) {
    if (value === null || value === undefined || value < _value) {
      isValid = false
      setErrorMessage('Значение должно быть больше или равно ' + _value)
    }
    return this
  }

  function max(this: This, _value: number) {
    if (value === null || value === undefined || value > _value) {
      isValid = false
      setErrorMessage('Значение должно быть меньше или равно ' + _value)
    }
    return this
  }

  function valid(this: This) {
    if (isValid) return true
    return errorMessage
  }
  return { required, valid, min, max }
}
