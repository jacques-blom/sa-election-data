import type { GovernmentRecord } from './types.ts';

/** Keep the pinned source unchanged; publish explicit, sourced editorial corrections. */
export function clarifyGovernmentRecord(record: GovernmentRecord): GovernmentRecord {
  if (record.id === 'DTS_03') return {
    ...record, termination: 'Council_Reconstitution',
    notes: 'In September 2025 the existing council elected a new mayor and speaker under national intervention. The council was not dissolved. This corrects the source’s termination code to agree with its own narrative.',
    editorialCorrection: {
      reviewedAt: '2026-11-07', originalNotes: record.notes, originalTermination: record.termination,
      sources: [{ title: 'MISTRA 2026 v1.0 · Ditsobotla source narrative', url: 'https://coalitions.mistra.org.za/downloads.html' }],
    },
  };
  if (record.id === 'GEO_01') return {
    ...record,
    notes: 'The DA reached 28 of 55 seats after the July 2023 by-elections. That outright majority was temporary: it lost ward 8 to the PA in February 2024. The DA–FF+ coalition ended in June 2024. The source’s phrase “governed alone from then” should not be read as continuous single-party government for the rest of the term.',
    editorialCorrection: {
      reviewedAt: '2026-11-07', originalNotes: record.notes,
      sources: [
        { title: 'MISTRA Coalitions Barometer II · George', url: 'https://mistra.org.za/wp-content/uploads/2025/08/MISTRA-COALITION-BAROMETER-II-web-ready-11-Aug-2025.pdf' },
        { title: 'IEC · by-election results, 14 February 2024', url: 'https://www.elections.org.za/pw/News-And-Media/News-List/News/News-Article/Results-of-the-Municipal-by-election-held-on-14-February-2024?a=AISDGvpz75ps1usOfX7oioCYzHeWYupdoLm179ws+Ko%3D' },
        { title: 'George Herald · 27 June 2024', url: 'https://www.georgeherald.com/News/Article/Politics/da-exits-coalition-with-ff-plus-in-george-202406270418' },
      ],
    },
  };
  return record;
}
