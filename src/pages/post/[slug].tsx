import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  total_characher_body: number;
}

export default function Post({ post, total_characher_body }: PostProps) {
  const CHARACTER_POR_MINUTS = 200;

  if (!post) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <img className={styles.banner} src={post.data.banner.url} alt="banner" />
      <main className={commonStyles.containerPosts}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <div className={commonStyles.containerInfo}>
          <span>
            <FiCalendar />
            {post.first_publication_date}
          </span>
          <span>
            <FiUser /> {post.data.author}
          </span>
          <span className={styles.time_reading}>
            <FiClock />
            {Math.round(total_characher_body / CHARACTER_POR_MINUTS)} min
          </span>
        </div>
        <div className={styles.containerContent}>
          {post.data.content.map(content => (
            <div key={content.heading}>
              <h1>{content.heading}</h1>
              {content.body.map(({ text }, i) => (
                <div key={i} dangerouslySetInnerHTML={{ __html: text }} />
              ))}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('ignite_desafio');
  // const paths = posts.results.map(post => ({ params: { slug: post.uid } })); // nos teste pedia esse formato
  const paths = posts.results.map(post => `post/${post.uid}`); // porem as 'path' da minha rota sao nesse formato.

  return {
    paths: paths,
    fallback: true,
  };
  // TODO
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug: string = params.slug as string;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('ignite_desafio', slug);

  const post = {
    uid: response.uid,
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: RichText.asText(response.data.title),
      subtitle: RichText.asText(response.data.subtitle),
      author: RichText.asText(response.data.author),
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => ({
        heading: RichText.asText(content.heading),
        body: [{ text: RichText.asHtml(content.body) }],
      })),
    },
  };
  const total_characher_body = response?.data.content.reduce(
    (total, content) => {
      const character_heading_total = RichText.asText(content.heading).split(
        ' '
      ).length;
      const total_body = RichText.asText(content.body).split(' ').length;

      return (total += character_heading_total + total_body);
    },
    0
  );

  return {
    props: {
      post,
      total_characher_body,
    },
  };
  // TODO
};
