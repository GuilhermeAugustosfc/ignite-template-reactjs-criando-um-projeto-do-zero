import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import { RichText } from 'prismic-dom';
import Link from 'next/link';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';

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
}

export default function Home({ postsPagination }: HomeProps) {
  const [post, setPost] = useState<PostPagination>(postsPagination);

  const onHandlePagination = async () => {
    const response = await fetch(postsPagination.next_page);
    const data = await response.json();
    const newPost: Post[] = data.results.map(post => ({
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: RichText.asText(post.data.title),
        subtitle: RichText.asText(post.data.subtitle),
        author: RichText.asText(post.data.author),
      },
    }));
    setPost(state => {
      return {
        next_page: data.next_page,
        results: [...state.results, ...newPost],
      };
    });
  };

  return (
    <main className={commonStyles.containerPosts}>
      {post.results.map(post => (
        <Link href={`/post/${post.uid}`} key={post.uid}>
          <a>
            <article className={styles.post}>
              <div className={styles.title}>{post.data.title}</div>
              <div className={commonStyles.subtitle}>{post.data.subtitle}</div>
              <div className={commonStyles.containerInfo}>
                <span>
                  <FiCalendar />
                  {post.first_publication_date}
                </span>
                <span>
                  <FiUser /> {post.data.author}
                </span>
              </div>
            </article>
          </a>
        </Link>
      ))}
      {post.next_page && (
        <button className={styles.loadPost} onClick={onHandlePagination}>
          Carregar mais posts
        </button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const response = await prismic.getByType('ignite_desafio', {
    pageSize: 1,
  });

  const posts = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: RichText.asText(post.data.title),
        subtitle: RichText.asText(post.data.subtitle),
        author: RichText.asText(post.data.author),
      },
    };
  });
  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts,
      },
    },
  };
};
