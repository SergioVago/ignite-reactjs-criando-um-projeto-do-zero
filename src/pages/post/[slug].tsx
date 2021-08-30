import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { v4 as uuid } from 'uuid';
import { useMemo } from 'react';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Content {
  heading: string;
  body: {
    text: string;
  }[];
}

interface Post {
  first_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: Content[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const readTime = useMemo(() => {
    const wordTotalCount = post.data.content.reduce(
      (totalAcc: number, data: Content) => {
        const bodyText = RichText.asText(data.body);

        const wordHeadingCount = data.heading.split(' ').length;
        const wordBodyCount = bodyText.split(' ').length;

        return totalAcc + wordHeadingCount + wordBodyCount;
      },
      0
    );

    const humanWordReadTime = 200;

    const readTimeCalc = Math.ceil(wordTotalCount / humanWordReadTime);

    return readTimeCalc;
  }, [post.data.content]);

  const parsedFirstPublicationDate = useMemo(() => {
    return format(new Date(post.first_publication_date), 'dd MMM yyyy', {
      locale: ptBR,
    });
  }, [post.first_publication_date]);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />

      <img alt="banner" src={post.data.banner.url} className={styles.banner} />

      <main className={commonStyles.container}>
        <div className={styles.post}>
          <strong className={styles.postHeader}>{post.data.title}</strong>

          <div className={commonStyles.info}>
            <FiCalendar size="20" />
            <time>{parsedFirstPublicationDate}</time>
            <FiUser size="20" />
            <span>{post.data.author}</span>
            <FiClock size="20" />
            <span>{readTime} min</span>
          </div>

          <section>
            {post.data.content.map(content => {
              return (
                <div className={styles.postContent} key={uuid()}>
                  <div className={styles.heading}>{content.heading}</div>
                  <div
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </div>
              );
            })}
          </section>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      author: response.data.author,
      banner: response.data.banner,
      content: response.data.content,
      title: response.data.title,
      subtitle: response.data.subtitle,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 1, // 1 minute
  };
};
