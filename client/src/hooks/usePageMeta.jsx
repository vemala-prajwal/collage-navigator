import { useEffect } from 'react';

export default function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    if (title) {
      document.title = `${title} — Campus Navigator`;
    }

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }

    return () => {
      /* no cleanup required */
    };
  }, [title, description]);
}
