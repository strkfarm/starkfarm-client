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
      const urlPrefix =
        typeof window === 'undefined' && !url.includes('http')
          ? process.env.HOSTNAME || 'https://app.strkfarm.xyz'
          : '';

      try {
        const options = args.fetchOptions || { method: 'GET' };
        const res = await fetch(`${urlPrefix}${url}`, options);
        if (!res.ok) {
          console.error(
            'Error fetching url',
            `${urlPrefix}${url}`,
            res.statusText,
          );
          throw new Error('Error fetching url');
        }
        return res.json();
      } catch (err) {
        console.error('Error fetching url', `${urlPrefix}${url}`, err);
        throw err;
      }
    },
  });
};
