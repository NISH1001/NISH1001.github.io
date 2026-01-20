require 'date'

module Jekyll
  module DateSortFilter
    # Parse human-readable dates like "June 14th, 2024" or "May, 2020"
    def parse_human_date(date_str)
      return nil if date_str.nil? || date_str.to_s.empty?

      # Remove ordinal suffixes (st, nd, rd, th)
      cleaned = date_str.to_s.gsub(/(\d+)(st|nd|rd|th)/, '\1')

      begin
        Date.parse(cleaned).to_time
      rescue ArgumentError
        nil
      end
    end

    # Sort notes by date with fallback: completed_on -> started_on -> date
    def sort_by_note_date(notes)
      return [] if notes.nil?

      notes.sort_by do |note|
        date = parse_human_date(note['completed_on']) ||
               parse_human_date(note['started_on']) ||
               note['date'] ||
               Time.new(1970, 1, 1)

        # Ensure we have a Time object for comparison
        date = date.to_time if date.respond_to?(:to_time)
        date
      end.reverse
    end
  end
end

Liquid::Template.register_filter(Jekyll::DateSortFilter)
