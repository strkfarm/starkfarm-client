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
      console.log(`zkLend 3`);
      try {
        const urlPrefix =
          typeof window === 'undefined' && !url.includes('http')
            ? 'http://localhost:3000'
            : '';
        console.log(`zkLend 4`, `${urlPrefix}${url}`);
        const options = args.fetchOptions || { method: 'GET' };
        console.log(`zkLend 5`, options);
        const res = await fetch(`${urlPrefix}${url}`, options);
        console.log(`zkLend 6`, res);
        if (!res.ok) {
          console.error('Error fetching url', res.statusText);
          throw new Error('Error fetching url');
        }
        console.log(`zkLend 5`);
        return res.json();
      } catch (err) {
        console.error('Error fetching url', err);
        throw err;
      }
    },
  });
};
