#!/usr/bin/env python3
"""
Logseq to Jekyll Migration Script

Converts Logseq markdown notes to Jekyll-compatible markdown for the _notes collection.

Usage:
    uv run scripts/logseq2jekyll.py "Article-Why Books Don't Work.md"
    uv run scripts/logseq2jekyll.py "Book%2FAnathem - Neal Stephenson.md" --dry-run
"""

import argparse
import json
import os
import re
import shutil
from pathlib import Path
from typing import Optional

# Configuration
LOGSEQ_ROOT = Path("/Users/nishparadox/Dropbox/kb/logseq-nishparadox")
LOGSEQ_PAGES = LOGSEQ_ROOT / "pages"
LOGSEQ_ASSETS = LOGSEQ_ROOT / "assets"

JEKYLL_ROOT = Path(__file__).parent.parent
JEKYLL_NOTES = JEKYLL_ROOT / "_notes"
JEKYLL_ASSETS = JEKYLL_ROOT / "assets" / "notes"

BLOCK_INDEX_CACHE = LOGSEQ_ROOT / ".block_index.json"

# Tags to exclude (workflow/status tags)
EXCLUDED_TAGS = {
    'to-read', 'already-read', 'in-progress', 'thought-provoking',
    'priority-definitely', 'priority-maybe', 'my-favorite', 'highlights'
}

# Prefixes to strip from title
TITLE_PREFIXES = ['Article-', 'Article/', 'Reading-', 'Reading/', 'Book-', 'Book/', 'Video-', 'Video/', 'Research Paper-', 'Research Paper/']


def slugify(title: str) -> str:
    """Convert title to URL-friendly slug."""
    slug = title.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')


def clean_title(filename: str) -> str:
    """Extract clean title from Logseq filename."""
    title = filename.replace('.md', '')

    # URL decode first
    title = title.replace('%2F', '/').replace('%3A', ':').replace('%20', ' ')

    # Remove [[Category]]- prefix pattern
    title = re.sub(r'^\[\[[^\]]+\]\]-?', '', title)

    # Remove standard prefixes (including with slash like "Book/")
    for prefix in TITLE_PREFIXES:
        if title.startswith(prefix):
            title = title[len(prefix):]
            break
        # Also handle "Book/" style prefix
        prefix_slash = prefix.replace('-', '/')
        if title.startswith(prefix_slash):
            title = title[len(prefix_slash):]
            break

    return title.strip()


def extract_wiki_link_text(text: str) -> str:
    """Extract plain text from wiki link [[text]]."""
    match = re.match(r'\[\[([^\]]+)\]\]', text)
    return match.group(1) if match else text


def parse_tags(tag_string: str) -> list[str]:
    """Parse Logseq tags into a list."""
    tags = []

    # Match #[[Multi Word]] and #single-word
    pattern = r'#\[\[([^\]]+)\]\]|#([\w-]+)'
    for match in re.finditer(pattern, tag_string):
        tag = match.group(1) or match.group(2)
        tag_lower = tag.lower().replace(' ', '-')
        if tag_lower not in EXCLUDED_TAGS:
            tags.append(tag_lower)

    return tags


