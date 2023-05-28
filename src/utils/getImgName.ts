export const getImgName = (url: string) => {
  return url.split('/').reverse()[0]
}
