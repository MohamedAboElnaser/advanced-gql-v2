const { ApolloServer } = require("apollo-server");
const typeDefs = require("./typedefs");
const resolvers = require("./resolvers");
const { createToken, getUserFromToken } = require("./auth");
const db = require("./db");

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context({ req, connection }) {
        // If the request is a subscription, we can get the user from the connection context
        const cnx = { ...db };
        if (connection) {
            return { ...cnx, ...connection.context };
        }
        const token = req.headers.authorization;
        const user = getUserFromToken(token);
        return { ...cnx, user, createToken };
    },
    subscriptions: {
        onConnect(params) {
            console.log("Subscription connection established");
            const token = params.authToken;
            const user = getUserFromToken(token);

            /**
             * If the user is not authenticated,
             * then he can not subscribe to any updates
             */
            if (!user) {
                throw new Error("You must be logged in to subscribe");
            }
            /**
             * Any thing returned from here will be
             * available in the context of the subscription resolvers
             */
            return { user };
        },
    },
});

server.listen(4000).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
