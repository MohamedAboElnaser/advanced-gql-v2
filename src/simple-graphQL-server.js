const gql = require("graphql-tag");
const { ApolloServer, PubSub } = require("apollo-server");

/**
 * This PubSub instance will act as a message broker for our GraphQL subscriptions.
 * It allows us to publish and subscribe to events in our GraphQL server.
 * In this case, we will use it to notify subscribers when a new post is created.
 */
const pubsub = new PubSub();
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
        error: String
    }

    type Settings {
        user: User!
        theme: String
    }

    type Post {
        id: ID!
        message: String!
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
        createPost(message: String!): Post!
    }

    # This subscription type at in the schema defines:
    # 1. Available subscription endpoints that clients can subscribe to
    # 2. The data that will be sent to the clients when the event occurs

    type Subscription {
        newPost: Post!
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
        createPost(_, { message }) {
            const post = {
                id: `${Math.random().toString(36).slice(2, 7)}`,
                message,
            };
            // Publish the new post event to notify subscribers
            /**
             * This means that when a new post is created,
             * The server will publish an event named "NEW_POST" through the pubsub instance.
             * All subscribers to this event will receive the new post data.
             * This is how we can implement real-time updates in our GraphQL server.
             * Under the hood, Apollo Server uses WebSockets to handle subscriptions.
             * This allows clients to receive updates in real-time without needing to poll the server.
             */
            pubsub.publish("NEW_POST", { newPost: post });
            return post;
        },
    },
    /**
     * Here we define the resolver for the subscription field.
     * This resolver will be called when a client subscribes to the newPost event.
     */
    Subscription: {
        newPost: {
            subscribe: () => pubsub.asyncIterator("NEW_POST"),
        },
    },

    User: {
        error() {
            throw new Error("Oops something went wrong");
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
