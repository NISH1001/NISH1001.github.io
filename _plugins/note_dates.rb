# frozen_string_literal: true
#
# Notes in _notes/ carry human-readable reading dates (`completed_on`, `started_on`)
# but no `date`, so Jekyll stamps them with the build time. That made every note
# show the current month on the tags page and defeated any date sort. Derive
# `date` from the reading dates instead, preferring the completion date.
require "time"

Jekyll::Hooks.register :site, :post_read do |site|
  notes = site.collections["notes"]
  next unless notes

  notes.docs.each do |doc|
    next if doc.data.key?("date")

    raw = doc.data["completed_on"] || doc.data["started_on"]
    next if raw.nil? || raw.to_s.strip.empty?

    begin
      doc.data["date"] = Time.parse(raw.to_s)
    rescue ArgumentError
      Jekyll.logger.warn "Note dates:", "could not parse #{raw.inspect} in #{doc.relative_path}"
    end
  end
end
