/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMatch = /* GraphQL */ `
  query GetMatch($id: ID!) {
    getMatch(id: $id) {
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
export const listMatchs = /* GraphQL */ `
  query ListMatchs(
    $filter: ModelMatchFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMatchs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        movieIds
        searchReference
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getLikedMovieIds = /* GraphQL */ `
  query GetLikedMovieIds($id: ID!) {
    getLikedMovieIds(id: $id) {
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
export const listLikedMovieIdss = /* GraphQL */ `
  query ListLikedMovieIdss(
    $filter: ModelLikedMovieIdsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLikedMovieIdss(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        movieIds
        searchReference
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        email
        externalId
        username
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
