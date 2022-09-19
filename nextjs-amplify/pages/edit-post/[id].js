import { useEffect, useRef, useState } from 'react';
import { API, Storage, withSSRContext } from 'aws-amplify';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { v4 as uuid } from 'uuid';
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
  const router = useRouter();
  const { id } = router.query;
  const [content, setContent] = useState(post.content);
  const [coverImage, setCoverImage] = useState(null);
  const [localImage, setLocalImage] = useState(null);
  const fileInput = useRef(null);

  useEffect(() => {
    if (post.coverImage) {
      updateCoverImage(post.coverImage);
    }
  }, [id]);

  async function updateCoverImage(coverImage) {
    const imageKey = await Storage.get(coverImage);
    setCoverImage(imageKey);
  }

  async function uploadImage() {
    fileInput.current.click();
  }

  function handleImageChange(e) {
    const fileUpload = e.target.files[0];
    if (!fileUpload) return;
    setCoverImage(fileUpload);
    setLocalImage(URL.createObjectURL(fileUpload));
  }

  async function updateCurrentPost(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const title = form.get('title');

    if (!title || !content) return;

    const postUpdate = { title, content, id };

    if (coverImage && localImage) {
      const fileName = `${coverImage.name}_${uuid()}`;
      postUpdate.coverImage = fileName;
      await Storage.put(fileName, coverImage);
    }

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
      {coverImage && (
        <img src={localImage ? localImage : coverImage} className="mt-4" />
        // <Image
        //   src={coverImage}
        //   className="mt-4"
        //   alt={post.title}
        //   width="100%"
        //   height="400px"
        //   layout="fill"
        //   objectFit="cover"
        //   objectPosition="center center"
        // />
      )}
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
      <input
        type="file"
        ref={fileInput}
        className="absolute w-0 h-0"
        onChange={handleImageChange}
      />
      <button
        className="bg-purple-600 text-white font-semibold px-8 py-2 rounded-lg mr-2"
        onClick={uploadImage}
        type="button"
      >
        Upload Cover Image
      </button>
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
