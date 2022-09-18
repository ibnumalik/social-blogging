import { API } from 'aws-amplify';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';

import { listPosts, getPost } from '../../graphql/queries';

export default function Post({ post }) {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-5xl mt-4 font-semibold tracking-wide">
        {post.title}
      </h1>
      <p className="text-sm font-light my-4">
        by {post.username || 'Anonymous'}
      </p>
      <div className="mt-8">
        <ReactMarkdown className="prose" children={post.content} />
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  const postData = await API.graphql({ query: listPosts });
  const paths = postData.data.listPosts.items.map((post) => ({
    params: { id: post.id },
  }));

  return { paths, fallback: true };
}

export async function getStaticProps({ params }) {
  const { id } = params;
  const postData = await API.graphql({ query: getPost, variables: { id } });

  return { props: { post: postData.data.getPost } };
}
