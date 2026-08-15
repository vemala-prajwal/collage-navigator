import { useEffect } from 'react';

export default function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Campus Navigator`;
    }

    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);
}
