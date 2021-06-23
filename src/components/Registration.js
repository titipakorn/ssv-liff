import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import React from "react";
import { useForm } from "react-hook-form";

export default function Registration({
  userID,
  liff,
  displayName,
  profileURL,
}) {
  const { data, loading } = useQuery(USER_QUERY, {
    variables: {
      userID,
    },
    skip: !userID,
  });

  const registered = data && data.items && data.items.length > 0;
  if (!userID) {
    return <></>;
  }
  return (
    <div>
      <h1 className="title is-2">Registration</h1>
      {registered && (
        <div>
          Already registered, thank you. However, you can update your
          information if needed.
        </div>
      )}
      <hr />
      <RegisterForm
        userID={userID}
        displayName={displayName}
        profileURL={profileURL}
      />
      <hr />
    </div>
  );
}

function RegisterForm({ userID, profileURL, displayName }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [saveThis, { loading }] = useMutation(USER_CREATE, {
    refetchQueries: {
      query: USER_QUERY,
      variables: { userID },
    },
  });
  const onSubmit = async (data) => {
    let body = {
      ...data,
      profileURL,
      userID,
    };
    console.log(body);
    const res = await saveThis({ variables: body });
    console.log("mutate result: ", res);
  };
  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form onSubmit={handleSubmit(onSubmit)} className="content">
      {/* register your input into the hook by invoking the "register" function */}
      <div className="field">
        <label className="label">Line ID</label>
        <div className="control">
          <input
            className="input"
            type="text"
            defaultValue={displayName}
            {...register("lineID", { required: true })}
          />
        </div>
        {errors.lineID && <p className="help is-danger">Line ID is required</p>}
      </div>
      {errors.email && <span>This field is required</span>}

      <div className="field">
        <label className="label">Email</label>
        <div className="control">
          <input
            className="input"
            type="email"
            {...register("email", { required: true })}
          />
        </div>
        {errors.email && <p className="help is-danger">Email is required</p>}
      </div>

      <div className="field">
        <label className="label">Phone #</label>
        <div className="control">
          <input className="input" type="tel" {...register("tel")} />
        </div>
        {errors.tel && <p className="help is-danger">Phone is required</p>}
      </div>

      <div className="field is-grouped">
        <div className="control">
          <button className="button is-link">Submit</button>
        </div>
      </div>
    </form>
  );
}

const USER_QUERY = gql`
  query USER_QUERY($userID: String!) {
    items: user(where: { line_user_id: { _eq: $userID } }) {
      id
      username
      email
      role
      lang
      profile_url
    }
  }
`;

const USER_CREATE = gql`
  mutation USER_CREATE(
    $userID: String!
    $lineID: String!
    $email: String!
    $profileURL: String!
    $tel: String
  ) {
    insert_user_one(
      object: {
        line_user_id: $userID
        username: $lineID
        email: $email
        tel: $tel
        role: "user"
        lang: "ja"
        profile_url: ""
      }
      on_conflict: {
        constraint: user_line_user_id_key
        update_columns: [username, email, profile_url, tel]
      }
    ) {
      id
      username
      email
      tel
      role
      lang
      profile_url
    }
  }
`;
