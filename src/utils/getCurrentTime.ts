export const getCurrentTime = async (): Promise<Date | null> => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const response = await fetch('https://worldtimeapi.org/api/timezone/' + tz)
    const data = await response.json()
    return data.datetime
  } catch (error) {
    console.error(error)
    return null
  }
}
