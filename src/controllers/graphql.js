const { Mongo } = require('../db/mongo');
mongodb = require('mongodb')
let graphql = require('graphql');
let moment = require('moment');
let sanitize = require('mongo-sanitize');

const QueryRoot = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    posts: {
      type: new graphql.GraphQLList(Post),
      args: {
        _id: { type: graphql.GraphQLString,},
        author_id :{type: graphql.GraphQLString,}
      },
      resolve: async (_, {_id,author_id}) => {
        var posts = [];
        var filter = {};

        if (_id != null)
          filter._id = new mongodb.ObjectId(_id)
        if (author_id !=null)
          filter.author = new mongodb.ObjectId(author_id)
        
        
        posts = await Mongo.db.collection('posts').find(filter).toArray();

        return posts;
      }
    },
    users: { 
      type: new graphql.GraphQLList(User),
      args: {
        _id: { type: graphql.GraphQLString,}
      },
      resolve: async (_,{_id}) => {
        var users = []
        var filter = {};

        if (_id != null){
          filter._id = new mongodb.ObjectId(_id)
        }

        users = await Mongo.db.collection('users').find(filter).toArray();

        return users;
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
    _id: { 
      type: graphql.GraphQLString
    },
    article: { type: graphql.GraphQLString },
    hashtags: { type: new graphql.GraphQLList(graphql.GraphQLString)},
    locations: {type: new graphql.GraphQLList(Location)},
    publish_date: {type: Date},
    media: {type: new graphql.GraphQLList(Media)},
    author: {
      type: User,
      resolve: async (post) =>{
        var post_author = sanitize(post.author);
        var user = await Mongo.db.collection('users').findOne({_id: new mongodb.ObjectId(post_author)})
        return user
      }
    },
    comments: {
      type: new graphql.GraphQLList(Comment),
      resolve: async (post) =>{
        // var user = await Mongo.db.collection('').findOne({_id: new mongodb.ObjectId(post.author)})
        // return user
        var comments = await Mongo.db.collection('post_comments').aggregate([
            {$match: {"post_id": new mongodb.ObjectId(post._id)}},
            {$graphLookup: {
                from: "post_comments",
                connectToField: "parent_comment_id",
                connectFromField: "_id",
                startWith: "$_id", // usually value of connectFromField                                                             
                depthField: "n",
                as: "comments"
            }}
        ]).toArray();
        return comments
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
    _id: { type: graphql.GraphQLString },
    name: { type: graphql.GraphQLString },
    email: { type: graphql.GraphQLString},
    avatar: {type: graphql.GraphQLString},
    background: {type: graphql.GraphQLString}
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

const Comment = new graphql.GraphQLObjectType({
  name: 'Comment',
  fields: () => ({
    _id: { type: graphql.GraphQLString },
    user_id: { type: graphql.GraphQLString },
    author: {
      type: User,
      resolve: async (comment) => {
        var user = await Mongo.db.collection('users').findOne({_id:comment.user_id})
        return user
      }
    },
    content: { type: graphql.GraphQLString },
    create_date:  {type: Date},
    update_date:  {type: Date},
    comments: {type: new graphql.GraphQLList(Comment)}
  })
})


const schema = new graphql.GraphQLSchema({
  query: QueryRoot,
  // mutation: MutationRoot
});

  
module.exports.schema = schema;
module.exports.root = QueryRoot;