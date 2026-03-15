
export const setCookie = (name: string, value: any, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  
  const encodedValue = encodeURIComponent(JSON.stringify(value));

  document.cookie = `${name}=${encodedValue};expires=${date.toUTCString()};path=/;Secure;SameSite=Strict`;
};

export const getCookie = (name: string) => {
  const nameEQ = name + "=";
  const cookiesArray = document.cookie.split(';');
  
  for (let i = 0; i < cookiesArray.length; i++) {
    let cookie = cookiesArray[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      const rawValue = cookie.substring(nameEQ.length, cookie.length);
      try {
        return JSON.parse(decodeURIComponent(rawValue));
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};