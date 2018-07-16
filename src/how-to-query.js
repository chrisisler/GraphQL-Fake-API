const author = 'andy'
const content = 'hope is a good thing'
const query = `mutation CreateMessage($input: MessageInput) {
  createMessage(input: $input) {
    id
  }
}`

fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    query,
    variables: {
      input: {
        author,
        content,
      }
    }
  })
})
  .then(r => r.json())
  .then(data => console.log('data returned:', data))
