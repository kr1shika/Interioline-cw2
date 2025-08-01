// utils/csrf.js
export const getCsrfToken = async () => {
  const res = await fetch("https://localhost:2005/api/csrf-token", {
    credentials: "include"
  });
  const data = await res.json();
  return data.csrfToken;
};
