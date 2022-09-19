import { withAuthenticator } from '@aws-amplify/ui-react';
import { useCallback, useRef, useState } from 'react';
import { API, Storage } from 'aws-amplify';
import { v4 as uuid } from 'uuid';
import { useRouter } from 'next/router';
import Image from 'next/image';
import SimpleMDEEditor from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { createPost } from '../graphql/mutations';

const initialState = { title: '', content: '' };

function CreatePost() {
  const [post, setPost] = useState(initialState);
  const [image, setImage] = useState(null);
  const hiddenFileInput = useRef(null);
  const { title, content } = post;
  const router = useRouter();

  const onChange = useCallback(
    (e) => {
      setPost(() => ({ ...post, [e.target.name]: e.target.value }));
    },
    [post]
  );

  async function createNewPost() {
    if (!title || !content) return;
    const id = uuid();
    post.id = id;

    if (image) {
      const fileName = `${image.name}_${uuid()}`;
      post.coverImage = fileName;
      await Storage.put(fileName, image);
    }

    await API.graphql({
      query: createPost,
      variables: { input: post },
      authMode: 'AMAZON_COGNITO_USER_POOLS',
    });

    router.push(`/posts/${id}`);
  }

  function uploadImage() {
    hiddenFileInput.current.click();
  }

  function handleChange(e) {
    const fileUploaded = e.target.files[0];
    if (!fileUploaded) return;
    setImage(fileUploaded);
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6">
        Create new post
      </h1>
      <input
        onChange={onChange}
        name="title"
        placeholder="Title"
        value={post.title}
        className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 y-2"
      />

      {image && (
        <div className="h-[400px] relative">
          <Image
            alt={post.title + ' cover image'}
            src={URL.createObjectURL(image)}
            className="my-4"
            width="100%"
            height="400px"
            layout="fill"
            objectFit="cover"
            objectPosition="center center"
          />
        </div>
      )}
      <SimpleMDEEditor
        value={post.content}
        onChange={(value) => setPost({ ...post, content: value })}
      />
      <div className="cover-image">
        <input
          type="file"
          ref={hiddenFileInput}
          className="absolute w-0 h-0"
          onChange={handleChange}
        />
        <button
          onClick={uploadImage}
          className="bg-purple-600 text-white font-semibold px-8 py-2 rounded-lg mr-2 mb-4"
        >
          Upload cover image
        </button>
      </div>
      <button
        type="button"
        className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
        onClick={createNewPost}
      >
        Create Post
      </button>
    </div>
  );
}

export default withAuthenticator(CreatePost);
