import {GraphQLObjectType, GraphQLSchema, GraphQLString} from "graphql";

export default new GraphQLSchema({
    query: new GraphQLObjectType({
        fields: {
            testString: {
                resolve: () => "Hello world",
                type: GraphQLString,
            },
        },
        name: "Query",
    }),
});
