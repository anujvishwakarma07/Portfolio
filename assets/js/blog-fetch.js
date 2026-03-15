/**
 * Step 1: Basic Fetch & Log
 * This script demonstrates how to call Hashnode's GraphQL API.
 */

const HASHNODE_API_URL = 'https://gql.hashnode.com';

// Query for listing 3 posts
const GET_POSTS_QUERY = `
  query GetPosts($username: String!, $first: Int!) {
    user(username: $username) {
      publications(first: 1) {
        edges {
          node {
            posts(first: $first) {
              edges {
                node {
                  title
                  brief
                  publishedAt
                  slug
                  coverImage {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Query for fetching a single post content
const GET_SINGLE_POST_QUERY = `
  query GetSinglePost($host: String!, $slug: String!) {
    publication(host: $host) {
      post(slug: $slug) {
        title
        publishedAt
        content {
          html
        }
        coverImage {
          url
        }
        author {
          name
          profilePicture
        }
        tags {
          name
        }
      }
    }
  }
`;

/**
 * Render Blogs to the UI (Home Page List)
 */
function renderBlogs(posts) {
    const wrapper = document.querySelector('.blog-list-wrapper');
    if (!wrapper) return;

    wrapper.innerHTML = '';

    posts.slice(0, 3).forEach((post, index) => {
        const date = new Date(post.publishedAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const blogHtml = `
            <div class="blog-list-item">
                <div class="blog-list-content">
                    <div class="blog-meta-wrapper">
                        <span class="blog-number">${(index + 1).toString().padStart(2, '0')}</span>
                        <span class="blog-category-date">${formattedDate}</span>
                    </div>
                    <h3>
                        <a href="blog-details.html?slug=${post.slug}">
                            ${post.title}
                        </a>
                    </h3>
                </div>
                <div class="blog-hover-thumb">
                    <img src="${post.coverImage?.url || 'assets/img/blog/mblog1.png'}" alt="${post.title}">
                </div>
                <div class="blog-arrow-icon">
                    <i class="bi bi-arrow-right"></i>
                </div>
            </div>
        `;
        
        wrapper.insertAdjacentHTML('beforeend', blogHtml);
    });
}

/**
 * Render Blogs to the Grid (See All Blogs Page)
 */
function renderBlogGrid(posts) {
    const gridWrapper = document.getElementById('blog-grid-wrapper');
    if (!gridWrapper) return;

    gridWrapper.innerHTML = '';

    posts.forEach((post) => {
        const date = new Date(post.publishedAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const blogHtml = `
            <div class="col-lg-4 col-md-6">
                <div class="mblog-item round8 cmn-shadow">
                    <div class="thumb w-100">
                        <img src="${post.coverImage?.url || 'assets/img/blog/mblog1.png'}" alt="${post.title}" class="round8 w-100" style="height: 250px; object-fit: cover;">
                    </div>
                    <div class="content">
                        <span class="mblog-date pra-clr fz-16">
                            Blog . ${formattedDate}
                        </span>
                        <h4>
                            <a href="blog-details.html?slug=${post.slug}" class="white">
                                ${post.title}
                            </a>
                        </h4>
                        <a href="blog-details.html?slug=${post.slug}" class="cmn-shadow mblog-arrow">
                            <img src="assets/img/blog/right-arrow.png" alt="img">
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        gridWrapper.insertAdjacentHTML('beforeend', blogHtml);
    });

    // Hide static pagination since we aren't using it yet
    const pagination = document.querySelector('.paginations');
    if (pagination) pagination.style.display = 'none';
}

