export const methodology = `# Reading Counted election results

Counted is an independent civic project, not an official IEC service. It serves
stored IEC municipal election results for 2000, 2006, 2011, 2016, 2021 and 2026.

- Always keep the election year, area, source URL, snapshot ID, IEC report time,
  last successful check, freshness and quality flags with figures you present.
- The 2026 results are provisional. A vote leader is not necessarily a winner;
  100% reporting is not an official declaration. Use reported milestones for wins.
- Ballot totals can combine multiple ballots and are not unique voters. Reporting
  progress is not turnout. Do not calculate turnout from these fields.
- Null means unavailable, not zero. Preserve source discrepancies and anomalies.
- National and provincial summaries contain leading parties only. OTHER is an
  aggregate, not a party. Do not infer a missing party's votes from these summaries.
- Party pages are slices of the source list. Do not use a page sum as a vote-share
  denominator. Use source totals with the correct ballot basis and quality flags.
- Towns and suburbs map to whole overlapping wards, not town-only vote totals.
  Place mappings are for 2026. Use list_areas to discover historical election IDs.
- Matching IDs across elections do not establish comparable boundaries. Historical
  comparisons need boundary and ballot checks; this server does not infer swings.
- Estimated council seats are not reported seats. The get_results tool returns
  source-reported seats only. District-council ballot coverage is incomplete.
- Successful fetch time and IEC report time mean different things. A successful
  tool call may return stale data. Historical report dates may be regeneration dates.
- Updates can be corrected or withdrawn: check superseded_by and previous_event_id.
  A source URL points to the IEC's current file, not an immutable historical copy.
- A geographical match does not establish voter registration or voting eligibility.

Start with list_elections. Use search_places and get_place for current named-place
mapping, or list_areas for election-specific IDs, then get_results. Check
get_sync_status for live health. Follow next_offset / next_before for more records.
`;

export const serverInstructions = `Read-only access to Counted's South African municipal election data.
Use discovery tools to obtain IDs; always specify the election year when requesting results.
Cite the returned data URL and IEC source. Preserve provisional status, source timestamps,
freshness, geographic scope and quality caveats. Null is not zero, ballots are not voters,
reporting is not turnout, and matching historical IDs do not prove matching boundaries.
Read counted://methodology for interpretation rules. No requests trigger IEC ingestion.`;
