---
title: "Search Results"
layout: post
permalink: /search
---

<div id="search-query-display"></div>
<div id="search-results-page"></div>

<script>
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    if (!query) {
        document.getElementById('search-results-page').innerHTML = '<p>No search query provided.</p>';
        return;
    }

    document.getElementById('search-query-display').innerHTML = '<p>Results for: <strong>' + query + '</strong></p>';

    fetch('/SearchData.json')
        .then(response => response.json())
        .then(docs => {
            lunr.tokenizer.separator = /[\s/]+/;

            var index = lunr(function() {
                this.ref('id');
                this.field('title', { boost: 500 });
                this.field('tags', { boost: 100 });
                this.field('content', { boost: 1 });
                this.field('url');
                this.metadataWhitelist = ['position'];

                for (var i in docs) {
                    this.add({
                        id: i,
                        title: docs[i].title,
                        tags: docs[i].tags || '',
                        content: docs[i].content,
                        url: docs[i].url
                    });
                }
            });

            var results = index.query(function(q) {
                var tokens = lunr.tokenizer(query);
                q.term(tokens, { boost: 10 });
                q.term(tokens, { wildcard: lunr.Query.wildcard.TRAILING });
            });

            if (results.length === 0 && query.length > 2) {
                var tokens = lunr.tokenizer(query).filter(function(token) {
                    return token.str.length < 20;
                });
                if (tokens.length > 0) {
                    results = index.query(function(q) {
                        q.term(tokens, {
                            editDistance: Math.round(Math.sqrt(query.length / 2 - 1))
                        });
                    });
                }
            }

            var resultsContainer = document.getElementById('search-results-page');

            if (results.length === 0) {
                resultsContainer.innerHTML = '<p>No results found for "' + query + '"</p>';
                return;
            }

            resultsContainer.innerHTML = '<p>' + results.length + ' result(s) found</p>';

            var resultsList = document.createElement('div');
            resultsList.classList.add('search-results-full');
            resultsContainer.appendChild(resultsList);

            results.forEach(function(result) {
                var doc = docs[result.ref];

                var resultItem = document.createElement('div');
                resultItem.classList.add('search-result-item');

                var title = document.createElement('h3');
                var link = document.createElement('a');
                link.href = doc.url;
                link.textContent = doc.title || doc.doc;
                title.appendChild(link);
                resultItem.appendChild(title);

                var preview = document.createElement('p');
                preview.classList.add('search-result-preview-text');
                var content = doc.content || '';
                var previewText = content.substring(0, 200);
                if (content.length > 200) previewText += '...';
                preview.textContent = previewText;
                resultItem.appendChild(preview);

                var type = document.createElement('span');
                type.classList.add('search-result-type');
                type.textContent = doc.type || 'page';
                resultItem.appendChild(type);

                resultsList.appendChild(resultItem);
            });
        })
        .catch(function(err) {
            console.error('Search error:', err);
            document.getElementById('search-results-page').innerHTML = '<p>Error loading search results.</p>';
        });
})();
</script>

<style>
.search-results-full {
    margin-top: var(--space-md);
}
.search-result-item {
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--border);
}
.search-result-item h3 {
    margin: 0 0 var(--space-xs) 0;
}
.search-result-item h3 a {
    color: var(--brand);
    text-decoration: none;
}
.search-result-item h3 a:hover {
    text-decoration: underline;
}
.search-result-preview-text {
    color: var(--text);
    font-size: var(--scale-sm);
    margin: var(--space-xs) 0;
}
.search-result-type {
    font-size: var(--scale-xs);
    color: var(--text);
    opacity: 0.6;
    text-transform: uppercase;
}
</style>
