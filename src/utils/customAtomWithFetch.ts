import { customAtomWithQuery } from './customAtomWithQuery';

export const customAtomWithFetch = (args: {
  url: string;
  queryKey: string;
  fetchOptions?: any;
}) => {
  const { url, queryKey } = args;
  return customAtomWithQuery({
    queryKey,
    queryFn: async () => {
      try {
        const urlPrefix =
          typeof window === 'undefined' && !url.includes('http')
            ? 'http://localhost:3000'
            : '';
        const options = args.fetchOptions || { method: 'GET' };
        const res = await fetch(`${urlPrefix}${url}`, options);
        if (!res.ok) {
          console.error('Error fetching url', res.statusText);
          throw new Error('Error fetching url');
        }
        return res.json();
      } catch (err) {
        console.error('Error fetching url', err);
        throw err;
      }
    },
  });
};
