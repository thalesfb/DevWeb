const posts = () => {
  return fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .catch(err => console.log(err));
}

async function fetchData() {
  const data = await posts();
  const list = document.getElementById('list');
  list.innerHTML = '';

  data.forEach(post => {
    const listItem = document.createElement('li');
    listItem.textContent = post.title;
    list.appendChild(listItem);
  });
}
window.fetchData = fetchData;

export { posts };