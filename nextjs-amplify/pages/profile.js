import { withAuthenticator } from '@aws-amplify/ui-react';

function Profile({ signOut, user }) {
  if (!user) return null;

  return (
    <div className="Profile">
      <h1 className="text-3xl font-semibold tracking-wide mt-6">Profile</h1>
      <h3 className="font-medium text-gray-500 my-2">
        Username: {user.username}
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Email: {user.attributes.email}
      </p>
      <button
        className="rounded bg-red-600 text-white px-4 py-2"
        onClick={signOut}
      >
        Sign out
      </button>
    </div>
  );
}

export default withAuthenticator(Profile);
