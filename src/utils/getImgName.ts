export const getImgName = (url: string): string => {
  return url.split('/').reverse()[0]
}
