export const methodology = `# Reading Counted election results

Counted is an independent civic project, not an official IEC service. It serves
stored IEC municipal election results for 2000, 2006, 2011, 2016, 2021 and 2026.

Government context is separately sourced. Use get_government_history for MISTRA
administrations through 28 February 2026 and any separately verified governments.
Documented single-party administrations have their own municipal/IEC sources and
evidence period. An electionBaseline is only a historical seat majority, never
proof of continuous government. The history trends_url in an area summary provides
same-ballot series, historical council allocations, sources and explicit gaps.
Members, supporters and officeholders in MISTRA are at inauguration; subsequent
changes may appear only in notes. Active at cutoff is not current. Keep notes,
source issues and dates. Missing coverage is not proof of single-party rule.
The 2026 recorded-partner total is hypothetical. Government change requires
confirmed before/after administrations, even once election results are final.

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
  comparisons need boundary and ballot checks. Page summaries expose exploratory
  same-ID percentage-point movements, never validated boundary-adjusted swings.
- Estimated council seats are not reported seats. The get_results tool returns
  source-reported seats only. get_area_summary also exposes the website's seat
  estimates with explicit status and assumptions. District-council coverage is incomplete.
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
For bulk exploration, custom rankings or Python calculations, call get_analysis_guide first.
Use render_results_image, render_comparison_image or render_council_image for requested charts.
Their MCP Apps viewer displays the exact PNG. Without viewer support, embed image_markdown
and include PNG/data download links. Never claim an image is displayed when only a link appears.
Chart URLs are immutable snapshots; call the tool again for updated figures. Images are
deterministically rendered from stored public data and cached; election records are never changed.
Call get_api_docs for the complete API contract. Use get_overview, get_area_summary and
list_area_summaries for calculations behind the public pages. Keep their ballot basis,
estimate status, denominators and comparison caveats. These tools execute no caller code.
Read counted://methodology for interpretation rules. No requests trigger IEC ingestion.`;