function renderFeaturedBlog(post) {
    const featuredSection = document.getElementById('featured-blog-container');
    if (!featuredSection) return;

    const date = new Date(post.publishedAt);
    const formattedDate = date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Strip "Introduction" if it exists at the start
    const cleanBrief = post.brief.replace(/^Introduction\s+/i, '');

    featuredSection.innerHTML = `
        <div class="single-blog-wrap cmn-shadow round8">
            <div class="single-thumb">
                <img src="${post.coverImage?.url || 'assets/img/blog/blog-singe.png'}" alt="${post.title}">
            </div>
            <div class="single-content">
                <span class="single-date pra-clr fw-400 fz-16">
                    Featured . ${formattedDate}
                </span>
                <h3 class="white featured-title">
                    ${post.title}
                </h3>
                <p class="pra-clr featured-intro">
                    ${cleanBrief}
                </p>
                <a href="blog-details.html?slug=${post.slug}" class="d-flex align-items-center pra-clr gap-xl-4 gap-3">
                    Read the story
                    <span class="arrow">
                        <img src="assets/img/blog/right-arrow.png" alt="img">
                    </span>
                </a>
            </div>
        </div>
    `;
}

function renderBlogDetail(post) {
    console.log('Rendering blog detail for:', post.title);
    
    const titleEl = document.getElementById('blog-title');
    const authorImageEl = document.getElementById('blog-author-image');
    const authorNameEl = document.getElementById('blog-author-name');
    const dateEl = document.getElementById('blog-date');
    const mainImageEl = document.getElementById('blog-main-image');
    // Targeting the exact ID we created
    const contentWrapper = document.getElementById('blog-content-area');

    if (titleEl) titleEl.innerText = post.title;
    if (authorImageEl) authorImageEl.src = post.author.profilePicture || authorImageEl.src;
    if (authorNameEl) authorNameEl.innerText = post.author.name;
    if (dateEl) {
        const date = new Date(post.publishedAt);
        dateEl.innerText = date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
    if (mainImageEl) mainImageEl.src = post.coverImage?.url || mainImageEl.src;
    
    if (contentWrapper) {
        console.log('Replacing dummy content with real blog HTML...');
        contentWrapper.innerHTML = post.content.html;
    } else {
        console.error('❌ Could not find contentWrapper (blog-content-area)');
    }
}

async function fetchBlogs(username) {
    // Determine how many posts to fetch based on page
    const isBlogPage = document.getElementById('blog-grid-wrapper') !== null;
    const postCount = isBlogPage ? 10 : 3;

    try {
        const response = await fetch(HASHNODE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: GET_POSTS_QUERY,
                variables: { 
                    username: username,
                    first: postCount
                },
            }),
        });

        const result = await response.json();
        if (result.errors) {
            console.error('❌ Hashnode API Errors:', result.errors.map(e => e.message).join(', '));
            return;
        }

        const publicationNode = result.data.user?.publications?.edges[0]?.node;
        const postEdges = publicationNode?.posts?.edges;

        if (postEdges && postEdges.length > 0) {
            const posts = postEdges.map(edge => edge.node);
            
            if (isBlogPage) {
                renderFeaturedBlog(posts[0]);
                renderBlogGrid(posts);
            } else {
                renderBlogs(posts);
            }
        }
    } catch (error) {
        console.error('❌ Network or Fetch Error:', error);
    }
}

async function fetchSingleBlog(host, slug) {
    try {
        const response = await fetch(HASHNODE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: GET_SINGLE_POST_QUERY,
                variables: { host: host, slug: slug },
            }),
        });

        const result = await response.json();
        if (result.errors) {
            console.error('❌ Hashnode API Errors:', result.errors.map(e => e.message).join(', '));
            return;
        }

        const post = result.data.publication?.post;
        if (post) {
            renderBlogDetail(post);
        }
    } catch (error) {
        console.error('❌ Network or Fetch Error:', error);
    }
}

// Initial Kick-off
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

// YOUR CONFIGURATION
const HASHNODE_USERNAME = 'anuj-vishwakarma';
const HASHNODE_HOST = 'blog-anuj.hashnode.dev';

console.log('--- Blog Fetch Debug ---');
console.log('Current URL Search:', window.location.search);
console.log('Detected Slug:', slug);

if (slug) {
    console.log('👉 Detail Page Mode');
    fetchSingleBlog(HASHNODE_HOST, slug);
} else {
    console.log('👉 Home Page Mode');
    fetchBlogs(HASHNODE_USERNAME);
}


