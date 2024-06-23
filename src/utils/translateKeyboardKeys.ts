//prettier-ignore
const enToRuMap: Record<string, string> = {
  'q': 'й', 'w': 'ц', 'e': 'у', '`': 'ё', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г',
  'i': 'ш', 'o': 'щ', 'p': 'з', '[': 'х', ']': 'ъ', 'a': 'ф', 's': 'ы',
  'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д',
  ';': 'ж', "'": 'э', 'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и',
  'n': 'т', 'm': 'ь', ',': 'б', '.': 'ю',
  
  'Q': 'Й', 'W': 'Ц', 'E': 'У', '~': 'Ё', 'R': 'К', 'T': 'Е', 'Y': 'Н', 'U': 'Г',
  'I': 'Ш', 'O': 'Щ', 'P': 'З', '{': 'Х', '}': 'Ъ', 'A': 'Ф', 'S': 'Ы',
  'D': 'В', 'F': 'А', 'G': 'П', 'H': 'Р', 'J': 'О', 'K': 'Л', 'L': 'Д',
  ':': 'Ж', '"': 'Э', 'Z': 'Я', 'X': 'Ч', 'C': 'С', 'V': 'М', 'B': 'И',
  'N': 'Т', 'M': 'Ь', '<': 'Б', '>': 'Ю'
}

//prettier-ignore
const ruToEnMap: Record<string, string>  = {
  'ф': 'a', 'и': 'b', 'с': 'c', 'в': 'd', 'у': 'e',
  'а': 'f', 'п': 'g', 'р': 'h', 'ш': 'i', 'о': 'j',
  'л': 'k', 'д': 'l', 'ь': 'm', 'т': 'n', 'щ': 'o',
  'з': 'p', 'й': 'q', 'к': 'r', 'ы': 's', 'е': 't',
  'г': 'u', 'м': 'v', 'ц': 'w', 'ч': 'x', 'н': 'y',
  'я': 'z',

  'Ф': 'A', 'И': 'B', 'С': 'C', 'В': 'D', 'У': 'E', 
  'А': 'F', 'П': 'G', 'Р': 'H', 'Ш': 'I', 'О': 'J',
  'Л': 'K', 'Д': 'L', 'Ь': 'M', 'Т': 'N', 'Щ': 'O', 
  'З': 'P', 'Й': 'Q', 'К': 'R', 'Ы': 'S', 'Е': 'T',
  'Г': 'U', 'М': 'V', 'Ц': 'W', 'Ч': 'X', 'Н': 'Y', 
  'Я': 'Z'
}

const keyTranslation = (
  text: string,
  mapChars: Record<string, string>
): string => text.replace(/./g, (char) => mapChars[char] || char)

export const translateKeysRuToEn = (ruText: string) =>
  keyTranslation(ruText, ruToEnMap)
export const translateKeysEnToRu = (enText: string) =>
  keyTranslation(enText, enToRuMap)
