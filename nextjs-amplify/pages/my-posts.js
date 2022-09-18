import { withAuthenticator } from '@aws-amplify/ui-react';
import { API, Auth } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { postsByUsername } from '../graphql/queries';

function MyPostsList({ user }) {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const postData = await API.graphql({
      query: postsByUsername,
      variables: { user },
    });
    setPosts(postData.data.postsByUsername.items);
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">
        My Posts
      </h1>
      {posts.map((post, index) => (
        <Link key={index} href={`/posts/${post.id}`}>
          <div className="cursor-pointer border-b border-gray-300	mt-8 pb-4">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-500 mt-2">Author: {post.username}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function MyPosts({ user }) {
  if (!user) return null;

  return <MyPostsList user={user} />;
}

export default withAuthenticator(MyPosts);