def extract_properties(content: str) -> dict:
    """Extract Logseq properties from content."""
    properties = {}

    # source:: (case insensitive)
    source_match = re.search(r'source::\s*(https?://[^\s\n]+)', content, re.IGNORECASE)
    if source_match:
        properties['source'] = source_match.group(1)

    # author:: [[Name]] or author:: Name (case insensitive)
    author_match = re.search(r'author::\s*(?:\[\[)?([^\]\n,]+)(?:\]\])?', content, re.IGNORECASE)
    if author_match:
        author = author_match.group(1).strip()
        # Clean wiki link brackets
        author = re.sub(r'\[\[([^\]]+)\]\]', r'\1', author)
        properties['author'] = author

    # tags:: (case insensitive)
    tags_match = re.search(r'tags::\s*([^\n]+)', content, re.IGNORECASE)
    if tags_match:
        properties['tags'] = parse_tags(tags_match.group(1))

    # completed-on:: or COMPLETED ON::
    completed_match = re.search(r'completed[- ]?on::\s*\[\[([^\]]+)\]\]', content, re.IGNORECASE)
    if completed_match:
        properties['completed_on'] = completed_match.group(1)

    # started-on:: or STARTED ON::
    started_match = re.search(r'started[- ]?on::\s*\[\[([^\]]+)\]\]', content, re.IGNORECASE)
    if started_match:
        properties['started_on'] = started_match.group(1)

    # Also collect inline tags like #Walking #Article
    inline_tags = parse_tags(content)
    if 'tags' in properties:
        # Merge, avoiding duplicates
        existing = set(properties['tags'])
        for tag in inline_tags:
            if tag not in existing:
                properties['tags'].append(tag)
    elif inline_tags:
        properties['tags'] = inline_tags

    return properties


def generate_front_matter(title: str, properties: dict) -> str:
    """Generate Jekyll YAML front matter."""
    lines = ['---']
    lines.append(f'title: "{title}"')

    if 'tags' in properties and properties['tags']:
        tags_str = ', '.join(properties['tags'])
        lines.append(f'tags: [{tags_str}]')

    if 'author' in properties:
        lines.append(f'author: "{properties["author"]}"')

    if 'source' in properties:
        lines.append(f'source: "{properties["source"]}"')

    if 'started_on' in properties:
        lines.append(f'started_on: "{properties["started_on"]}"')

    if 'completed_on' in properties:
        lines.append(f'completed_on: "{properties["completed_on"]}"')

    lines.append('---')
    return '\n'.join(lines)


def build_block_index(force_rebuild: bool = False) -> dict:
    """Build or load cached index of block IDs to content."""
    if BLOCK_INDEX_CACHE.exists() and not force_rebuild:
        try:
            with open(BLOCK_INDEX_CACHE, 'r') as f:
                return json.load(f)
        except:
            pass

    print("Building block index (first run, may take a moment)...")
    index = {}

    for md_file in LOGSEQ_PAGES.glob('*.md'):
        try:
            content = md_file.read_text(encoding='utf-8')

            # Find all id:: definitions and their preceding content
            lines = content.split('\n')
            for i, line in enumerate(lines):
                id_match = re.search(r'id::\s*([a-f0-9-]{36})', line)
                if id_match:
                    uuid = id_match.group(1)

                    # Get the content - either same line or previous line
                    if line.strip().startswith('id::'):
                        # id is on its own line, content is on previous line
                        if i > 0:
                            content_line = lines[i-1]
                            # Remove bullet and leading whitespace
                            content_text = re.sub(r'^[\s\t]*-\s*', '', content_line)
                            index[uuid] = content_text.strip()
                    else:
                        # id is at end of content line
                        content_text = re.sub(r'\s*id::\s*[a-f0-9-]{36}', '', line)
                        content_text = re.sub(r'^[\s\t]*-\s*', '', content_text)
                        index[uuid] = content_text.strip()
        except Exception as e:
            print(f"Warning: Could not parse {md_file.name}: {e}")

    # Cache for next time
    try:
        with open(BLOCK_INDEX_CACHE, 'w') as f:
            json.dump(index, f)
        print(f"Cached {len(index)} block references")
    except:
        pass

    return index


def resolve_block_references(content: str, block_index: dict) -> str:
    """Resolve ((uuid)) and {{embed ((uuid))}} references."""

    def replace_ref(match):
        uuid = match.group(1)
        if uuid in block_index:
            return f"> {block_index[uuid]}"
        return f"[ref: {uuid[:8]}...]"

    def replace_embed(match):
        uuid = match.group(1)
        if uuid in block_index:
            return f"\n> {block_index[uuid]}\n"
        return f"[embed: {uuid[:8]}...]"

    # Replace embeds first (they're more specific)
    content = re.sub(r'\{\{embed\s*\(\(([a-f0-9-]{36})\)\)\}\}', replace_embed, content)

    # Replace inline references
    content = re.sub(r'\(\(([a-f0-9-]{36})\)\)', replace_ref, content)

    return content


