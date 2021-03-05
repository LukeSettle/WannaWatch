/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createMatch = /* GraphQL */ `
  mutation CreateMatch(
    $input: CreateMatchInput!
    $condition: ModelMatchConditionInput
  ) {
    createMatch(input: $input, condition: $condition) {
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
export const updateMatch = /* GraphQL */ `
  mutation UpdateMatch(
    $input: UpdateMatchInput!
    $condition: ModelMatchConditionInput
  ) {
    updateMatch(input: $input, condition: $condition) {
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
export const deleteMatch = /* GraphQL */ `
  mutation DeleteMatch(
    $input: DeleteMatchInput!
    $condition: ModelMatchConditionInput
  ) {
    deleteMatch(input: $input, condition: $condition) {
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
export const createLikedMovieIds = /* GraphQL */ `
  mutation CreateLikedMovieIds(
    $input: CreateLikedMovieIdsInput!
    $condition: ModelLikedMovieIdsConditionInput
  ) {
    createLikedMovieIds(input: $input, condition: $condition) {
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
export const updateLikedMovieIds = /* GraphQL */ `
  mutation UpdateLikedMovieIds(
    $input: UpdateLikedMovieIdsInput!
    $condition: ModelLikedMovieIdsConditionInput
  ) {
    updateLikedMovieIds(input: $input, condition: $condition) {
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
export const deleteLikedMovieIds = /* GraphQL */ `
  mutation DeleteLikedMovieIds(
    $input: DeleteLikedMovieIdsInput!
    $condition: ModelLikedMovieIdsConditionInput
  ) {
    deleteLikedMovieIds(input: $input, condition: $condition) {
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
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
