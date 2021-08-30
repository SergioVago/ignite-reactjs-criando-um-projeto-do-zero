import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { v4 as uuid } from 'uuid';
import { useMemo } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../../components/Comments';
import ExitPreviewButton from '../../components/ExitPreviewButton';

interface Content {
  heading: string;
  body: {
    text: string;
  }[];
}

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  preview: boolean;
}

export default function Post({ post, preview }: PostProps) {
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

  const parsedLastPublicationDate = useMemo(() => {
    return format(
      new Date(post.first_publication_date),
      "'* editado em' dd MMM yyyy, 'às' hh:mm",
      {
        locale: ptBR,
      }
    );
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

          <div className={`${commonStyles.info} ${styles.lastPublicationDate}`}>
            <time>
              <i>{parsedLastPublicationDate}</i>
            </time>
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

      <footer className={`${commonStyles.container} ${styles.footer}`}>
        <hr />
        <div className={styles.nestedPosts}>
          <div>
            <p>Como utilizar Hooks</p>
            <a>Post Anterior</a>
          </div>
          <div className={styles.nextPost}>
            <p>Criando um app CRA do Zero</p>
            <a>Próximo Post</a>
          </div>
        </div>

        <Comments />

        {preview && <ExitPreviewButton />}
      </footer>
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
}) => {
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
    last_publication_date: response.last_publication_date,
  };

  return {
    props: {
      post,
      preview,
    },
    revalidate: 1, // 1 minute
  };
};
