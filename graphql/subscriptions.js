/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateMatch = /* GraphQL */ `
  subscription OnCreateMatch {
    onCreateMatch {
      id
      movieIds
      searchReference
      users {
        id
        email
        externalId
        username
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateMatch = /* GraphQL */ `
  subscription OnUpdateMatch {
    onUpdateMatch {
      id
      movieIds
      searchReference
      users {
        id
        email
        externalId
        username
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteMatch = /* GraphQL */ `
  subscription OnDeleteMatch {
    onDeleteMatch {
      id
      movieIds
      searchReference
      users {
        id
        email
        externalId
        username
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const onCreateLikedMovieIds = /* GraphQL */ `
  subscription OnCreateLikedMovieIds {
    onCreateLikedMovieIds {
      id
      movieIds
      searchReference
      user {
        id
        email
        externalId
        username
        createdAt
        updatedAt
      }
      match {
        id
        movieIds
        searchReference
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateLikedMovieIds = /* GraphQL */ `
  subscription OnUpdateLikedMovieIds {
    onUpdateLikedMovieIds {
      id
      movieIds
      searchReference
      user {
        id
        email
        externalId
        username
        createdAt
        updatedAt
      }
      match {
        id
        movieIds
        searchReference
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteLikedMovieIds = /* GraphQL */ `
  subscription OnDeleteLikedMovieIds {
    onDeleteLikedMovieIds {
      id
      movieIds
      searchReference
      user {
        id
        email
        externalId
        username
        createdAt
        updatedAt
      }
      match {
        id
        movieIds
        searchReference
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
      id
      email
      externalId
      username
      matches {
        id
        movieIds
        searchReference
        createdAt
        updatedAt
      }
      likedMovieIds {
        id
        movieIds
        searchReference
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
      id
      email
      externalId
      username
      matches {
        id
        movieIds
        searchReference
        createdAt
        updatedAt
      }
      likedMovieIds {
        id
        movieIds
        searchReference
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
      id
      email
      externalId
      username
      matches {
        id
        movieIds
        searchReference
        createdAt
        updatedAt
      }
      likedMovieIds {
        id
        movieIds
        searchReference
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
