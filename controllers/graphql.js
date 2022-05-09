const { Mongo } = require('../db/mongo');
mongodb = require('mongodb')
var graphql = require('graphql');
var moment = require('moment');

const QueryRoot = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    posts: {
      type: new graphql.GraphQLList(Post),
      resolve: async () => {
        var posts = await Mongo.db.collection('posts').find({}).toArray();
        return posts;
      }
    }
  })
})

// const MutationRoot = new graphql.GraphQLObjectType({
//   name: 'Mutation',
//   fields: () => ({
//     user: {
//       type: User,
//       args: {
//         _id : { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
//         name: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) }
//       },
//       resolve: async (parent, args, context, resolveInfo) => {
//         try {
//           return (await  db.collection('users').updateOne({_id: new mongodb.ObjectId(args._id)},{
//             "$set": {"name": args.name}
//           }))
//         } catch (err) {
//           throw new Error("Failed to update user data")
//         }
//       }
//     }
//   })
// })


const Post = new graphql.GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    _id: { type: graphql.GraphQLString },
    article: { type: graphql.GraphQLString },
    hashtags: { type: new graphql.GraphQLList(graphql.GraphQLString)},
    locations: {type: new graphql.GraphQLList(Location)},
    publish_date: {type: Date},
    media: {type: new graphql.GraphQLList(Media)},
    author: {
      type: User,
      resolve: async (post) =>{
        var user = await Mongo.db.collection('users').findOne({_id: new mongodb.ObjectId(post.author)})
        return user
      }
    }
  })
})


const Date = new graphql.GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  parseValue(value) {
    return new Date(value); // value from the client
  },
  serialize(value) { // value sent to client
    return moment(value.toLocaleString(), "MM/DD/YYYY, h:mm:ss a").fromNow();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value) // ast value is always in string format
    }
    return null;
  },
})

const User = new graphql.GraphQLObjectType({
  name: 'User',
  fields: () => ({
    _id: { type: graphql.GraphQLInt },
    name: { type: graphql.GraphQLString },
    email: { type: graphql.GraphQLString}
  })
})

const Media = new graphql.GraphQLObjectType({
  name: 'Media',
  fields: () => ({
    url: { type: graphql.GraphQLString },
    type: { type: graphql.GraphQLString },
    upload_date: {type: Date},
    comment: { type: graphql.GraphQLString},
  })
})

const Location = new graphql.GraphQLObjectType({
  name: 'Location',
  fields: () => ({
    coords: { type: new graphql.GraphQLList(graphql.GraphQLString)}
  })
})


const schema = new graphql.GraphQLSchema({ 
  query: QueryRoot,
  // mutation: MutationRoot
});

  
module.exports.schema = schema;
module.exports.root = QueryRoot;