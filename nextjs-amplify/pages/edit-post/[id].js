import { useState } from 'react';
import { API, withSSRContext } from 'aws-amplify';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import 'easymde/dist/easymde.min.css';
import { updatePost } from '../../graphql/mutations';
import { getPost } from '../../graphql/queries';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
});

export async function getServerSideProps({ req, query }) {
  const { API } = withSSRContext({ req });

  try {
    const post = await API.graphql({
      query: getPost,
      variables: { id: query.id },
    });

    return {
      props: { post: post.data.getPost },
    };
  } catch (error) {
    console.log('error happened', error);
  }
}

function EditPost({ post }) {
  const [content, setContent] = useState(post.content);
  const router = useRouter();
  const { id } = router.query;

  async function updateCurrentPost(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const title = form.get('title');

    if (!title || !content) return;

    const postUpdate = { title, content, id };
    await API.graphql({
      query: updatePost,
      variables: { input: postUpdate },
      authMode: 'AMAZON_COGNITO_USER_POOLS',
    });

    router.push('/my-posts');
  }

  if (!post) return <div>Loading...</div>;

  return (
    <form onSubmit={updateCurrentPost}>
      <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">
        Edit post
      </h1>
      <input
        name="title"
        placeholder="Title"
        defaultValue={post.title}
        className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 y-2"
      />
      <SimpleMDE
        value={content}
        onChange={(value) => setContent({ content: value })}
      />
      <button
        className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
        type="submit"
      >
        Update Post
      </button>
    </form>
  );
}

export default EditPost;
