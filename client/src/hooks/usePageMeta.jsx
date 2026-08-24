import { useEffect } from 'react';

const BASE_TITLE = 'Campus Navigator';

export default function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    const previousTitle = document.title;
    let metaDescription = document.querySelector('meta[name="description"]');
    const createdMetaDescription = !metaDescription;
    const previousDescription = metaDescription?.getAttribute('content') || '';

    if (!metaDescription && description) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }

    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    if (description && metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    return () => {
      document.title = previousTitle || BASE_TITLE;
      if (metaDescription) {
        if (createdMetaDescription) {
          metaDescription.remove();
        } else {
          metaDescription.setAttribute('content', previousDescription);
        }
      }
    };
  }, [title, description]);
}
