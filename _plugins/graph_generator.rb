# Graph Generator Plugin for Jekyll
# Generates a JSON file with nodes (notes/posts) and links (references between them)

module Jekyll
  class GraphGenerator < Generator
    safe true
    priority :low

    def generate(site)
      # Collect all documents (notes and posts)
      all_docs = []

      # Add notes
      if site.collections['notes']
        site.collections['notes'].docs.each do |note|
          all_docs << {
            id: note.url,
            title: note.data['title'] || note.basename_without_ext,
            type: 'note',
            url: note.url,
            content: note.content
          }
        end
      end

      # Add posts
      site.posts.docs.each do |post|
        all_docs << {
          id: post.url,
          title: post.data['title'],
          type: 'post',
          url: post.url,
          content: post.content
        }
      end

      # Build nodes and find links
      nodes = []
      links = []

      all_docs.each do |doc|
        nodes << {
          id: doc[:id],
          title: doc[:title],
          type: doc[:type],
          url: doc[:url]
        }

        # Find wiki-style links [[title]]
        wiki_links = doc[:content].scan(/\[\[([^\]]+)\]\]/).flatten

        wiki_links.each do |link_title|
          # Find the target document by title
          target = all_docs.find { |d| d[:title]&.downcase == link_title.downcase }
          if target
            links << {
              source: doc[:id],
              target: target[:id]
            }
          end
        end

        # Find regular markdown links to other documents
        doc[:content].scan(/\[([^\]]+)\]\(([^)]+)\)/).each do |link_text, link_url|
          # Only include internal links
          if link_url.start_with?('/') || link_url.start_with?('..')
            target = all_docs.find { |d| d[:url] == link_url || link_url.include?(d[:url]) }
            if target && target[:id] != doc[:id]
              links << {
                source: doc[:id],
                target: target[:id]
              }
            end
          end
        end
      end

      # Remove duplicate links
      links.uniq!

      # Create the graph data
      graph_data = {
        nodes: nodes,
        links: links
      }

      # Write to JSON file
      graph_json = JSON.pretty_generate(graph_data)

      # Create the graph data page
      site.pages << GraphDataPage.new(site, graph_json)
    end
  end

  class GraphDataPage < Page
    def initialize(site, content)
      @site = site
      @base = site.source
      @dir = 'assets/js'
      @name = 'graph-data.json'

      self.process(@name)
      self.content = content
      self.data = {
        'layout' => nil
      }
    end
  end
end
