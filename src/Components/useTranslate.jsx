import { useState, useEffect } from "react";

const useTranslate = (lang) => {
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    fetch(`/locales/${lang}.json`)
      .then((response) => response.json())
      .then((data) => setTranslations(data))
      .catch((error) => console.error("Error loading language file:", error));
  }, [lang]);

  return translations;
};

export default useTranslate;
