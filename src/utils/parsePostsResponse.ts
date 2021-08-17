import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

function parsePost(post: Post) {
  return {
    uid: post.uid,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
  };
}

export default function parsePostsResponse(postsResponse: Post[]) {
  return postsResponse.map(post => {
    return parsePost(post);
  });
}
