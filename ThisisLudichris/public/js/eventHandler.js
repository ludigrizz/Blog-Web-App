
function showPage(section) {
    var content = '';

    switch (section) {
        case 'about_me':
            content = '<h2>What is? Who?</h2><p>This is crazy, a phrase people always say to chris.".</p>';
            break;
        case 'blog':
            console.log("hi");
            getBlogData(blogData => {
                const content = generateBlogContent(blogData);
                document.getElementById('content').innerHTML = content;
              });
            break;
        case 'playlist':
            content = '<iframe style="border-radius: 12px;" src="https://open.spotify.com/embed/playlist/3hSly42AZvsqNqPDlcYbp9?utm_source=generator" width="100%" height="352" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe><iframe style="border-radius:12px" src="https://open.spotify.com/embed/playlist/29WFdV0YozGoI65PKP1skg?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';
            break;
        case 'get_in_touch':
            content = '<h2>Get in touch</h2>' +
            '<form id="signupForm">' +
            '<label for="username">Username:</label>' +
            '<input type="text" id="username" name="username" required><br>' +
            '<label for="password">Password:</label>' +
            '<input type="password" id="password" name="password" required><br>' +
            '<label for="email">Email:</label>' +
            '<input type="email" id="email" name="email" required><br>' +
            '<label for="comments">Comments:</label>' +
            '<textarea id="comments" name="comments" rows="4" required></textarea><br>' +
            '<button type="button" onclick="submitForm()">Submit</button>' +
        '</form>';
            break;
        default:
            content = '<h2>Default</h2><p>This is the default content.</p>';
            break;
    }

    document.getElementById('content').innerHTML = content;

}

document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('about_me_button').addEventListener('click', function() {
        showPage('about_me');
    });
    
    document.getElementById('blog_button').addEventListener('click', function() {
        showPage('blog');
    });
    
    document.getElementById('playlist_button').addEventListener('click', function() {
        showPage('playlist');
    });
    
    document.getElementById('get_in_touch_button').addEventListener('click', function() {
        showPage('get_in_touch');
    });
})
function generateBlogContent(blogData) {
    let content = '<h2>Blog Posts</h2>';

    if (blogData && blogData.items && blogData.items.length > 0) {
      // Iterate through blog posts and format the content
      for (const post of blogData.items) {
        content += `
          <div class="blog-post">
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <p>Published on: ${new Date(post.published).toLocaleDateString()}</p>
          </div>
        `;
      }
    } else {
      // Handle the case where there are no blog posts
      content += '<p>No blog posts available.</p>';
    }
  
    return content;
  }

function submitForm() {
    //preventDefault(); 
    alert('Form submitted!'); // Replace this with your actual form submission logic
}


function getBlogData(callback) {
    const bloggerApiUrl='https://www.googleapis.com/blogger/v3/blogs/8839810470144706822/posts?key=AIzaSyAwv2w0ndQF_se6j6wZduH3pWQE0FPhNRQ';
  
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const blogData = JSON.parse(xhr.responseText);
        callback(blogData);
      }
    };
    xhr.open('GET', bloggerApiUrl, true);
    xhr.send();
  }