def clean_logseq_syntax(content: str) -> str:
    """Clean Logseq-specific syntax."""

    # Remove YAML front matter from Logseq
    content = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)

    # Remove id:: lines (standalone or at end of line)
    content = re.sub(r'\n\s*id::\s*[a-f0-9-]{36}\s*\n', '\n', content)
    content = re.sub(r'\s*id::\s*[a-f0-9-]{36}', '', content)

    # Remove collapsed:: true
    content = re.sub(r'\n\s*collapsed::\s*true\s*\n', '\n', content)
    content = re.sub(r'\s*collapsed::\s*true', '', content)

    # Convert ^^highlight^^ to **highlight**
    content = re.sub(r'\^\^([^\^]+)\^\^', r'**\1**', content)

    # Remove DONE/TODO markers
    content = re.sub(r'^(\s*-\s*)(?:DONE|TODO|LATER|NOW)\s+', r'\1', content, flags=re.MULTILINE)

    # Remove standalone separator lines (- ---)
    content = re.sub(r'\n\s*-\s*---\s*\n', '\n\n', content)

    # Remove Metadata section header and its property lines
    # This removes the source::, author::, tags::, etc. that we already parsed
    # Match both with and without bullet prefix, case insensitive
    content = re.sub(r'-\s*Metadata\n(?:\s*-\s*\w+::.*\n)*', '', content, flags=re.IGNORECASE)
    content = re.sub(r'^[\s-]*source::.*$', '', content, flags=re.MULTILINE | re.IGNORECASE)
    content = re.sub(r'^[\s-]*author::.*$', '', content, flags=re.MULTILINE | re.IGNORECASE)
    content = re.sub(r'^[\s-]*tags::.*$', '', content, flags=re.MULTILINE | re.IGNORECASE)
    content = re.sub(r'^[\s-]*total[- ]?time::.*$', '', content, flags=re.MULTILINE | re.IGNORECASE)
    content = re.sub(r'^[\s-]*completed[- ]?on::.*$', '', content, flags=re.MULTILINE | re.IGNORECASE)
    content = re.sub(r'^[\s-]*recommended[- ]?by::.*$', '', content, flags=re.MULTILINE | re.IGNORECASE)
    content = re.sub(r'^[\s-]*media[- ]?type::.*$', '', content, flags=re.MULTILINE | re.IGNORECASE)
    content = re.sub(r'^[\s-]*status::.*$', '', content, flags=re.MULTILINE | re.IGNORECASE)
    content = re.sub(r'^[\s-]*website::.*$', '', content, flags=re.MULTILINE | re.IGNORECASE)
    content = re.sub(r'^[\s-]*follow[- ]?up::.*$', '', content, flags=re.MULTILINE | re.IGNORECASE)
    content = re.sub(r'^[\s-]*started[- ]?on::.*$', '', content, flags=re.MULTILINE | re.IGNORECASE)

    # Clean up multiple blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)

    # Remove #Highlights header (we keep the content, just not this marker)
    content = re.sub(r'-\s*\*?\*?#Highlights\*?\*?\s*\n', '', content)

    return content.strip()


def copy_assets(content: str, dry_run: bool = False) -> str:
    """Find and copy local assets, update paths."""

    def replace_asset(match):
        alt = match.group(1)
        path = match.group(2)

        if path.startswith('http'):
            return match.group(0)  # Keep external URLs

        # Resolve relative path
        asset_path = LOGSEQ_ASSETS / Path(path).name
        if not asset_path.exists():
            # Try the path as-is
            asset_path = LOGSEQ_ROOT / path.lstrip('../')

        if asset_path.exists():
            new_name = asset_path.name
            target = JEKYLL_ASSETS / new_name

            if not dry_run:
                JEKYLL_ASSETS.mkdir(parents=True, exist_ok=True)
                shutil.copy2(asset_path, target)
                print(f"  Copied asset: {new_name}")

            return f'![{alt}](/assets/notes/{new_name})'
        else:
            print(f"  Warning: Asset not found: {path}")
            return match.group(0)

    return re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', replace_asset, content)


