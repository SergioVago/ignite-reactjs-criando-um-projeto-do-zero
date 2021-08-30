import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';

import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { useState } from 'react';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import parsePostsResponse from '../utils/parsePostsResponse';
import ExitPreviewButton from '../components/ExitPreviewButton';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const { next_page, results } = postsPagination || {};

  const [posts, setPosts] = useState(() => {
    return parsePostsResponse(results);
  });
  const [nextPage, setNextPage] = useState(next_page);

  function handleLoadMorePosts() {
    fetch(nextPage)
      .then(response => response.json())
      .then((data: ApiSearchResponse) => {
        const postsResponse = parsePostsResponse(data.results);

        setPosts(atualPosts => {
          return [...atualPosts, ...postsResponse];
        });
        setNextPage(data.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Home | space traveling</title>
      </Head>

      <Header home />

      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts?.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={commonStyles.info}>
                  <FiCalendar size="20" />
                  <time>{post.first_publication_date}</time>
                  <FiUser size="20" />
                  <span>{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {nextPage && (
          <button
            type="button"
            className={styles.loadMorePostsButton}
            onClick={handleLoadMorePosts}
          >
            Carregar mais posts
          </button>
        )}
      </main>

      <footer className={commonStyles.container}>
        {preview && <ExitPreviewButton />}
      </footer>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.content'],
      pageSize: 1,
      ref: previewData?.ref ?? null,
    }
  );

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsResponse.results,
      },
      preview,
    },
  };
};
