// Reading:
// - https://www.howtographql.com/graphql-js/2-a-simple-query/
// - https://medium.freecodecamp.org/organizing-graphql-mutations-653306699f3d

const { GraphQLServer } = require('graphql-yoga')
const fetch = require('node-fetch')

const cached = require('./cached')

let context = {
  mockPosts: [ {
    userId: 1,
    id: 1,
    title: 'title-foo',
    body: 'body-foo',
  } ]
}

let resolvers = {
  Query: {
    posts(root, args, context, info) {
      // const BASE_URL = 'https://jsonplaceholder.typicode.com'
      // let fetchedPost = await cached('single-post-fetch', () =>
      //   fetch(`${BASE_URL}/posts/3`).then(res => res.json())
      // )
      return context.mockPosts
    },
    // comments(root, args, context, info) { },
    // albums(root, args, context, info) { },
    // photos(root, args, context, info) { },
    // todos(root, args, context, info) { },
    // users(root, args, context, info) { },
  },
  Mutation: {
    createPost(root, args, context, info) {
      let post = Object.assign({}, args)
      context.mockPosts.push(post)
      return post
    },
    updatePost(root, { id, newTitle, newBody, newUserId }, context, info) {
      let post = context.mockPosts.find(post => post.id == id) // need ==
      if (post) {
        post.title = newTitle
        post.body = newBody
      }
      return post
    },
    deletePost(root, { id }, context, info) {
      let post = context.mockPosts.find(post => post.id == id) // need ==
      if (post) {
        context.mockPosts = context.mockPosts.filter(_ => _.id !== post.id)
      }

      return void 0
    }
  },
  Post: {
    userId: root => root.userId,
    id: root => root.id,
    body: root => root.body,
    title: root => root.title,
  }
}

let server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context,
})

server.start(_ => {
  console.log('Server: http://localhost:4000')
})