def migrate_note(filename: str, dry_run: bool = False, rebuild_index: bool = False) -> Optional[str]:
    """Migrate a single Logseq note to Jekyll."""

    # Find the file - support multiple search methods
    source_path = LOGSEQ_PAGES / filename
    if not source_path.exists():
        # Try URL-encoded version (/ -> %2F)
        encoded_name = filename.replace('/', '%2F')
        source_path = LOGSEQ_PAGES / encoded_name

    if not source_path.exists():
        # Try with .md extension
        if not filename.endswith('.md'):
            source_path = LOGSEQ_PAGES / f"{filename}.md"
            if not source_path.exists():
                encoded_name = filename.replace('/', '%2F')
                source_path = LOGSEQ_PAGES / f"{encoded_name}.md"

    if not source_path.exists():
        # Fuzzy match - search for the term in filenames (case insensitive)
        search_term = filename.lower().replace('.md', '')
        matches = [
            f for f in LOGSEQ_PAGES.glob("*.md")
            if search_term in f.name.lower().replace('%2f', '/').replace('%20', ' ')
        ]
        if matches:
            if len(matches) == 1:
                source_path = matches[0]
                print(f"Found: {source_path.name}")
            else:
                print(f"Multiple matches found for '{filename}':")
                for i, m in enumerate(matches[:10], 1):
                    print(f"  {i}. {m.name}")
                if len(matches) > 10:
                    print(f"  ... and {len(matches) - 10} more")
                print("\nBe more specific or use the exact filename.")
                return None
        else:
            print(f"Error: No files found matching: {filename}")
            return None

    print(f"Processing: {source_path.name}")

    # Read content
    content = source_path.read_text(encoding='utf-8')

    # Extract title and properties
    title = clean_title(source_path.name)
    properties = extract_properties(content)

    print(f"  Title: {title}")
    if properties.get('tags'):
        print(f"  Tags: {', '.join(properties['tags'])}")

    # Build block index for reference resolution
    block_index = build_block_index(force_rebuild=rebuild_index)

    # Transform content
    content = resolve_block_references(content, block_index)
    content = clean_logseq_syntax(content)
    content = copy_assets(content, dry_run=dry_run)

    # Generate output
    front_matter = generate_front_matter(title, properties)
    output = f"{front_matter}\n\n{content}"

    # Write output
    slug = slugify(title)
    output_path = JEKYLL_NOTES / f"{slug}.md"

    if dry_run:
        print(f"\n--- DRY RUN OUTPUT ---")
        print(f"Would write to: {output_path}")
        print(f"\n{output[:1000]}...")
        if len(output) > 1000:
            print(f"\n... ({len(output)} chars total)")
    else:
        JEKYLL_NOTES.mkdir(parents=True, exist_ok=True)
        output_path.write_text(output, encoding='utf-8')
        print(f"  Written to: {output_path}")

    return str(output_path)


def main():
    parser = argparse.ArgumentParser(
        description='Migrate Logseq notes to Jekyll _notes collection'
    )
    parser.add_argument(
        'filename',
        help='Logseq filename to migrate (e.g., "Article-Title.md")'
    )
    parser.add_argument(
        '--dry-run', '-n',
        action='store_true',
        help='Preview output without writing files'
    )
    parser.add_argument(
        '--rebuild-index',
        action='store_true',
        help='Force rebuild of block reference index'
    )

    args = parser.parse_args()

    result = migrate_note(
        args.filename,
        dry_run=args.dry_run,
        rebuild_index=args.rebuild_index
    )

    if result and not args.dry_run:
        print(f"\nDone! Note available at: /notes/{Path(result).stem}")


if __name__ == '__main__':
    main()
