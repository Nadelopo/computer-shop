export const formatPhoneNumber = (phoneNumber: number) => {
  const digits = String(phoneNumber)
  if (digits.length === 11) {
    //prettier-ignore
    return `+${digits.charAt(0)} (${digits.substring(1, 4)}) ${digits.substring(4, 7)} ${digits.substring(7, 9)}-${digits.substring(9, 11)}`;
  } else {
    return phoneNumber
  }
}
