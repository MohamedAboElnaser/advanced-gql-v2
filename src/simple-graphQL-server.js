const gql = require('graphql-tag')
const { ApolloServer } = require("apollo-server");

/**
 * To set up a simple GraphQL server,
 * we need to define schema (contains types , queries, mutations)
 * and resolvers (functions that resolve the queries and mutations).
 */
const user = {
    id: "1",
    email: "user@domain.something",
    name: "user-name",
};

const settings = {
    user,
    theme: "dark",
};
/* TypeDefs */
const typeDefs = gql`
    type User {
        id: ID!
        email: String!
        name: String
    }

    type Settings {
        user: User!
        theme: String
    }

    input SettingsInput {
        user: ID!
        theme: String
    }

    type Query {
        me: User!
        settings(userId: ID!): Settings!
    }

    type Mutation {
        settings(input: SettingsInput!): Settings!
    }
`;

/* Resolvers */
const resolvers = {
    Query: {
        me() {
            return user;
        },
        settings(_, { userId }) {
            return settings;
        },
    },

    Mutation: {
        settings(_, { input }) {
            return {
                ...settings,
                theme: input.theme,
            };
        },
    },
};

/* Create GraphQL Server */

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

server.listen(4000).then(({ url }) => {
    console.log(`🚀 Server is up and running at ${url}`);
});
