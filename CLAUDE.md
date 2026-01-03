# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Jekyll-based personal blog hosted at nish1001.github.io. The blog "Bits and Paradoxes" covers topics from technical content to existential and meta-learning themes.

## Commands

### Development Server
```bash
# Install dependencies (first time setup)
gem install bundler:2.3.20
bundle install

# Run development server with all features
make serve
# OR directly:
bundle exec jekyll build && bundle exec jekyll serve --incremental --future --unpublished --verbose

# Build site only
bundle exec jekyll build
```

## Architecture

### Jekyll Structure
- **_posts/**: Blog posts in Markdown format (YYYY-MM-DD-title.markdown)
- **_layouts/**: Page templates (default.html, page.html, post.html)
- **_includes/**: Reusable components (nav, footer, analytics, ads, disqus comments)
- **_config.yml**: Main Jekyll configuration with site settings, permalinks, and plugin configuration

### Key Features
- **Pagination**: 15 posts per page (configured in _config.yml)
- **Permalinks**: /:categories/:title.html format
- **Plugins**: jekyll-paginate, jekyll-feed, jekyll-sitemap
- **Analytics**: Google Analytics and AdSense integration
- **Comments**: Disqus integration for post comments

### Static Assets
- **css/**: Bootstrap-based styling with custom modifications
- **img/**: Site images and backgrounds
- **fonts/**: Custom font files
- **documents/**: PDF and other document storage

### Frontend Framework
Uses Bootstrap-based Clean Blog theme with Grunt for asset processing (package.json configuration present but primarily using Jekyll's built-in processing).