import { withAuthenticator } from '@aws-amplify/ui-react';
import { API, withSSRContext } from 'aws-amplify';
import Link from 'next/link';

import { postsByUsername } from '../graphql/queries';
import { deletePost as deletePostMutation } from '../graphql/mutations';
import { useRouter } from 'next/router';

export async function getServerSideProps({ req }) {
  const { API, Auth } = withSSRContext({ req });

  try {
    const { username } = await Auth.currentAuthenticatedUser();
    const posts = await API.graphql({
      query: postsByUsername,
      variables: { username },
    });

    return {
      props: {
        posts: posts?.data?.postsByUsername?.items || [],
      },
    };
  } catch (error) {
    // @todo handle error user is not authenticated.
  }
}

function MyPostsList({ posts }) {
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  async function deletePost(id) {
    await API.graphql({
      query: deletePostMutation,
      variables: { input: { id } },
      authMode: 'AMAZON_COGNITO_USER_POOLS',
    });

    refreshData();
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">
        My Posts
      </h1>
      {posts?.map((post, index) => (
        <div key={index} className="border-b border-gray-300	mt-8 pb-4">
          <h2 className="text-xl font-semibold">{post.title}</h2>
          <p className="text-gray-500 mt-2 mb-2">Author: {post.username}</p>
          <Link href={`/edit-post/${post.id}`}>
            <a className="text-sm mr-4 text-blue-500">Edit Post</a>
          </Link>
          <Link href={`/posts/${post.id}`}>
            <a className="text-sm mr-4 text-blue-500">View Post</a>
          </Link>
          <button
            className="text-sm mr-4 text-red-500"
            onClick={() => deletePost(post.id)}
          >
            Delete Post
          </button>
        </div>
      ))}
    </div>
  );
}

function MyPosts({ user, posts }) {
  if (!user) return null;

  if (posts.length === 0) {
    return (
      <div>
        <p className="mb-4">You did not have any post yet. Go create one!</p>
        <Link href={`/create-post`}>
          <a className="bg-black px-4 py-2 rounded text-white inline-block">
            Create post
          </a>
        </Link>
      </div>
    );
  }

  return <MyPostsList user={user} posts={posts} />;
}

export default withAuthenticator(MyPosts);
