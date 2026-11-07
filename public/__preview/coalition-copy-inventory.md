# Coalition Chaos — complete copy review

Snapshot: 2026-11-07T15:09:14.932Z

54 active first-pick lines, 88 relationship/local lines and 204 scenario cards (176 history + 16 fallback + 12 generic). 46 removed entries are archived below.

Current local-code snapshot, preserving original review IDs. Kept, revised, restored and clarified entries are active; removed copy and unselected proposals are archived. Restored marks humour reinstated after the first edit. Clarified marks jokes reworded to make sense without prior political knowledge; previous wording shows the line before that pass. Factual corrections remain in place. Historical facts are separate from invented scenes and dialogue. Braces represent variable game values. This is an editorial and factual review, not legal clearance or confirmation of deployment.

Commentary changes with selection. Local history can replace a national story for the same parties; newly completed public red lines get priority. Rolls start from the original deal. Unseen local scenarios are preferred, then other applicable history, then generic cards. Cards do not measure real-world probabilities or party reliability.

126 record-level decisions recorded as of 2026-11-07. Source checks and access limits accompany the checked histories. 5 additional checks are recorded in the audit. Clarity pass: 399 active entries reviewed; 187 reworded. Use the Clarified filter to see before-and-after wording.

## Additional checks

**GENERAL-COPY:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**LEARNING:** Reviewed outcome explanations against code and Constitution section160: fixed game majority differs from actual voting rules; budgets need a majority of all members; withdrawal of support does not remove elected seats. Civic participation guidance is general and directs readers to local procedures.

- [https://www.justice.gov.za/constitution/chp07.html](https://www.justice.gov.za/constitution/chp07.html): read — Sections152 and160 support public involvement, quorum and voting distinctions.

- [https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/](https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/): indexed-text-read — Official indexed text describes ward committees and community involvement in IDP/budgets. Direct opening timed out.

**RULES-STORY:** City announcement dated5May2023 confirms Gwamanda received139 council votes. The text does not confuse this with the party seat total.

- [https://joburg.org.za/media_/Pages/Media/Media%20Statements/2023%20Media%20Statements/May/Joburg-elects-the-Executive-Mayor.aspx](https://joburg.org.za/media_/Pages/Media/Media%20Statements/2023%20Media%20Statements/May/Joburg-elects-the-Executive-Mayor.aspx): read

**CAMEOS:** Checked all eight names against the listed leader/profile pages and inspected the portrait sheet. Historical officeholders are distinguished from national leader cameos. This is not an image-rights or legal clearance.

- [https://www.anc1912.org.za/officials/](https://www.anc1912.org.za/officials/): read — Lists Cyril Ramaphosa as the ANC leader or president.

- [https://www.da.org.za/our-people](https://www.da.org.za/our-people): read — Lists Geordin Hill-Lewis as the DA leader or president.

- [https://effonline.org/eff-parliament-members/](https://effonline.org/eff-parliament-members/): read — Lists Julius Malema as the EFF leader or president.

- [https://mkparty.org.za/about-mk/leadership/party-leaders/](https://mkparty.org.za/about-mk/leadership/party-leaders/): read — Lists Jacob Zuma as the MK leader or president.

- [https://ifp.org.za/structures/our-leadership/](https://ifp.org.za/structures/our-leadership/): read — Lists Velenkosini Hlabisa as the IFP leader or president.

- [https://elections.sabcnews.com/party-profile/the-patriotic-alliance/](https://elections.sabcnews.com/party-profile/the-patriotic-alliance/): read — Lists Gayton McKenzie as the PA leader or president.

- [https://www.actionsa.org.za/herman-mashaba/](https://www.actionsa.org.za/herman-mashaba/): read — Lists Herman Mashaba as the ActionSA leader or president.

- [https://www.vfplus.org.za/leadership/federal-management/](https://www.vfplus.org.za/leadership/federal-management/): read — Lists Corné Mulder as the FF+ leader or president.

**PROPOSALS:** Unapplied alternative jokes remain review history only. Preserve the approved IFP cellphone-contract line and the clearer EFF deputy line now used in the game. No unused proposal should be mistaken for deployed copy.

## First picks (54)

### ANC-01 · Revised

> ANC: lost its majority. Please select a coalition partner to continue.

**When:** Only ANC selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** The ANC lost its outright national majority in the 2024 election, after holding it since 1994. This is national election history, not this council’s result.

**Meaning:** The party-selection prompt turns the ANC’s loss of its national majority into a game instruction: choose partners to keep governing. It does not claim the ANC never governed with partners before 2024.

**Previous wording:** ANC: thirty years of solo mode. Now asking who has a spare controller.

**Review decision:** Replace the controller metaphor with the original main-character punchline: a clear caricature of a formerly dominant party after losing its majority. The claim of thirty years governing alone stays removed. Also retain the lost-majority/cooperation idea in clearer game-prompt wording: select a coalition partner to continue.

**Current backstory — National election · May–June 2024:** The ANC lost its outright national majority in the 2024 election, after holding it since 1994. This is national election history, not this council’s result.

**Sources:** [AP · 1 Jun 2024](https://apnews.com/article/d9da7582ca98a4e00fec2da6a5fe1e91)

**Source checks:** [AP · 1 Jun 2024](https://apnews.com/article/d9da7582ca98a4e00fec2da6a5fe1e91): read — AP contemporary national results report supports loss of majority held since 1994.

**Code:** src/lib/seats/party-commentary.ts · intro-anc-majority

### ANC-03 · Restored

> ANC: the majority left. The main-character energy stayed.

**When:** Only ANC selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** The ANC lost its outright national majority in the 2024 election, after holding it since 1994. This is national election history, not this council’s result.

**Meaning:** The joke contrasts fewer seats with continuing to act like the central character.

**Review decision:** Replace the controller metaphor with the original main-character punchline: a clear caricature of a formerly dominant party after losing its majority. The claim of thirty years governing alone stays removed. Also retain the lost-majority/cooperation idea in clearer game-prompt wording: select a coalition partner to continue.

**Current backstory — National election · May–June 2024:** The ANC lost its outright national majority in the 2024 election, after holding it since 1994. This is national election history, not this council’s result.

**Sources:** [AP · 1 Jun 2024](https://apnews.com/article/d9da7582ca98a4e00fec2da6a5fe1e91)

**Source checks:** [AP · 1 Jun 2024](https://apnews.com/article/d9da7582ca98a4e00fec2da6a5fe1e91): read — AP contemporary national results report supports loss of majority held since 1994.

**Code:** src/lib/seats/party-commentary.ts · intro-anc-majority

### ANC-04 · Kept

> ANC: discovering that “the people have spoken” can mean “find a roommate”.

**When:** Only ANC selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** The ANC lost its outright national majority in the 2024 election, after holding it since 1994. This is national election history, not this council’s result.

**Meaning:** A roommate means a coalition partner; voters made sharing necessary.

**Review decision:** Replace the controller metaphor with the original main-character punchline: a clear caricature of a formerly dominant party after losing its majority. The claim of thirty years governing alone stays removed. Also retain the lost-majority/cooperation idea in clearer game-prompt wording: select a coalition partner to continue.

**Current backstory — National election · May–June 2024:** The ANC lost its outright national majority in the 2024 election, after holding it since 1994. This is national election history, not this council’s result.

**Sources:** [AP · 1 Jun 2024](https://apnews.com/article/d9da7582ca98a4e00fec2da6a5fe1e91)

**Source checks:** [AP · 1 Jun 2024](https://apnews.com/article/d9da7582ca98a4e00fec2da6a5fe1e91): read — AP contemporary national results report supports loss of majority held since 1994.

**Code:** src/lib/seats/party-commentary.ts · intro-anc-majority

### ANC-05 · Kept

> ANC: promised a smaller Cabinet. Ordered a bigger table.

**When:** Only ANC selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** The Presidency named eleven GNU participants in June 2024, including ANC and DA. It also said the need for inclusion prevented the planned reduction in government portfolios.

**Meaning:** More partners made a smaller Cabinet harder to deliver.

**Review decision:** Restore the remote-control joke as recognisable political-personality satire, not a literal claim about Cabinet behaviour. Keep the verified eleven-party context.

**Current backstory — National government · June 2024:** The Presidency named eleven GNU participants in June 2024, including ANC and DA. It also said the need for inclusion prevented the planned reduction in government portfolios.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-anc-gnu

### ANC-06 · Clarified

> ANC: eleven parties sharing a government. Still acting like it owns the remote.

**When:** Only ANC selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** The Presidency named eleven GNU participants in June 2024, including ANC and DA. It also said the need for inclusion prevented the planned reduction in government portfolios.

**Meaning:** Eleven parties shared the 2024 unity government; the remote-control joke imagines the ANC still treating the shared household as its own.

**Previous wording:** ANC: eleven parties in the GNU. Still acting like it owns the remote.

**Review decision:** Clarity pass: Replaces the unexplained GNU acronym with the arrangement needed for the household joke. Restored humour retained.

**Current backstory — National government · June 2024:** The Presidency named eleven GNU participants in June 2024, including ANC and DA. It also said the need for inclusion prevented the planned reduction in government portfolios.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-anc-gnu

### ANC-08 · Clarified

> ANC: unity government is a family meeting where everyone brought their own party.

**When:** Only ANC selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** The Presidency named eleven GNU participants in June 2024, including ANC and DA. It also said the need for inclusion prevented the planned reduction in government portfolios.

**Meaning:** A government of several political parties becomes a crowded family gathering, with a second meaning for party.

**Previous wording:** ANC: the GNU is a family meeting where everyone brought their own party.

**Review decision:** Clarity pass: Names unity government directly so the reader does not have to decode GNU.

**Current backstory — National government · June 2024:** The Presidency named eleven GNU participants in June 2024, including ANC and DA. It also said the need for inclusion prevented the planned reduction in government portfolios.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-anc-gnu

### ANC-10 · Clarified

> ANC: ex-president Zuma backed MK. Now the family reunion needs two sets of campaign posters.

**When:** Only ANC selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party.

**Meaning:** Former ANC president Jacob Zuma backed a different party, so former political family members now campaign under different party banners.

**Previous wording:** ANC: the family reunion now needs two sets of campaign posters.

**Review decision:** Clarity pass: Adds the missing former-president and party-change setup for the family-reunion metaphor.

**Current backstory — National party history · December 2023–January 2024:** Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party.

**Sources:** [ANC membership statement · 29 Jan 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/)

**Source checks:** [ANC membership statement · 29 Jan 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/): read — ANC statement dated 29 January confirms 16 December support announcement and immediate suspension resolution.

**Code:** src/lib/seats/party-commentary.ts · intro-anc-zuma

### ANC-09 · Restored

> ANC: even the former president started seeing other parties.

**When:** Only ANC selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party.

**Meaning:** Seeing other parties treats Zuma’s move like a relationship breakup.

**Review decision:** Restore the seeing-other-parties relationship joke. It describes Zuma backing MK without reintroducing the claim that he founded the party.

**Current backstory — National party history · December 2023–January 2024:** Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party.

**Sources:** [ANC membership statement · 29 Jan 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/)

**Source checks:** [ANC membership statement · 29 Jan 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/): read — ANC statement dated 29 January confirms 16 December support announcement and immediate suspension resolution.

**Code:** src/lib/seats/party-commentary.ts · intro-anc-zuma

### ANC-11 · Clarified

> ANC: suspended ex-president Zuma for backing MK. Couldn’t cancel the comeback tour.

**When:** Only ANC selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party.

**Meaning:** The ANC suspended its former president after he supported MK; the comeback-tour metaphor describes his continuing political presence.

**Previous wording:** ANC: suspended the ex. Couldn’t cancel the comeback tour.

**Review decision:** Clarity pass: Identifies the ex and the reason for the suspension without requiring the backstory panel.

**Current backstory — National party history · December 2023–January 2024:** Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party.

**Sources:** [ANC membership statement · 29 Jan 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/)

**Source checks:** [ANC membership statement · 29 Jan 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/): read — ANC statement dated 29 January confirms 16 December support announcement and immediate suspension resolution.

**Code:** src/lib/seats/party-commentary.ts · intro-anc-zuma

### DA-01 · Clarified

> DA: spent years opposing the ANC. Then asked for a desk in the same government.

**When:** Only DA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.

**Meaning:** The DA moved from opposing ANC rule to working in the same national government, imagined as asking for office space.

**Previous wording:** DA: spent years opposing the ANC. Then asked for a desk.

**Review decision:** Clarity pass: Explains what the desk stands for while preserving the short office joke. Restored humour retained.

**Current backstory — National government · June 2024:** The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.

**Sources:** [DA election manifesto · 2024](https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [DA election manifesto · 2024](https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa): read — DA manifesto page explicitly frames Rescue Plan against ANC government.

**Code:** src/lib/seats/party-commentary.ts · intro-da-gnu

### DA-02 · Clarified

> DA: promised a rescue from ANC rule. The escape route led to a shared Cabinet.

**When:** Only DA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.

**Meaning:** The DA campaigned against ANC rule with its Rescue Plan, then joined a national Cabinet with the ANC.

**Previous wording:** DA: rescued South Africa straight into a meeting with the ANC.

**Review decision:** Clarity pass: States the campaign promise and the resulting shared government, so rescue is not an unexplained campaign reference. Restored humour retained.

**Current backstory — National government · June 2024:** The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.

**Sources:** [DA election manifesto · 2024](https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [DA election manifesto · 2024](https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa): read — DA manifesto page explicitly frames Rescue Plan against ANC government.

**Code:** src/lib/seats/party-commentary.ts · intro-da-gnu

### DA-03 · Clarified

> DA: anti-ANC speeches hit differently when the ANC joins you for Cabinet tea.

**When:** Only DA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.

**Meaning:** Former opponents became Cabinet colleagues; imagined tea-break small talk carries the awkwardness of their earlier campaign rhetoric.

**Previous wording:** DA: the anti-ANC speeches must make Cabinet tea breaks awkward.

**Review decision:** Clarity pass: Makes it explicit that the ANC is now sharing the Cabinet table with the DA.

**Current backstory — National government · June 2024:** The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.

**Sources:** [DA election manifesto · 2024](https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [DA election manifesto · 2024](https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa): read — DA manifesto page explicitly frames Rescue Plan against ANC government.

**Code:** src/lib/seats/party-commentary.ts · intro-da-gnu

### DA-05 · Clarified

> DA: Steenhuisen became Agriculture minister in 2024. Finally, common ground he could point at.

**When:** Only DA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** John Steenhuisen, then the DA leader, was named Minister of Agriculture in the June 2024 cabinet announcement. The reference is to that appointment, not a current leadership roster.

**Meaning:** John Steenhuisen’s 2024 Agriculture appointment supplies literal farmland for the political phrase common ground.

**Previous wording:** DA: Steenhuisen got Agriculture in 2024. Finally, common ground he could point at.

**Review decision:** Clarity pass: Identifies Agriculture as a ministerial appointment; the name no longer needs to do the explanatory work.

**Current backstory — National cabinet · June 2024:** John Steenhuisen, then the DA leader, was named Minister of Agriculture in the June 2024 cabinet announcement. The reference is to that appointment, not a current leadership roster.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-da-agriculture

### DA-06 · Clarified

> DA: Steenhuisen got the Agriculture ministry. The coalition still needs manure management.

**When:** Only DA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** John Steenhuisen, then the DA leader, was named Minister of Agriculture in the June 2024 cabinet announcement. The reference is to that appointment, not a current leadership roster.

**Meaning:** The Agriculture portfolio sets up an earthy metaphor for managing coalition disagreements.

**Previous wording:** DA: Steenhuisen got Agriculture. The coalition still needs manure management.

**Review decision:** Clarity pass: Makes the ministry explicit while preserving the original punchline and tone. Restored humour retained.

**Current backstory — National cabinet · June 2024:** John Steenhuisen, then the DA leader, was named Minister of Agriculture in the June 2024 cabinet announcement. The reference is to that appointment, not a current leadership roster.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-da-agriculture

### DA-09 · Clarified

> DA: EFF votes once helped it govern councils. Awkward footnote to the anti-EFF speeches.

**When:** Only DA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** The DA’s July 2019 account acknowledged EFF support on an issue-by-issue basis for DA-led councils after 2016. This was not a formal DA–EFF coalition. Its July 2024 GNU statement took a different position, seeking to keep EFF and MK out of executive power. Both statements are dated political positions.

**Meaning:** Past EFF voting support helped DA-led councils, creating a contrast with the DA’s later political opposition to EFF involvement in national government.

**Previous wording:** DA: those old EFF votes make an awkward footnote to the campaign speeches.

**Review decision:** Clarity pass: Explains what the old votes achieved and which speeches make them awkward; it does not label the support a formal coalition.

**Current backstory — Municipal politics · 2016–2019:** The DA’s July 2019 account acknowledged EFF support on an issue-by-issue basis for DA-led councils after 2016. This was not a formal DA–EFF coalition. Its July 2024 GNU statement took a different position, seeking to keep EFF and MK out of executive power. Both statements are dated political positions.

**Sources:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power) · [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists)

**Source checks:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power): read — DA July 2019 account explicitly distinguishes issue-by-issue EFF support from the formal governing coalition.; [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists): read — DA 17 July 2024 statement expressly says GNU role is to prevent MK/EFF access to executive power.

**Code:** src/lib/seats/party-commentary.ts · intro-da-eff-support

### DA-10 · Clarified

> DA: accepted EFF council votes, opposed EFF Cabinet seats. Red lines with a municipal setting.

**When:** Only DA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** The DA’s July 2019 account acknowledged EFF support on an issue-by-issue basis for DA-led councils after 2016. This was not a formal DA–EFF coalition. Its July 2024 GNU statement took a different position, seeking to keep EFF and MK out of executive power. Both statements are dated political positions.

**Meaning:** The DA accepted issue-by-issue EFF support in councils but later opposed EFF inclusion in the national executive; the imaginary setting changes the red-line policy by level of government.

**Previous wording:** DA: red lines. Previously available in a more flexible municipal edition.

**Review decision:** Clarity pass: Supplies the two dated positions behind the red-lines joke instead of assuming the reader knows them. Restored humour retained.

**Current backstory — Municipal politics · 2016–2019:** The DA’s July 2019 account acknowledged EFF support on an issue-by-issue basis for DA-led councils after 2016. This was not a formal DA–EFF coalition. Its July 2024 GNU statement took a different position, seeking to keep EFF and MK out of executive power. Both statements are dated political positions.

**Sources:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power) · [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists)

**Source checks:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power): read — DA July 2019 account explicitly distinguishes issue-by-issue EFF support from the formal governing coalition.; [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists): read — DA 17 July 2024 statement expressly says GNU role is to prevent MK/EFF access to executive power.

**Code:** src/lib/seats/party-commentary.ts · intro-da-eff-support

### EFF-01 · Clarified

> EFF: red overalls in Parliament. Even the dress code wants a speaking slot.

**When:** Only EFF selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** EFF MPs arrived in Parliament in red workers’ overalls in May 2014. Contemporary reporting also recorded them buying food from street vendors rather than eating Parliament’s catering.

**Meaning:** The EFF’s recognisable parliamentary clothing is personified as another participant demanding to speak.

**Previous wording:** EFF: even the dress code wants the floor.

**Review decision:** Clarity pass: Names the clothing and setting and replaces the parliamentary idiom wants the floor with a speaking slot.

**Current backstory — Parliament · May 2014:** EFF MPs arrived in Parliament in red workers’ overalls in May 2014. Contemporary reporting also recorded them buying food from street vendors rather than eating Parliament’s catering.

**Sources:** [Sowetan · 22 May 2014](https://www.sowetan.co.za/news/2014-05-22-eff-buys-own-food-at-parliament/)

**Source checks:** [Sowetan · 22 May 2014](https://www.sowetan.co.za/news/2014-05-22-eff-buys-own-food-at-parliament/): read — Sowetan contemporaneous report records red overalls and buying food from street vendors instead of the parliamentary catering.

**Code:** src/lib/seats/party-commentary.ts · intro-eff-overalls

### EFF-02 · Clarified

> EFF: wore red overalls to Parliament. Business casual was apparently counter-revolutionary.

**When:** Only EFF selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** EFF MPs arrived in Parliament in red workers’ overalls in May 2014. Contemporary reporting also recorded them buying food from street vendors rather than eating Parliament’s catering.

**Meaning:** Red workers’ overalls stand in comic contrast to conventional office clothing, with revolutionary language applied to a dress-code choice.

**Previous wording:** EFF: business casual was apparently counter-revolutionary.

**Review decision:** Clarity pass: Adds the clothing choice that makes the business-casual punchline understandable. Restored humour retained.

**Current backstory — Parliament · May 2014:** EFF MPs arrived in Parliament in red workers’ overalls in May 2014. Contemporary reporting also recorded them buying food from street vendors rather than eating Parliament’s catering.

**Sources:** [Sowetan · 22 May 2014](https://www.sowetan.co.za/news/2014-05-22-eff-buys-own-food-at-parliament/)

**Source checks:** [Sowetan · 22 May 2014](https://www.sowetan.co.za/news/2014-05-22-eff-buys-own-food-at-parliament/): read — Sowetan contemporaneous report records red overalls and buying food from street vendors instead of the parliamentary catering.

**Code:** src/lib/seats/party-commentary.ts · intro-eff-overalls

### EFF-03 · Restored

> EFF: red overalls. Absolutely no indoor voice.

**When:** Only EFF selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** EFF MPs arrived in Parliament in red workers’ overalls in May 2014. Contemporary reporting also recorded them buying food from street vendors rather than eating Parliament’s catering.

**Meaning:** This exaggerates the EFF’s confrontational public style.

**Review decision:** Restore business-casual and indoor-voice caricatures of the party’s public parliamentary style. Exaggeration is part of the joke; it is not being presented as a measured factual finding.

**Current backstory — Parliament · May 2014:** EFF MPs arrived in Parliament in red workers’ overalls in May 2014. Contemporary reporting also recorded them buying food from street vendors rather than eating Parliament’s catering.

**Sources:** [Sowetan · 22 May 2014](https://www.sowetan.co.za/news/2014-05-22-eff-buys-own-food-at-parliament/)

**Source checks:** [Sowetan · 22 May 2014](https://www.sowetan.co.za/news/2014-05-22-eff-buys-own-food-at-parliament/): read — Sowetan contemporaneous report records red overalls and buying food from street vendors instead of the parliamentary catering.

**Code:** src/lib/seats/party-commentary.ts · intro-eff-overalls

### EFF-04 · Kept

> EFF: rejected Parliament’s catering. Even lunch needed a revolution.

**When:** Only EFF selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** EFF MPs arrived in Parliament in red workers’ overalls in May 2014. Contemporary reporting also recorded them buying food from street vendors rather than eating Parliament’s catering.

**Meaning:** The catering choice becomes an extension of political protest.

**Review decision:** Restore business-casual and indoor-voice caricatures of the party’s public parliamentary style. Exaggeration is part of the joke; it is not being presented as a measured factual finding.

**Current backstory — Parliament · May 2014:** EFF MPs arrived in Parliament in red workers’ overalls in May 2014. Contemporary reporting also recorded them buying food from street vendors rather than eating Parliament’s catering.

**Sources:** [Sowetan · 22 May 2014](https://www.sowetan.co.za/news/2014-05-22-eff-buys-own-food-at-parliament/)

**Source checks:** [Sowetan · 22 May 2014](https://www.sowetan.co.za/news/2014-05-22-eff-buys-own-food-at-parliament/): read — Sowetan contemporaneous report records red overalls and buying food from street vendors instead of the parliamentary catering.

**Code:** src/lib/seats/party-commentary.ts · intro-eff-overalls

### EFF-06 · Kept

> EFF: helped the DA govern. Strictly no relationship status, please.

**When:** Only EFF selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** After the 2016 municipal elections, the EFF supported some DA-led administrations on individual issues without joining a formal governing coalition. The DA acknowledged this arrangement in July 2019.

**Meaning:** It compares limited voting cooperation with refusing a formal relationship.

**Review decision:** Restore the principles/terms-and-conditions joke as a concise political contradiction grounded in the verified support arrangement.

**Current backstory — Municipal politics · 2016–2019:** After the 2016 municipal elections, the EFF supported some DA-led administrations on individual issues without joining a formal governing coalition. The DA acknowledged this arrangement in July 2019.

**Sources:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power)

**Source checks:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power): read — DA July 2019 account explicitly distinguishes issue-by-issue EFF support from the formal governing coalition.

**Code:** src/lib/seats/party-commentary.ts · intro-eff-kingmaker

### EFF-07 · Clarified

> EFF: helped DA councils govern without joining the coalition. Don’t tag them in photos.

**When:** Only EFF selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** After the 2016 municipal elections, the EFF supported some DA-led administrations on individual issues without joining a formal governing coalition. The DA acknowledged this arrangement in July 2019.

**Meaning:** EFF support helped DA-led councils without a formal governing coalition, likened to a relationship that avoids public couple photos.

**Previous wording:** EFF: the DA’s municipal situationship. Don’t tag them in photos.

**Review decision:** Clarity pass: Explains the support-without-membership arrangement and removes reliance on the slang situationship.

**Current backstory — Municipal politics · 2016–2019:** After the 2016 municipal elections, the EFF supported some DA-led administrations on individual issues without joining a formal governing coalition. The DA acknowledged this arrangement in July 2019.

**Sources:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power)

**Source checks:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power): read — DA July 2019 account explicitly distinguishes issue-by-issue EFF support from the formal governing coalition.

**Code:** src/lib/seats/party-commentary.ts · intro-eff-kingmaker

### EFF-08 · Clarified

> EFF: helped the DA govern councils. Revolutionary principles, municipal terms and conditions apply.

**When:** Only EFF selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** After the 2016 municipal elections, the EFF supported some DA-led administrations on individual issues without joining a formal governing coalition. The DA acknowledged this arrangement in July 2019.

**Meaning:** EFF support for DA-led councils is contrasted with its revolutionary political persona, using the language of contractual exceptions.

**Previous wording:** EFF: revolutionary principles. Municipal terms and conditions apply.

**Review decision:** Clarity pass: Adds the municipal cooperation that the original terms-and-conditions line left unstated. Restored humour retained.

**Current backstory — Municipal politics · 2016–2019:** After the 2016 municipal elections, the EFF supported some DA-led administrations on individual issues without joining a formal governing coalition. The DA acknowledged this arrangement in July 2019.

**Sources:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power)

**Source checks:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power): read — DA July 2019 account explicitly distinguishes issue-by-issue EFF support from the formal governing coalition.

**Code:** src/lib/seats/party-commentary.ts · intro-eff-kingmaker

### EFF-09 · Revised

> EFF: wanted to take power. MK took the deputy.

**When:** Only EFF selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This describes that transfer, not his subsequent positions.

**Meaning:** The EFF’s ambition to gain power is contrasted with deputy president Floyd Shivambu leaving for MK. Took is a transfer metaphor, not coercion.

**Previous wording:** EFF: even the deputy exercised freedom of movement.

**Review decision:** Use the clearer proposed deputy-to-MK joke and retain one T-shirt variant. Remove opaque freedom-of-movement/economic-freedom wordplay.

**Current backstory — National party history · August 2024:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This describes that transfer, not his subsequent positions.

**Sources:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party) · [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party): read — EWN 15 August report confirms Shivambu leaving EFF and joining MK.; [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/party-commentary.ts · intro-eff-shivambu

### EFF-12 · Kept

> EFF: lost the deputy to MK. Awkward time to print matching T-shirts.

**When:** Only EFF selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This describes that transfer, not his subsequent positions.

**Meaning:** Matching party clothing becomes awkward when a senior member changes parties.

**Review decision:** Use the clearer proposed deputy-to-MK joke and retain one T-shirt variant. Remove opaque freedom-of-movement/economic-freedom wordplay.

**Current backstory — National party history · August 2024:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This describes that transfer, not his subsequent positions.

**Sources:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party) · [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party): read — EWN 15 August report confirms Shivambu leaving EFF and joining MK.; [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/party-commentary.ts · intro-eff-shivambu

### MK-01 · Revised

> MK: brand-new party. Pre-owned president.

**When:** Only MK selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** MK announced its public arrival on 16 December 2023. By its August 2024 organisational statement, it listed former South African president Jacob Zuma as party president. The joke contrasts a new party with a familiar leader; it does not identify today’s municipal candidates.

**Meaning:** A new organisation is contrasted with an already familiar former president.

**Review decision:** Keep the strongest new-party/familiar-president and lead-singer jokes; remove near duplicates. Distinguish December 2023 public launch from the August 2024 statement naming Zuma party president.

**Current backstory — National party history · December 2023–August 2024:** MK announced its public arrival on 16 December 2023. By its August 2024 organisational statement, it listed former South African president Jacob Zuma as party president. The joke contrasts a new party with a familiar leader; it does not identify today’s municipal candidates.

**Sources:** [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/party-commentary.ts · intro-mk-arrival

### MK-02 · Clarified

> MK: the ANC’s greatest hits, with ex-president Zuma back on lead vocals.

**When:** Only MK selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** MK announced its public arrival on 16 December 2023. By its August 2024 organisational statement, it listed former South African president Jacob Zuma as party president. The joke contrasts a new party with a familiar leader; it does not identify today’s municipal candidates.

**Meaning:** Former ANC president Jacob Zuma leading a new party is likened to a familiar singer returning with a different band.

**Previous wording:** MK: the ANC’s greatest hits, with the original lead singer.

**Review decision:** Clarity pass: Identifies the familiar singer and avoids making the reader infer which former ANC figure the joke means.

**Current backstory — National party history · December 2023–August 2024:** MK announced its public arrival on 16 December 2023. By its August 2024 organisational statement, it listed former South African president Jacob Zuma as party president. The joke contrasts a new party with a familiar leader; it does not identify today’s municipal candidates.

**Sources:** [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/party-commentary.ts · intro-mk-arrival

### MK-06 · Clarified

> MK: recruited the EFF’s deputy, Floyd Shivambu. The EFF got a forwarding address.

**When:** Only MK selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** Floyd Shivambu moved from the EFF to MK in August 2024 and was named MK National Organiser on 22 August. This is a dated episode, not a statement about his current affiliation.

**Meaning:** Floyd Shivambu moved from EFF deputy president to MK in 2024, imagined as leaving a forwarding address with his former party.

**Previous wording:** MK: recruited Floyd Shivambu. The EFF got a forwarding address.

**Review decision:** Clarity pass: Identifies Shivambu’s previous role, which supplies the missing reason the EFF appears in the punchline.

**Current backstory — National party history · August 2024:** Floyd Shivambu moved from the EFF to MK in August 2024 and was named MK National Organiser on 22 August. This is a dated episode, not a statement about his current affiliation.

**Sources:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party) · [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party): read — EWN 15 August report confirms Shivambu leaving EFF and joining MK.; [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/party-commentary.ts · intro-mk-recruit

### MK-05 · Restored

> MK: building a new party from other parties’ spare parts.

**When:** Only MK selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** Floyd Shivambu moved from the EFF to MK in August 2024 and was named MK National Organiser on 22 August. This is a dated episode, not a statement about his current affiliation.

**Meaning:** Spare parts means politicians arriving from other parties.

**Review decision:** Restore the spare-parts recruitment metaphor as ordinary satire of party-switching politicians. The misleading implication that Shivambu became MK deputy president remains removed.

**Current backstory — National party history · August 2024:** Floyd Shivambu moved from the EFF to MK in August 2024 and was named MK National Organiser on 22 August. This is a dated episode, not a statement about his current affiliation.

**Sources:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party) · [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party): read — EWN 15 August report confirms Shivambu leaving EFF and joining MK.; [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/party-commentary.ts · intro-mk-recruit

### MK-09 · Clarified

> MK: most seats in KwaZulu-Natal. Its rivals pooled theirs and took the cake.

**When:** Only MK selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** MK won the largest share in KwaZulu-Natal in 2024 but not an outright majority. The legislature elected the IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This provincial episode does not describe the selected council.

**Meaning:** MK was the largest party in the provincial legislature, but a grouping of other parties had enough votes to elect a different premier.

**Previous wording:** MK: won the biggest slice of KZN. Watched someone else cut the cake.

**Review decision:** Clarity pass: Expands the province name, identifies the slices as seats, and explains how other parties could prevail.

**Current backstory — KwaZulu-Natal · June 2024:** MK won the largest share in KwaZulu-Natal in 2024 but not an outright majority. The legislature elected the IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This provincial episode does not describe the selected council.

**Sources:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/) · [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** src/lib/seats/party-commentary.ts · intro-mk-kzn

### MK-11 · Clarified

> MK: most seats in KwaZulu-Natal, but no majority. Then the other parties started adding.

**When:** Only MK selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** MK won the largest share in KwaZulu-Natal in 2024 but not an outright majority. The legislature elected the IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This provincial episode does not describe the selected council.

**Meaning:** Having more seats than each other party individually did not give MK a majority; other parties could combine their votes.

**Previous wording:** MK: first in KZN. Then the other parties started adding.

**Review decision:** Clarity pass: States the missing distinction between the largest party and an outright majority before the arithmetic punchline.

**Current backstory — KwaZulu-Natal · June 2024:** MK won the largest share in KwaZulu-Natal in 2024 but not an outright majority. The legislature elected the IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This provincial episode does not describe the selected council.

**Sources:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/) · [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** src/lib/seats/party-commentary.ts · intro-mk-kzn

### IFP-02 · Clarified

> IFP: got the KwaZulu-Natal premier’s office. The coalition partners kept the spare keys.

**When:** Only IFP selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Meaning:** The IFP secured the premiership with other parties’ support, imagined as occupying an office to which coalition partners also hold keys.

**Previous wording:** IFP: got the KZN keys. The coalition partners kept the spare set.

**Review decision:** Clarity pass: Identifies the office and province instead of leaving KZN keys unexplained.

**Current backstory — KwaZulu-Natal · June 2024:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Sources:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf) · [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** src/lib/seats/party-commentary.ts · intro-ifp-premier

### IFP-03 · Kept

> IFP: the premier’s chair came with more conditions than a cellphone contract.

**When:** Only IFP selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Meaning:** Coalition compromises are compared with the fine print in a cellphone contract.

**Review decision:** Restore the tea-break exaggeration about a close 41–39 vote. It makes no rule claim that one absence would automatically defeat the majority. Keep the approved cellphone-contract line.

**Current backstory — KwaZulu-Natal · June 2024:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Sources:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf) · [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** src/lib/seats/party-commentary.ts · intro-ifp-premier

### IFP-01 · Clarified

> IFP: won KZN’s premier vote 41–39. Too tight for a tea break.

**When:** Only IFP selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Meaning:** The 41–39 election of the IFP premier was close enough to inspire a joke about everyone needing to stay for the vote.

**Previous wording:** IFP: that premier vote was too tight for a tea break.

**Review decision:** Clarity pass: Supplies the close margin that explains why a tea break would be risky. Restored humour retained.

**Current backstory — KwaZulu-Natal · June 2024:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Sources:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf) · [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** src/lib/seats/party-commentary.ts · intro-ifp-premier

### IFP-05 · Clarified

> IFP: Hlabisa got the Cooperative Governance ministry. In a coalition, even the title is wishful thinking.

**When:** Only IFP selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** IFP leader Velenkosini Hlabisa was named Minister of Cooperative Governance and Traditional Affairs in June 2024. The title and appointment inspire the wordplay.

**Meaning:** Hlabisa’s ministerial portfolio literally includes cooperative governance, a phrase turned into a joke about the work required to keep coalition partners cooperating.

**Previous wording:** IFP: Hlabisa got Cooperative Governance. Even the job title is wishful thinking.

**Review decision:** Clarity pass: Identifies the ministry and makes the coalition-cooperation wordplay explicit. Restored humour retained.

**Current backstory — National cabinet · June 2024:** IFP leader Velenkosini Hlabisa was named Minister of Cooperative Governance and Traditional Affairs in June 2024. The title and appointment inspire the wordplay.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-ifp-cogta

### IFP-12 · Clarified

> IFP: after the EFF breakup, any reunion needs a mediator and separate chairs.

**When:** Only IFP selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** IFP and EFF accounts describe an end to their cooperation in January 2023. The IFP said it had refused an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their explanations of responsibility differed.

**Meaning:** IFP–EFF cooperation ended in 2023; a hypothetical reunion is imagined as an awkward meeting requiring distance and mediation.

**Previous wording:** IFP: the EFF reunion needs a mediator and separate chairs.

**Review decision:** Clarity pass: States that a breakup preceded the hypothetical reunion, without assigning blame or inventing a later reunion.

**Current backstory — Party negotiations · January 2023:** IFP and EFF accounts describe an end to their cooperation in January 2023. The IFP said it had refused an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their explanations of responsibility differed.

**Sources:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/) · [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf)

**Source checks:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/): read — IFP 30 January statement sets out its account of uMhlathuze request/refusal; blame is not treated as fact.; [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf): read — EFF 29 January statement records ending ties, withdrawing support and deputy mayors returning to ordinary councillor roles; its accusations remain party claims.

**Code:** src/lib/seats/party-commentary.ts · intro-ifp-eff-split

### PA-04 · Clarified

> PA: got the Sport, Arts and Culture ministry. The coalition already had enough drama.

**When:** Only PA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** PA leader Gayton McKenzie was named Minister of Sport, Arts and Culture in June 2024. The sporting metaphors refer to that portfolio.

**Meaning:** The PA’s ministerial portfolio includes the arts, while coalition disagreements provide another, comic meaning of drama.

**Previous wording:** PA: Sport, Arts and Culture. The coalition already had enough drama.

**Review decision:** Clarity pass: Explains why the list of sport, arts and culture appears before the drama joke.

**Current backstory — National cabinet · June 2024:** PA leader Gayton McKenzie was named Minister of Sport, Arts and Culture in June 2024. The sporting metaphors refer to that portfolio.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-pa-sport

### PA-02 · Clarified

> PA: Gayton McKenzie got the sports ministry. Passing the microphone remains optional.

**When:** Only PA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** PA leader Gayton McKenzie was named Minister of Sport, Arts and Culture in June 2024. The sporting metaphors refer to that portfolio.

**Meaning:** Gayton McKenzie’s sports portfolio supplies the idea of passing, applied to the microphone and his outspoken public persona.

**Previous wording:** PA: Gayton got Sport. Passing the microphone remains optional.

**Review decision:** Clarity pass: Uses the full name and identifies the ministry so the reader need not recognise Gayton or the appointment in advance. Restored humour retained.

**Current backstory — National cabinet · June 2024:** PA leader Gayton McKenzie was named Minister of Sport, Arts and Culture in June 2024. The sporting metaphors refer to that portfolio.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-pa-sport

### PA-07 · Clarified

> PA: Gayton McKenzie became Central Karoo district mayor. His opening speech needed a bigger district.

**When:** Only PA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** Gayton McKenzie became Central Karoo district mayor in April 2022, in a coalition including the PA, ANC and Karoo Democratic Force. This is a district council episode, not a claim about this municipality.

**Meaning:** McKenzie’s district mayoralty supplies the setting for an obviously exaggerated joke about an outsized speaking presence.

**Previous wording:** PA: the Central Karoo wasn’t big enough for the opening speech.

**Review decision:** Clarity pass: Names the person and actual district role before the hyperbole; it does not present the exaggerated speech as a sourced incident. Restored humour retained.

**Current backstory — Central Karoo district · April 2022:** Gayton McKenzie became Central Karoo district mayor in April 2022, in a coalition including the PA, ANC and Karoo Democratic Force. This is a district council episode, not a claim about this municipality.

**Sources:** [SABC · 12 Apr 2022](https://www.sabcnews.com/sabcnews/mckenzie-promises-to-reject-mayoral-benefits/)

**Source checks:** [SABC · 12 Apr 2022](https://www.sabcnews.com/sabcnews/mckenzie-promises-to-reject-mayoral-benefits/): read — SABC 12 April confirms McKenzie’s district mayoralty and ANC/KDF partners; does not support exaggerated speech size or personal ambition.

**Code:** src/lib/seats/party-commentary.ts · intro-pa-karoo

### PA-08 · Restored

> PA: took the Karoo mayoral chain. Wore it like a heavyweight belt.

**When:** Only PA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** Gayton McKenzie became Central Karoo district mayor in April 2022, in a coalition including the PA, ANC and Karoo Democratic Force. This is a district council episode, not a claim about this municipality.

**Meaning:** The chain is compared to a sporting championship belt.

**Review decision:** Restore the two strongest larger-than-life persona jokes. The speech-size and heavyweight-belt images are comic exaggeration. Explicitly identify Central Karoo as a district and do not restore the inaccurate small-town mayor line.

**Current backstory — Central Karoo district · April 2022:** Gayton McKenzie became Central Karoo district mayor in April 2022, in a coalition including the PA, ANC and Karoo Democratic Force. This is a district council episode, not a claim about this municipality.

**Sources:** [SABC · 12 Apr 2022](https://www.sabcnews.com/sabcnews/mckenzie-promises-to-reject-mayoral-benefits/)

**Source checks:** [SABC · 12 Apr 2022](https://www.sabcnews.com/sabcnews/mckenzie-promises-to-reject-mayoral-benefits/): read — SABC 12 April confirms McKenzie’s district mayoralty and ANC/KDF partners; does not support exaggerated speech size or personal ambition.

**Code:** src/lib/seats/party-commentary.ts · intro-pa-karoo

### PA-11 · Clarified

> ActionSA said it offered two Joburg mayoral committee posts to win PA back in 2023. Apparently flowers wouldn’t do.

**When:** Only PA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** ActionSA said in January 2023 that it had offered two mayoral committee positions to restore PA support for Johannesburg’s coalition. Its account said the negotiating teams, including PA and DA, accepted the proposal but the DA Federal Executive rejected it. This records ActionSA’s account of negotiations, not posts ultimately received by PA.

**Meaning:** ActionSA described offering two executive committee positions to restore PA support, likened to a reconciliation attempt requiring more than flowers.

**Previous wording:** ActionSA said it offered PA two Joburg portfolios in 2023. Apparently flowers wouldn’t do.

**Review decision:** Clarity pass: Preserves the source attribution and year, identifies the political posts and explains the attempt to win PA back that makes flowers relevant.

**Current backstory — Johannesburg negotiations · January 2023:** ActionSA said in January 2023 that it had offered two mayoral committee positions to restore PA support for Johannesburg’s coalition. Its account said the negotiating teams, including PA and DA, accepted the proposal but the DA Federal Executive rejected it. This records ActionSA’s account of negotiations, not posts ultimately received by PA.

**Sources:** [ActionSA account of negotiations · 25 Jan 2023](https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/)

**Source checks:** [ActionSA account of negotiations · 25 Jan 2023](https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/): read — ActionSA 25 January statement says two MMC positions offered, negotiating teams accepted, DA Federal Executive rejected; no three-position total stated.

**Code:** src/lib/seats/party-commentary.ts · intro-pa-joburg

### FF+-01 · Revised

> FF+: Freedom in the name. Prison keys in the 2024 Cabinet deal.

**When:** Only FF+ selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** FF+ leader at the time, Pieter Groenewald, was named Minister of Correctional Services in June 2024. The jokes concern the portfolio, not allegations about any coalition partner.

**Meaning:** Freedom in the party name is contrasted with the Correctional Services portfolio assigned to Pieter Groenewald in 2024; it does not accuse partners of crimes.

**Previous wording:** FF+: Freedom in the name. Prison keys in the deal.

**Review decision:** Keep the portfolio/name wordplay with date and the plainly impossible long-speech sentence. Remove duplicates.

**Current backstory — National cabinet · June 2024:** FF+ leader at the time, Pieter Groenewald, was named Minister of Correctional Services in June 2024. The jokes concern the portfolio, not allegations about any coalition partner.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024) · [FF+ leadership statement · 22 Jul 2024](https://www.vfplus.org.za/media-releases/ministers-post-for-ff-plus-leader-necessitates-minor-changes-to-partys-parliamentary-leadership/)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [FF+ leadership statement · 22 Jul 2024](https://www.vfplus.org.za/media-releases/ministers-post-for-ff-plus-leader-necessitates-minor-changes-to-partys-parliamentary-leadership/): indexed-party-statement — Party identifies Groenewald as its leader and appointed Minister of Correctional Services in July 2024 statement.

**Code:** src/lib/seats/party-commentary.ts · intro-ffplus-corrections

### FF+-04 · Revised

> FF+: got Correctional Services. Still can’t sentence anyone for a long speech.

**When:** Only FF+ selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** FF+ leader at the time, Pieter Groenewald, was named Minister of Correctional Services in June 2024. The jokes concern the portfolio, not allegations about any coalition partner.

**Meaning:** It imagines punishment for long speeches; no such punishment is real.

**Review decision:** Keep the portfolio/name wordplay with date and the plainly impossible long-speech sentence. Remove duplicates.

**Current backstory — National cabinet · June 2024:** FF+ leader at the time, Pieter Groenewald, was named Minister of Correctional Services in June 2024. The jokes concern the portfolio, not allegations about any coalition partner.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024) · [FF+ leadership statement · 22 Jul 2024](https://www.vfplus.org.za/media-releases/ministers-post-for-ff-plus-leader-necessitates-minor-changes-to-partys-parliamentary-leadership/)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [FF+ leadership statement · 22 Jul 2024](https://www.vfplus.org.za/media-releases/ministers-post-for-ff-plus-leader-necessitates-minor-changes-to-partys-parliamentary-leadership/): indexed-party-statement — Party identifies Groenewald as its leader and appointed Minister of Correctional Services in July 2024 statement.

**Code:** src/lib/seats/party-commentary.ts · intro-ffplus-corrections

### FF+-05 · Clarified

> FF+: pledged to replace the ANC, then joined it in government. Cabinet-sized loophole.

**When:** Only FF+ selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. In June 2024 it was named among participants in the ANC-inclusive GNU.

**Meaning:** FF+ participated in an agreement aimed at replacing ANC government and later entered the ANC-inclusive national government.

**Previous wording:** FF+: the anti-ANC pact had a Cabinet-sized loophole.

**Review decision:** Clarity pass: States the before-and-after contradiction instead of assuming the reader knows the pact and Cabinet appointment.

**Current backstory — National agreements · August 2023–June 2024:** FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. In June 2024 it was named among participants in the ANC-inclusive GNU.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.

**Code:** src/lib/seats/party-commentary.ts · intro-ffplus-charter

### FF+-06 · Clarified

> FF+: opposed the ANC, then joined it in the Cabinet carpool.

**When:** Only FF+ selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. In June 2024 it was named among participants in the ANC-inclusive GNU.

**Meaning:** Former opponents ended up sharing national government, imagined as sharing a ride to Cabinet.

**Previous wording:** FF+: opposed the ANC right up to the Cabinet parking bay.

**Review decision:** Clarity pass: Makes the shared Cabinet arrangement explicit while retaining the parking-and-commuting metaphor. Restored humour retained.

**Current backstory — National agreements · August 2023–June 2024:** FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. In June 2024 it was named among participants in the ANC-inclusive GNU.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.

**Code:** src/lib/seats/party-commentary.ts · intro-ffplus-charter

### FF+-08 · Clarified

> FF+: joined the ANC in government. So that’s what the plus was for.

**When:** Only FF+ selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. In June 2024 it was named among participants in the ANC-inclusive GNU.

**Meaning:** FF+ joining government with the ANC creates a joke about the plus sign in its name adding another party.

**Previous wording:** FF+: the plus apparently includes the ANC.

**Review decision:** Clarity pass: Adds the governing arrangement that gives the plus-sign wordplay its meaning.

**Current backstory — National agreements · August 2023–June 2024:** FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. In June 2024 it was named among participants in the ANC-inclusive GNU.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.

**Code:** src/lib/seats/party-commentary.ts · intro-ffplus-charter

### FF+-10 · Clarified

> FF+: got the Speaker’s job in Cape Town. Small party, big volume control.

**When:** Only FF+ selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** FF+ joined the DA-led seven-party Cape Town coalition in 2006, and its councillor Dirk Smit became speaker. This dated city example illustrates negotiating roles without being the largest party.

**Meaning:** A small party’s councillor became Cape Town Speaker, with the chairing role imagined as a volume control over a much larger council.

**Previous wording:** FF+: a small Cape Town caucus with a Speaker-sized volume control.

**Review decision:** Clarity pass: Replaces caucus jargon and makes the actual Speaker appointment explicit.

**Current backstory — Cape Town · March 2006:** FF+ joined the DA-led seven-party Cape Town coalition in 2006, and its councillor Dirk Smit became speaker. This dated city example illustrates negotiating roles without being the largest party.

**Sources:** [ACCORD / Zwelethu Jolobe · Cape Town 2006](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf)

**Source checks:** [ACCORD / Zwelethu Jolobe · Cape Town 2006](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf): read — Jolobe ACCORD monograph, printed page 100 / PDF page 28, records seven-party coalition and FF+ Dirk Smit becoming speaker.

**Code:** src/lib/seats/party-commentary.ts · intro-ffplus-speaker

### FF+-09 · Clarified

> FF+: why win Cape Town outright when you can get the Speaker’s bell that shuts everyone up?

**When:** Only FF+ selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** FF+ joined the DA-led seven-party Cape Town coalition in 2006, and its councillor Dirk Smit became speaker. This dated city example illustrates negotiating roles without being the largest party.

**Meaning:** Securing the Speaker’s role can give a small party an important council position without winning an outright majority; the bell exaggerates the chair’s power to call for order.

**Previous wording:** FF+: why win Cape Town when you can get the bell that shuts everyone up?

**Review decision:** Clarity pass: Identifies the bell with the Speaker and distinguishes winning an outright majority from gaining an influential coalition role. Restored humour retained.

**Current backstory — Cape Town · March 2006:** FF+ joined the DA-led seven-party Cape Town coalition in 2006, and its councillor Dirk Smit became speaker. This dated city example illustrates negotiating roles without being the largest party.

**Sources:** [ACCORD / Zwelethu Jolobe · Cape Town 2006](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf)

**Source checks:** [ACCORD / Zwelethu Jolobe · Cape Town 2006](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf): read — Jolobe ACCORD monograph, printed page 100 / PDF page 28, records seven-party coalition and FF+ Dirk Smit becoming speaker.

**Code:** src/lib/seats/party-commentary.ts · intro-ffplus-speaker

### ActionSA-02 · Clarified

> ActionSA: founder Herman Mashaba left the DA. The arguments followed him home.

**When:** Only ActionSA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** Herman Mashaba served as Johannesburg mayor under the DA from 2016 to 2019 and launched ActionSA in August 2020. The reference is to those roles; it does not adopt either party’s accusations about their split.

**Meaning:** ActionSA’s founder previously belonged to the DA; the joke imagines the old political disagreements following him into his new party.

**Previous wording:** ActionSA: Herman left the DA. The arguments followed him home.

**Review decision:** Clarity pass: Adds Mashaba’s full name and founding role so Herman is not an unexplained reference.

**Current backstory — Party history · 2016–2020:** Herman Mashaba served as Johannesburg mayor under the DA from 2016 to 2019 and launched ActionSA in August 2020. The reference is to those roles; it does not adopt either party’s accusations about their split.

**Sources:** [ActionSA organisational history](https://www.actionsa.org.za/ready-for-action/) · [ActionSA account of Mashaba’s DA mayoralty](https://www.actionsa.org.za/responding-to-often-raised-issues/) · [Johannesburg mayoral history](https://joburg.org.za/play_/Pages/Play%20in%20Joburg/Culture%20and%20Heritage/Links/Johannesburg%27s-mayors.aspx)

**Source checks:** [ActionSA organisational history](https://www.actionsa.org.za/ready-for-action/): read — ActionSA organisational page states party established 29 August 2020.; [ActionSA account of Mashaba’s DA mayoralty](https://www.actionsa.org.za/responding-to-often-raised-issues/): read — Mashaba’s 3 January 2025 account identifies former DA mayoralty and 2019 resignation. Accusations about motives are not adopted.; [Johannesburg mayoral history](https://joburg.org.za/play_/Pages/Play%20in%20Joburg/Culture%20and%20Heritage/Links/Johannesburg%27s-mayors.aspx): indexed-official-extract — City lists Herman Mashaba as mayor 2016–2019; also corroborated by official 2025 State of the City address.

**Code:** src/lib/seats/party-commentary.ts · intro-actionsa-origins

### ActionSA-03 · Clarified

> ActionSA: founded by an ex-DA mayor. New party, still knows the DA’s buttons by heart.

**When:** Only ActionSA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** Herman Mashaba served as Johannesburg mayor under the DA from 2016 to 2019 and launched ActionSA in August 2020. The reference is to those roles; it does not adopt either party’s accusations about their split.

**Meaning:** A former DA mayor founded ActionSA, supplying the familiarity behind the metaphor of knowing how to push the DA’s buttons.

**Previous wording:** ActionSA: new party. Still knows the DA’s buttons by heart.

**Review decision:** Clarity pass: Adds the relationship that explains why a new party would know the DA so well.

**Current backstory — Party history · 2016–2020:** Herman Mashaba served as Johannesburg mayor under the DA from 2016 to 2019 and launched ActionSA in August 2020. The reference is to those roles; it does not adopt either party’s accusations about their split.

**Sources:** [ActionSA organisational history](https://www.actionsa.org.za/ready-for-action/) · [ActionSA account of Mashaba’s DA mayoralty](https://www.actionsa.org.za/responding-to-often-raised-issues/) · [Johannesburg mayoral history](https://joburg.org.za/play_/Pages/Play%20in%20Joburg/Culture%20and%20Heritage/Links/Johannesburg%27s-mayors.aspx)

**Source checks:** [ActionSA organisational history](https://www.actionsa.org.za/ready-for-action/): read — ActionSA organisational page states party established 29 August 2020.; [ActionSA account of Mashaba’s DA mayoralty](https://www.actionsa.org.za/responding-to-often-raised-issues/): read — Mashaba’s 3 January 2025 account identifies former DA mayoralty and 2019 resignation. Accusations about motives are not adopted.; [Johannesburg mayoral history](https://joburg.org.za/play_/Pages/Play%20in%20Joburg/Culture%20and%20Heritage/Links/Johannesburg%27s-mayors.aspx): indexed-official-extract — City lists Herman Mashaba as mayor 2016–2019; also corroborated by official 2025 State of the City address.

**Code:** src/lib/seats/party-commentary.ts · intro-actionsa-origins

### ActionSA-04 · Clarified

> ActionSA: its founder left the DA. The breakup keeps getting renewed for another season.

**When:** Only ActionSA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** Herman Mashaba served as Johannesburg mayor under the DA from 2016 to 2019 and launched ActionSA in August 2020. The reference is to those roles; it does not adopt either party’s accusations about their split.

**Meaning:** The founder’s departure from the DA is imagined as an ongoing television breakup storyline.

**Previous wording:** ActionSA: the DA breakup that keeps getting renewed for another season.

**Review decision:** Clarity pass: Identifies whose breakup the joke refers to rather than implying ActionSA itself used to be the DA. Restored humour retained.

**Current backstory — Party history · 2016–2020:** Herman Mashaba served as Johannesburg mayor under the DA from 2016 to 2019 and launched ActionSA in August 2020. The reference is to those roles; it does not adopt either party’s accusations about their split.

**Sources:** [ActionSA organisational history](https://www.actionsa.org.za/ready-for-action/) · [ActionSA account of Mashaba’s DA mayoralty](https://www.actionsa.org.za/responding-to-often-raised-issues/) · [Johannesburg mayoral history](https://joburg.org.za/play_/Pages/Play%20in%20Joburg/Culture%20and%20Heritage/Links/Johannesburg%27s-mayors.aspx)

**Source checks:** [ActionSA organisational history](https://www.actionsa.org.za/ready-for-action/): read — ActionSA organisational page states party established 29 August 2020.; [ActionSA account of Mashaba’s DA mayoralty](https://www.actionsa.org.za/responding-to-often-raised-issues/): read — Mashaba’s 3 January 2025 account identifies former DA mayoralty and 2019 resignation. Accusations about motives are not adopted.; [Johannesburg mayoral history](https://joburg.org.za/play_/Pages/Play%20in%20Joburg/Culture%20and%20Heritage/Links/Johannesburg%27s-mayors.aspx): indexed-official-extract — City lists Herman Mashaba as mayor 2016–2019; also corroborated by official 2025 State of the City address.

**Code:** src/lib/seats/party-commentary.ts · intro-actionsa-origins

### ActionSA-05 · Clarified

> ActionSA: founded by a former DA mayor. Signed a pact with the ex. What could possibly go wrong?

**When:** Only ActionSA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** ActionSA joined DA, IFP, FF+ and other parties at the August 2023 Multi-Party Charter talks. The stated aim was to replace the ANC government and keep the EFF out; this was a pre-election national pact.

**Meaning:** ActionSA was founded by former DA mayor Herman Mashaba and later signed a national pre-election pact involving the DA, likened to reuniting with an ex.

**Previous wording:** ActionSA: signed a pact with the ex. What could possibly go wrong?

**Review decision:** Clarity pass: Explains which party is the ex and why, while keeping the relationship punchline.

**Current backstory — National party negotiations · August 2023:** ActionSA joined DA, IFP, FF+ and other parties at the August 2023 Multi-Party Charter talks. The stated aim was to replace the ANC government and keep the EFF out; this was a pre-election national pact.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/)

**Source checks:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.

**Code:** src/lib/seats/party-commentary.ts · intro-actionsa-charter

### ActionSA-09 · Clarified

> ActionSA: from an anti-ANC pact to ANC help winning Tshwane’s mayoralty. Sharp turn. No indicator.

**When:** Only ActionSA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** ActionSA’s Nasiphi Moya became Tshwane mayor on 9 October 2024 with support including the ANC and EFF, after DA mayor Cilliers Brink was removed. This local history differs from ActionSA’s earlier national pact.

**Meaning:** ActionSA’s earlier national anti-ANC pact contrasts with ANC support for its Tshwane mayor; the change is imagined as an abrupt road turn.

**Previous wording:** ActionSA: the road to Tshwane’s mayoral office took a sharp ANC turn.

**Review decision:** Clarity pass: States both ends of the political turn so the driving metaphor does not require knowledge of the earlier pact.

**Current backstory — Tshwane · October 2024:** ActionSA’s Nasiphi Moya became Tshwane mayor on 9 October 2024 with support including the ANC and EFF, after DA mayor Cilliers Brink was removed. This local history differs from ActionSA’s earlier national pact.

**Sources:** [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997) · [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/)

**Source checks:** [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/party-commentary.ts · intro-actionsa-tshwane

### ActionSA-10 · Clarified

> ActionSA: signed an anti-ANC pact, then won Tshwane’s mayoralty with ANC support. Same ambition, new supporting cast.

**When:** Only ActionSA selected. Drawn from retained introductions; relevant local solo history can also compete.

**Context:** ActionSA’s Nasiphi Moya became Tshwane mayor on 9 October 2024 with support including the ANC and EFF, after DA mayor Cilliers Brink was removed. This local history differs from ActionSA’s earlier national pact.

**Meaning:** The party’s earlier anti-ANC national agreement contrasts with the ANC’s subsequent support for its Tshwane mayor, imagined as a change of cast.

**Previous wording:** ActionSA: kept the mayoral ambition. Changed the supporting cast.

**Review decision:** Clarity pass: Identifies the actual change in support that the theatrical metaphor previously left unstated.

**Current backstory — Tshwane · October 2024:** ActionSA’s Nasiphi Moya became Tshwane mayor on 9 October 2024 with support including the ANC and EFF, after DA mayor Cilliers Brink was removed. This local history differs from ActionSA’s earlier national pact.

**Sources:** [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997) · [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/)

**Source checks:** [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/party-commentary.ts · intro-actionsa-tshwane

## Relationships & local history (88)

### REL-01 · Restored

> DA + EFF: first item on the agenda: pretend nobody remembers the campaign insults.

**When:** DA + EFF selected · Any municipality (national backstory) · Newly completed public red line gets priority.

**Context:** The DA acknowledged issue-by-issue EFF support for councils after 2016. Its July 2024 GNU statement sought to keep EFF and MK out of executive power; Helen Zille called cooperation with them almost impossible in November 2025. On 6 November 2026, Daily Maverick reported Geordin Hill-Lewis declining to rule partners out publicly. These dated statements do not establish a local agreement.

**Meaning:** The imaginary first agenda item asks DA and EFF negotiators to ignore their earlier campaign insults. Those past attacks are the awkward baggage at this fictional table.

**Previous wording:** DA + EFF: the red line has applied for special leave.

**Review decision:** Clarify the political-baggage joke: old campaign insults make hypothetical negotiations awkward. Keep the qualified, dated factual backstory.

**Current backstory — Party positions · 2019–November 2026:** The DA acknowledged issue-by-issue EFF support for councils after 2016. Its July 2024 GNU statement sought to keep EFF and MK out of executive power; Helen Zille called cooperation with them almost impossible in November 2025. On 6 November 2026, Daily Maverick reported Geordin Hill-Lewis declining to rule partners out publicly. These dated statements do not establish a local agreement.

**Sources:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power) · [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists) · [Newsday interview with Helen Zille · 3 Nov 2025](https://newsday.co.za/south-africa/9110/the-da-will-never-work-with-the-eff-or-mk/) · [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/)

**Source checks:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power): read — DA July 2019 account explicitly distinguishes issue-by-issue EFF support from the formal governing coalition.; [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists): read — DA 17 July 2024 statement expressly says GNU role is to prevent MK/EFF access to executive power.; [Newsday interview with Helen Zille · 3 Nov 2025](https://newsday.co.za/south-africa/9110/the-da-will-never-work-with-the-eff-or-mk/): read — Newsday interview body says almost impossible and decisions after seat results; headline never is stronger. Background corrected and updated with dated 2026 follow-up.; [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/): read — Daily Maverick 6 November 2026 explicitly reports Mashaba open to talks including MK with concerns; also Hill-Lewis cautious public stance and EFF new openness conditional on socialist programme.

**Code:** src/lib/seats/political-history.ts · da-eff-red-lines

### REL-02 · Clarified

> DA + MK: the DA’s Helen Zille doubted this match. You’ve arranged the date.

**When:** DA + MK selected · Any municipality (national backstory) · Newly completed public red line gets priority.

**Context:** The DA’s July 2024 GNU statement sought to keep MK and EFF out of executive power. Helen Zille called cooperation with them almost impossible in November 2025. On 6 November 2026, Daily Maverick reported Geordin Hill-Lewis declining to rule partners out publicly. That is not an announcement of a DA–MK deal.

**Meaning:** Helen Zille’s doubt about DA–MK cooperation becomes an awkward date arranged by the player.

**Previous wording:** DA + MK: Helen’s nightmare now has a seating plan.

**Review decision:** Clarity pass: Identifies Helen Zille with the DA and states her earlier doubt before the matchmaking joke. Restored humour retained.

**Current backstory — Party positions · July 2024–November 2026:** The DA’s July 2024 GNU statement sought to keep MK and EFF out of executive power. Helen Zille called cooperation with them almost impossible in November 2025. On 6 November 2026, Daily Maverick reported Geordin Hill-Lewis declining to rule partners out publicly. That is not an announcement of a DA–MK deal.

**Sources:** [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists) · [Newsday interview with Helen Zille · 3 Nov 2025](https://newsday.co.za/south-africa/9110/the-da-will-never-work-with-the-eff-or-mk/) · [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/)

**Source checks:** [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists): read — DA 17 July 2024 statement expressly says GNU role is to prevent MK/EFF access to executive power.; [Newsday interview with Helen Zille · 3 Nov 2025](https://newsday.co.za/south-africa/9110/the-da-will-never-work-with-the-eff-or-mk/): read — Newsday interview body says almost impossible and decisions after seat results; headline never is stronger. Background corrected and updated with dated 2026 follow-up.; [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/): read — Daily Maverick 6 November 2026 explicitly reports Mashaba open to talks including MK with concerns; also Hill-Lewis cautious public stance and EFF new openness conditional on socialist programme.

**Code:** src/lib/seats/political-history.ts · da-mk-red-lines

### REL-03 · Clarified

> DA + ActionSA: Joburg’s coalition exes are trying again. Hide the old screenshots.

**When:** DA + ActionSA selected · Johannesburg

**Context:** DA and ActionSA were partners in Johannesburg’s governing coalition. In January 2023, ActionSA publicly criticised the DA’s coalition negotiations and proposed putting forward its own mayoral candidate.

**Meaning:** Former coalition partners are treated as exes trying again, with old screenshots ready to reopen arguments.

**Previous wording:** DA + ActionSA: Joburg’s exes are trying again. Hide the old screenshots.

**Review decision:** Clarity pass: Adds coalition to explain what kind of exes these parties are while keeping the relationship joke.

**Current backstory — Johannesburg · January 2023:** DA and ActionSA were partners in Johannesburg’s governing coalition. In January 2023, ActionSA publicly criticised the DA’s coalition negotiations and proposed putting forward its own mayoral candidate.

**Sources:** [ActionSA statement · 26 Jan 2023](https://www.actionsa.org.za/coalition-negotiations-collapse-ahead-of-joburg-motions-of-no-confidence/) · [Johannesburg council · 26 Jan 2023](https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf)

**Source checks:** [ActionSA statement · 26 Jan 2023](https://www.actionsa.org.za/coalition-negotiations-collapse-ahead-of-joburg-motions-of-no-confidence/): read — ActionSA 26 January statement confirms talks failed, current coalition and proposed ActionSA mayoral candidate. Forecast of removal is not used as proof of outcome.; [Johannesburg council · 26 Jan 2023](https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf): limited-extraction — Official scanned PDF was reachable but readable result could not be established using available extraction. Removal independently checked against post-vote SABC reporting; no vote total copied.

**Code:** src/lib/seats/political-history.ts · joburg-da-actionsa

### REL-04 · Clarified

> DA + ActionSA in Tshwane: coalition exes. Same office keys, fresh trust issues.

**When:** DA + ActionSA selected · Tshwane

**Context:** ActionSA announced its withdrawal of support from Tshwane’s DA-led coalition in September 2024. Its own statement cited the city’s finances; that was the party’s stated explanation.

**Meaning:** Former coalition partners return to familiar offices with lingering trust issues.

**Previous wording:** DA + ActionSA in Tshwane: same exes, same keys, fresh trust issues.

**Review decision:** Clarity pass: Names the coalition relationship and specifies office keys while retaining the exes joke.

**Current backstory — Tshwane · September 2024:** ActionSA announced its withdrawal of support from Tshwane’s DA-led coalition in September 2024. Its own statement cited the city’s finances; that was the party’s stated explanation.

**Sources:** [ActionSA statement · 25 Sep 2024](https://www.actionsa.org.za/gauteng-in-action-25-september-2024/)

**Source checks:** [ActionSA statement · 25 Sep 2024](https://www.actionsa.org.za/gauteng-in-action-25-september-2024/): read — ActionSA 25 September statement explicitly records support withdrawal and financial-state explanation as the party’s position.

**Code:** src/lib/seats/political-history.ts · tshwane-da-actionsa

### REL-05 · Clarified

> ANC + ActionSA: ANC votes helped elect ActionSA’s Tshwane mayor. The anti-ANC speeches are on unpaid leave.

**When:** ANC + ActionSA selected · Tshwane

**Context:** ActionSA joined the August 2023 Multi-Party Charter aimed at replacing the ANC government. The ANC then backed ActionSA’s Nasiphi Moya for Tshwane mayor in October 2024. She was elected on 9 October, illustrating how local partners can differ from earlier national alignments.

**Meaning:** ANC votes helping elect an ActionSA mayor put earlier anti-ANC speeches on imaginary unpaid leave.

**Previous wording:** ANC + ActionSA: Tshwane’s anti-ANC speeches have been placed on unpaid leave.

**Review decision:** Clarity pass: Adds the vote and mayoral outcome that make the unpaid-leave joke understandable.

**Current backstory — Tshwane · 9 October 2024:** ActionSA joined the August 2023 Multi-Party Charter aimed at replacing the ANC government. The ANC then backed ActionSA’s Nasiphi Moya for Tshwane mayor in October 2024. She was elected on 9 October, illustrating how local partners can differ from earlier national alignments.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997) · [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/)

**Source checks:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.; [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/political-history.ts · tshwane-anc-actionsa

### REL-06 · Revised

> DA + PA in Joburg: the handshake comes with a counteroffer.

**When:** DA + PA selected · Johannesburg

**Context:** Talks to restore PA support for Johannesburg’s DA-led coalition broke down in January 2023. DA mayor Mpho Phalatse subsequently lost a no-confidence vote. Accounts of responsibility were disputed.

**Meaning:** The joke applies this dated political history to your fictional deal. It does not report a current alliance or a real private conversation.

**Review decision:** Add post-vote reporting rather than relying on forecast coverage; clarify support is withdrawn rather than council seats changing ownership.

**Current backstory — Johannesburg · January 2023:** Talks to restore PA support for Johannesburg’s DA-led coalition broke down in January 2023. DA mayor Mpho Phalatse subsequently lost a no-confidence vote. Accounts of responsibility were disputed.

**Sources:** [Johannesburg council · 26 Jan 2023](https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf) · [ActionSA statement · 26 Jan 2023](https://www.actionsa.org.za/coalition-negotiations-collapse-ahead-of-joburg-motions-of-no-confidence/) · [SABC · 26 Jan 2023, after the vote](https://www.sabcnews.com/sabcnews/joburg-mayor-mpho-phalatse-voted-out-of-office/)

**Source checks:** [ActionSA statement · 26 Jan 2023](https://www.actionsa.org.za/coalition-negotiations-collapse-ahead-of-joburg-motions-of-no-confidence/): read — ActionSA 26 January statement confirms talks failed, current coalition and proposed ActionSA mayoral candidate. Forecast of removal is not used as proof of outcome.; [Johannesburg council · 26 Jan 2023](https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf): limited-extraction — Official scanned PDF was reachable but readable result could not be established using available extraction. Removal independently checked against post-vote SABC reporting; no vote total copied.; [SABC · 26 Jan 2023](https://www.sabcnews.com/sabcnews/phalatse-upbeat-shell-defeat-motions-of-no-confidence/): read — SABC article is a pre-vote forecast and records PA support loss; it does not establish completed removal. Replaced by post-vote SABC article.; [SABC · 26 Jan 2023 after the vote](https://www.sabcnews.com/sabcnews/joburg-mayor-mpho-phalatse-voted-out-of-office/): read — Completed Phalatse removal. Article gives 140 in favour; its against-count differs from other coverage, so no numeric vote margin copied.

**Code:** src/lib/seats/political-history.ts · joburg-da-pa

### REL-07 · Kept

> ANC + EFF in Joburg: enemies on the posters, colleagues at the photocopier.

**When:** ANC + EFF selected · Johannesburg

**Context:** Johannesburg’s 2022/23 annual reporting lists both the ANC and EFF in the Government of Local Unity formed in January 2023, alongside several smaller parties.

**Meaning:** The joke applies this dated political history to your fictional deal. It does not report a current alliance or a real private conversation.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — Johannesburg · January 2023:** Johannesburg’s 2022/23 annual reporting lists both the ANC and EFF in the Government of Local Unity formed in January 2023, alongside several smaller parties.

**Sources:** [Johannesburg annual report · 2022/23](https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf)

**Source checks:** [Johannesburg annual report · 2022/23](https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf): read — Johannesburg annual report pages 35 and 40 lists ANC/EFF/PA and other parties in January 2023 GLU.

**Code:** src/lib/seats/political-history.ts · joburg-anc-eff

### REL-08 · Revised

> ANC + IFP: KZN’s old rivals now arguing over who booked the meeting room.

**When:** ANC + IFP selected · KwaZulu-Natal

**Context:** IFP, ANC, DA and NFP formed KwaZulu-Natal’s provincial unity government in June 2024. The legislature elected IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This was provincial cooperation, not a blanket municipal agreement.

**Meaning:** The joke applies this dated political history to your fictional deal. It does not report a current alliance or a real private conversation.

**Review decision:** Use directly checked legislature minutes and post-formation provincial reporting; the national GNU statement and 12 June talks report do not alone establish the completed four-party provincial arrangement. Make the fictional truce about residents tracking work.

**Current backstory — KwaZulu-Natal · June 2024:** IFP, ANC, DA and NFP formed KwaZulu-Natal’s provincial unity government in June 2024. The legislature elected IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This was provincial cooperation, not a blanket municipal agreement.

**Sources:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf) · [SABC · 18 Jun 2024, provincial government formed](https://www.sabcnews.com/sabcnews/new-kzn-premier-calls-on-executive-to-serve-with-dignity/)

**Source checks:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.; [IFP GNU statement · June 2024](https://ifp.org.za/newsroom/ifp-press-conference-to-provide-an-update-on-the-government-of-national-unity/): read — IFP 28 June statement confirms national GNU talks and ongoing KZN provincial unity government, but does not explicitly list all four provincial parties; replaced with direct completed-formation reporting and minutes.; [SABC · 18 Jun 2024](https://www.sabcnews.com/sabcnews/new-kzn-premier-calls-on-executive-to-serve-with-dignity/): read — Completed provincial government: ANC, IFP, DA, NFP; Ntuli sworn in and called executive to serve residents.

**Code:** src/lib/seats/political-history.ts · kzn-anc-ifp

### REL-09 · Kept

> ANC + DA: the attack ads must make excellent Cabinet icebreakers.

**When:** ANC + DA selected · Any municipality (national backstory)

**Context:** The ANC and DA joined the national Government of National Unity in June 2024. National cooperation does not establish an agreement in this municipality.

**Meaning:** The joke applies this dated political history to your fictional deal. It does not report a current alliance or a real private conversation.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — National politics · June 2024:** The ANC and DA joined the national Government of National Unity in June 2024. National cooperation does not establish an agreement in this municipality.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/political-history.ts · anc-da-gnu

### REL-10 · Clarified

> ANC + MK: Jacob Zuma’s old party meets his new one. Bring your own grudge.

**When:** ANC + MK selected · Any municipality (national backstory)

**Context:** Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party. That history informs the reunion joke, not a prediction of this deal.

**Meaning:** Jacob Zuma’s old and new parties turn a political reunion into a family gathering with old grudges.

**Previous wording:** ANC + MK: family reunion. Bring your own faction.

**Review decision:** Clarity pass: Names the person linking the parties so the family metaphor has an explicit setup.

**Current backstory — National politics · 2023–2024:** Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party. That history informs the reunion joke, not a prediction of this deal.

**Sources:** [ANC membership statement · 29 Jan 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/)

**Source checks:** [ANC membership statement · 29 Jan 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/): read — ANC statement dated 29 January confirms 16 December support announcement and immediate suspension resolution.

**Code:** src/lib/seats/political-history.ts · anc-mk-family

### REL-11 · Clarified

> DA + FF+: the anti-ANC carpool now stops at Cabinet. The ANC is already inside.

**When:** DA + FF+ selected · Any municipality (national backstory)

**Context:** DA and FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. Both were then named as participants in the ANC-inclusive national GNU in June 2024. These national precedents do not confirm a local coalition.

**Meaning:** The parties’ anti-ANC carpool reaches a Cabinet that also contains the ANC.

**Previous wording:** DA + FF+: the anti-ANC carpool now stops at Cabinet.

**Review decision:** Clarity pass: Adds the contradiction that makes the carpool joke work.

**Current backstory — National politics · June 2024:** DA and FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. Both were then named as participants in the ANC-inclusive national GNU in June 2024. These national precedents do not confirm a local coalition.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.

**Code:** src/lib/seats/political-history.ts · da-ff-gnu

### REL-12 · Clarified

> DA + PA: one unity government, two parties refusing to let the other finish a sentence.

**When:** DA + PA selected · Any municipality (national backstory)

**Context:** The DA and PA were both named in the national GNU in June 2024. Parties can cooperate nationally while competing or bargaining differently in individual councils.

**Meaning:** Parties in one unity government still compete to finish every sentence first.

**Previous wording:** DA + PA: one GNU, two parties refusing to let the other finish a sentence.

**Review decision:** Clarity pass: Expands the GNU acronym into ordinary language while preserving the interruption joke.

**Current backstory — National politics · June 2024:** The DA and PA were both named in the national GNU in June 2024. Parties can cooperate nationally while competing or bargaining differently in individual councils.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/political-history.ts · da-pa-gnu

### REL-13 · Restored

> ANC + EFF in Ekurhuleni: couples’ counselling, with a Speaker and a gavel.

**When:** ANC + EFF selected · Ekurhuleni

**Context:** ANC and EFF governed together in Ekurhuleni in 2023–2024. In March 2024, ANC representatives publicly threatened to end the arrangement after a disrupted council sitting. Their explanations were political claims, not an agreed account of blame.

**Meaning:** Couples’ counselling turns the parties’ strained relationship into a council scene, complete with Speaker and gavel.

**Previous wording:** ANC + EFF in Ekurhuleni: less couples’ counselling, more crowd control.

**Review decision:** Bring back the relationship humour without the earlier crowd-control suggestion of violence.

**Current backstory — Ekurhuleni · March 2024:** ANC and EFF governed together in Ekurhuleni in 2023–2024. In March 2024, ANC representatives publicly threatened to end the arrangement after a disrupted council sitting. Their explanations were political claims, not an agreed account of blame.

**Sources:** [EWN · 6 Mar 2024](https://www.ewn.co.za/2024/03/06/the-plug-must-be-pulled-doesnt-matter-when-anc-on-ekurhuleni-coalition-pact-with-eff)

**Source checks:** [EWN · 6 Mar 2024](https://www.ewn.co.za/2024/03/06/the-plug-must-be-pulled-doesnt-matter-when-anc-on-ekurhuleni-coalition-pact-with-eff): read — EWN 6 March reports ANC threat to end Ekurhuleni arrangement after disruption; accusations remain attributed.

**Code:** src/lib/seats/political-history.ts · ekurhuleni-anc-eff

### REL-14 · Clarified

> ANC + EFF in the Bay: they brought the votes. The Northern Alliance got the mayor’s chair.

**When:** ANC + EFF selected · Nelson Mandela Bay

**Context:** In May 2023, a coalition including ANC and EFF helped replace DA mayor Retief Odendaal with Gary van Niekerk of the Northern Alliance. Van Niekerk had been council speaker. This is a historical leadership change, not today’s coalition map.

**Meaning:** ANC and EFF supplied support for a mayor from the Northern Alliance rather than either of their own parties.

**Previous wording:** ANC + EFF in the Bay: they brought the votes. Someone else got the big chair.

**Review decision:** Clarity pass: Names the third party and the mayor’s office behind the big-chair reference.

**Current backstory — Nelson Mandela Bay · May 2023:** In May 2023, a coalition including ANC and EFF helped replace DA mayor Retief Odendaal with Gary van Niekerk of the Northern Alliance. Van Niekerk had been council speaker. This is a historical leadership change, not today’s coalition map.

**Sources:** [eNCA · 26 May 2023](https://www.enca.com/news/northern-alliances-gary-van-niekerk-elected-new-nelson-mandela-bay-mayor) · [ACCORD · Bay coalition timeline](https://coalitions.accord.org.za/coalition/nelson-mandela-bay/)

**Source checks:** [eNCA · 26 May 2023](https://www.enca.com/news/northern-alliances-gary-van-niekerk-elected-new-nelson-mandela-bay-mayor): read — eNCA 26 May reports completed Van Niekerk mayoral election, Odendaal removal and ANC/EFF/PA/Northern Alliance coalition.; [ACCORD · Bay coalition timeline](https://coalitions.accord.org.za/coalition/nelson-mandela-bay/): read — ACCORD historical timeline corroborates 26 May 2023 leadership change; its current markers are not used as current-government facts.

**Code:** src/lib/seats/political-history.ts · bay-anc-eff

### REL-15 · Clarified

> ANC + PA in Knysna: PA says hiring decisions sank the last deal. This time, that agenda item is double-underlined.

**When:** ANC + PA selected · Knysna

**Context:** In September 2023, PA councillors resigned from Knysna’s mayoral committee and the party announced its withdrawal from the ANC-led coalition. The PA linked its decision to senior appointments; that was its stated reason.

**Meaning:** The PA’s stated reason for the earlier breakup makes hiring an anxiously emphasised item on the fictional reunion agenda.

**Previous wording:** ANC + PA in Knysna: a fresh start, with the appointments item underlined.

**Review decision:** Clarity pass: State the previous dispute and retain attribution to the PA, so the double-underlining joke works without reading the backstory.

**Current backstory — Knysna · September 2023:** In September 2023, PA councillors resigned from Knysna’s mayoral committee and the party announced its withdrawal from the ANC-led coalition. The PA linked its decision to senior appointments; that was its stated reason.

**Sources:** [Knysna-Plett Herald · 7 Sep 2023](https://www.knysnaplettherald.com/News/Article/Politics/colourful-coalition-politics-in-knysna-on-a-knife-edge-due-to-race-202309071039)

**Source checks:** [Knysna-Plett Herald · 7 Sep 2023](https://www.knysnaplettherald.com/News/Article/Politics/colourful-coalition-politics-in-knysna-on-a-knife-edge-due-to-race-202309071039): read — Knysna-Plett Herald 7 September reports PA MMC resignations and coalition withdrawal on 6 September; councillors remained in council; appointments reason is attributed.

**Code:** src/lib/seats/political-history.ts · knysna-anc-pa

### REL-16 · Clarified

> ANC + EFF in Durban: the EFF’s revolution can wait. The ANC mayor needs their votes.

**When:** ANC + EFF selected · eThekwini

**Context:** EFF councillors voted against a no-confidence motion targeting ANC mayor Mxolisi Kaunda in February 2023. The motion failed. Supporting a mayor in that vote did not by itself establish a formal coalition agreement.

**Meaning:** The EFF’s revolutionary image is contrasted with its votes helping an ANC mayor survive.

**Previous wording:** ANC + EFF in Durban: revolutionary until the mayor needs a favour.

**Review decision:** Clarity pass: Names whose revolution, whose mayor and which favour the joke refers to. Restored humour retained.

**Current backstory — eThekwini · 3 February 2023:** EFF councillors voted against a no-confidence motion targeting ANC mayor Mxolisi Kaunda in February 2023. The motion failed. Supporting a mayor in that vote did not by itself establish a formal coalition agreement.

**Sources:** [TimesLIVE · 3 Feb 2023](https://www.timeslive.co.za/politics/2023-02-03-motion-of-no-confidence-against-ethekwini-mayor-mxolisi-kaunda-fails/)

**Source checks:** [TimesLIVE · 3 Feb 2023](https://www.timeslive.co.za/politics/2023-02-03-motion-of-no-confidence-against-ethekwini-mayor-mxolisi-kaunda-fails/): read — TimesLIVE 3 February reports no-confidence motion failed with EFF among votes against it.

**Code:** src/lib/seats/political-history.ts · ethekwini-anc-eff

### REL-17 · Clarified

> DA + ActionSA: signed the anti-ANC pact. Kept the grudge.

**When:** DA + ActionSA selected · Any municipality (national backstory)

**Context:** DA and ActionSA were among the signatories to the Multi-Party Charter in August 2023, ahead of the 2024 national and provincial elections. This was a national pact, not evidence of a deal in this council.

**Meaning:** Signing a common anti-ANC pact does not magically erase the partners’ old arguments.

**Previous wording:** DA + ActionSA: signed the pact. Kept the grudge.

**Review decision:** Clarity pass: Names the pact’s purpose so the joke does not require Charter knowledge.

**Current backstory — National politics · August 2023:** DA and ActionSA were among the signatories to the Multi-Party Charter in August 2023, ahead of the 2024 national and provincial elections. This was a national pact, not evidence of a deal in this council.

**Sources:** [Multi-Party Charter · Aug 2023](https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/)

**Source checks:** [Multi-Party Charter · Aug 2023](https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/): read — Signed Multi-Party Charter page dated 18 August lists signatories and explicitly sets ANC/EFF exclusions in the 2024 national/provincial election context.

**Code:** src/lib/seats/political-history.ts · da-actionsa-charter

### REL-18 · Clarified

> DA + IFP: the anti-ANC pact took a scenic route into a government with the ANC.

**When:** DA + IFP selected · Any municipality (national backstory)

**Context:** DA and IFP signed the August 2023 Multi-Party Charter and both joined the national GNU in June 2024. Those national arrangements do not establish a municipal coalition.

**Meaning:** A pact aimed at replacing the ANC takes a scenic detour into government with the ANC.

**Previous wording:** DA + IFP: the anti-ANC pact took a scenic route through the GNU.

**Review decision:** Clarity pass: Explains the later ANC-inclusive government instead of relying on the GNU acronym.

**Current backstory — National politics · 2023–2024:** DA and IFP signed the August 2023 Multi-Party Charter and both joined the national GNU in June 2024. Those national arrangements do not establish a municipal coalition.

**Sources:** [Multi-Party Charter · Aug 2023](https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Multi-Party Charter · Aug 2023](https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/): read — Signed Multi-Party Charter page dated 18 August lists signatories and explicitly sets ANC/EFF exclusions in the 2024 national/provincial election context.

**Code:** src/lib/seats/political-history.ts · da-ifp-charter

### REL-19 · Clarified

> ANC + PA: unity government is a team sport. Both have appointed themselves captain.

**When:** ANC + PA selected · Any municipality (national backstory)

**Context:** ANC and PA were named as participants in the national GNU in June 2024. This national history does not confirm a coalition in this municipality.

**Meaning:** The parties treat unity government as a team sport while both claiming the captaincy.

**Previous wording:** ANC + PA: the GNU is a team sport. Both have appointed themselves captain.

**Review decision:** Clarity pass: Expands the GNU acronym without changing the competing-captains joke.

**Current backstory — National politics · June 2024:** ANC and PA were named as participants in the national GNU in June 2024. This national history does not confirm a coalition in this municipality.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/political-history.ts · anc-pa-gnu

### REL-20 · Clarified

> ANC + ActionSA in Joburg: support agreed one issue at a time. Commitment issues, now council policy.

**When:** ANC + ActionSA selected · Johannesburg

**Context:** ANC and ActionSA agreed to cooperate issue by issue in Johannesburg in August 2024. ActionSA’s Nobuhle Mthembu was elected speaker on 21 August. Issue-by-issue support was distinct from an unrestricted coalition commitment.

**Meaning:** Their limited agreement becomes a relationship-status joke.

**Previous wording:** ANC + ActionSA in Joburg: commitment issues, but make them a council policy.

**Review decision:** Clarity pass: Names the issue-by-issue arrangement that makes “commitment issues” a local joke.

**Current backstory — Johannesburg · August 2024:** ANC and ActionSA agreed to cooperate issue by issue in Johannesburg in August 2024. ActionSA’s Nobuhle Mthembu was elected speaker on 21 August. Issue-by-issue support was distinct from an unrestricted coalition commitment.

**Sources:** [EWN · 20 Aug 2024](https://www.ewn.co.za/2024/08/20/actionsas-nobuhle-mthembu-competent-candidate-for-joburg-council-speaker-says-partys-ngobeni) · [ActionSA statement · 28 Aug 2024](https://www.actionsa.org.za/gauteng-in-action-28-august-2024/)

**Source checks:** [EWN · 20 Aug 2024](https://www.ewn.co.za/2024/08/20/actionsas-nobuhle-mthembu-competent-candidate-for-joburg-council-speaker-says-partys-ngobeni): checked — EWN, 20 August 2024: issue-by-issue cooperation and planned speaker election; the next source verifies the completed election.; [ActionSA statement · 28 Aug 2024](https://www.actionsa.org.za/gauteng-in-action-28-august-2024/): checked — ActionSA, 28 August 2024: Nobuhle Mthembu elected speaker on 21 August 2024.

**Code:** src/lib/seats/local-history.ts · joburg-anc-actionsa

### REL-21 · Clarified

> ANC + Al Jama-ah: the small party got Joburg’s mayoral chain. The junior partner took the master bedroom.

**When:** ANC + Al Jama-ah selected · Johannesburg

**Context:** Al Jama-ah’s Thapelo Amad became Johannesburg mayor in January 2023 under the Government of Local Unity, which included the ANC and EFF. The city’s annual report records his resignation in April 2023.

**Meaning:** A smaller party secured the leading office.

**Previous wording:** ANC + Al Jama-ah: the junior partner took the master bedroom.

**Review decision:** Clarity pass: Identifies the office behind the bedroom metaphor.

**Current backstory — Johannesburg · January–April 2023:** Al Jama-ah’s Thapelo Amad became Johannesburg mayor in January 2023 under the Government of Local Unity, which included the ANC and EFF. The city’s annual report records his resignation in April 2023.

**Sources:** [Johannesburg citizens’ annual report · 2022/23](https://joburg.org.za/documents_/Documents/Annual-and-Citizens-Report/ITEM01ANNEXUREC_CoJ_IAR_Citizens%20Report_Council.pdf)

**Source checks:** [Johannesburg citizens’ annual report · 2022/23](https://joburg.org.za/documents_/Documents/Annual-and-Citizens-Report/ITEM01ANNEXUREC_CoJ_IAR_Citizens%20Report_Council.pdf): checked — Johannesburg citizens annual report 2022/23, printed page 14: GLU included ANC, EFF and Al Jama-ah; Amad held office January–April and resigned in April.

**Code:** src/lib/seats/local-history.ts · joburg-anc-aljama

### REL-22 · Clarified

> ANC + COPE in Tshwane: COPE’s one councillor became mayor. Smallest team, head of the table.

**When:** ANC + COPE selected · Tshwane

**Context:** Tshwane elected COPE’s Murunwa Makwarela mayor on 28 February 2023. ATM nominated him, with ANC and EFF support. This records that election, not an enduring agreement between all those parties.

**Meaning:** A one-seat party supplied the mayor.

**Previous wording:** ANC + COPE in Tshwane: barely a caucus. Somehow the head of the table.

**Review decision:** Clarity pass: Supplies the caucus size and mayoral role instead of assuming the player knows them.

**Current backstory — Tshwane · 28 February 2023:** Tshwane elected COPE’s Murunwa Makwarela mayor on 28 February 2023. ATM nominated him, with ANC and EFF support. This records that election, not an enduring agreement between all those parties.

**Sources:** [SABC · 28 Feb 2023](https://www.sabcnews.com/sabcnews/dr-makwarela-elected-new-tshwane-mayor/)

**Source checks:** [SABC · 28 Feb 2023](https://www.sabcnews.com/sabcnews/dr-makwarela-elected-new-tshwane-mayor/): checked — SABC, 28 February 2023: COPE nominee Makwarela, nominated by ATM with ANC/EFF backing, elected 112–101.

**Code:** src/lib/seats/local-history.ts · tshwane-anc-cope

### REL-23 · Clarified

> ANC + EFF backed COPE for Tshwane mayor: they booked the honeymoon. COPE got the suite.

**When:** ANC + EFF selected · Tshwane

**Context:** ANC and EFF supported COPE’s Murunwa Makwarela in Tshwane’s February 2023 mayoral election. He defeated the DA’s Cilliers Brink by 112 votes to 101. Voting together did not itself establish a permanent coalition.

**Meaning:** Two parties supported a third party’s mayoral candidate.

**Previous wording:** ANC + EFF: booked the Tshwane honeymoon. COPE got the suite.

**Review decision:** Clarity pass: Names the support arrangement before the honeymoon punchline.

**Current backstory — Tshwane · 28 February 2023:** ANC and EFF supported COPE’s Murunwa Makwarela in Tshwane’s February 2023 mayoral election. He defeated the DA’s Cilliers Brink by 112 votes to 101. Voting together did not itself establish a permanent coalition.

**Sources:** [SABC · 28 Feb 2023](https://www.sabcnews.com/sabcnews/dr-makwarela-elected-new-tshwane-mayor/) · [The Citizen · 28 Feb 2023](https://www.citizen.co.za/news/tshwane-mayor-elected-february-2023/)

**Source checks:** [SABC · 28 Feb 2023](https://www.sabcnews.com/sabcnews/dr-makwarela-elected-new-tshwane-mayor/): checked — SABC, 28 February 2023: COPE nominee Makwarela, nominated by ATM with ANC/EFF backing, elected 112–101.; [The Citizen · 28 Feb 2023](https://www.citizen.co.za/news/tshwane-mayor-elected-february-2023/): checked — Citizen, 28 February 2023: 112–101 election result by secret ballot. Does not independently establish individual councillor votes.

**Code:** src/lib/seats/local-history.ts · tshwane-anc-eff

### REL-24 · Clarified

> DA + EFF in Ekurhuleni: a DA mayor returned, EFF backing was disputed, and the thank-you list got awkward.

**When:** DA + EFF selected · Ekurhuleni

**Context:** After ANC–EFF talks failed, Tania Campbell was re-elected Ekurhuleni mayor on 8 November 2022. Daily Maverick attributed her 124–99 victory to EFF backing alongside the DA’s existing partners; EFF Gauteng chair Nkululeko Dunga denied voting with the DA. The result did not establish a formal DA–EFF coalition.

**Meaning:** The disputed account of support makes the comeback’s acknowledgements awkward.

**Previous wording:** DA + EFF in Ekurhuleni: a mayoral comeback with an awkward thank-you list.

**Review decision:** Clarity pass: Explains the awkwardness while preserving the dispute about EFF support.

**Current backstory — Ekurhuleni · 8 November 2022:** After ANC–EFF talks failed, Tania Campbell was re-elected Ekurhuleni mayor on 8 November 2022. Daily Maverick attributed her 124–99 victory to EFF backing alongside the DA’s existing partners; EFF Gauteng chair Nkululeko Dunga denied voting with the DA. The result did not establish a formal DA–EFF coalition.

**Sources:** [Daily Maverick · 8 Nov 2022](https://www.dailymaverick.co.za/article/2022-11-08-how-the-anc-eff-partnership-failed-in-ekurhuleni-and-led-to-the-re-election-of-mayor-tania-campbell/)

**Source checks:** [Daily Maverick · 8 Nov 2022](https://www.dailymaverick.co.za/article/2022-11-08-how-the-anc-eff-partnership-failed-in-ekurhuleni-and-led-to-the-re-election-of-mayor-tania-campbell/): checked — Daily Maverick, 8 November 2022: attributes Campbell’s 124–99 return to EFF backing after failed ANC–EFF talks; also records Dunga’s denial. Revised fact preserves that caveat.

**Code:** src/lib/seats/local-history.ts · ekurhuleni-da-eff

### REL-25 · Clarified

> ANC + ABC: Durban’s deputy mayor job came with an ejector seat.

**When:** ANC + ABC selected · eThekwini

**Context:** ABC leader Philani Mavundla lost his eThekwini executive-committee position and deputy mayoralty in December 2022. The ANC brought the removal motion; the council minutes record ANC and EFF votes in favour.

**Meaning:** The deputy mayor was removed from office.

**Previous wording:** ANC + ABC: Durban’s deputy job came with an ejector seat.

**Review decision:** Clarity pass: Names the kind of deputy rather than leaving the role implicit.

**Current backstory — eThekwini · 13 December 2022:** ABC leader Philani Mavundla lost his eThekwini executive-committee position and deputy mayoralty in December 2022. The ANC brought the removal motion; the council minutes record ANC and EFF votes in favour.

**Sources:** [eThekwini council minutes · 13 Dec 2022](https://dag.durban.gov.za/uploads/0000/6/2025/08/10/minutes-council-2022-12-13.pdf) · [SABC · 13 Dec 2022](https://www.sabcnews.com/sabcnews/ethekwini-deputy-mayor-philani-mavundla-ousted/)

**Source checks:** [eThekwini council minutes · 13 Dec 2022](https://dag.durban.gov.za/uploads/0000/6/2025/08/10/minutes-council-2022-12-13.pdf): checked — eThekwini minutes, 13 December 2022, urgent notice of motion: Young proposed, Mngonyama seconded; 125 supported removal including ANC 90 and EFF 23. Read original extracted text, not the erroneous automated query assessment.; [SABC · 13 Dec 2022](https://www.sabcnews.com/sabcnews/ethekwini-deputy-mayor-philani-mavundla-ousted/): checked — SABC, 13 December 2022: reports ANC removal motion with EFF and smaller-party support.

**Code:** src/lib/seats/local-history.ts · ethekwini-anc-abc

### REL-26 · Clarified

> DA + IFP in Durban’s ward 99: so united, the DA stayed off the ballot.

**When:** DA + IFP selected · eThekwini

**Context:** The DA did not contest eThekwini’s ward 99 by-election on 14 December 2022, and the IFP won the ward from the ANC. In its announcement the next day, the IFP acknowledged the DA’s decision as cooperation between the parties. This ward-level arrangement was not a citywide governing coalition.

**Meaning:** One party made room for the other in a particular ward election.

**Previous wording:** DA + IFP in Durban: so united, one stayed off the ballot.

**Review decision:** Clarity pass: Identifies which party stood aside and keeps the ward-level scope clear. Restored humour retained.

**Current backstory — eThekwini · December 2022:** The DA did not contest eThekwini’s ward 99 by-election on 14 December 2022, and the IFP won the ward from the ANC. In its announcement the next day, the IFP acknowledged the DA’s decision as cooperation between the parties. This ward-level arrangement was not a citywide governing coalition.

**Sources:** [IFP statement · 15 Dec 2022](https://ifp.org.za/newsroom/ifp-wins-the-historic-ethekwini-ward-99/)

**Source checks:** [IOL / The Star retrospective · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/): checked — IOL/The Star, 8 February 2023: joint press conference confirms IFP standing aside in Newcastle ward 31 for TSSA; alleged threats are disputed. Its eThekwini paragraph is ambiguously worded; IFP’s December statement independently confirms DA stood aside there.; [IFP statement · 15 Dec 2022](https://ifp.org.za/newsroom/ifp-wins-the-historic-ethekwini-ward-99/): checked in first source audit — Supporting source verified in the earlier local-history review; restored copy keeps the narrow documented claim.

**Code:** src/lib/seats/local-history.ts · ethekwini-da-ifp

### REL-27 · Kept

> DA + ACDP: Cape Town’s coalition needed seven parties and possibly a prayer.

**When:** DA + ACDP selected · Cape Town

**Context:** In 2006, the DA assembled a seven-party Cape Town coalition including the ACDP, FF+ and UDM. Helen Zille became mayor and ACDP councillor Andrew Arnolds became deputy mayor.

**Meaning:** The joke applies this dated political history to your fictional deal. It does not report a current alliance or a real private conversation.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — Cape Town · March 2006:** In 2006, the DA assembled a seven-party Cape Town coalition including the ACDP, FF+ and UDM. Helen Zille became mayor and ACDP councillor Andrew Arnolds became deputy mayor.

**Sources:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf)

**Source checks:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf): checked — ACCORD/Jolobe chapter, printed page 100: DA plus six named partners in 2006; Zille mayor 106–103, Arnolds deputy and Smit speaker. Automated query falsely counted eight; checked original text.

**Code:** src/lib/seats/local-history.ts · cape-town-da-acdp

### REL-28 · Clarified

> DA + FF+ in Cape Town: FF+ got the Speaker’s chair, keeping seven coalition parties in order. Seven parties, one bell.

**When:** DA + FF+ selected · Cape Town

**Context:** The FF+ joined Cape Town’s DA-led seven-party coalition in 2006. Its councillor Dirk Smit became speaker. This historical coalition predates the DA’s later outright city majorities.

**Meaning:** The Speaker must chair a council containing a large coalition.

**Previous wording:** DA + FF+ in Cape Town: seven parties, one bell. FF+ called dibs.

**Review decision:** Clarity pass: Names the office and its role so the bell is understandable.

**Current backstory — Cape Town · March 2006:** The FF+ joined Cape Town’s DA-led seven-party coalition in 2006. Its councillor Dirk Smit became speaker. This historical coalition predates the DA’s later outright city majorities.

**Sources:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf)

**Source checks:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf): checked — ACCORD/Jolobe chapter, printed page 100: DA plus six named partners in 2006; Zille mayor 106–103, Arnolds deputy and Smit speaker. Automated query falsely counted eight; checked original text.

**Code:** src/lib/seats/local-history.ts · cape-town-da-ff

### REL-29 · Restored

> Cape Town’s DA: before the solo act, there was a seven-party backing band.

**When:** DA selected · Cape Town

**Context:** The DA formed Cape Town’s governing coalition with six partner parties in 2006. Helen Zille won the mayoral vote 106–103. This is an earlier chapter, not a description of the present council.

**Meaning:** The joke connects this dated episode to the fictional selection; it does not report a present alliance or private conversation.

**Previous wording:** Cape Town’s DA: six ex-partners omitted from the solo-career documentary.

**Review decision:** Restore the valuable solo-DA local history: players need not select ACDP/FF+ to learn Cape Town’s coalition past. Replace the fictional documentary-omission insinuation with a clearly metaphorical backing band; retain the game/save-file personality.

**Current backstory — Cape Town · March 2006:** The DA formed Cape Town’s governing coalition with six partner parties in 2006. Helen Zille won the mayoral vote 106–103. This is an earlier chapter, not a description of the present council.

**Sources:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf)

**Source checks:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf): checked — ACCORD/Jolobe chapter, printed page 100: DA plus six named partners in 2006; Zille mayor 106–103, Arnolds deputy and Smit speaker. Automated query falsely counted eight; checked original text.

**Code:** src/lib/seats/local-history.ts · cape-town-da-memory

### REL-30 · Clarified

> ANC + DA in Mangaung: some ANC councillors voted for a DA Speaker. Opposition starts at home.

**When:** ANC + DA selected · Mangaung

**Context:** DA councillor Maryke Davies became Mangaung speaker in March 2023. News24 reported that ANC councillors voted against their party’s choice. These were cross-party votes, not an ANC–DA coalition agreement.

**Meaning:** Some councillors voted against their own party’s choice.

**Previous wording:** ANC + DA in Mangaung: the ANC caucus took “opposition” a bit too literally.

**Review decision:** Clarity pass: Provides the cross-party vote that makes the opposition joke work. Restored humour retained.

**Current backstory — Mangaung · 29 March 2023:** DA councillor Maryke Davies became Mangaung speaker in March 2023. News24 reported that ANC councillors voted against their party’s choice. These were cross-party votes, not an ANC–DA coalition agreement.

**Sources:** [News24 · 29 Mar 2023](https://www.news24.com/news24/politics/government/anc-councillors-in-mangaung-defy-party-and-vote-das-maryke-davies-in-as-new-speaker-20230329) · [DA election announcement · 29 Mar 2023](https://www.da.org.za/2023/03/da-cllr-maryke-davies-voted-in-as-speaker-of-the-mangaung-metropolitan-municipality)

**Source checks:** [News24 · 29 Mar 2023](https://www.news24.com/news24/politics/government/anc-councillors-in-mangaung-defy-party-and-vote-das-maryke-davies-in-as-new-speaker-20230329): checked — News24, 29 March 2023: Davies elected speaker; reports ANC councillors supporting her against party choice. Attribution retained; this is not proof of a formal ANC–DA agreement.; [Mangaung council record · 29 Mar 2023](https://www.mangaung.co.za/2023/03/27/council-meeting-29-march-2023/): checked — Mangaung linked council page returned 404; removed with the redundant ANC–DA record. DA’s dated announcement independently confirms election.; [DA election announcement · 29 Mar 2023](https://www.da.org.za/2023/03/da-cllr-maryke-davies-voted-in-as-speaker-of-the-mangaung-metropolitan-municipality): checked in first source audit — Supporting source verified in the earlier local-history review; restored copy keeps the narrow documented claim.

**Code:** src/lib/seats/local-history.ts · mangaung-anc-da

### REL-31 · Restored

> Mangaung ANC: enough seats to govern. Not enough to agree with itself.

**When:** ANC selected · Mangaung

**Context:** In March 2023, some ANC councillors backed the DA’s Maryke Davies for Mangaung speaker against their party’s choice, according to contemporary reporting. The episode illustrates internal caucus discipline, not a formal coalition.

**Meaning:** Holding enough seats does not ensure caucus discipline; the joke riffs on the documented split in voting.

**Review decision:** Restore sharp caucus-discipline satire tied to the documented split vote, while retaining attribution in the factual paragraph.

**Current backstory — Mangaung · March 2023:** In March 2023, some ANC councillors backed the DA’s Maryke Davies for Mangaung speaker against their party’s choice, according to contemporary reporting. The episode illustrates internal caucus discipline, not a formal coalition.

**Sources:** [News24 · 29 Mar 2023](https://www.news24.com/news24/politics/government/anc-councillors-in-mangaung-defy-party-and-vote-das-maryke-davies-in-as-new-speaker-20230329) · [DA election announcement · 29 Mar 2023](https://www.da.org.za/2023/03/da-cllr-maryke-davies-voted-in-as-speaker-of-the-mangaung-metropolitan-municipality)

**Source checks:** [News24 · 29 Mar 2023](https://www.news24.com/news24/politics/government/anc-councillors-in-mangaung-defy-party-and-vote-das-maryke-davies-in-as-new-speaker-20230329): checked — News24, 29 March 2023: Davies elected speaker; reports ANC councillors supporting her against party choice. Attribution retained; this is not proof of a formal ANC–DA agreement.; [DA election announcement · 29 Mar 2023](https://www.da.org.za/2023/03/da-cllr-maryke-davies-voted-in-as-speaker-of-the-mangaung-metropolitan-municipality): checked

**Code:** src/lib/seats/local-history.ts · mangaung-anc-caucus

### REL-32 · Clarified

> Buffalo City ANC: replacing its own mayor. The call is coming from inside the house.

**When:** ANC selected · Buffalo City

**Context:** The ANC recalled Buffalo City mayor Xola Pakati in March 2023. Princess Faku replaced him on 23 March, winning 62 votes to the DA candidate’s 22. The ANC held a majority; this was an internal leadership change, not a coalition collapse.

**Meaning:** The governing party replaced its own mayor.

**Previous wording:** Buffalo City ANC: no opposition required. The recall is coming from inside the house.

**Review decision:** Clarity pass: Explains the party replacing its own mayor in plain language, then keeps the familiar call-from-inside-the-house punchline.

**Current backstory — Buffalo City · March 2023:** The ANC recalled Buffalo City mayor Xola Pakati in March 2023. Princess Faku replaced him on 23 March, winning 62 votes to the DA candidate’s 22. The ANC held a majority; this was an internal leadership change, not a coalition collapse.

**Sources:** [SABC · 23 Mar 2023](https://www.sabcnews.com/sabcnews/princess-faku-elected-as-buffalo-city-metro-mayor/)

**Source checks:** [SABC · 23 Mar 2023](https://www.sabcnews.com/sabcnews/princess-faku-elected-as-buffalo-city-metro-mayor/): checked — SABC, 23 March 2023: Faku elected 62–22 after ANC recalled Pakati; ANC majority explicitly reported.

**Code:** src/lib/seats/local-history.ts · buffalo-city-anc-recall

### REL-33 · Clarified

> ANC + ATM in Mogale: ATM got the mayor’s office. The junior partner ordered the executive package.

**When:** ANC + ATM selected · Mogale City

**Context:** Mogale City elected ATM’s Danny Thupane mayor in April 2023, replacing the DA-led administration. The municipality named ATM, ANC and EFF as participants in the new Government of Local Unity.

**Meaning:** A smaller coalition partner supplied the mayor.

**Previous wording:** ANC + ATM in Mogale: the junior partner ordered the executive package.

**Review decision:** Clarity pass: Names the party and office behind the upgrade joke.

**Current backstory — Mogale City · 25 April 2023:** Mogale City elected ATM’s Danny Thupane mayor in April 2023, replacing the DA-led administration. The municipality named ATM, ANC and EFF as participants in the new Government of Local Unity.

**Sources:** [Mogale City statement · 25 Apr 2023](https://mogalecity.gov.za/wp-content/uploads/Pdfs/Media%20Room/Press%20Release/Mogale%20City%20elects%20new%20execitive%20mayor.pdf)

**Source checks:** [Mogale City statement · 25 Apr 2023](https://mogalecity.gov.za/wp-content/uploads/Pdfs/Media%20Room/Press%20Release/Mogale%20City%20elects%20new%20execitive%20mayor.pdf): checked — Mogale official statement, 25 April 2023, pages 1–2: ATM mayor Danny Thupane, ANC speaker Lucky Sele, EFF whip Tsholofelo Ramaisa; ATM–ANC–EFF GLU.

**Code:** src/lib/seats/local-history.ts · mogale-anc-atm

### REL-34 · Restored

> ANC + EFF in Mogale: big parties negotiating who gets to call the ATM mayor “boss”.

**When:** ANC + EFF selected · Mogale City

**Context:** Mogale City’s April 2023 leadership change installed an ATM mayor, ANC speaker and EFF council whip. The official statement described an ATM–ANC–EFF Government of Local Unity.

**Meaning:** The joke applies this dated political history to your fictional deal. It does not report a current alliance or a real private conversation.

**Review decision:** Restore the ANC–EFF pairing so this local leadership arrangement can appear without ATM in the player’s selection. Calling the mayor boss is obvious political shorthand, not a legal assertion about party control. Fix the fictional call so it does not invent an unselected third party.

**Current backstory — Mogale City · April 2023:** Mogale City’s April 2023 leadership change installed an ATM mayor, ANC speaker and EFF council whip. The official statement described an ATM–ANC–EFF Government of Local Unity.

**Sources:** [Mogale City statement · 25 Apr 2023](https://mogalecity.gov.za/wp-content/uploads/Pdfs/Media%20Room/Press%20Release/Mogale%20City%20elects%20new%20execitive%20mayor.pdf)

**Source checks:** [Mogale City statement · 25 Apr 2023](https://mogalecity.gov.za/wp-content/uploads/Pdfs/Media%20Room/Press%20Release/Mogale%20City%20elects%20new%20execitive%20mayor.pdf): checked — Mogale official statement, 25 April 2023, pages 1–2: ATM mayor Danny Thupane, ANC speaker Lucky Sele, EFF whip Tsholofelo Ramaisa; ATM–ANC–EFF GLU.

**Code:** src/lib/seats/local-history.ts · mogale-anc-eff

### REL-35 · Clarified

> ANC + PA in Emfuleni: the ANC had the most seats, but still needed a longer negotiating table.

**When:** ANC + PA selected · Emfuleni

**Context:** After the 2021 election, the ANC held 38 of Emfuleni’s 90 seats. MISTRA lists ANC, PA and four other parties in the November 2021 administration, totalling 45 seats: a minority arrangement, one short of an outright majority. These are the partners recorded at formation.

**Meaning:** The largest party still needed other parties’ support.

**Previous wording:** ANC + PA in Emfuleni: even the biggest caucus needed a longer table.

**Review decision:** Clarity pass: Explains why the table is growing without suggesting the recorded arrangement reached a majority.

**Current backstory — Emfuleni · November 2021:** After the 2021 election, the ANC held 38 of Emfuleni’s 90 seats. MISTRA lists ANC, PA and four other parties in the November 2021 administration, totalling 45 seats: a minority arrangement, one short of an outright majority. These are the partners recorded at formation.

**Sources:** [MISTRA dataset · Emfuleni EMF_01, formed 22 Nov 2021](https://coalitions.mistra.org.za/)

**Source checks:** [MISTRA dataset · Emfuleni EMF_01, formed 22 Nov 2021](https://coalitions.mistra.org.za/): checked — Published MISTRA 2026 download page checked; original vendored municipal_administrations.csv reviewed. EMF_01 lists ANC38/90 and member parties totalling45, classified Minority. TBZ_01 includes EFF; TBZ_02 codes EFF Opposition from October2022. Zip not readable by web tool; CSV provenance retained in repo.

**Code:** src/lib/seats/local-history.ts · emfuleni-anc-pa

### REL-36 · Restored

> ANC + AIC in Rustenburg: tiny caucus. Platinum-sized wish list.

**When:** ANC + AIC selected · Rustenburg

**Context:** MISTRA records a post-2021 governing agreement in Rustenburg between the ANC, AIC and local party Arona. The ANC did not hold an outright majority on its own. The agreement put the ANC’s candidates in the mayor and speaker positions.

**Meaning:** The joke connects this dated episode to the fictional selection; it does not report a present alliance or private conversation.

**Previous wording:** ANC + AIC in Rustenburg: tiny caucus. Platinum-sized demands.

**Review decision:** Restore geographic and small-party variety using the verified narrow coalition fact. Avoid the source’s inconsistent 45/89–90 majority arithmetic. The platinum wish list is explicit comic exaggeration about bargaining priorities, replacing invoice/payment implications.

**Current backstory — Rustenburg · November 2021:** MISTRA records a post-2021 governing agreement in Rustenburg between the ANC, AIC and local party Arona. The ANC did not hold an outright majority on its own. The agreement put the ANC’s candidates in the mayor and speaker positions.

**Sources:** [MISTRA Coalitions Barometer · 2021–2023, North West chapter](https://mistra.org.za/wp-content/uploads/2024/04/MISTRA-COALITION-BAROMETER_final-25-April-2024.pdf)

**Source checks:** [MISTRA Coalitions Barometer · 2021–2023, North West chapter](https://mistra.org.za/wp-content/uploads/2024/04/MISTRA-COALITION-BAROMETER_final-25-April-2024.pdf): checked — MISTRA 2021–23 printed pages241–245: JB Marks ANC33/67 and PA2. Rustenburg coalition partners confirmed, but text/table disagree on 89/90 seats and whether45 is a majority; do not retain that majority claim.

**Code:** src/lib/seats/local-history.ts · rustenburg-anc-aic

### REL-37 · Clarified

> ANC + PA in JB Marks: the ANC was one short of a majority. PA’s two seats had never been so popular.

**When:** ANC + PA selected · JB Marks

**Context:** In the 2021 JB Marks election, the ANC won 33 of 67 seats, one below an outright majority. Its coalition with the PA, which held two seats, crossed that threshold.

**Meaning:** Two PA seats could take the ANC past the majority threshold.

**Previous wording:** ANC + PA in JB Marks: one seat short made two seats very popular.

**Review decision:** Clarity pass: Identifies who was short and why two seats mattered.

**Current backstory — JB Marks · November 2021:** In the 2021 JB Marks election, the ANC won 33 of 67 seats, one below an outright majority. Its coalition with the PA, which held two seats, crossed that threshold.

**Sources:** [MISTRA Coalitions Barometer · 2021–2023, North West chapter](https://mistra.org.za/wp-content/uploads/2024/04/MISTRA-COALITION-BAROMETER_final-25-April-2024.pdf)

**Source checks:** [MISTRA Coalitions Barometer · 2021–2023, North West chapter](https://mistra.org.za/wp-content/uploads/2024/04/MISTRA-COALITION-BAROMETER_final-25-April-2024.pdf): checked — MISTRA 2021–23 printed pages241–245: JB Marks ANC33/67 and PA2. Rustenburg coalition partners confirmed, but text/table disagree on 89/90 seats and whether45 is a majority; do not retain that majority claim.

**Code:** src/lib/seats/local-history.ts · jb-marks-anc-pa

### REL-39 · Clarified

> Lekwa Community Forum + EFF in Standerton: the residents’ meeting has developed mayoral ambitions.

**When:** LCF + EFF selected · Lekwa

**Context:** After the 2021 election, Lekwa Community Forum candidates won the mayor and speaker positions, while an EFF councillor became chief whip. The result ended ANC control of the municipality.

**Meaning:** A local community party won the mayoralty.

**Previous wording:** LCF + EFF in Standerton: the residents’ meeting has developed mayoral ambitions.

**Review decision:** Clarity pass: Expands LCF so the residents’ meeting joke works without knowing the acronym.

**Current backstory — Lekwa · 22 November 2021:** After the 2021 election, Lekwa Community Forum candidates won the mayor and speaker positions, while an EFF councillor became chief whip. The result ended ANC control of the municipality.

**Sources:** [City Press · 22 Nov 2021](https://www.news24.com/citypress/politics/anc-loses-control-of-mpumalangas-lekwa-municipality-to-community-forum-20211122)

**Source checks:** [City Press · 22 Nov 2021](https://www.news24.com/citypress/politics/anc-loses-control-of-mpumalangas-lekwa-municipality-to-community-forum-20211122): checked — City Press, 22 November 2021: LCF won Lekwa mayor and speaker; EFF won chief whip; first change from ANC municipal leadership.

**Code:** src/lib/seats/local-history.ts · lekwa-lcf-eff

### REL-40 · Clarified

> ANC + EFF in Sasolburg: ANC helped elect an EFF mayor. Local chemistry. EFF head office said absolutely not.

**When:** ANC + EFF selected · Metsimaholo

**Context:** EFF mayor Selloane Motjeane resigned in November 2021 after her party’s national leadership objected to her election with ANC support. The DA’s Jeff Zwane succeeded her in December. Local support and national instructions had diverged.

**Meaning:** National leaders rejected local cooperation behind an EFF mayor.

**Previous wording:** ANC + EFF in Sasolburg: local chemistry. Head office said absolutely not.

**Review decision:** Clarity pass: Identifies the local agreement and the party whose head office objected.

**Current backstory — Metsimaholo · November–December 2021:** EFF mayor Selloane Motjeane resigned in November 2021 after her party’s national leadership objected to her election with ANC support. The DA’s Jeff Zwane succeeded her in December. Local support and national instructions had diverged.

**Sources:** [The Citizen · 3 Dec 2021](https://www.citizen.co.za/news/south-africa/politics/das-jeff-zwane-elected-new-mayor-of-metsimaholo-3-december-2021/)

**Source checks:** [The Citizen · 3 Dec 2021](https://www.citizen.co.za/news/south-africa/politics/das-jeff-zwane-elected-new-mayor-of-metsimaholo-3-december-2021/): checked — Citizen, 3 December 2021: Zwane elected after Motjeane resigned on EFF national leadership instruction over ANC support.

**Code:** src/lib/seats/local-history.ts · metsimaholo-anc-eff

### REL-41 · Clarified

> ANC + AIC in Sasolburg: little party, big mayoral chain. Must be quite heavy.

**When:** ANC + AIC selected · Metsimaholo

**Context:** AIC councillor Jack Malindi became Metsimaholo mayor unopposed in August 2023 after DA mayor Jeff Zwane’s removal. SABC reported that ATM nominated him and ANC seconded the nomination. This records that election, not a permanent coalition agreement.

**Meaning:** A small party supplied the mayor.

**Previous wording:** ANC + AIC in Sasolburg: little party, big chain. Must be quite heavy.

**Review decision:** Clarity pass: Names the chain as a mayoral chain. Restored humour retained.

**Current backstory — Metsimaholo · August 2023:** AIC councillor Jack Malindi became Metsimaholo mayor unopposed in August 2023 after DA mayor Jeff Zwane’s removal. SABC reported that ATM nominated him and ANC seconded the nomination. This records that election, not a permanent coalition agreement.

**Sources:** [SABC · 19 Aug 2023](https://www.sabcnews.com/sabcnews/atm-anc-join-forces-as-aics-malindi-elected-metsimaholo-mayor/)

**Source checks:** [SABC · 19 Aug 2023](https://www.sabcnews.com/sabcnews/atm-anc-join-forces-as-aics-malindi-elected-metsimaholo-mayor/): checked — SABC, 19 August 2023: AIC’s Malindi elected unopposed, nominated by ATM and seconded by ANC after Zwane’s removal.

**Code:** src/lib/seats/local-history.ts · metsimaholo-anc-aic

### REL-42 · Revised

> MAP16 + EFF: support for the mayor, questions for the spending.

**When:** MAP16 + EFF selected · Maluti a Phofung

**Context:** MAP16 secured a November 2021 agreement to lead Maluti-a-Phofung with backing from the EFF and smaller parties. MAP16 said the EFF would oversee the municipal public accounts committee rather than co-govern. The DA and FF+ offered support for electing officeholders without joining the agreement.

**Meaning:** The joke connects this dated episode to the fictional selection; it does not report a present alliance or private conversation.

**Previous wording:** MAP16 + EFF: nothing says trust like giving your partner the audit job.

**Review decision:** Keep the already corrected spending-scrutiny tease; name MPAC explicitly so oversight is not confused with an audit job.

**Current backstory — Maluti-a-Phofung · November 2021:** MAP16 secured a November 2021 agreement to lead Maluti-a-Phofung with backing from the EFF and smaller parties. MAP16 said the EFF would oversee the municipal public accounts committee rather than co-govern. The DA and FF+ offered support for electing officeholders without joining the agreement.

**Sources:** [News24Wire / Polity · 18 Nov 2021](https://www.polity.org.za/article/anc-out-as-former-party-members-map-16-clinch-coalition-deal-in-maluti-a-phofung-2021-11-18)

**Source checks:** [News24Wire / Polity · 18 Nov 2021](https://www.polity.org.za/article/anc-out-as-former-party-members-map-16-clinch-coalition-deal-in-maluti-a-phofung-2021-11-18): checked — News24Wire/Polity, 18 November 2021: MAP16 spokesperson described EFF oversight of MPAC without co-governing, and DA/FF+ support for officeholder elections outside agreement.

**Code:** src/lib/seats/local-history.ts · maluti-map16-eff

### REL-43 · Clarified

> IFP + Team Sugar in Newcastle: IFP stepped off the ward 31 ballot to help its partner. A deal with extra sweetness.

**When:** IFP + TSSA selected · Newcastle

**Context:** In February 2023, the IFP announced that it would not contest Newcastle’s ward 31 by-election and would support coalition partner Team Sugar South Africa. The two parties confirmed the arrangement at a joint press conference. It applied to that by-election, not all Newcastle wards.

**Meaning:** IFP stood aside in one ward to support Team Sugar.

**Previous wording:** IFP + Team Sugar: a ballot withdrawal with extra sweetness.

**Review decision:** Clarity pass: Supplies which party withdrew, where, and why before the party-name pun. Restored humour retained.

**Current backstory — Newcastle · February 2023:** In February 2023, the IFP announced that it would not contest Newcastle’s ward 31 by-election and would support coalition partner Team Sugar South Africa. The two parties confirmed the arrangement at a joint press conference. It applied to that by-election, not all Newcastle wards.

**Sources:** [IOL / The Star · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/)

**Source checks:** [IOL / The Star · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/): checked — IOL/The Star, 8 February 2023: joint press conference confirms IFP standing aside in Newcastle ward 31 for TSSA; alleged threats are disputed. Its eThekwini paragraph is ambiguously worded; IFP’s December statement independently confirms DA stood aside there.

**Code:** src/lib/seats/local-history.ts · newcastle-ifp-tssa

### REL-44 · Clarified

> IFP in Newcastle’s ward 31: please support us. By voting for our partner Team Sugar.

**When:** IFP selected · Newcastle

**Context:** In February 2023 the IFP announced that it would stand aside in Newcastle’s ward 31 by-election to support Team Sugar South Africa. This was a specific ward-level electoral arrangement, not evidence that Team Sugar is part of your selected deal.

**Meaning:** A party asks supporters to vote for its partner instead.

**Previous wording:** IFP in Newcastle’s ward 31: please support us. By voting for someone else.

**Review decision:** Clarity pass: Names the other party and its relationship to IFP.

**Current backstory — Newcastle · February 2023:** In February 2023 the IFP announced that it would stand aside in Newcastle’s ward 31 by-election to support Team Sugar South Africa. This was a specific ward-level electoral arrangement, not evidence that Team Sugar is part of your selected deal.

**Sources:** [IOL / The Star · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/)

**Source checks:** [IOL / The Star · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/): checked — IOL/The Star, 8 February 2023: joint press conference confirms IFP standing aside in Newcastle ward 31 for TSSA; alleged threats are disputed. Its eThekwini paragraph is ambiguously worded; IFP’s December statement independently confirms DA stood aside there.

**Code:** src/lib/seats/local-history.ts · newcastle-ifp-support

### REL-45 · Clarified

> IFP + EFF in Richards Bay: the last deal broke down. This reunion needs one mayor’s chair and fewer captain’s hats.

**When:** IFP + EFF selected · uMhlathuze

**Context:** The IFP and EFF’s local cooperation broke down in January 2023. In its public account of talks, the IFP said it rejected an EFF request to lead uMhlathuze. That is the IFP’s account of the negotiations, not an agreed finding about blame.

**Meaning:** Former partners need to settle leadership before working together again.

**Previous wording:** IFP + EFF in Richards Bay: perhaps start this reunion with the chairs already labelled.

**Review decision:** Clarity pass: Gives the reunion context and identifies the chair without asserting one side’s disputed account as fact.

**Current backstory — uMhlathuze · January 2023:** The IFP and EFF’s local cooperation broke down in January 2023. In its public account of talks, the IFP said it rejected an EFF request to lead uMhlathuze. That is the IFP’s account of the negotiations, not an agreed finding about blame.

**Sources:** [IFP account of negotiations · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/) · [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/01/29-01-23_EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM-OF-THE-2nd-NATIONAL-PEOPLES-ASSEMBLY.pdf)

**Source checks:** [IFP account of negotiations · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/): checked — IFP, 30 January 2023: its own account describes EFF request to lead uMhlathuze and IFP refusal. Attribution is necessary.; [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/01/29-01-23_EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM-OF-THE-2nd-NATIONAL-PEOPLES-ASSEMBLY.pdf): checked — EFF, 29 January 2023, pages4–5: cut ties with IFP, instructed deputy mayors to resign, criticised IFP. Competing partisan accounts do not settle blame.

**Code:** src/lib/seats/local-history.ts · umhlathuze-ifp-eff

### REL-46 · Clarified

> DA + IFP in Richards Bay: DA took the deputy’s chair after EFF’s exit. Mind the previous occupant’s feelings.

**When:** DA + IFP selected · uMhlathuze

**Context:** DA councillor Christo Botha became uMhlathuze deputy mayor in August 2023 under IFP mayor Xolani Ngwezi. ACCORD’s timeline records support from IFP, DA and smaller parties, after the earlier EFF deputy’s departure.

**Meaning:** The deputy mayor’s office changed parties.

**Previous wording:** DA + IFP in Richards Bay: new deputy, same chair. Mind the previous occupant’s feelings.

**Review decision:** Clarity pass: Identifies the previous occupant’s party and the new deputy’s party. Restored humour retained.

**Current backstory — uMhlathuze · August 2023:** DA councillor Christo Botha became uMhlathuze deputy mayor in August 2023 under IFP mayor Xolani Ngwezi. ACCORD’s timeline records support from IFP, DA and smaller parties, after the earlier EFF deputy’s departure.

**Sources:** [ACCORD · uMhlathuze historical timeline](https://coalitions.accord.org.za/coalition/umhlathuze-2/)

**Source checks:** [ACCORD · uMhlathuze historical timeline](https://coalitions.accord.org.za/coalition/umhlathuze-2/): checked — ACCORD uMhlathuze timeline: Botha deputy from10 August2023; Ngwezi IFP mayor; earlier EFF deputy ended31 January2023. Unrelated headline seat arithmetic on tracker is erroneous and unused.

**Code:** src/lib/seats/local-history.ts · umhlathuze-da-ifp

### REL-47 · Clarified

> ANC + ABC in Greytown: former ANC mayor Mavundla returned wearing ABC colours. New badge, old friends.

**When:** ANC + ABC selected · uMvoti

**Context:** ABC leader Philani Mavundla became uMvoti mayor in June 2023 through an agreement with the ANC. He had previously been the municipality’s mayor as an ANC member. The new arrangement displaced the IFP-led administration.

**Meaning:** A former ANC mayor returned as ABC leader with ANC backing.

**Previous wording:** ANC + ABC in Greytown: Mavundla’s comeback needed a new badge and the old friends.

**Review decision:** Clarity pass: Identifies Mavundla’s old and new affiliations before the badge joke.

**Current backstory — uMvoti · June 2023:** ABC leader Philani Mavundla became uMvoti mayor in June 2023 through an agreement with the ANC. He had previously been the municipality’s mayor as an ANC member. The new arrangement displaced the IFP-led administration.

**Sources:** [TimesLIVE · 21 Jun 2023](https://www.timeslive.co.za/politics/2023-06-21-philani-mavundla-is-the-mayor-of-umvoti-again/)

**Source checks:** [TimesLIVE · 21 Jun 2023](https://www.timeslive.co.za/politics/2023-06-21-philani-mavundla-is-the-mayor-of-umvoti-again/): checked — TimesLIVE, 21 June 2023: Mavundla returned as ABC mayor with ANC; previously ANC mayor2011–13; displaced IFP–ABC–DA arrangement.

**Code:** src/lib/seats/local-history.ts · umvoti-anc-abc

### REL-48 · Clarified

> IFP + ABC in Greytown: ABC left the old deal for the ANC. The reunion invitation should probably mention that.

**When:** IFP + ABC selected · uMvoti

**Context:** An IFP–ABC–DA arrangement governed uMvoti after the 2021 election. In June 2023, ABC switched to an agreement with the ANC and its leader Philani Mavundla became mayor.

**Meaning:** Former partners must deal with an earlier switch of allegiance.

**Previous wording:** IFP + ABC in Greytown: the reunion invitation should probably mention the ANC.

**Review decision:** Clarity pass: Explains why the ANC belongs in a joke about an IFP–ABC reunion. Restored humour retained.

**Current backstory — uMvoti · 2021–June 2023:** An IFP–ABC–DA arrangement governed uMvoti after the 2021 election. In June 2023, ABC switched to an agreement with the ANC and its leader Philani Mavundla became mayor.

**Sources:** [TimesLIVE · 21 Jun 2023](https://www.timeslive.co.za/politics/2023-06-21-philani-mavundla-is-the-mayor-of-umvoti-again/)

**Source checks:** [TimesLIVE · 21 Jun 2023](https://www.timeslive.co.za/politics/2023-06-21-philani-mavundla-is-the-mayor-of-umvoti-again/): checked — TimesLIVE, 21 June 2023: Mavundla returned as ABC mayor with ANC; previously ANC mayor2011–13; displaced IFP–ABC–DA arrangement.

**Code:** src/lib/seats/local-history.ts · umvoti-ifp-abc

### REL-49 · Clarified

> DA + EFF in Modimolle: a tied mayoral vote went to a coin toss. Heads, principles. Tails, a mayor.

**When:** DA + EFF selected · Modimolle-Mookgophong

**Context:** Marlene van Staden was re-elected Modimolle-Mookgophong mayor in December 2021 after tied votes were settled by a coin toss. EFF and FF+ councillors had supported the DA candidate. This records voting support, not a formal DA–EFF coalition.

**Meaning:** A coin toss really settled a tied mayoral election.

**Previous wording:** DA + EFF in Modimolle: heads, principles. Tails, a mayor.

**Review decision:** Clarity pass: States the unusual event before the heads-or-tails punchline. Restored humour retained.

**Current backstory — Modimolle-Mookgophong · 2 December 2021:** Marlene van Staden was re-elected Modimolle-Mookgophong mayor in December 2021 after tied votes were settled by a coin toss. EFF and FF+ councillors had supported the DA candidate. This records voting support, not a formal DA–EFF coalition.

**Sources:** [DA statement · 2 Dec 2021](https://www.da.org.za/2021/12/da-wins-mayor-position-in-modimolle-mookgophong) · [SABC · 2 Dec 2021](https://www.sabcnews.com/sabcnews/das-marlene-van-staden-re-elected-modimolle-mookgophong-mayor-through-toss-of-a-coin/)

**Source checks:** [DA statement · 2 Dec 2021](https://www.da.org.za/2021/12/da-wins-mayor-position-in-modimolle-mookgophong): checked — DA, 2 December 2021: van Staden elected after two tied14–14 rounds with EFF/FF+ support; four previous meetings. Keep attribution for exact number of mayoral rounds.; [SABC · 2 Dec 2021](https://www.sabcnews.com/sabcnews/das-marlene-van-staden-re-elected-modimolle-mookgophong-mayor-through-toss-of-a-coin/): checked — SABC, 2 December 2021: coin toss and combined opposition14 versus ANC14 confirmed. Its fifth-tie wording mixes the sequence of prior sittings/speaker deadlocks; exact mayoral-round detail comes from DA account.

**Code:** src/lib/seats/local-history.ts · modimolle-da-eff

### REL-50 · Clarified

> DA + FF+ in Modimolle: a coin toss settled the tied mayoral vote. The kingmaker was loose change.

**When:** DA + FF+ selected · Modimolle-Mookgophong

**Context:** The DA reported that EFF and FF+ councillors backed Marlene van Staden in December 2021, with two mayoral votes tied at 14–14 before a coin toss settled the election. The game keeps its usual majority threshold.

**Meaning:** A coin decided who became mayor after a tie.

**Previous wording:** DA + FF+ in Modimolle: when the kingmaker is loose change.

**Review decision:** Clarity pass: Explains why loose change could be a kingmaker.

**Current backstory — Modimolle-Mookgophong · December 2021:** The DA reported that EFF and FF+ councillors backed Marlene van Staden in December 2021, with two mayoral votes tied at 14–14 before a coin toss settled the election. The game keeps its usual majority threshold.

**Sources:** [DA statement · 2 Dec 2021](https://www.da.org.za/2021/12/da-wins-mayor-position-in-modimolle-mookgophong)

**Source checks:** [DA statement · 2 Dec 2021](https://www.da.org.za/2021/12/da-wins-mayor-position-in-modimolle-mookgophong): checked — DA, 2 December 2021: van Staden elected after two tied14–14 rounds with EFF/FF+ support; four previous meetings. Keep attribution for exact number of mayoral rounds.

**Code:** src/lib/seats/local-history.ts · modimolle-da-ff

### REL-51 · Revised

> DA + EFF in Thabazimbi: same council, competing scripts.

**When:** DA + EFF selected · Thabazimbi

**Context:** MISTRA records EFF participation in Thabazimbi’s initial DA-led 2021 coalition, followed by its departure in 2022. Prolonged disputes over council leadership preceded the council’s dissolution in 2024.

**Meaning:** The joke connects this dated episode to the fictional selection; it does not report a present alliance or private conversation.

**Previous wording:** DA + EFF in Thabazimbi: the coalition drama outlived the council.

**Review decision:** Remove misleading implication that DA–EFF cooperation lasted until the council was dissolved. Keep the dated sequence and add parliamentary corroboration.

**Current backstory — Thabazimbi · 2021–2024:** MISTRA records EFF participation in Thabazimbi’s initial DA-led 2021 coalition, followed by its departure in 2022. Prolonged disputes over council leadership preceded the council’s dissolution in 2024.

**Sources:** [MISTRA dataset · Thabazimbi TBZ_01 and TBZ_02](https://coalitions.mistra.org.za/) · [eNCA · 4 Oct 2024](https://www.enca.com/news/thabazimbi-municipality-premier-announces-municipal-council-dissolution) · [Parliament oversight report · 2 Oct 2024](https://www.parliament.gov.za/storage/app/media/Docs/atc/ce69ce3c-e5d9-4dc3-b038-1f0cc106e53a.pdf)

**Source checks:** [MISTRA dataset · Thabazimbi TBZ_01 and TBZ_02](https://coalitions.mistra.org.za/): checked — Published MISTRA 2026 download page checked; original vendored municipal_administrations.csv reviewed. EMF_01 lists ANC38/90 and member parties totalling45, classified Minority. TBZ_01 includes EFF; TBZ_02 codes EFF Opposition from October2022. Zip not readable by web tool; CSV provenance retained in repo.; [eNCA · 4 Oct 2024](https://www.enca.com/news/thabazimbi-municipality-premier-announces-municipal-council-dissolution): checked — eNCA, 4 October 2024: dissolution followed extended competing administrations. Parliament’s 2 October2024 oversight report independently confirms original five-party coalition and later dissolution process.; [Parliament oversight report · 2 Oct 2024](https://www.parliament.gov.za/storage/app/media/Docs/atc/ce69ce3c-e5d9-4dc3-b038-1f0cc106e53a.pdf): checked

**Code:** src/lib/seats/local-history.ts · thabazimbi-da-eff

### REL-52 · Clarified

> DA + NCM in Springbok: the mayor and Speaker agreed to swap jobs. Musical chairs, with a signed playlist.

**When:** DA + NCM selected · NAMA KHOI

**Context:** On 9 July 2024, the DA announced that Rodney Kritzinger and NCM councillor Gustav Bock had exchanged the mayor and speaker positions. The party said this implemented the rotation agreed with the Namakwa Civic Movement in 2021. This is the announcement date, not a verified date of the office swap.

**Meaning:** The parties arranged a rotation of two offices.

**Previous wording:** DA + NCM in Springbok: musical chairs with a playlist everyone signed.

**Review decision:** Clarity pass: Identifies which chairs were being swapped.

**Current backstory — Nama Khoi · announced 9 July 2024:** On 9 July 2024, the DA announced that Rodney Kritzinger and NCM councillor Gustav Bock had exchanged the mayor and speaker positions. The party said this implemented the rotation agreed with the Namakwa Civic Movement in 2021. This is the announcement date, not a verified date of the office swap.

**Sources:** [DA statement · 9 Jul 2024](https://nc.da.org.za/2024/07/da-takes-up-mayoral-position-in-nama-khoi-coalition-municipality)

**Source checks:** [DA statement · 9 Jul 2024](https://nc.da.org.za/2024/07/da-takes-up-mayoral-position-in-nama-khoi-coalition-municipality): checked — DA, 9 July 2024: announces Kritzinger/Bock mayor–speaker rotation under2021 agreement. Does not specify effective date; existing qualified announcement date retained.

**Code:** src/lib/seats/local-history.ts · nama-khoi-da-ncm

### REL-53 · Clarified

> DA + UDM in the Bay: UDM’s deputy mayor was voted out. His chair has abandonment issues.

**When:** DA + UDM selected · Nelson Mandela Bay

**Context:** On 24 August 2017, a no-confidence vote removed UDM deputy mayor Mongameli Bobani in Nelson Mandela Bay. The DA’s statement recorded support for the motion from its ACDP and COPE partners. This was a dispute within the governing coalition.

**Meaning:** Removal of the deputy mayor becomes a furniture joke.

**Previous wording:** DA + UDM in the Bay: the deputy mayor’s chair has abandonment issues.

**Review decision:** Clarity pass: Explains why the chair has been abandoned. Restored humour retained.

**Current backstory — Nelson Mandela Bay · August 2017:** On 24 August 2017, a no-confidence vote removed UDM deputy mayor Mongameli Bobani in Nelson Mandela Bay. The DA’s statement recorded support for the motion from its ACDP and COPE partners. This was a dispute within the governing coalition.

**Sources:** [DA statement · 24 Aug 2017](https://www.da.org.za/2017/08/da-welcomes-successful-motion-no-confidence-bobani)

**Source checks:** [Nelson Mandela Bay annual report · 2016/17](https://www.nelsonmandelabay.gov.za/DataRepository/Documents/adopted-2016-17-annual-report.pdf): unavailable-404; [DA statement · 24 Aug 2017](https://www.da.org.za/2017/08/da-welcomes-successful-motion-no-confidence-bobani): verified

**Code:** src/lib/seats/local-history.ts · bay-da-udm

### REL-54 · Revised

> DA + FF+ in George: broke up, got back together, definitely kept the screenshots.

**When:** DA + FF+ selected · George

**Context:** In June 2024, the DA announced it was ending its George coalition with the FF+; the FF+ disputed whether the termination procedure was complete. In November 2025, the DA announced a new agreement with FF+ and ACDP, including the deputy mayor’s position for FF+. These are dated announcements, not a claim about the current administration.

**Meaning:** The joke applies this dated political history to your fictional deal. It does not report a current alliance or a real private conversation.

**Review decision:** Attribute contested termination announcement and retain FF+ procedural response; distinguish announced allocation from current officeholding.

**Current backstory — George · June 2024–November 2025:** In June 2024, the DA announced it was ending its George coalition with the FF+; the FF+ disputed whether the termination procedure was complete. In November 2025, the DA announced a new agreement with FF+ and ACDP, including the deputy mayor’s position for FF+. These are dated announcements, not a claim about the current administration.

**Sources:** [George Herald · 27 Jun 2024](https://www.georgeherald.com/News/Article/Politics/da-exits-coalition-with-ff-plus-in-george-202406270418) · [DA agreement announcement · 18 Nov 2025](https://www.da.org.za/2025/11/stability-for-george-council-as-new-coalition-agreement-signed)

**Source checks:** [George Herald · 27 Jun 2024](https://www.georgeherald.com/News/Article/Politics/da-exits-coalition-with-ff-plus-in-george-202406270418): verified; [DA agreement announcement · 18 Nov 2025](https://www.da.org.za/2025/11/stability-for-george-council-as-new-coalition-agreement-signed): verified

**Code:** src/lib/seats/local-history.ts · george-da-ff

### REL-55 · Clarified

> DA + ACDP in George: ACDP got the Corporate Services portfolio. Even answered prayers come with paperwork.

**When:** DA + ACDP selected · George

**Context:** The DA’s November 2025 George coalition announcement named ACDP and FF+ as partners. It allocated the corporate-services mayoral-committee portfolio to ACDP. This is the announced agreement at that date.

**Meaning:** Receiving a council portfolio also means taking on its work.

**Previous wording:** DA + ACDP in George: prayers answered. The answer was Corporate Services.

**Review decision:** Clarity pass: Explains what Corporate Services refers to before the prayer-and-paperwork punchline. Restored humour retained.

**Current backstory — George · 18 November 2025:** The DA’s November 2025 George coalition announcement named ACDP and FF+ as partners. It allocated the corporate-services mayoral-committee portfolio to ACDP. This is the announced agreement at that date.

**Sources:** [DA agreement announcement · 18 Nov 2025](https://www.da.org.za/2025/11/stability-for-george-council-as-new-coalition-agreement-signed)

**Source checks:** [DA agreement announcement · 18 Nov 2025](https://www.da.org.za/2025/11/stability-for-george-council-as-new-coalition-agreement-signed): verified

**Code:** src/lib/seats/local-history.ts · george-da-acdp

### REL-56 · Clarified

> ANC + FF+ in Oudtshoorn: campaign opponents now sharing power. Awkward enough to make an ostrich look away.

**When:** ANC + FF+ selected · Oudtshoorn

**Context:** FF+ councillor Johan Allers became Oudtshoorn mayor on 1 August 2024 under a new arrangement including ANC, PA and local parties, after FF+ backed the July removal of DA mayor Chris Macpherson. ANC councillor Mziwoxolo Tyatya became deputy mayor.

**Meaning:** Former electoral opponents must now cooperate in government.

**Previous wording:** ANC + FF+ in Oudtshoorn: awkward enough to make an ostrich look away.

**Review decision:** Clarity pass: Explains the source of the awkwardness without requiring familiarity with party ideologies.

**Current backstory — Oudtshoorn · August 2024:** FF+ councillor Johan Allers became Oudtshoorn mayor on 1 August 2024 under a new arrangement including ANC, PA and local parties, after FF+ backed the July removal of DA mayor Chris Macpherson. ANC councillor Mziwoxolo Tyatya became deputy mayor.

**Sources:** [SABC · 1 Aug 2024](https://www.sabcnews.com/sabcnews/ff-plus-cements-alliance-with-anc-in-oudtshoorn-municipality/)

**Source checks:** [SABC · 1 Aug 2024](https://www.sabcnews.com/sabcnews/ff-plus-cements-alliance-with-anc-in-oudtshoorn-municipality/): verified

**Code:** src/lib/seats/local-history.ts · oudtshoorn-anc-ff

### REL-57 · Clarified

> DA + FF+ in Oudtshoorn: FF+ helped remove the DA mayor. Still untangling feathers from that breakup.

**When:** DA + FF+ selected · Oudtshoorn

**Context:** In July 2024 the FF+ backed a no-confidence motion against DA mayor Chris Macpherson. Its Johan Allers became mayor in August with ANC and other parties, ending the earlier DA–FF+ partnership in Oudtshoorn.

**Meaning:** A previous coalition partner supported the mayor’s removal.

**Previous wording:** DA + FF+ in Oudtshoorn: still untangling the feathers from the last breakup.

**Review decision:** Clarity pass: Names the event behind the breakup while keeping the local feather joke. Restored humour retained.

**Current backstory — Oudtshoorn · July–August 2024:** In July 2024 the FF+ backed a no-confidence motion against DA mayor Chris Macpherson. Its Johan Allers became mayor in August with ANC and other parties, ending the earlier DA–FF+ partnership in Oudtshoorn.

**Sources:** [SABC · 1 Aug 2024](https://www.sabcnews.com/sabcnews/ff-plus-cements-alliance-with-anc-in-oudtshoorn-municipality/)

**Source checks:** [SABC · 1 Aug 2024](https://www.sabcnews.com/sabcnews/ff-plus-cements-alliance-with-anc-in-oudtshoorn-municipality/): verified

**Code:** src/lib/seats/local-history.ts · oudtshoorn-da-ff

### REL-58 · Clarified

> ANC + GOOD in Theewaterskloof: GOOD switched from the ANC’s side to the DA’s. GOOD company, until it found other company.

**When:** ANC + GOOD selected · Theewaterskloof

**Context:** GOOD helped the ANC and PA govern Theewaterskloof after the 2021 election. In August 2024, GOOD changed alignment and backed the DA, resulting in new mayoral and speaker appointments.

**Meaning:** GOOD changed which side it supported.

**Previous wording:** ANC + GOOD in Theewaterskloof: GOOD company. Until it found other company.

**Review decision:** Clarity pass: Explains the party switch behind the company pun.

**Current backstory — Theewaterskloof · 2021–August 2024:** GOOD helped the ANC and PA govern Theewaterskloof after the 2021 election. In August 2024, GOOD changed alignment and backed the DA, resulting in new mayoral and speaker appointments.

**Sources:** [GroundUp · Theewaterskloof coalition history, 2025](https://groundup.org.za/article/out-of-the-black-and-into-the-red-theewaterskloof-municipalitys-rapid-decline/)

**Source checks:** [GroundUp · Theewaterskloof coalition history, 2025](https://groundup.org.za/article/out-of-the-black-and-into-the-red-theewaterskloof-municipalitys-rapid-decline/): verified

**Code:** src/lib/seats/local-history.ts · theewaterskloof-anc-good

### REL-59 · Clarified

> DA + GOOD in Theewaterskloof: GOOD came over from the ANC’s side. The ANC’s ex says you’re different.

**When:** DA + GOOD selected · Theewaterskloof

**Context:** GOOD backed a DA-led arrangement in Theewaterskloof in August 2024 after leaving its alignment with ANC and PA. GOOD’s John Michels became speaker and the DA’s Lincoln de Bruyn became mayor.

**Meaning:** A former ANC partner starts working with the DA.

**Previous wording:** DA + GOOD in Theewaterskloof: the ANC’s ex says you’re different.

**Review decision:** Clarity pass: Identifies whose former partner is arriving.

**Current backstory — Theewaterskloof · August 2024:** GOOD backed a DA-led arrangement in Theewaterskloof in August 2024 after leaving its alignment with ANC and PA. GOOD’s John Michels became speaker and the DA’s Lincoln de Bruyn became mayor.

**Sources:** [GroundUp · Theewaterskloof coalition history, 2025](https://groundup.org.za/article/out-of-the-black-and-into-the-red-theewaterskloof-municipalitys-rapid-decline/)

**Source checks:** [GroundUp · Theewaterskloof coalition history, 2025](https://groundup.org.za/article/out-of-the-black-and-into-the-red-theewaterskloof-municipalitys-rapid-decline/): verified

**Code:** src/lib/seats/local-history.ts · theewaterskloof-da-good

### REL-60 · Clarified

> DA + PDC in Plett: PDC left the deal and took the mayor’s office with new partners. Checked into the other suite.

**When:** DA + PDC selected · Bitou

**Context:** The DA, Plett Democratic Congress and Active United Front formed Bitou’s post-2021 coalition. PDC left in February 2024. Its Claude Terblanche was elected mayor on 2 February under an arrangement including ANC, PA and Ikhwezi Political Movement.

**Meaning:** The departing coalition partner supplied the next mayor.

**Previous wording:** DA + PDC in Plett: your coalition partner checked into the other mayoral suite.

**Review decision:** Clarity pass: Explains the political move behind the hotel metaphor.

**Current backstory — Bitou · 2021–February 2024:** The DA, Plett Democratic Congress and Active United Front formed Bitou’s post-2021 coalition. PDC left in February 2024. Its Claude Terblanche was elected mayor on 2 February under an arrangement including ANC, PA and Ikhwezi Political Movement.

**Sources:** [Daily Maverick · 19 Aug 2024](https://www.dailymaverick.co.za/article/2024-08-19-council-fracas-in-bitou-as-governing-anc-led-coalition-collapses/) · [Knysna-Plett Herald · 2 Feb 2024](https://www.knysnaplettherald.com/News/Article/Politics/bitou-s-new-mayor-confirmed-202402020122)

**Source checks:** [Daily Maverick · 19 Aug 2024](https://www.dailymaverick.co.za/article/2024-08-19-council-fracas-in-bitou-as-governing-anc-led-coalition-collapses/): verified; [Knysna-Plett Herald · 2 Feb 2024](https://www.knysnaplettherald.com/News/Article/Politics/bitou-s-new-mayor-confirmed-202402020122): verified

**Code:** src/lib/seats/local-history.ts · bitou-da-pdc

### REL-61 · Clarified

> ANC + PA in Plett: a short-lived coalition that unpacked before checking the cancellation policy.

**When:** ANC + PA selected · Bitou

**Context:** In February 2024, ANC, PA, PDC and IPM formed the arrangement that replaced Bitou’s DA-led administration. PDC councillor Claude Terblanche became mayor. The arrangement changed again later that year.

**Meaning:** The governing arrangement changed again within the year.

**Previous wording:** ANC + PA in Plett: the coalition unpacked before checking the cancellation policy.

**Review decision:** Clarity pass: Signals the arrangement’s short life before the accommodation joke. Restored humour retained.

**Current backstory — Bitou · February 2024:** In February 2024, ANC, PA, PDC and IPM formed the arrangement that replaced Bitou’s DA-led administration. PDC councillor Claude Terblanche became mayor. The arrangement changed again later that year.

**Sources:** [Daily Maverick · 19 Aug 2024](https://www.dailymaverick.co.za/article/2024-08-19-council-fracas-in-bitou-as-governing-anc-led-coalition-collapses/)

**Source checks:** [Daily Maverick · 19 Aug 2024](https://www.dailymaverick.co.za/article/2024-08-19-council-fracas-in-bitou-as-governing-anc-led-coalition-collapses/): verified

**Code:** src/lib/seats/local-history.ts · bitou-anc-pa

### REL-62 · Clarified

> ANC + PA in Beaufort West: five mayors in under three years. The mayoral chain gets more mileage than the N1.

**When:** ANC + PA selected · Beaufort West

**Context:** Beaufort West’s post-2021 coalition included ANC, PA and Karoo Democratic Force. Several mayoral changes followed; by February 2024, reporting described another change as the municipality’s fifth mayor in under three years.

**Meaning:** Repeated mayoral changes mean the chain keeps moving.

**Previous wording:** ANC + PA in Beaufort West: the mayoral chain gets more mileage than the N1.

**Review decision:** Clarity pass: Supplies the turnover behind the mileage joke.

**Current backstory — Beaufort West · 2021–2024:** Beaufort West’s post-2021 coalition included ANC, PA and Karoo Democratic Force. Several mayoral changes followed; by February 2024, reporting described another change as the municipality’s fifth mayor in under three years.

**Sources:** [GroundUp · Beaufort West political history, 2026](https://groundup.org.za/article/beaufort-west/) · [Daily Maverick · 12 Feb 2024](https://www.dailymaverick.co.za/article/2024-02-12-mayor-5-for-beaufort-west-gayton-mckenzie-announces-leadership-changes/)

**Source checks:** [GroundUp · Beaufort West political history, 2026](https://groundup.org.za/article/beaufort-west/): verified; [Daily Maverick · 12 Feb 2024](https://www.dailymaverick.co.za/article/2024-02-12-mayor-5-for-beaufort-west-gayton-mckenzie-announces-leadership-changes/): verified

**Code:** src/lib/seats/local-history.ts · beaufort-west-anc-pa

### REL-63 · Clarified

> DA + Cederberg First: getting their mayor back took a by-election. Some reunions need more than a group chat.

**When:** DA + CFRA selected · Cederberg

**Context:** Cederberg First, DA and FF+ formed a coalition after the 2021 election. ANC and PA took over in July 2022. A by-election win gave the earlier partners enough votes to return Cederberg First’s Ruben Richards as mayor in March 2023.

**Meaning:** A by-election result enabled former partners to return to office.

**Previous wording:** DA + Cederberg First: the reunion needed a by-election, not just a group chat.

**Review decision:** Clarity pass: Explains what the reunion achieved and why the election mattered.

**Current backstory — Cederberg · 2021–March 2023:** Cederberg First, DA and FF+ formed a coalition after the 2021 election. ANC and PA took over in July 2022. A by-election win gave the earlier partners enough votes to return Cederberg First’s Ruben Richards as mayor in March 2023.

**Sources:** [Son · 2 Mar 2023](https://www.son.co.za/nuus/kaapse-nuus/richards-weer-cederberg-mayor-20230302)

**Source checks:** [Son · 2 Mar 2023](https://www.son.co.za/nuus/kaapse-nuus/richards-weer-cederberg-mayor-20230302): verified; [MISTRA dataset · Cederberg CED_01–03](https://coalitions.mistra.org.za/): landing-page-only; direct alternate source checked

**Code:** src/lib/seats/local-history.ts · cederberg-da-cfra

### REL-64 · Clarified

> DA + FF+ in Swellendam: one councillor abstained and the mayoral vote tied. The seating plan needed therapy.

**When:** DA + FF+ selected · Swellendam

**Context:** On 3 February 2025, Swellendam’s mayoral candidates each received five votes after FF+ speaker Juan van Schalkwyk abstained. He then resigned from the council. The DA and ANC each held five seats; FF+ held one. An abstention and a resignation are different actions: the vote tied before his council seat became vacant.

**Meaning:** An abstention left the election tied.

**Previous wording:** DA + FF+ in Swellendam: one abstention. The whole seating plan needed therapy.

**Review decision:** Clarity pass: Names the consequence of the abstention without confusing it with the later resignation. Restored humour retained.

**Current backstory — Swellendam · February 2025:** On 3 February 2025, Swellendam’s mayoral candidates each received five votes after FF+ speaker Juan van Schalkwyk abstained. He then resigned from the council. The DA and ANC each held five seats; FF+ held one. An abstention and a resignation are different actions: the vote tied before his council seat became vacant.

**Sources:** [Daily Maverick · 3 Feb 2025](https://www.dailymaverick.co.za/article/2025-02-03-swellendam-has-a-da-and-ff-plus-problem-sudden-resignation-leaves-no-mayor-no-speaker/)

**Source checks:** [Daily Maverick · 3 Feb 2025](https://www.dailymaverick.co.za/article/2025-02-03-swellendam-has-a-da-and-ff-plus-problem-sudden-resignation-leaves-no-mayor-no-speaker/): verified

**Code:** src/lib/seats/local-history.ts · swellendam-da-ff

### REL-65 · Clarified

> DA + FF+ in Saldanha: FF+’s one seat completed a majority. Suddenly everyone remembers your birthday.

**When:** DA + FF+ selected · Saldanha Bay

**Context:** After the 2021 election, Saldanha Bay’s DA held 13 of 27 council seats. Its coalition with FF+, which held one seat, reached the 14-seat majority. These are historical seat figures, separate from your selected deal.

**Meaning:** A single-seat partner supplied decisive support.

**Previous wording:** DA + FF+ in Saldanha: one seat. Suddenly everyone remembers your birthday.

**Review decision:** Clarity pass: Explains why one seat suddenly attracts so much attention.

**Current backstory — Saldanha Bay · Post-2021 council:** After the 2021 election, Saldanha Bay’s DA held 13 of 27 council seats. Its coalition with FF+, which held one seat, reached the 14-seat majority. These are historical seat figures, separate from your selected deal.

**Sources:** [ACCORD · Saldanha’s post-2021 council](https://coalitions.accord.org.za/coalition/saldanha/)

**Source checks:** [ACCORD · Saldanha’s post-2021 council](https://coalitions.accord.org.za/coalition/saldanha/): verified; [MISTRA dataset · Saldanha SAL_01](https://coalitions.mistra.org.za/): landing-page-only; direct alternate source checked

**Code:** src/lib/seats/local-history.ts · saldanha-da-ff

### REL-66 · Clarified

> Witzenberg’s DA: back in the mayor’s office. Good thing it kept the receipt for the chair.

**When:** DA selected · Witzenberg

**Context:** Trevor Abrahams was elected Witzenberg executive mayor on 14 December 2023. Contemporary reporting described the DA’s return after an ANC-aligned administration. The municipality confirms the appointment date; this story does not infer the exact partner lineup.

**Meaning:** The DA returned to the mayoralty.

**Previous wording:** Witzenberg’s DA: kept the receipt for the mayoral chair.

**Review decision:** Clarity pass: Names the comeback behind the returned-furniture joke.

**Current backstory — Witzenberg · 14 December 2023:** Trevor Abrahams was elected Witzenberg executive mayor on 14 December 2023. Contemporary reporting described the DA’s return after an ANC-aligned administration. The municipality confirms the appointment date; this story does not infer the exact partner lineup.

**Sources:** [Witzenberg Municipality · leadership record](https://www.witzenberg.gov.za/leadership) · [News24 · 14 Dec 2023](https://www.news24.com/southafrica/news/da-regains-control-of-witzenberg-municipality-after-ousting-anc-coalition-20231214)

**Source checks:** [Witzenberg Municipality · leadership record](https://www.witzenberg.gov.za/leadership): verified; [News24 · 14 Dec 2023](https://www.news24.com/southafrica/news/da-regains-control-of-witzenberg-municipality-after-ousting-anc-coalition-20231214): headline-and-caption-verified; body-paywalled

**Code:** src/lib/seats/local-history.ts · witzenberg-da-return

### REL-67 · Clarified

> DA + FF+ in Langeberg: a budget dispute and a coalition breakup. Irreconcilable differences, itemised.

**When:** DA + FF+ selected · Langeberg

**Context:** The DA and FF+ formed Langeberg’s post-2021 governing coalition. In August 2024 the DA said the relationship had ended, citing the FF+’s refusal to back the May budget among its reasons. That explanation is attributed to the DA.

**Meaning:** A budget argument featured in the account of a coalition breakup.

**Previous wording:** DA + FF+ in Langeberg: irreconcilable differences, itemised.

**Review decision:** Clarity pass: Explains why the differences are itemised without assigning blame.

**Current backstory — Langeberg · May–August 2024:** The DA and FF+ formed Langeberg’s post-2021 governing coalition. In August 2024 the DA said the relationship had ended, citing the FF+’s refusal to back the May budget among its reasons. That explanation is attributed to the DA.

**Sources:** [EWN · 8 Aug 2024](https://www.ewn.co.za/2024/08/08/wc-da-explains-why-it-ended-relationship-with-freedom-front-plus)

**Source checks:** [EWN · 8 Aug 2024](https://www.ewn.co.za/2024/08/08/wc-da-explains-why-it-ended-relationship-with-freedom-front-plus): verified

**Code:** src/lib/seats/local-history.ts · langeberg-da-ff

### REL-68 · Clarified

> ANC + ICOSA: ANC’s provincial leaders ordered an end to the local deal. Honeymoon cancelled by head office.

**When:** ANC + ICOSA selected · Kannaland

**Context:** An ANC–ICOSA arrangement followed Kannaland’s November 2021 election. The ANC’s provincial leadership instructed its councillors to withdraw in December. The Dullah Omar Institute documents the resulting changes in council alignments.

**Meaning:** Provincial party instructions ended a local arrangement.

**Previous wording:** ANC + ICOSA: the local honeymoon lasted until the provincial office phoned.

**Review decision:** Clarity pass: Identifies whose leaders called and what they required.

**Current backstory — Kannaland · November–December 2021:** An ANC–ICOSA arrangement followed Kannaland’s November 2021 election. The ANC’s provincial leadership instructed its councillors to withdraw in December. The Dullah Omar Institute documents the resulting changes in council alignments.

**Sources:** [Dullah Omar Institute · 18 Nov 2022](https://dullahomarinstitute.org.za/our-work/multilevel-govt/local-government-bulletin/archives/volume-17-issue-4-november-2022/rogue-leadership-and-lawlessness-in-kannaland-municipality)

**Source checks:** [Dullah Omar Institute · 18 Nov 2022](https://dullahomarinstitute.org.za/our-work/multilevel-govt/local-government-bulletin/archives/volume-17-issue-4-november-2022/rogue-leadership-and-lawlessness-in-kannaland-municipality): verified; [News24Wire / Polity ·2Dec2021](https://www.polity.org.za/article/anc-withdraws-from-coalition-with-icosa-in-kannaland-municipality-2021-12-02): verified

**Code:** src/lib/seats/local-history.ts · kannaland-anc-icosa

### REL-69 · Restored

> DA + CSA in Graaff-Reinet: signed just in time to start arguing about the agenda.

**When:** DA + CSA selected · Dr. Beyers Naude

**Context:** The DA announced a coalition with Compatriots of South Africa and FF+ shortly before Dr Beyers Naudé’s inaugural November 2021 council meeting. DA’s Ewald Loock became mayor and CSA’s Laughton Hoffman became speaker.

**Meaning:** The agreement was reached shortly before the council meeting. Immediately arguing over the agenda is invented comic scene-setting.

**Review decision:** Restore the last-minute agreement punchline. The hypothetical agenda argument is satirical scene-setting, not a sourced historical allegation.

**Current backstory — Dr Beyers Naudé · 23 November 2021:** The DA announced a coalition with Compatriots of South Africa and FF+ shortly before Dr Beyers Naudé’s inaugural November 2021 council meeting. DA’s Ewald Loock became mayor and CSA’s Laughton Hoffman became speaker.

**Sources:** [DA statement · 23 Nov 2021](https://www.da.org.za/2021/11/da-cllr-ewald-loock-elected-as-mayor-of-the-dr-beyers-naude-municipality)

**Source checks:** [DA statement · 23 Nov 2021](https://www.da.org.za/2021/11/da-cllr-ewald-loock-elected-as-mayor-of-the-dr-beyers-naude-municipality): verified

**Code:** src/lib/seats/local-history.ts · beyers-naude-da-csa

### REL-70 · Restored

> DA + FF+ in Graaff-Reinet: a coalition with the punctuality of a last-minute matric project.

**When:** DA + FF+ selected · Dr. Beyers Naude

**Context:** DA, FF+ and Compatriots of South Africa concluded a coalition agreement shortly before Dr Beyers Naudé’s inaugural council meeting on 23 November 2021. The DA’s Ewald Loock was elected mayor.

**Meaning:** The joke applies this dated political history to your fictional deal. It does not report a current alliance or a real private conversation.

**Review decision:** Restore: the deadline is sourced, the matric-project comparison is recognisable South African humour, and the DA–FF+ pairing exposes this history without requiring CSA to be selected. Overlap with the CSA episode does not make this variation useless.

**Current backstory — Dr Beyers Naudé · November 2021:** DA, FF+ and Compatriots of South Africa concluded a coalition agreement shortly before Dr Beyers Naudé’s inaugural council meeting on 23 November 2021. The DA’s Ewald Loock was elected mayor.

**Sources:** [DA statement · 23 Nov 2021](https://www.da.org.za/2021/11/da-cllr-ewald-loock-elected-as-mayor-of-the-dr-beyers-naude-municipality)

**Source checks:** [DA statement · 23 Nov 2021](https://www.da.org.za/2021/11/da-cllr-ewald-loock-elected-as-mayor-of-the-dr-beyers-naude-municipality): verified

**Code:** src/lib/seats/local-history.ts · beyers-naude-da-ff

### REL-71 · Revised

> DA + KIM in Knysna: the coalition had sea views. And an expiry date.

**When:** DA + KIM selected · Knysna

**Context:** DA and Knysna Independent Movement governed together after the 2021 election, with EFF voting support helping them take office. A council vote removed their administration in August 2022, making way for an arrangement including ANC, PA, EFF and Plaaslike Besorgde Inwoners. This is the earlier coalition chapter.

**Meaning:** The joke applies this dated political history to your fictional deal. It does not report a current alliance or a real private conversation.

**Review decision:** Correct incomplete replacement coalition membership and distinguish EFF voting support from joining the earlier DA/KIM coalition.

**Current backstory — Knysna · 2021–August 2022:** DA and Knysna Independent Movement governed together after the 2021 election, with EFF voting support helping them take office. A council vote removed their administration in August 2022, making way for an arrangement including ANC, PA, EFF and Plaaslike Besorgde Inwoners. This is the earlier coalition chapter.

**Sources:** [Daily Maverick retrospective · 6 Sep 2023](https://www.dailymaverick.co.za/article/2023-09-06-patriotic-alliance-breaks-knysna-coalition-with-anc-says-it-wont-vote-in-council/)

**Source checks:** [Daily Maverick retrospective · 6 Sep 2023](https://www.dailymaverick.co.za/article/2023-09-06-patriotic-alliance-breaks-knysna-coalition-with-anc-says-it-wont-vote-in-council/): verified

**Code:** src/lib/seats/local-history.ts · knysna-da-kim

### REL-72 · Revised

> Msunduzi ANC: why wait for the opposition to change your mayor?

**When:** ANC selected · Msunduzi

**Context:** In August 2019, the ANC announced that Msunduzi mayor Themba Njilo and its other executive-committee members would be redeployed as part of leadership changes in KwaZulu-Natal municipalities. This was an internal party decision, not a coalition breakup or an election by residents.

**Meaning:** The joke applies this dated political history to your fictional deal. It does not report a current alliance or a real private conversation.

**Review decision:** Match source to party announcement, explain its institutional scope and use support wording in fictional outcome.

**Current backstory — Msunduzi · August 2019:** In August 2019, the ANC announced that Msunduzi mayor Themba Njilo and its other executive-committee members would be redeployed as part of leadership changes in KwaZulu-Natal municipalities. This was an internal party decision, not a coalition breakup or an election by residents.

**Sources:** [News24Wire / Polity · 13 Aug 2019](https://www.polity.org.za/article/zandile-gumede-themba-njilo-officially-out-as-anc-in-kzn-makes-sweeping-leadership-changes-2019-08-13)

**Source checks:** [News24Wire / Polity · 13 Aug 2019](https://www.polity.org.za/article/zandile-gumede-themba-njilo-officially-out-as-anc-in-kzn-makes-sweeping-leadership-changes-2019-08-13): verified

**Code:** src/lib/seats/local-history.ts · msunduzi-anc-recall

### REL-73 · Restored

> ANC + IFP: old rivals, shared Cabinet. The polite smiles must hurt.

**When:** ANC + IFP selected · Any municipality (national backstory)

**Context:** ANC and IFP were named as participants in the national GNU in June 2024. This does not establish a local coalition.

**Meaning:** Longstanding rivals become Cabinet colleagues; the strained polite smiles are imagined relationship humour.

**Review decision:** Restore the recognisable awkward-partners caricature; painful smiles are obvious exaggeration, not a factual health or motive claim.

**Current backstory — National government · June 2024:** ANC and IFP were named as participants in the national GNU in June 2024. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/relationship-history.ts · anc-ifp-gnu

### REL-74 · Clarified

> ANC + FF+: former opponents, Cabinet colleagues. The old campaign posters have requested a transfer.

**When:** ANC + FF+ selected · Any municipality (national backstory)

**Context:** ANC and FF+ were named as participants in the national GNU in June 2024. This does not establish a local coalition.

**Meaning:** Old campaign posters would rather transfer than watch former opponents become Cabinet colleagues.

**Previous wording:** ANC + FF+: even the old campaign posters have requested a transfer.

**Review decision:** Clarity pass: States the former-opponents/new-colleagues contrast before the personified posters react.

**Current backstory — National government · June 2024:** ANC and FF+ were named as participants in the national GNU in June 2024. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/relationship-history.ts · anc-ff-gnu

### REL-75 · Clarified

> IFP + PA: IFP’s Hlabisa got Cooperative Governance. PA’s Gayton got Sport. They still need a referee.

**When:** IFP + PA selected · Any municipality (national backstory)

**Context:** IFP and PA were named as participants in the national GNU in June 2024. IFP’s Velenkosini Hlabisa received Cooperative Governance and Traditional Affairs; PA’s Gayton McKenzie received Sport, Arts and Culture. This does not establish a local coalition.

**Meaning:** The parties received Cooperative Governance and Sport portfolios, yet their imaginary coalition talks still need a referee.

**Previous wording:** IFP + PA: Hlabisa tries to cooperate. Gayton appeals to the referee.

**Review decision:** Clarity pass: Identifies each politician’s party and portfolio so the cooperation and sporting wordplay is explicit. Restored humour retained.

**Current backstory — National government · June 2024:** IFP and PA were named as participants in the national GNU in June 2024. IFP’s Velenkosini Hlabisa received Cooperative Governance and Traditional Affairs; PA’s Gayton McKenzie received Sport, Arts and Culture. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/relationship-history.ts · ifp-pa-gnu

### REL-76 · Clarified

> IFP + FF+: signed an anti-ANC pact. Then joined a Cabinet with the ANC. Please update the lanyards.

**When:** IFP + FF+ selected · Any municipality (national backstory)

**Context:** IFP and FF+ were named as participants in the national GNU in June 2024. IFP and FF+ had also joined the August 2023 Charter talks aimed at replacing the ANC government. This does not establish a local coalition.

**Meaning:** The parties’ move from an anti-ANC pact into an ANC-inclusive Cabinet makes their lanyards need updating.

**Previous wording:** IFP + FF+: left to stop the ANC. Came home with GNU lanyards.

**Review decision:** Clarity pass: Spells out the change in political company behind the GNU-lanyard joke.

**Current backstory — National government · June 2024:** IFP and FF+ were named as participants in the national GNU in June 2024. IFP and FF+ had also joined the August 2023 Charter talks aimed at replacing the ANC government. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024) · [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.

**Code:** src/lib/seats/relationship-history.ts · ifp-ff-gnu

### REL-77 · Clarified

> PA + FF+: Sport meets the prisons portfolio. Extra time has two meanings.

**When:** PA + FF+ selected · Any municipality (national backstory)

**Context:** PA and FF+ were named as participants in the national GNU in June 2024. PA’s Gayton McKenzie received Sport, Arts and Culture; FF+’s Pieter Groenewald received Correctional Services. This does not establish a local coalition.

**Meaning:** Extra time means more play in sport but more time served in prison.

**Previous wording:** PA + FF+: Sport meets Correctional Services. Extra time has two meanings.

**Review decision:** Clarity pass: Explains Correctional Services as the prisons portfolio so both meanings are accessible.

**Current backstory — National government · June 2024:** PA and FF+ were named as participants in the national GNU in June 2024. PA’s Gayton McKenzie received Sport, Arts and Culture; FF+’s Pieter Groenewald received Correctional Services. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/relationship-history.ts · pa-ff-gnu

### REL-78 · Clarified

> IFP + ActionSA: signed an anti-ANC pact. Later worked with the ANC. Please face the camera.

**When:** IFP + ActionSA selected · Any municipality (national backstory)

**Context:** IFP and ActionSA participated in the August 2023 Multi-Party Charter talks, aimed at replacing the ANC government and keeping the EFF out. In 2024, IFP joined the ANC-inclusive GNU, while ActionSA’s Nasiphi Moya became Tshwane mayor with ANC and EFF support. These later national and local choices explain the reunion joke; they do not establish a pact in this municipality.

**Meaning:** Parties that signed an anti-ANC pact later worked with the ANC, making the reunion photo awkward.

**Previous wording:** IFP + ActionSA: the old pact is back. Please ignore where everyone went afterwards.

**Review decision:** Clarity pass: States the later political choice instead of asking the player to know where everyone went.

**Current backstory — National party negotiations · August 2023:** IFP and ActionSA participated in the August 2023 Multi-Party Charter talks, aimed at replacing the ANC government and keeping the EFF out. In 2024, IFP joined the ANC-inclusive GNU, while ActionSA’s Nasiphi Moya became Tshwane mayor with ANC and EFF support. These later national and local choices explain the reunion joke; they do not establish a pact in this municipality.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024) · [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997) · [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.; [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/relationship-history.ts · ifp-actionsa-charter

### REL-79 · Clarified

> FF+ + ActionSA: anti-ANC pact, then ANC partners. The old group photo needs a new caption.

**When:** FF+ + ActionSA selected · Any municipality (national backstory)

**Context:** FF+ and ActionSA participated in the August 2023 Multi-Party Charter talks, aimed at replacing the ANC government and keeping the EFF out. In 2024, FF+ joined the ANC-inclusive GNU, while ActionSA’s Nasiphi Moya became Tshwane mayor with ANC and EFF support. These later national and local choices explain the reunion joke; they do not establish a pact in this municipality.

**Meaning:** An old anti-ANC group photo needs a new caption after both parties later work with the ANC.

**Previous wording:** FF+ + ActionSA: the anti-ANC pact has some awkward post-election photos.

**Review decision:** Clarity pass: Makes the change in partners explicit before the photo-caption punchline.

**Current backstory — National party negotiations · August 2023:** FF+ and ActionSA participated in the August 2023 Multi-Party Charter talks, aimed at replacing the ANC government and keeping the EFF out. In 2024, FF+ joined the ANC-inclusive GNU, while ActionSA’s Nasiphi Moya became Tshwane mayor with ANC and EFF support. These later national and local choices explain the reunion joke; they do not establish a pact in this municipality.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024) · [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997) · [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.; [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/relationship-history.ts · ff-actionsa-charter

### REL-80 · Clarified

> EFF + MK: Floyd Shivambu moved from EFF to MK. Please date the group photos.

**When:** EFF + MK selected · Any municipality (national backstory)

**Context:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This dated leadership transfer is a backstory, not his current role or proof of a local alliance.

**Meaning:** Floyd Shivambu’s move from EFF to MK makes the date on an old group photo essential.

**Previous wording:** EFF + MK: please check which side Floyd was on when that photo was taken.

**Review decision:** Clarity pass: Names Floyd fully and states the party transfer before the photo joke.

**Current backstory — National party history · August 2024:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This dated leadership transfer is a backstory, not his current role or proof of a local alliance.

**Sources:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party) · [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party): read — EWN 15 August report confirms Shivambu leaving EFF and joining MK.; [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/relationship-history.ts · eff-mk-transfer

### REL-81 · Clarified

> EFF + IFP: last time, there was a row over uMhlathuze’s mayor’s job. This time, hide the chair.

**When:** EFF + IFP selected · Any municipality (national backstory)

**Context:** IFP and EFF accounts describe the end of their cooperation in January 2023. The IFP said it declined an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their accounts of responsibility differed. National negotiations concerned particular councils, not every municipality.

**Meaning:** A previous argument over uMhlathuze’s mayoral job makes hiding the chair seem like preparation for this reunion.

**Previous wording:** EFF + IFP: reunited. Please don’t ask who gets uMhlathuze.

**Review decision:** Clarity pass: States the earlier mayoral-job dispute before the chair joke without assigning blame or claiming it was the sole reason for the breakup.

**Current backstory — Party negotiations · January 2023:** IFP and EFF accounts describe the end of their cooperation in January 2023. The IFP said it declined an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their accounts of responsibility differed. National negotiations concerned particular councils, not every municipality.

**Sources:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/) · [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf)

**Source checks:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/): read — IFP 30 January statement sets out its account of uMhlathuze request/refusal; blame is not treated as fact.; [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf): read — EFF 29 January statement records ending ties, withdrawing support and deputy mayors returning to ordinary councillor roles; its accusations remain party claims.

**Code:** src/lib/seats/relationship-history.ts · eff-ifp-breakup

### REL-82 · Restored

> EFF + FF+: almost the same initials. Different planets.

**When:** EFF + FF+ selected · Any municipality (national backstory) · Newly completed public red line gets priority.

**Context:** In June 2024, the EFF said it would not join a GNU containing DA or FF+. By 6 November 2026, Daily Maverick reported treasurer-general Omphile Maotwe saying the party would not exclude potential partners on principle, while requiring agreement on a socialist programme. Positions and negotiating conditions can change; neither statement establishes a local agreement.

**Meaning:** Similar party abbreviations contrast with substantial political differences. Different planets is a metaphor, not a permanent refusal to negotiate.

**Previous wording:** EFF + FF+: one letter apart. Several planets away.

**Review decision:** Restore the ideological-distance joke without claiming the abbreviations differ by exactly one character. Keep both the 2024 position and 2026 openness in the backstory.

**Current backstory — Party positions · June 2024 / November 2026:** In June 2024, the EFF said it would not join a GNU containing DA or FF+. By 6 November 2026, Daily Maverick reported treasurer-general Omphile Maotwe saying the party would not exclude potential partners on principle, while requiring agreement on a socialist programme. Positions and negotiating conditions can change; neither statement establishes a local agreement.

**Sources:** [SABC, reporting Malema’s briefing · 13 Jun 2024](https://www.sabcnews.com/sabcnews/eff-wont-join-gnu-if-da-and-ff-plus-part-of-it-malema-2/) · [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/)

**Source checks:** [SABC, reporting Malema’s briefing · 13 Jun 2024](https://www.sabcnews.com/sabcnews/eff-wont-join-gnu-if-da-and-ff-plus-part-of-it-malema-2/): read — SABC 13 June reports EFF refusal to join GNU containing DA/FF+; later 2026 stance added to avoid permanent-ban impression.; [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/): read — Daily Maverick 6 November 2026 explicitly reports Mashaba open to talks including MK with concerns; also Hill-Lewis cautious public stance and EFF new openness conditional on socialist programme.

**Code:** src/lib/seats/relationship-history.ts · eff-ff-gnu-terms

### REL-83 · Clarified

> ANC + EFF: dinner for two. EFF leader Julius Malema has opinions about the DA and FF+ plus-ones.

**When:** ANC + EFF selected · Any municipality (national backstory)

**Context:** During June 2024 negotiations, the EFF proposed cooperation with the ANC while excluding DA and FF+ participation. The ANC went on to form the GNU including those parties. This describes the negotiations, not an agreement reached between ANC and EFF.

**Meaning:** A dinner invitation becomes awkward because EFF leader Julius Malema objected to DA and FF+ joining the arrangement.

**Previous wording:** ANC + EFF: dinner for two. Julius has opinions about the other guests.

**Review decision:** Clarity pass: Identifies Julius, his party role and the unwanted plus-ones without inventing attributed dialogue.

**Current backstory — National negotiations · June 2024:** During June 2024 negotiations, the EFF proposed cooperation with the ANC while excluding DA and FF+ participation. The ANC went on to form the GNU including those parties. This describes the negotiations, not an agreement reached between ANC and EFF.

**Sources:** [EWN · 30 Jun 2024](https://www.ewn.co.za/2024/06/30/eff-proposes-coalition-with-anc-without-the-da-or-ff-plus) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [EWN · 30 Jun 2024](https://www.ewn.co.za/2024/06/30/eff-proposes-coalition-with-anc-without-the-da-or-ff-plus): read — EWN 30 June reports EFF proposal for ANC agreement excluding DA/FF+; records proposal, not completed alliance.

**Code:** src/lib/seats/relationship-history.ts · anc-eff-gnu-terms

### REL-84 · Clarified

> ActionSA + MK: ActionSA leader Herman Mashaba is open to talks. His eyebrows have reservations.

**When:** ActionSA + MK selected · Any municipality (national backstory)

**Context:** On 6 November 2026, Daily Maverick reported Herman Mashaba’s openness to negotiations including MK, alongside his concerns about the party. Openness to talks is not a signed coalition or evidence that the concerns were resolved.

**Meaning:** Mashaba is open to talking while his personified eyebrows remain unconvinced.

**Previous wording:** ActionSA + MK: Herman’s open to talks. His eyebrows have reservations.

**Review decision:** Clarity pass: Identifies Herman Mashaba and his ActionSA role before the facial-expression joke.

**Current backstory — Party negotiations · November 2026:** On 6 November 2026, Daily Maverick reported Herman Mashaba’s openness to negotiations including MK, alongside his concerns about the party. Openness to talks is not a signed coalition or evidence that the concerns were resolved.

**Sources:** [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/)

**Source checks:** [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/): read — Daily Maverick 6 November 2026 explicitly reports Mashaba open to talks including MK with concerns; also Hill-Lewis cautious public stance and EFF new openness conditional on socialist programme.

**Code:** src/lib/seats/relationship-history.ts · actionsa-mk-talks

### REL-85 · Revised

> MK + FF+: even agreeing to disagree may need a recess.

**When:** MK + FF+ selected · Any municipality (national backstory) · Newly completed public red line gets priority.

**Context:** At the FF+ voter-registration campaign launch in May 2026, Corné Mulder said the party preferred not to form coalitions with MK, EFF or ANC because of policy differences, while remaining open to coalition government. A stated preference is not an unconditional refusal to negotiate.

**Meaning:** The joke applies this dated political history to your fictional deal. It does not report a current alliance or a real private conversation.

**Review decision:** Specify voter-registration campaign, and retain Mulder’s explicit preference not to partner with MK/EFF/ANC while distinguishing preference from a blanket prohibition.

**Current backstory — National party positions · May 2026:** At the FF+ voter-registration campaign launch in May 2026, Corné Mulder said the party preferred not to form coalitions with MK, EFF or ANC because of policy differences, while remaining open to coalition government. A stated preference is not an unconditional refusal to negotiate.

**Sources:** [SABC · 21 May 2026](https://www.sabcnews.com/sabcnews/ff-plus-says-its-time-for-it-to-govern-south-africa/)

**Source checks:** [SABC · 21 May 2026](https://www.sabcnews.com/sabcnews/ff-plus-says-its-time-for-it-to-govern-south-africa/): read — SABC 21 May 2026 records voter-registration campaign launch and Mulder preferring not to form coalitions with MK/EFF/ANC over policy disagreement; not an unconditional ban.

**Code:** src/lib/seats/relationship-history.ts · mk-ff-policy-gap

### REL-86 · Clarified

> IFP + MK: MK won the most KZN seats. IFP got the premier’s job. Lovely reunion.

**When:** IFP + MK selected · KwaZulu-Natal

**Context:** MK won the largest share in KwaZulu-Natal in 2024 without an outright majority. IFP’s Thami Ntuli became premier after a 41–39 legislature vote. This provincial rivalry is not proof of a municipal agreement or a permanent ban on cooperation.

**Meaning:** MK won the most provincial seats, but IFP won the premier’s job, making their reunion awkward.

**Previous wording:** IFP + MK: one won the biggest bloc, the other got the keys. Lovely reunion.

**Review decision:** Clarity pass: Names which party got which electoral outcome and office instead of using ambiguous keys and blocs.

**Current backstory — KwaZulu-Natal · June 2024:** MK won the largest share in KwaZulu-Natal in 2024 without an outright majority. IFP’s Thami Ntuli became premier after a 41–39 legislature vote. This provincial rivalry is not proof of a municipal agreement or a permanent ban on cooperation.

**Sources:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/) · [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** src/lib/seats/relationship-history.ts · kzn-ifp-mk-premier

### REL-87 · Clarified

> EFF + ActionSA in Tshwane: from an anti-EFF pact to EFF votes for ActionSA’s mayor. Roll out the red carpet.

**When:** EFF + ActionSA selected · Tshwane

**Context:** EFF support helped ActionSA’s Nasiphi Moya become Tshwane mayor in October 2024, alongside the ANC and other parties. This was a particular local arrangement, despite the earlier national Charter’s aim to keep the EFF out.

**Meaning:** An earlier aim to keep EFF out becomes a welcome for EFF votes helping elect ActionSA’s mayor.

**Previous wording:** EFF + ActionSA in Tshwane: the red line turned out to be a red carpet.

**Review decision:** Clarity pass: Supplies the reversal that makes the red-carpet joke work.

**Current backstory — Tshwane · October 2024:** EFF support helped ActionSA’s Nasiphi Moya become Tshwane mayor in October 2024, alongside the ANC and other parties. This was a particular local arrangement, despite the earlier national Charter’s aim to keep the EFF out.

**Sources:** [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997) · [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/) · [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/)

**Source checks:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.; [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/relationship-history.ts · tshwane-eff-actionsa

### REL-88 · Clarified

> PA + ActionSA in Joburg: ActionSA says it offered PA two council leadership jobs. Some welcome-back cards come with job titles.

**When:** PA + ActionSA selected · Johannesburg

**Context:** ActionSA said it offered two mayoral committee positions in January 2023 to restore PA support for Johannesburg’s coalition. Its account said the negotiating teams, including PA and DA, accepted the proposal but the DA Federal Executive rejected it. This records ActionSA’s account of negotiations, not posts ultimately received by PA.

**Meaning:** ActionSA’s reported offer to bring PA back included two leadership jobs, making the welcome-back card unusually practical.

**Previous wording:** PA + ActionSA in Joburg: the reported reunion offer came with two portfolios.

**Review decision:** Clarity pass: Keeps the proposal attributed to ActionSA and explains portfolios as council leadership jobs; it does not claim those posts were received.

**Current backstory — Johannesburg · January 2023:** ActionSA said it offered two mayoral committee positions in January 2023 to restore PA support for Johannesburg’s coalition. Its account said the negotiating teams, including PA and DA, accepted the proposal but the DA Federal Executive rejected it. This records ActionSA’s account of negotiations, not posts ultimately received by PA.

**Sources:** [ActionSA account of negotiations · 25 Jan 2023](https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/)

**Source checks:** [ActionSA account of negotiations · 25 Jan 2023](https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/): read — ActionSA 25 January statement says two MMC positions offered, negotiating teams accepted, DA Federal Executive rejected; no three-position total stated.

**Code:** src/lib/seats/relationship-history.ts · joburg-pa-actionsa

### REL-89 · Kept

> EFF + PA in Joburg: unity government. Separate microphones, please.

**When:** EFF + PA selected · Johannesburg

**Context:** Johannesburg’s 2022/23 annual report lists EFF and PA among parties in the Government of Local Unity formed in January 2023. This was a wider coalition, not a standalone EFF–PA pact.

**Meaning:** The joke applies this dated political history to your fictional deal. It does not report a current alliance or a real private conversation.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — Johannesburg · January 2023:** Johannesburg’s 2022/23 annual report lists EFF and PA among parties in the Government of Local Unity formed in January 2023. This was a wider coalition, not a standalone EFF–PA pact.

**Sources:** [Johannesburg annual report · 2022/23](https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf)

**Source checks:** [Johannesburg annual report · 2022/23](https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf): read — Johannesburg annual report pages 35 and 40 lists ANC/EFF/PA and other parties in January 2023 GLU.

**Code:** src/lib/seats/relationship-history.ts · joburg-eff-pa

## General bird banter (26)

### BIRD-01 · Clarified

> Everyone wants the mayor’s chain. Nobody wants to take the meeting notes.

**When:** No party selected.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** The ceremonial job appeals more than the ordinary work of recording the meeting.

**Previous wording:** Everyone wants the mayor’s chain. Nobody wants the minutes.

**Review decision:** Clarity pass: Spell out meeting minutes so the contrast works without council terminology.

**Code:** src/lib/seats/game.ts

### BIRD-02 · Revised

> {shortfall} more {seat / seats}. Time for a very principled phone call.

**When:** Below a majority.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Comments on the deal’s support or the task of agreeing what to do.

**Previous wording:** {shortfall} more {seat/seats}. Time for a very principled phone call.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-03 · Clarified

> No coalition partners to blame. Your own councillors will have to improvise.

**When:** Solo majority.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** A party governing alone has to invent another excuse when things go wrong.

**Previous wording:** No partners to blame. The caucus will have to improvise.

**Review decision:** Clarity pass: Replace caucus with own councillors and identify the absent coalition partners.

**Code:** src/lib/seats/game.ts

### BIRD-04 · Kept

> You have the numbers. Please don’t let anyone leave the group chat.

**When:** Exactly enough support, with multiple parties.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** A single lost seat removes this majority. The group chat stands for the deal.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-05 · Kept

> Every partner is essential. Everyone has noticed.

**When:** A majority dependent on every partner.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Pivotal parties know they can demand concessions.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-06 · Kept

> One mayoral chain. A whole season of main characters.

**When:** At least five parties; after exact/lean cases.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Many leaders compete for a single top job, like a reality-TV ensemble.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-07 · Kept

> The press conference is booked. Has anyone read the agreement?

**When:** Multi-party majority.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Publicity may get ahead of practical agreement.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-08 · Kept

> {count} parties. No single exit sinks it. The egos travel separately.

**When:** At least five parties, no pivotal partner.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** The seat cushion is real; personalities can still create friction.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-09 · Revised

> {count} parties. {One can / {critical} can each} sink this deal. Nobody tell the negotiators.

**When:** At least five parties, at least one pivotal partner.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Comments on the deal’s support or the task of agreeing what to do.

**Previous wording:** {count} parties. {One can / N can each} sink this deal. Nobody tell the negotiators.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-10 · Kept

> Exactly enough seats. Nobody is allowed a dramatic exit.

**When:** Smaller multi-party majority with no spare seats.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** A walkout would remove the majority.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-11 · Revised

> Every partner counts. Keep a chair for everyone.

**When:** Smaller coalition dependent on every partner.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Comments on the deal’s support or the task of agreeing what to do.

**Previous wording:** Every partner can sink this deal. Watch the demands multiply.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-12 · Kept

> No single exit sinks this deal. The group chat can still explode.

**When:** Smaller coalition with no pivotal partner.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Numerical resilience does not prevent arguments.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-13 · Revised

> {One partner can / {critical} partners can each} sink this deal. Check who holds the balance.

**When:** Smaller coalition with some pivotal partners.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Comments on the deal’s support or the task of agreeing what to do.

**Previous wording:** {One partner can / N partners can each} sink this deal. Suddenly everyone’s essential.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-14 · Kept

> The chairs are empty. The demands are already arriving.

**When:** No party selected.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Negotiators want concessions before a meeting even starts.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-15 · Kept

> The group photo can wait. You still need the numbers.

**When:** Below a majority.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** The coalition announcement is premature.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-16 · Clarified

> One party. Still arguing over who gets the microphone.

**When:** Solo majority.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Even one party can contain competing voices.

**Previous wording:** One party. The factions have requested separate microphones.

**Review decision:** Clarity pass: Make the internal disagreement visible without needing to know what factions are.

**Code:** src/lib/seats/game.ts

### BIRD-17 · Kept

> One mayoral chain. A whole committee of main characters.

**When:** At least five parties in a majority.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Multiple competing ambitions, not an automatic claim of mathematical fragility.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-18 · Kept

> Order. Who’s still speaking to whom?

**When:** No party selected.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** The Speaker must first establish which politicians can bear to negotiate.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-19 · Kept

> I’ve brought the agenda. They’ve brought demands.

**When:** No party selected.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Routine procedure meets political bargaining.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-20 · Kept

> Lovely speeches. I’m still counting.

**When:** Below a majority.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Rhetoric cannot substitute for seats.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-21 · Kept

> Fewer press statements. More seats, please.

**When:** Below a majority.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Public positioning does not solve the arithmetic.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-22 · Kept

> One party. I’m keeping the gavel.

**When:** Solo majority.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** The bird refuses to surrender her authority to the dominant party.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-23 · Clarified

> A whole majority. Now watch the party argue with itself.

**When:** Solo majority.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Winning enough seats does not make everyone within the party agree.

**Previous wording:** A whole majority. The internal opposition is warming up.

**Review decision:** Clarity pass: Replace the abstract internal opposition with a recognisable argument.

**Code:** src/lib/seats/game.ts

### BIRD-24 · Revised

> You’ve agreed on the numbers. Now comes the tricky part: agreeing what to do.

**When:** Multi-party majority.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** Comments on the deal’s support or the task of agreeing what to do.

**Previous wording:** You’ve agreed on a number. Please don’t ruin it by discussing policy.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### BIRD-25 · Clarified

> Even the smallest partner can bring this down. Handle with care.

**When:** Every selected partner is pivotal.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** When every partner is pivotal, even the smallest needs careful handling.

**Previous wording:** Nobody breathe near the smallest partner.

**Review decision:** Clarity pass: Put the reason for the exaggerated caution into the joke; this only appears when every partner is pivotal.

**Code:** src/lib/seats/game.ts

### BIRD-26 · Clarified

> I’ll take the meeting notes. Someone else can take the credit.

**When:** Multi-party majority, not every partner pivotal.

**Context:** Seat arithmetic or generic satire; not a claim about a named party.

**Meaning:** The Speaker does the routine work while someone else claims the achievement.

**Previous wording:** I’ll take the minutes. Someone else can take the credit.

**Review decision:** Clarity pass: Keep the take/take wordplay while spelling out meeting minutes.

**Code:** src/lib/seats/game.ts

## Deal names (7)

### NAME-01 · Kept

> Some assembly required.

**When:** No selected party; defined in code but title hidden in normal UI.

**Context:** A label determined by the seat calculation.

**Meaning:** Building the coalition is like assembling furniture.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### NAME-02 · Kept

> Still in the group chat.

**When:** Below majority; defined in code but title hidden in normal UI.

**Context:** A label determined by the seat calculation.

**Meaning:** Negotiations have not yet produced enough support.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### NAME-03 · Kept

> The solo act.

**When:** One party reaches a majority.

**Context:** A label determined by the seat calculation.

**Meaning:** One party can govern without a partner.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### NAME-04 · Kept

> The one-seat tightrope.

**When:** Multi-party majority with exactly the required seats.

**Context:** A label determined by the seat calculation.

**Meaning:** Losing one seat removes the majority; it does not mean there is one spare seat.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### NAME-05 · Kept

> The marriage of inconvenience.

**When:** A majority in which every partner is pivotal, except the exact-threshold case.

**Context:** A label determined by the seat calculation.

**Meaning:** They need one another even when cooperation is uncomfortable.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### NAME-06 · Kept

> The very big group project.

**When:** At least five parties after exact/lean cases have been ruled out.

**Context:** A label determined by the seat calculation.

**Meaning:** A familiar group assignment with many contributors and competing egos.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/game.ts

### NAME-07 · Clarified

> The crowded table.

**When:** Other multi-party majorities.

**Context:** A label determined by the seat calculation.

**Meaning:** Several parties share the bargaining table.

**Previous wording:** The big-tent deal.

**Review decision:** Clarity pass: Use a visible scene instead of the political term big tent.

**Code:** src/lib/seats/game.ts

## History scenarios (176)

### REL-01-X · Clarified

> The campaign insults enter the chat.
> DA and EFF sit down to negotiate. Someone brings a folder of the insults they traded during the campaign. {actor} leaves before the folder is opened.

**When:** Test a majority containing DA + EFF. Any municipality (national backstory).

**Context:** The DA acknowledged issue-by-issue EFF support for councils after 2016. Its July 2024 GNU statement sought to keep EFF and MK out of executive power; Helen Zille called cooperation with them almost impossible in November 2025. On 6 November 2026, Daily Maverick reported Geordin Hill-Lewis declining to rule partners out publicly. These dated statements do not establish a local agreement.

**Meaning:** Invented scene: the negotiations are derailed before the parties even open a folder of the insults they traded while campaigning.

**Previous wording:** The red lines enter the chat.
DA and EFF sit down to negotiate. Someone brings a folder of old campaign speeches. {actor} leaves before the folder is opened.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Names the campaign insults behind the red-line and old-speeches references; the approved tease is unchanged.

**Current backstory — Party positions · 2019–November 2026:** The DA acknowledged issue-by-issue EFF support for councils after 2016. Its July 2024 GNU statement sought to keep EFF and MK out of executive power; Helen Zille called cooperation with them almost impossible in November 2025. On 6 November 2026, Daily Maverick reported Geordin Hill-Lewis declining to rule partners out publicly. These dated statements do not establish a local agreement.

**Sources:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power) · [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists) · [Newsday interview with Helen Zille · 3 Nov 2025](https://newsday.co.za/south-africa/9110/the-da-will-never-work-with-the-eff-or-mk/) · [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/)

**Source checks:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power): read — DA July 2019 account explicitly distinguishes issue-by-issue EFF support from the formal governing coalition.; [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists): read — DA 17 July 2024 statement expressly says GNU role is to prevent MK/EFF access to executive power.; [Newsday interview with Helen Zille · 3 Nov 2025](https://newsday.co.za/south-africa/9110/the-da-will-never-work-with-the-eff-or-mk/): read — Newsday interview body says almost impossible and decisions after seat results; headline never is stronger. Background corrected and updated with dated 2026 follow-up.; [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/): read — Daily Maverick 6 November 2026 explicitly reports Mashaba open to talks including MK with concerns; also Hill-Lewis cautious public stance and EFF new openness conditional on socialist programme.

**Code:** src/lib/seats/political-history.ts · da-eff-red-lines:walkout

### REL-01-T · Clarified

> The water pipes win this round.
> DA and EFF put the old campaign insults aside and agree on the water-pipe repairs. The work plan has fewer exclamation marks. Everyone stays.

**When:** Test a majority containing DA + EFF. Any municipality (national backstory).

**Context:** The DA acknowledged issue-by-issue EFF support for councils after 2016. Its July 2024 GNU statement sought to keep EFF and MK out of executive power; Helen Zille called cooperation with them almost impossible in November 2025. On 6 November 2026, Daily Maverick reported Geordin Hill-Lewis declining to rule partners out publicly. These dated statements do not establish a local agreement.

**Meaning:** Invented scene: putting campaign insults aside produces a calmer repair plan with fewer exclamation marks.

**Previous wording:** The water pipes win this round.
DA and EFF put the speeches aside and agree on the water-pipe repairs. The work plan has fewer exclamation marks. Everyone stays.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Names which speeches are being set aside so the punctuation joke has a clear setup.

**Current backstory — Party positions · 2019–November 2026:** The DA acknowledged issue-by-issue EFF support for councils after 2016. Its July 2024 GNU statement sought to keep EFF and MK out of executive power; Helen Zille called cooperation with them almost impossible in November 2025. On 6 November 2026, Daily Maverick reported Geordin Hill-Lewis declining to rule partners out publicly. These dated statements do not establish a local agreement.

**Sources:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power) · [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists) · [Newsday interview with Helen Zille · 3 Nov 2025](https://newsday.co.za/south-africa/9110/the-da-will-never-work-with-the-eff-or-mk/) · [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/)

**Source checks:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power): read — DA July 2019 account explicitly distinguishes issue-by-issue EFF support from the formal governing coalition.; [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists): read — DA 17 July 2024 statement expressly says GNU role is to prevent MK/EFF access to executive power.; [Newsday interview with Helen Zille · 3 Nov 2025](https://newsday.co.za/south-africa/9110/the-da-will-never-work-with-the-eff-or-mk/): read — Newsday interview body says almost impossible and decisions after seat results; headline never is stronger. Background corrected and updated with dated 2026 follow-up.; [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/): read — Daily Maverick 6 November 2026 explicitly reports Mashaba open to talks including MK with concerns; also Hill-Lewis cautious public stance and EFF new openness conditional on socialist programme.

**Code:** src/lib/seats/political-history.ts · da-eff-red-lines:truce

### REL-02-X · Clarified

> Enough seats. Wrong neighbour.
> DA and MK approve your deal’s seat totals. Then they see they’ll be sitting next to each other. {actor} leaves before the place cards are printed.

**When:** Test a majority containing DA + MK. Any municipality (national backstory).

**Context:** The DA’s July 2024 GNU statement sought to keep MK and EFF out of executive power. Helen Zille called cooperation with them almost impossible in November 2025. On 6 November 2026, Daily Maverick reported Geordin Hill-Lewis declining to rule partners out publicly. That is not an announcement of a DA–MK deal.

**Meaning:** Invented scene: the numbers work for the fictional deal, but sharing the table with a political opponent proves harder.

**Previous wording:** The seating plan crosses a red line.
DA and MK approve the seat totals, then discover their delegations are expected to share a table. {actor} leaves to consult the campaign archive.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Replaces an unexplained campaign-archive reference with the visible problem of sitting together.

**Current backstory — Party positions · July 2024–November 2026:** The DA’s July 2024 GNU statement sought to keep MK and EFF out of executive power. Helen Zille called cooperation with them almost impossible in November 2025. On 6 November 2026, Daily Maverick reported Geordin Hill-Lewis declining to rule partners out publicly. That is not an announcement of a DA–MK deal.

**Sources:** [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists) · [Newsday interview with Helen Zille · 3 Nov 2025](https://newsday.co.za/south-africa/9110/the-da-will-never-work-with-the-eff-or-mk/) · [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/)

**Source checks:** [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists): read — DA 17 July 2024 statement expressly says GNU role is to prevent MK/EFF access to executive power.; [Newsday interview with Helen Zille · 3 Nov 2025](https://newsday.co.za/south-africa/9110/the-da-will-never-work-with-the-eff-or-mk/): read — Newsday interview body says almost impossible and decisions after seat results; headline never is stronger. Background corrected and updated with dated 2026 follow-up.; [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/): read — Daily Maverick 6 November 2026 explicitly reports Mashaba open to talks including MK with concerns; also Hill-Lewis cautious public stance and EFF new openness conditional on socialist programme.

**Code:** src/lib/seats/political-history.ts · da-mk-red-lines:walkout

### REL-02-T · Revised

> An extremely awkward group photo.
> DA and MK agree on the road repairs in your fictional deal. Nobody agrees on the photo caption. Everyone stays for the work anyway.

**When:** Test a majority containing DA + MK. Any municipality (national backstory).

**Context:** The DA’s July 2024 GNU statement sought to keep MK and EFF out of executive power. Helen Zille called cooperation with them almost impossible in November 2025. On 6 November 2026, Daily Maverick reported Geordin Hill-Lewis declining to rule partners out publicly. That is not an announcement of a DA–MK deal.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Restore the sharper political caricature. Nightmare is comic commentary on her stated opposition, not a claim about a private dream or a current permanent ban.

**Current backstory — Party positions · July 2024–November 2026:** The DA’s July 2024 GNU statement sought to keep MK and EFF out of executive power. Helen Zille called cooperation with them almost impossible in November 2025. On 6 November 2026, Daily Maverick reported Geordin Hill-Lewis declining to rule partners out publicly. That is not an announcement of a DA–MK deal.

**Sources:** [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists) · [Newsday interview with Helen Zille · 3 Nov 2025](https://newsday.co.za/south-africa/9110/the-da-will-never-work-with-the-eff-or-mk/) · [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/)

**Source checks:** [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists): read — DA 17 July 2024 statement expressly says GNU role is to prevent MK/EFF access to executive power.; [Newsday interview with Helen Zille · 3 Nov 2025](https://newsday.co.za/south-africa/9110/the-da-will-never-work-with-the-eff-or-mk/): read — Newsday interview body says almost impossible and decisions after seat results; headline never is stronger. Background corrected and updated with dated 2026 follow-up.; [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/): read — Daily Maverick 6 November 2026 explicitly reports Mashaba open to talks including MK with concerns; also Hill-Lewis cautious public stance and EFF new openness conditional on socialist programme.

**Code:** src/lib/seats/political-history.ts · da-mk-red-lines:truce

### REL-03-X · Kept

> The coalition reunion special.
> DA and ActionSA agree to start fresh. Then someone says “about last time”. {actor} leaves the deal before the group photo.

**When:** Test a majority containing DA + ActionSA. Johannesburg.

**Context:** DA and ActionSA were partners in Johannesburg’s governing coalition. In January 2023, ActionSA publicly criticised the DA’s coalition negotiations and proposed putting forward its own mayoral candidate.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — Johannesburg · January 2023:** DA and ActionSA were partners in Johannesburg’s governing coalition. In January 2023, ActionSA publicly criticised the DA’s coalition negotiations and proposed putting forward its own mayoral candidate.

**Sources:** [ActionSA statement · 26 Jan 2023](https://www.actionsa.org.za/coalition-negotiations-collapse-ahead-of-joburg-motions-of-no-confidence/) · [Johannesburg council · 26 Jan 2023](https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf)

**Source checks:** [ActionSA statement · 26 Jan 2023](https://www.actionsa.org.za/coalition-negotiations-collapse-ahead-of-joburg-motions-of-no-confidence/): read — ActionSA 26 January statement confirms talks failed, current coalition and proposed ActionSA mayoral candidate. Forecast of removal is not used as proof of outcome.; [Johannesburg council · 26 Jan 2023](https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf): limited-extraction — Official scanned PDF was reachable but readable result could not be established using available extraction. Removal independently checked against post-vote SABC reporting; no vote total copied.

**Code:** src/lib/seats/political-history.ts · joburg-da-actionsa:walkout

### REL-03-T · Clarified

> The coalition exes agree on something.
> DA and ActionSA put the old Joburg arguments in a folder marked “after the election”. Everyone stays. Nobody deletes the screenshots.

**When:** Test a majority containing DA + ActionSA. Johannesburg.

**Context:** DA and ActionSA were partners in Johannesburg’s governing coalition. In January 2023, ActionSA publicly criticised the DA’s coalition negotiations and proposed putting forward its own mayoral candidate.

**Meaning:** Invented scene: the coalition exes postpone their old arguments but keep the screenshots.

**Previous wording:** The exes agree on something.
DA and ActionSA put the old Joburg arguments in a folder marked “after the election”. Everyone stays. Nobody deletes the screenshots.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Adds coalition so the title explains the exes metaphor without needing the backstory.

**Current backstory — Johannesburg · January 2023:** DA and ActionSA were partners in Johannesburg’s governing coalition. In January 2023, ActionSA publicly criticised the DA’s coalition negotiations and proposed putting forward its own mayoral candidate.

**Sources:** [ActionSA statement · 26 Jan 2023](https://www.actionsa.org.za/coalition-negotiations-collapse-ahead-of-joburg-motions-of-no-confidence/) · [Johannesburg council · 26 Jan 2023](https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf)

**Source checks:** [ActionSA statement · 26 Jan 2023](https://www.actionsa.org.za/coalition-negotiations-collapse-ahead-of-joburg-motions-of-no-confidence/): read — ActionSA 26 January statement confirms talks failed, current coalition and proposed ActionSA mayoral candidate. Forecast of removal is not used as proof of outcome.; [Johannesburg council · 26 Jan 2023](https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf): limited-extraction — Official scanned PDF was reachable but readable result could not be established using available extraction. Removal independently checked against post-vote SABC reporting; no vote total copied.

**Code:** src/lib/seats/political-history.ts · joburg-da-actionsa:truce

### REL-04-X · Kept

> Previously, on Tshwane…
> DA and ActionSA disagree over who gets the mayor’s office. {actor} leaves. The Speaker asks whether anyone kept the previous seating plan.

**When:** Test a majority containing DA + ActionSA. Tshwane.

**Context:** ActionSA announced its withdrawal of support from Tshwane’s DA-led coalition in September 2024. Its own statement cited the city’s finances; that was the party’s stated explanation.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — Tshwane · September 2024:** ActionSA announced its withdrawal of support from Tshwane’s DA-led coalition in September 2024. Its own statement cited the city’s finances; that was the party’s stated explanation.

**Sources:** [ActionSA statement · 25 Sep 2024](https://www.actionsa.org.za/gauteng-in-action-25-september-2024/)

**Source checks:** [ActionSA statement · 25 Sep 2024](https://www.actionsa.org.za/gauteng-in-action-25-september-2024/): read — ActionSA 25 September statement explicitly records support withdrawal and financial-state explanation as the party’s position.

**Code:** src/lib/seats/political-history.ts · tshwane-da-actionsa:walkout

### REL-04-T · Kept

> A new season. Same cast.
> DA and ActionSA agree on a council plan. The first clause: no replaying the 2024 breakup at every meeting. Everyone stays.

**When:** Test a majority containing DA + ActionSA. Tshwane.

**Context:** ActionSA announced its withdrawal of support from Tshwane’s DA-led coalition in September 2024. Its own statement cited the city’s finances; that was the party’s stated explanation.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — Tshwane · September 2024:** ActionSA announced its withdrawal of support from Tshwane’s DA-led coalition in September 2024. Its own statement cited the city’s finances; that was the party’s stated explanation.

**Sources:** [ActionSA statement · 25 Sep 2024](https://www.actionsa.org.za/gauteng-in-action-25-september-2024/)

**Source checks:** [ActionSA statement · 25 Sep 2024](https://www.actionsa.org.za/gauteng-in-action-25-september-2024/): read — ActionSA 25 September statement explicitly records support withdrawal and financial-state explanation as the party’s position.

**Code:** src/lib/seats/political-history.ts · tshwane-da-actionsa:truce

### REL-05-X · Revised

> The mayoral credit dispute.
> ANC and ActionSA both want the headline. The ribbon-cutting invitation becomes a coalition summit. {actor} leaves the deal.

**When:** Test a majority containing ANC + ActionSA. Tshwane.

**Context:** ActionSA joined the August 2023 Multi-Party Charter aimed at replacing the ANC government. The ANC then backed ActionSA’s Nasiphi Moya for Tshwane mayor in October 2024. She was elected on 9 October, illustrating how local partners can differ from earlier national alignments.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Replace pre-vote SABC liveblog with completed-election reporting, alongside official minutes.

**Current backstory — Tshwane · 9 October 2024:** ActionSA joined the August 2023 Multi-Party Charter aimed at replacing the ANC government. The ANC then backed ActionSA’s Nasiphi Moya for Tshwane mayor in October 2024. She was elected on 9 October, illustrating how local partners can differ from earlier national alignments.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997) · [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/)

**Source checks:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.; [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/political-history.ts · tshwane-anc-actionsa:walkout

### REL-05-T · Clarified

> Both logos fit.
> ANC and ActionSA agree to share the credit for fixing the roads. Two logos fit on the announcement. Everyone stays.

**When:** Test a majority containing ANC + ActionSA. Tshwane.

**Context:** ActionSA joined the August 2023 Multi-Party Charter aimed at replacing the ANC government. The ANC then backed ActionSA’s Nasiphi Moya for Tshwane mayor in October 2024. She was elected on 9 October, illustrating how local partners can differ from earlier national alignments.

**Meaning:** Invented scene: sharing credit for road repairs turns out to be as simple as fitting both logos on an announcement.

**Previous wording:** Local politics, different playlist.
ANC and ActionSA agree to share the credit for fixing the roads. Two logos fit on the announcement. Everyone stays.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Connects the title to the logos in the story instead of an unexplained playlist metaphor.

**Current backstory — Tshwane · 9 October 2024:** ActionSA joined the August 2023 Multi-Party Charter aimed at replacing the ANC government. The ANC then backed ActionSA’s Nasiphi Moya for Tshwane mayor in October 2024. She was elected on 9 October, illustrating how local partners can differ from earlier national alignments.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997) · [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/)

**Source checks:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.; [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/political-history.ts · tshwane-anc-actionsa:truce

### REL-06-X · Revised

> One office. Two wish lists.
> DA and PA sit down to divide the council jobs. There are more wish lists than offices. {actor} withdraws its support.

**When:** Test a majority containing DA + PA. Johannesburg.

**Context:** Talks to restore PA support for Johannesburg’s DA-led coalition broke down in January 2023. DA mayor Mpho Phalatse subsequently lost a no-confidence vote. Accounts of responsibility were disputed.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Previous wording:** One office. Two wish lists.
DA and PA sit down to divide the council jobs. There are more wish lists than offices. {actor} walks out with its seats.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Add post-vote reporting rather than relying on forecast coverage; clarify support is withdrawn rather than council seats changing ownership.

**Current backstory — Johannesburg · January 2023:** Talks to restore PA support for Johannesburg’s DA-led coalition broke down in January 2023. DA mayor Mpho Phalatse subsequently lost a no-confidence vote. Accounts of responsibility were disputed.

**Sources:** [Johannesburg council · 26 Jan 2023](https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf) · [ActionSA statement · 26 Jan 2023](https://www.actionsa.org.za/coalition-negotiations-collapse-ahead-of-joburg-motions-of-no-confidence/) · [SABC · 26 Jan 2023, after the vote](https://www.sabcnews.com/sabcnews/joburg-mayor-mpho-phalatse-voted-out-of-office/)

**Source checks:** [ActionSA statement · 26 Jan 2023](https://www.actionsa.org.za/coalition-negotiations-collapse-ahead-of-joburg-motions-of-no-confidence/): read — ActionSA 26 January statement confirms talks failed, current coalition and proposed ActionSA mayoral candidate. Forecast of removal is not used as proof of outcome.; [Johannesburg council · 26 Jan 2023](https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf): limited-extraction — Official scanned PDF was reachable but readable result could not be established using available extraction. Removal independently checked against post-vote SABC reporting; no vote total copied.; [SABC · 26 Jan 2023](https://www.sabcnews.com/sabcnews/phalatse-upbeat-shell-defeat-motions-of-no-confidence/): read — SABC article is a pre-vote forecast and records PA support loss; it does not establish completed removal. Replaced by post-vote SABC article.; [SABC · 26 Jan 2023 after the vote](https://www.sabcnews.com/sabcnews/joburg-mayor-mpho-phalatse-voted-out-of-office/): read — Completed Phalatse removal. Article gives 140 in favour; its against-count differs from other coverage, so no numeric vote margin copied.

**Code:** src/lib/seats/political-history.ts · joburg-da-pa:walkout

### REL-06-T · Revised

> The office keys find their owners.
> DA and PA finally agree on who does what. Even the parking bays are in writing. Everyone stays in the deal.

**When:** Test a majority containing DA + PA. Johannesburg.

**Context:** Talks to restore PA support for Johannesburg’s DA-led coalition broke down in January 2023. DA mayor Mpho Phalatse subsequently lost a no-confidence vote. Accounts of responsibility were disputed.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Add post-vote reporting rather than relying on forecast coverage; clarify support is withdrawn rather than council seats changing ownership.

**Current backstory — Johannesburg · January 2023:** Talks to restore PA support for Johannesburg’s DA-led coalition broke down in January 2023. DA mayor Mpho Phalatse subsequently lost a no-confidence vote. Accounts of responsibility were disputed.

**Sources:** [Johannesburg council · 26 Jan 2023](https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf) · [ActionSA statement · 26 Jan 2023](https://www.actionsa.org.za/coalition-negotiations-collapse-ahead-of-joburg-motions-of-no-confidence/) · [SABC · 26 Jan 2023, after the vote](https://www.sabcnews.com/sabcnews/joburg-mayor-mpho-phalatse-voted-out-of-office/)

**Source checks:** [ActionSA statement · 26 Jan 2023](https://www.actionsa.org.za/coalition-negotiations-collapse-ahead-of-joburg-motions-of-no-confidence/): read — ActionSA 26 January statement confirms talks failed, current coalition and proposed ActionSA mayoral candidate. Forecast of removal is not used as proof of outcome.; [Johannesburg council · 26 Jan 2023](https://joburg.org.za/about_/government/Documents/Council-Meetings/2023-Signed-Council-Minutes/26-JANUARY-2023-10TH-ORD.pdf): limited-extraction — Official scanned PDF was reachable but readable result could not be established using available extraction. Removal independently checked against post-vote SABC reporting; no vote total copied.; [SABC · 26 Jan 2023](https://www.sabcnews.com/sabcnews/phalatse-upbeat-shell-defeat-motions-of-no-confidence/): read — SABC article is a pre-vote forecast and records PA support loss; it does not establish completed removal. Replaced by post-vote SABC article.; [SABC · 26 Jan 2023 after the vote](https://www.sabcnews.com/sabcnews/joburg-mayor-mpho-phalatse-voted-out-of-office/): read — Completed Phalatse removal. Article gives 140 in favour; its against-count differs from other coverage, so no numeric vote margin copied.

**Code:** src/lib/seats/political-history.ts · joburg-da-pa:truce

### REL-07-X · Kept

> The joint statement has two versions.
> ANC and EFF agree to issue one statement. Both send a final version. {actor} leaves after discovering the other version has already been posted.

**When:** Test a majority containing ANC + EFF. Johannesburg.

**Context:** Johannesburg’s 2022/23 annual reporting lists both the ANC and EFF in the Government of Local Unity formed in January 2023, alongside several smaller parties.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — Johannesburg · January 2023:** Johannesburg’s 2022/23 annual reporting lists both the ANC and EFF in the Government of Local Unity formed in January 2023, alongside several smaller parties.

**Sources:** [Johannesburg annual report · 2022/23](https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf)

**Source checks:** [Johannesburg annual report · 2022/23](https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf): read — Johannesburg annual report pages 35 and 40 lists ANC/EFF/PA and other parties in January 2023 GLU.

**Code:** src/lib/seats/political-history.ts · joburg-anc-eff:walkout

### REL-07-T · Kept

> The microphones are shared.
> ANC and EFF each get five minutes at the joint briefing. Somehow, everyone sticks to it. All your partners stay.

**When:** Test a majority containing ANC + EFF. Johannesburg.

**Context:** Johannesburg’s 2022/23 annual reporting lists both the ANC and EFF in the Government of Local Unity formed in January 2023, alongside several smaller parties.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — Johannesburg · January 2023:** Johannesburg’s 2022/23 annual reporting lists both the ANC and EFF in the Government of Local Unity formed in January 2023, alongside several smaller parties.

**Sources:** [Johannesburg annual report · 2022/23](https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf)

**Source checks:** [Johannesburg annual report · 2022/23](https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf): read — Johannesburg annual report pages 35 and 40 lists ANC/EFF/PA and other parties in January 2023 GLU.

**Code:** src/lib/seats/political-history.ts · joburg-anc-eff:truce

### REL-08-X · Revised

> The seating plan summit.
> ANC and IFP spend the first meeting negotiating the seating plan. {actor} leaves before anyone reaches the actual agenda.

**When:** Test a majority containing ANC + IFP. KwaZulu-Natal.

**Context:** IFP, ANC, DA and NFP formed KwaZulu-Natal’s provincial unity government in June 2024. The legislature elected IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This was provincial cooperation, not a blanket municipal agreement.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Use directly checked legislature minutes and post-formation provincial reporting; the national GNU statement and 12 June talks report do not alone establish the completed four-party provincial arrangement. Make the fictional truce about residents tracking work.

**Current backstory — KwaZulu-Natal · June 2024:** IFP, ANC, DA and NFP formed KwaZulu-Natal’s provincial unity government in June 2024. The legislature elected IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This was provincial cooperation, not a blanket municipal agreement.

**Sources:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf) · [SABC · 18 Jun 2024, provincial government formed](https://www.sabcnews.com/sabcnews/new-kzn-premier-calls-on-executive-to-serve-with-dignity/)

**Source checks:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.; [IFP GNU statement · June 2024](https://ifp.org.za/newsroom/ifp-press-conference-to-provide-an-update-on-the-government-of-national-unity/): read — IFP 28 June statement confirms national GNU talks and ongoing KZN provincial unity government, but does not explicitly list all four provincial parties; replaced with direct completed-formation reporting and minutes.; [SABC · 18 Jun 2024](https://www.sabcnews.com/sabcnews/new-kzn-premier-calls-on-executive-to-serve-with-dignity/): read — Completed provincial government: ANC, IFP, DA, NFP; Ntuli sworn in and called executive to serve residents.

**Code:** src/lib/seats/political-history.ts · kzn-anc-ifp:walkout

### REL-08-T · Revised

> The double act gets to work.
> ANC and IFP agree on the repairs and how residents can track progress. The minutes come with deadlines. Everyone stays in the deal.

**When:** Test a majority containing ANC + IFP. KwaZulu-Natal.

**Context:** IFP, ANC, DA and NFP formed KwaZulu-Natal’s provincial unity government in June 2024. The legislature elected IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This was provincial cooperation, not a blanket municipal agreement.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** The unexpected double act.
ANC and IFP finish the agenda before lunch. Someone checks the minutes twice. Everyone stays in the deal.

**Game effect:** No support lost.

**Review decision:** Use directly checked legislature minutes and post-formation provincial reporting; the national GNU statement and 12 June talks report do not alone establish the completed four-party provincial arrangement. Make the fictional truce about residents tracking work.

**Current backstory — KwaZulu-Natal · June 2024:** IFP, ANC, DA and NFP formed KwaZulu-Natal’s provincial unity government in June 2024. The legislature elected IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This was provincial cooperation, not a blanket municipal agreement.

**Sources:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf) · [SABC · 18 Jun 2024, provincial government formed](https://www.sabcnews.com/sabcnews/new-kzn-premier-calls-on-executive-to-serve-with-dignity/)

**Source checks:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.; [IFP GNU statement · June 2024](https://ifp.org.za/newsroom/ifp-press-conference-to-provide-an-update-on-the-government-of-national-unity/): read — IFP 28 June statement confirms national GNU talks and ongoing KZN provincial unity government, but does not explicitly list all four provincial parties; replaced with direct completed-formation reporting and minutes.; [SABC · 18 Jun 2024](https://www.sabcnews.com/sabcnews/new-kzn-premier-calls-on-executive-to-serve-with-dignity/): read — Completed provincial government: ANC, IFP, DA, NFP; Ntuli sworn in and called executive to serve residents.

**Code:** src/lib/seats/political-history.ts · kzn-anc-ifp:truce

### REL-09-X · Clarified

> Same rivals. Smaller meeting room.
> ANC and DA draft a joint statement. The tracked changes develop tracked changes. {actor} leaves before they agree on the first sentence.

**When:** Test a majority containing ANC + DA. Any municipality (national backstory).

**Context:** The ANC and DA joined the national Government of National Unity in June 2024. National cooperation does not establish an agreement in this municipality.

**Meaning:** Invented scene: national rivals take their arguments into a local meeting and cannot finish one joint statement.

**Previous wording:** GNU, but make it municipal.
ANC and DA draft a joint statement. The tracked changes develop tracked changes. {actor} leaves before they agree on the first sentence.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Replaces the unexplained GNU acronym with the smaller local meeting that the scenario depicts.

**Current backstory — National politics · June 2024:** The ANC and DA joined the national Government of National Unity in June 2024. National cooperation does not establish an agreement in this municipality.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/political-history.ts · anc-da-gnu:walkout

### REL-09-T · Clarified

> Two authors. One agenda.
> ANC and DA agree on the council agenda. Both claim to have written it. Everyone stays, so Madam Speaker lets that one slide.

**When:** Test a majority containing ANC + DA. Any municipality (national backstory).

**Context:** The ANC and DA joined the national Government of National Unity in June 2024. National cooperation does not establish an agreement in this municipality.

**Meaning:** Invented scene: both parties claim authorship of the agreed agenda, but the council can get to work.

**Previous wording:** A GNU day at the office.
ANC and DA agree on the council agenda. Both claim to have written it. Everyone stays, so Madam Speaker lets that one slide.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Makes the title match the authorship joke without relying on the GNU/new-day pun.

**Current backstory — National politics · June 2024:** The ANC and DA joined the national Government of National Unity in June 2024. National cooperation does not establish an agreement in this municipality.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/political-history.ts · anc-da-gnu:truce

### REL-10-X · Kept

> The family group chat.
> ANC and MK promise not to bring up the past. Someone brings up the past. {actor} leaves with its entire delegation.

**When:** Test a majority containing ANC + MK. Any municipality (national backstory).

**Context:** Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party. That history informs the reunion joke, not a prediction of this deal.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — National politics · 2023–2024:** Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party. That history informs the reunion joke, not a prediction of this deal.

**Sources:** [ANC membership statement · 29 Jan 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/)

**Source checks:** [ANC membership statement · 29 Jan 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/): read — ANC statement dated 29 January confirms 16 December support announcement and immediate suspension resolution.

**Code:** src/lib/seats/political-history.ts · anc-mk-family:walkout

### REL-10-T · Kept

> A truce at the family braai.
> ANC and MK agree to discuss the water pipes instead of the family history. Nobody leaves. The minutes record this as progress.

**When:** Test a majority containing ANC + MK. Any municipality (national backstory).

**Context:** Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party. That history informs the reunion joke, not a prediction of this deal.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — National politics · 2023–2024:** Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party. That history informs the reunion joke, not a prediction of this deal.

**Sources:** [ANC membership statement · 29 Jan 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/)

**Source checks:** [ANC membership statement · 29 Jan 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/): read — ANC statement dated 29 January confirms 16 December support announcement and immediate suspension resolution.

**Code:** src/lib/seats/political-history.ts · anc-mk-family:truce

### REL-11-X · Kept

> The logo must be bigger.
> DA and FF+ approve the joint poster. Then someone measures the logos. {actor} leaves the deal over a matter of “equal partnership”.

**When:** Test a majority containing DA + FF+. Any municipality (national backstory).

**Context:** DA and FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. Both were then named as participants in the ANC-inclusive national GNU in June 2024. These national precedents do not confirm a local coalition.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Keep the political contradiction; clarify partners remain in the deal rather than implying seats can depart the council.

**Current backstory — National politics · June 2024:** DA and FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. Both were then named as participants in the ANC-inclusive national GNU in June 2024. These national precedents do not confirm a local coalition.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.

**Code:** src/lib/seats/political-history.ts · da-ff-gnu:walkout

### REL-11-T · Revised

> Two logos, one pothole.
> DA and FF+ agree that fixing the road can happen before agreeing on the poster. All partners stay in your deal.

**When:** Test a majority containing DA + FF+. Any municipality (national backstory).

**Context:** DA and FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. Both were then named as participants in the ANC-inclusive national GNU in June 2024. These national precedents do not confirm a local coalition.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** Two logos, one pothole.
DA and FF+ agree that fixing the road can happen before agreeing on the poster. All seats stay in your deal.

**Game effect:** No support lost.

**Review decision:** Keep the political contradiction; clarify partners remain in the deal rather than implying seats can depart the council.

**Current backstory — National politics · June 2024:** DA and FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. Both were then named as participants in the ANC-inclusive national GNU in June 2024. These national precedents do not confirm a local coalition.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.

**Code:** src/lib/seats/political-history.ts · da-ff-gnu:truce

### REL-12-X · Clarified

> The microphone is not a job title.
> DA and PA hold a joint briefing. Both want the last word. {actor} withdraws its support and leaves the other party with the microphone.

**When:** Test a majority containing DA + PA. Any municipality (national backstory).

**Context:** The DA and PA were both named in the national GNU in June 2024. Parties can cooperate nationally while competing or bargaining differently in individual councils.

**Meaning:** Invented scene: the parties treat control of a shared briefing microphone like a council job to fight over.

**Previous wording:** The microphone is not a portfolio.
DA and PA hold a joint briefing. Both want the last word. {actor} withdraws its support and leaves the other party with the microphone.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Replaces the specialised portfolio term with job title.

**Current backstory — National politics · June 2024:** The DA and PA were both named in the national GNU in June 2024. Parties can cooperate nationally while competing or bargaining differently in individual councils.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/political-history.ts · da-pa-gnu:walkout

### REL-12-T · Kept

> A handshake with footnotes.
> DA and PA put the local deal in writing. Even the press conference has a speaking order. Everyone stays.

**When:** Test a majority containing DA + PA. Any municipality (national backstory).

**Context:** The DA and PA were both named in the national GNU in June 2024. Parties can cooperate nationally while competing or bargaining differently in individual councils.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Keep clearly invented briefing satire; clarify withdrawal of support.

**Current backstory — National politics · June 2024:** The DA and PA were both named in the national GNU in June 2024. Parties can cooperate nationally while competing or bargaining differently in individual councils.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/political-history.ts · da-pa-gnu:truce

### REL-13-X · Kept

> The reunion needs a referee.
> ANC and EFF agree to leave the old Ekurhuleni arguments outside. The arguments get their own visitor passes. {actor} leaves the deal.

**When:** Test a majority containing ANC + EFF. Ekurhuleni.

**Context:** ANC and EFF governed together in Ekurhuleni in 2023–2024. In March 2024, ANC representatives publicly threatened to end the arrangement after a disrupted council sitting. Their explanations were political claims, not an agreed account of blame.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Bring back the relationship humour without the earlier crowd-control suggestion of violence.

**Current backstory — Ekurhuleni · March 2024:** ANC and EFF governed together in Ekurhuleni in 2023–2024. In March 2024, ANC representatives publicly threatened to end the arrangement after a disrupted council sitting. Their explanations were political claims, not an agreed account of blame.

**Sources:** [EWN · 6 Mar 2024](https://www.ewn.co.za/2024/03/06/the-plug-must-be-pulled-doesnt-matter-when-anc-on-ekurhuleni-coalition-pact-with-eff)

**Source checks:** [EWN · 6 Mar 2024](https://www.ewn.co.za/2024/03/06/the-plug-must-be-pulled-doesnt-matter-when-anc-on-ekurhuleni-coalition-pact-with-eff): read — EWN 6 March reports ANC threat to end Ekurhuleni arrangement after disruption; accusations remain attributed.

**Code:** src/lib/seats/political-history.ts · ekurhuleni-anc-eff:walkout

### REL-13-T · Revised

> The agenda reaches the last page.
> ANC and EFF agree on a work plan and a deadline for reporting back to residents. This meeting earns a full stop. Everyone stays.

**When:** Test a majority containing ANC + EFF. Ekurhuleni.

**Context:** ANC and EFF governed together in Ekurhuleni in 2023–2024. In March 2024, ANC representatives publicly threatened to end the arrangement after a disrupted council sitting. Their explanations were political claims, not an agreed account of blame.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** The minutes survive the meeting.
ANC and EFF agree on the agenda and finish it. The minute-taker asks them to repeat that for the record. Everyone stays.

**Game effect:** No support lost.

**Review decision:** Bring back the relationship humour without the earlier crowd-control suggestion of violence.

**Current backstory — Ekurhuleni · March 2024:** ANC and EFF governed together in Ekurhuleni in 2023–2024. In March 2024, ANC representatives publicly threatened to end the arrangement after a disrupted council sitting. Their explanations were political claims, not an agreed account of blame.

**Sources:** [EWN · 6 Mar 2024](https://www.ewn.co.za/2024/03/06/the-plug-must-be-pulled-doesnt-matter-when-anc-on-ekurhuleni-coalition-pact-with-eff)

**Source checks:** [EWN · 6 Mar 2024](https://www.ewn.co.za/2024/03/06/the-plug-must-be-pulled-doesnt-matter-when-anc-on-ekurhuleni-coalition-pact-with-eff): read — EWN 6 March reports ANC threat to end Ekurhuleni arrangement after disruption; accusations remain attributed.

**Code:** src/lib/seats/political-history.ts · ekurhuleni-anc-eff:truce

### REL-14-X · Kept

> The music stops. Who’s mayor?
> ANC and EFF discuss the Bay’s seating plan. Someone moves the mayoral chair while the others are talking. {actor} walks out.

**When:** Test a majority containing ANC + EFF. Nelson Mandela Bay.

**Context:** In May 2023, a coalition including ANC and EFF helped replace DA mayor Retief Odendaal with Gary van Niekerk of the Northern Alliance. Van Niekerk had been council speaker. This is a historical leadership change, not today’s coalition map.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — Nelson Mandela Bay · May 2023:** In May 2023, a coalition including ANC and EFF helped replace DA mayor Retief Odendaal with Gary van Niekerk of the Northern Alliance. Van Niekerk had been council speaker. This is a historical leadership change, not today’s coalition map.

**Sources:** [eNCA · 26 May 2023](https://www.enca.com/news/northern-alliances-gary-van-niekerk-elected-new-nelson-mandela-bay-mayor) · [ACCORD · Bay coalition timeline](https://coalitions.accord.org.za/coalition/nelson-mandela-bay/)

**Source checks:** [eNCA · 26 May 2023](https://www.enca.com/news/northern-alliances-gary-van-niekerk-elected-new-nelson-mandela-bay-mayor): read — eNCA 26 May reports completed Van Niekerk mayoral election, Odendaal removal and ANC/EFF/PA/Northern Alliance coalition.; [ACCORD · Bay coalition timeline](https://coalitions.accord.org.za/coalition/nelson-mandela-bay/): read — ACCORD historical timeline corroborates 26 May 2023 leadership change; its current markers are not used as current-government facts.

**Code:** src/lib/seats/political-history.ts · bay-anc-eff:walkout

### REL-14-T · Kept

> Same mayor after lunch.
> ANC and EFF agree to finish the water-services agenda before discussing the mayoral chain. The chairs stay exactly where they are.

**When:** Test a majority containing ANC + EFF. Nelson Mandela Bay.

**Context:** In May 2023, a coalition including ANC and EFF helped replace DA mayor Retief Odendaal with Gary van Niekerk of the Northern Alliance. Van Niekerk had been council speaker. This is a historical leadership change, not today’s coalition map.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — Nelson Mandela Bay · May 2023:** In May 2023, a coalition including ANC and EFF helped replace DA mayor Retief Odendaal with Gary van Niekerk of the Northern Alliance. Van Niekerk had been council speaker. This is a historical leadership change, not today’s coalition map.

**Sources:** [eNCA · 26 May 2023](https://www.enca.com/news/northern-alliances-gary-van-niekerk-elected-new-nelson-mandela-bay-mayor) · [ACCORD · Bay coalition timeline](https://coalitions.accord.org.za/coalition/nelson-mandela-bay/)

**Source checks:** [eNCA · 26 May 2023](https://www.enca.com/news/northern-alliances-gary-van-niekerk-elected-new-nelson-mandela-bay-mayor): read — eNCA 26 May reports completed Van Niekerk mayoral election, Odendaal removal and ANC/EFF/PA/Northern Alliance coalition.; [ACCORD · Bay coalition timeline](https://coalitions.accord.org.za/coalition/nelson-mandela-bay/): read — ACCORD historical timeline corroborates 26 May 2023 leadership change; its current markers are not used as current-government facts.

**Code:** src/lib/seats/political-history.ts · bay-anc-eff:truce

### REL-15-X · Clarified

> The lagoon is the calm part.
> ANC and PA promise a quiet Knysna meeting. Then the staff appointments item arrives. {actor} leaves before anyone reaches “any other business”.

**When:** Test a majority containing ANC + PA. Knysna.

**Context:** In September 2023, PA councillors resigned from Knysna’s mayoral committee and the party announced its withdrawal from the ANC-led coalition. The PA linked its decision to senior appointments; that was its stated reason.

**Meaning:** Invented scene: the calm meeting breaks down when staff appointments reach the agenda.

**Previous wording:** The lagoon is the calm part.
ANC and PA promise a quiet Knysna meeting. Then the appointments item arrives. {actor} leaves before anyone reaches “any other business”.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Specifies staff appointments so the disputed topic is clear.

**Current backstory — Knysna · September 2023:** In September 2023, PA councillors resigned from Knysna’s mayoral committee and the party announced its withdrawal from the ANC-led coalition. The PA linked its decision to senior appointments; that was its stated reason.

**Sources:** [Knysna-Plett Herald · 7 Sep 2023](https://www.knysnaplettherald.com/News/Article/Politics/colourful-coalition-politics-in-knysna-on-a-knife-edge-due-to-race-202309071039)

**Source checks:** [Knysna-Plett Herald · 7 Sep 2023](https://www.knysnaplettherald.com/News/Article/Politics/colourful-coalition-politics-in-knysna-on-a-knife-edge-due-to-race-202309071039): read — Knysna-Plett Herald 7 September reports PA MMC resignations and coalition withdrawal on 6 September; councillors remained in council; appointments reason is attributed.

**Code:** src/lib/seats/political-history.ts · knysna-anc-pa:walkout

### REL-15-T · Clarified

> An agreement with a view.
> ANC and PA agree on the staff appointments process before debating office views. The meeting ends with all partners still in the room.

**When:** Test a majority containing ANC + PA. Knysna.

**Context:** In September 2023, PA councillors resigned from Knysna’s mayoral committee and the party announced its withdrawal from the ANC-led coalition. The PA linked its decision to senior appointments; that was its stated reason.

**Meaning:** Invented scene: settling the staff appointments process leaves the parties free to argue about office views.

**Previous wording:** An agreement with a view.
ANC and PA agree on the appointments process before debating office views. The meeting ends with all partners still in the room.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Specifies staff appointments so the agreement and office-view joke have a clear sequence.

**Current backstory — Knysna · September 2023:** In September 2023, PA councillors resigned from Knysna’s mayoral committee and the party announced its withdrawal from the ANC-led coalition. The PA linked its decision to senior appointments; that was its stated reason.

**Sources:** [Knysna-Plett Herald · 7 Sep 2023](https://www.knysnaplettherald.com/News/Article/Politics/colourful-coalition-politics-in-knysna-on-a-knife-edge-due-to-race-202309071039)

**Source checks:** [Knysna-Plett Herald · 7 Sep 2023](https://www.knysnaplettherald.com/News/Article/Politics/colourful-coalition-politics-in-knysna-on-a-knife-edge-due-to-race-202309071039): read — Knysna-Plett Herald 7 September reports PA MMC resignations and coalition withdrawal on 6 September; councillors remained in council; appointments reason is attributed.

**Code:** src/lib/seats/political-history.ts · knysna-anc-pa:truce

### REL-16-X · Clarified

> Confidence has left the building.
> ANC and EFF agree the mayor must have everyone’s confidence. Then they name two different people. {actor} leaves the Durban deal.

**When:** Test a majority containing ANC + EFF. eThekwini.

**Context:** EFF councillors voted against a no-confidence motion targeting ANC mayor Mxolisi Kaunda in February 2023. The motion failed. Supporting a mayor in that vote did not by itself establish a formal coalition agreement.

**Meaning:** Invented scene: both parties demand confidence in the mayor, then choose different people for the job.

**Previous wording:** Confidence has left the building.
ANC and EFF agree that confidence is essential. They disagree on who should have it. {actor} leaves the Durban deal.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Turns an abstract disagreement about confidence into a concrete fictional disagreement over the mayor.

**Current backstory — eThekwini · 3 February 2023:** EFF councillors voted against a no-confidence motion targeting ANC mayor Mxolisi Kaunda in February 2023. The motion failed. Supporting a mayor in that vote did not by itself establish a formal coalition agreement.

**Sources:** [TimesLIVE · 3 Feb 2023](https://www.timeslive.co.za/politics/2023-02-03-motion-of-no-confidence-against-ethekwini-mayor-mxolisi-kaunda-fails/)

**Source checks:** [TimesLIVE · 3 Feb 2023](https://www.timeslive.co.za/politics/2023-02-03-motion-of-no-confidence-against-ethekwini-mayor-mxolisi-kaunda-fails/): read — TimesLIVE 3 February reports no-confidence motion failed with EFF among votes against it.

**Code:** src/lib/seats/political-history.ts · ethekwini-anc-eff:walkout

### REL-16-T · Revised

> A point of agreement.
> ANC and EFF turn a point of order into a point of agreement: publish the repair schedule. Everyone stays for the actual agenda.

**When:** Test a majority containing ANC + EFF. eThekwini.

**Context:** EFF councillors voted against a no-confidence motion targeting ANC mayor Mxolisi Kaunda in February 2023. The motion failed. Supporting a mayor in that vote did not by itself establish a formal coalition agreement.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** A point of agreement.
ANC and EFF come prepared for a point of order. They accidentally find a point of agreement. Everyone stays for the actual agenda.

**Game effect:** No support lost.

**Review decision:** Restore political inconsistency satire around the verified confidence vote. Favour is a voting metaphor, not an allegation of a payment or private deal.

**Current backstory — eThekwini · 3 February 2023:** EFF councillors voted against a no-confidence motion targeting ANC mayor Mxolisi Kaunda in February 2023. The motion failed. Supporting a mayor in that vote did not by itself establish a formal coalition agreement.

**Sources:** [TimesLIVE · 3 Feb 2023](https://www.timeslive.co.za/politics/2023-02-03-motion-of-no-confidence-against-ethekwini-mayor-mxolisi-kaunda-fails/)

**Source checks:** [TimesLIVE · 3 Feb 2023](https://www.timeslive.co.za/politics/2023-02-03-motion-of-no-confidence-against-ethekwini-mayor-mxolisi-kaunda-fails/): read — TimesLIVE 3 February reports no-confidence motion failed with EFF among votes against it.

**Code:** src/lib/seats/political-history.ts · ethekwini-anc-eff:truce

### REL-17-X · Kept

> Please see the original agreement.
> DA and ActionSA bring different versions of the old pact to the meeting. Both files are called FINAL. {actor} leaves before FINAL_v3 appears.

**When:** Test a majority containing DA + ActionSA. Any municipality (national backstory).

**Context:** DA and ActionSA were among the signatories to the Multi-Party Charter in August 2023, ahead of the 2024 national and provincial elections. This was a national pact, not evidence of a deal in this council.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — National politics · August 2023:** DA and ActionSA were among the signatories to the Multi-Party Charter in August 2023, ahead of the 2024 national and provincial elections. This was a national pact, not evidence of a deal in this council.

**Sources:** [Multi-Party Charter · Aug 2023](https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/)

**Source checks:** [Multi-Party Charter · Aug 2023](https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/): read — Signed Multi-Party Charter page dated 18 August lists signatories and explicitly sets ANC/EFF exclusions in the 2024 national/provincial election context.

**Code:** src/lib/seats/political-history.ts · da-actionsa-charter:walkout

### REL-17-T · Kept

> One document. Two signatures.
> DA and ActionSA agree on a local plan. They even sign the same version. The printer gets a standing ovation.

**When:** Test a majority containing DA + ActionSA. Any municipality (national backstory).

**Context:** DA and ActionSA were among the signatories to the Multi-Party Charter in August 2023, ahead of the 2024 national and provincial elections. This was a national pact, not evidence of a deal in this council.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — National politics · August 2023:** DA and ActionSA were among the signatories to the Multi-Party Charter in August 2023, ahead of the 2024 national and provincial elections. This was a national pact, not evidence of a deal in this council.

**Sources:** [Multi-Party Charter · Aug 2023](https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/)

**Source checks:** [Multi-Party Charter · Aug 2023](https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/): read — Signed Multi-Party Charter page dated 18 August lists signatories and explicitly sets ANC/EFF exclusions in the 2024 national/provincial election context.

**Code:** src/lib/seats/political-history.ts · da-actionsa-charter:truce

### REL-18-X · Clarified

> The small print gets bigger.
> DA and IFP agree on the big picture. Who gets which council job needs another page. {actor} leaves while it is still being drafted.

**When:** Test a majority containing DA + IFP. Any municipality (national backstory).

**Context:** DA and IFP signed the August 2023 Multi-Party Charter and both joined the national GNU in June 2024. Those national arrangements do not establish a municipal coalition.

**Meaning:** Invented scene: agreement on broad aims unravels over which party gets which council job, making the paperwork grow.

**Previous wording:** The pact needs an annexure.
DA and IFP agree on the big picture. The local seating plan requires another annexure. {actor} leaves while it is still being drafted.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Replaces annexure and an abstract seating plan with the actual fictional allocation of council jobs.

**Current backstory — National politics · 2023–2024:** DA and IFP signed the August 2023 Multi-Party Charter and both joined the national GNU in June 2024. Those national arrangements do not establish a municipal coalition.

**Sources:** [Multi-Party Charter · Aug 2023](https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Multi-Party Charter · Aug 2023](https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/): read — Signed Multi-Party Charter page dated 18 August lists signatories and explicitly sets ANC/EFF exclusions in the 2024 national/provincial election context.

**Code:** src/lib/seats/political-history.ts · da-ifp-charter:walkout

### REL-18-T · Clarified

> The fine print fits on one page.
> DA and IFP approve a local agreement shorter than the meeting agenda. Everyone signs. Nobody requests a subcommittee.

**When:** Test a majority containing DA + IFP. Any municipality (national backstory).

**Context:** DA and IFP signed the August 2023 Multi-Party Charter and both joined the national GNU in June 2024. Those national arrangements do not establish a municipal coalition.

**Meaning:** Invented scene: the partners finally produce an agreement shorter than the meeting agenda and resist creating another committee.

**Previous wording:** The annexure is only one page.
DA and IFP approve a local agreement shorter than the meeting agenda. Everyone signs. Nobody requests a subcommittee.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Replaces annexure with the familiar fine-print metaphor.

**Current backstory — National politics · 2023–2024:** DA and IFP signed the August 2023 Multi-Party Charter and both joined the national GNU in June 2024. Those national arrangements do not establish a municipal coalition.

**Sources:** [Multi-Party Charter · Aug 2023](https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Multi-Party Charter · Aug 2023](https://www.actionsa.org.za/a-multi-party-charter-for-south-africa/): read — Signed Multi-Party Charter page dated 18 August lists signatories and explicitly sets ANC/EFF exclusions in the 2024 national/provincial election context.

**Code:** src/lib/seats/political-history.ts · da-ifp-charter:truce

### REL-19-X · Clarified

> The handshake needs a schedule.
> ANC and PA agree to share the stage at their coalition launch. Then they compare speaking times. {actor} leaves before the microphones are switched on.

**When:** Test a majority containing ANC + PA. Any municipality (national backstory).

**Context:** ANC and PA were named as participants in the national GNU in June 2024. This national history does not confirm a coalition in this municipality.

**Meaning:** Invented scene: sharing a coalition-launch stage breaks down over speaking time before the microphones are switched on.

**Previous wording:** The handshake needs a schedule.
ANC and PA agree to share the stage. Then they compare speaking times. {actor} leaves before the ribbon has been found.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Establishes the event and uses its microphones for the ending instead of introducing an unexplained ribbon.

**Current backstory — National politics · June 2024:** ANC and PA were named as participants in the national GNU in June 2024. This national history does not confirm a coalition in this municipality.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/political-history.ts · anc-pa-gnu:walkout

### REL-19-T · Kept

> The deal makes it past the photo.
> ANC and PA agree on who does what after the handshake. Everyone stays for the less glamorous part: the work plan.

**When:** Test a majority containing ANC + PA. Any municipality (national backstory).

**Context:** ANC and PA were named as participants in the national GNU in June 2024. This national history does not confirm a coalition in this municipality.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — National politics · June 2024:** ANC and PA were named as participants in the national GNU in June 2024. This national history does not confirm a coalition in this municipality.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/political-history.ts · anc-pa-gnu:truce

### REL-20-X · Kept

> That was not one of the issues.
> ANC and ActionSA agree to take things issue by issue. Item two turns out to be whether item one counted. {actor} leaves the deal.

**When:** Test a majority containing ANC + ActionSA. Johannesburg.

**Context:** ANC and ActionSA agreed to cooperate issue by issue in Johannesburg in August 2024. ActionSA’s Nobuhle Mthembu was elected speaker on 21 August. Issue-by-issue support was distinct from an unrestricted coalition commitment.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — Johannesburg · August 2024:** ANC and ActionSA agreed to cooperate issue by issue in Johannesburg in August 2024. ActionSA’s Nobuhle Mthembu was elected speaker on 21 August. Issue-by-issue support was distinct from an unrestricted coalition commitment.

**Sources:** [EWN · 20 Aug 2024](https://www.ewn.co.za/2024/08/20/actionsas-nobuhle-mthembu-competent-candidate-for-joburg-council-speaker-says-partys-ngobeni) · [ActionSA statement · 28 Aug 2024](https://www.actionsa.org.za/gauteng-in-action-28-august-2024/)

**Source checks:** [EWN · 20 Aug 2024](https://www.ewn.co.za/2024/08/20/actionsas-nobuhle-mthembu-competent-candidate-for-joburg-council-speaker-says-partys-ngobeni): checked — EWN, 20 August 2024: issue-by-issue cooperation and planned speaker election; the next source verifies the completed election.; [ActionSA statement · 28 Aug 2024](https://www.actionsa.org.za/gauteng-in-action-28-august-2024/): checked — ActionSA, 28 August 2024: Nobuhle Mthembu elected speaker on 21 August 2024.

**Code:** src/lib/seats/local-history.ts · joburg-anc-actionsa:walkout

### REL-20-T · Kept

> It works for this agenda item.
> ANC and ActionSA agree on the water-repair plan. Nobody updates their relationship status. Everyone stays for the vote.

**When:** Test a majority containing ANC + ActionSA. Johannesburg.

**Context:** ANC and ActionSA agreed to cooperate issue by issue in Johannesburg in August 2024. ActionSA’s Nobuhle Mthembu was elected speaker on 21 August. Issue-by-issue support was distinct from an unrestricted coalition commitment.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — Johannesburg · August 2024:** ANC and ActionSA agreed to cooperate issue by issue in Johannesburg in August 2024. ActionSA’s Nobuhle Mthembu was elected speaker on 21 August. Issue-by-issue support was distinct from an unrestricted coalition commitment.

**Sources:** [EWN · 20 Aug 2024](https://www.ewn.co.za/2024/08/20/actionsas-nobuhle-mthembu-competent-candidate-for-joburg-council-speaker-says-partys-ngobeni) · [ActionSA statement · 28 Aug 2024](https://www.actionsa.org.za/gauteng-in-action-28-august-2024/)

**Source checks:** [EWN · 20 Aug 2024](https://www.ewn.co.za/2024/08/20/actionsas-nobuhle-mthembu-competent-candidate-for-joburg-council-speaker-says-partys-ngobeni): checked — EWN, 20 August 2024: issue-by-issue cooperation and planned speaker election; the next source verifies the completed election.; [ActionSA statement · 28 Aug 2024](https://www.actionsa.org.za/gauteng-in-action-28-august-2024/): checked — ActionSA, 28 August 2024: Nobuhle Mthembu elected speaker on 21 August 2024.

**Code:** src/lib/seats/local-history.ts · joburg-anc-actionsa:truce

### REL-21-X · Kept

> Who is steering this thing?
> ANC and Al Jama-ah both bring a steering wheel to the mayoral office. There is only one chair. {actor} leaves before the driving lesson.

**When:** Test a majority containing ANC + Al Jama-ah. Johannesburg.

**Context:** Al Jama-ah’s Thapelo Amad became Johannesburg mayor in January 2023 under the Government of Local Unity, which included the ANC and EFF. The city’s annual report records his resignation in April 2023.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Remove unsupported implication that the historical mayor lacked any work plan; keep small-party bargaining satire.

**Current backstory — Johannesburg · January–April 2023:** Al Jama-ah’s Thapelo Amad became Johannesburg mayor in January 2023 under the Government of Local Unity, which included the ANC and EFF. The city’s annual report records his resignation in April 2023.

**Sources:** [Johannesburg citizens’ annual report · 2022/23](https://joburg.org.za/documents_/Documents/Annual-and-Citizens-Report/ITEM01ANNEXUREC_CoJ_IAR_Citizens%20Report_Council.pdf)

**Source checks:** [Johannesburg citizens’ annual report · 2022/23](https://joburg.org.za/documents_/Documents/Annual-and-Citizens-Report/ITEM01ANNEXUREC_CoJ_IAR_Citizens%20Report_Council.pdf): checked — Johannesburg citizens annual report 2022/23, printed page 14: GLU included ANC, EFF and Al Jama-ah; Amad held office January–April and resigned in April.

**Code:** src/lib/seats/local-history.ts · joburg-anc-aljama:walkout

### REL-21-T · Revised

> The chain comes with a manual.
> ANC and Al Jama-ah agree who leads and who supports. The mayoral chain comes with an agreed work plan. Everyone stays.

**When:** Test a majority containing ANC + Al Jama-ah. Johannesburg.

**Context:** Al Jama-ah’s Thapelo Amad became Johannesburg mayor in January 2023 under the Government of Local Unity, which included the ANC and EFF. The city’s annual report records his resignation in April 2023.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** The chain comes with a manual.
ANC and Al Jama-ah agree who leads and who supports. The mayoral chain comes with a work plan this time. Everyone stays.

**Game effect:** No support lost.

**Review decision:** Remove unsupported implication that the historical mayor lacked any work plan; keep small-party bargaining satire.

**Current backstory — Johannesburg · January–April 2023:** Al Jama-ah’s Thapelo Amad became Johannesburg mayor in January 2023 under the Government of Local Unity, which included the ANC and EFF. The city’s annual report records his resignation in April 2023.

**Sources:** [Johannesburg citizens’ annual report · 2022/23](https://joburg.org.za/documents_/Documents/Annual-and-Citizens-Report/ITEM01ANNEXUREC_CoJ_IAR_Citizens%20Report_Council.pdf)

**Source checks:** [Johannesburg citizens’ annual report · 2022/23](https://joburg.org.za/documents_/Documents/Annual-and-Citizens-Report/ITEM01ANNEXUREC_CoJ_IAR_Citizens%20Report_Council.pdf): checked — Johannesburg citizens annual report 2022/23, printed page 14: GLU included ANC, EFF and Al Jama-ah; Amad held office January–April and resigned in April.

**Code:** src/lib/seats/local-history.ts · joburg-anc-aljama:truce

### REL-22-X · Clarified

> The office is bigger than the caucus.
> ANC and COPE plan a small-party mayor. The office fits all its councillors. The egos need a second room. {actor} reopens the deal by leaving it.

**When:** Test a majority containing ANC + COPE. Tshwane.

**Context:** Tshwane elected COPE’s Murunwa Makwarela mayor on 28 February 2023. ATM nominated him, with ANC and EFF support. This records that election, not an enduring agreement between all those parties.

**Meaning:** Invented scene: the fictional negotiation gives a small party a large office and an even larger argument.

**Previous wording:** The office is bigger than the caucus.
ANC and COPE finish the seating plan. Then they notice the mayoral office is bigger than the negotiation room. {actor} reopens the deal by leaving it.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Connects the room-size joke to the small-party mayor instead of comparing unrelated rooms.

**Current backstory — Tshwane · 28 February 2023:** Tshwane elected COPE’s Murunwa Makwarela mayor on 28 February 2023. ATM nominated him, with ANC and EFF support. This records that election, not an enduring agreement between all those parties.

**Sources:** [SABC · 28 Feb 2023](https://www.sabcnews.com/sabcnews/dr-makwarela-elected-new-tshwane-mayor/)

**Source checks:** [SABC · 28 Feb 2023](https://www.sabcnews.com/sabcnews/dr-makwarela-elected-new-tshwane-mayor/): checked — SABC, 28 February 2023: COPE nominee Makwarela, nominated by ATM with ANC/EFF backing, elected 112–101.

**Code:** src/lib/seats/local-history.ts · tshwane-anc-cope:walkout

### REL-22-T · Revised

> One chair, agreed occupant.
> ANC and COPE decide who wears the chain before ordering the nameplate. One less correction for the engraver. Everyone stays.

**When:** Test a majority containing ANC + COPE. Tshwane.

**Context:** Tshwane elected COPE’s Murunwa Makwarela mayor on 28 February 2023. ATM nominated him, with ANC and EFF support. This records that election, not an enduring agreement between all those parties.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** One chair, agreed occupant.
ANC and COPE decide who wears the chain before ordering the nameplate. The engraver is stunned. All your seats stay.

**Game effect:** No support lost.

**Review decision:** Keep the one-seat mayor lesson; remove the gratuitous suggestion that an orderly nomination would stun the engraver.

**Current backstory — Tshwane · 28 February 2023:** Tshwane elected COPE’s Murunwa Makwarela mayor on 28 February 2023. ATM nominated him, with ANC and EFF support. This records that election, not an enduring agreement between all those parties.

**Sources:** [SABC · 28 Feb 2023](https://www.sabcnews.com/sabcnews/dr-makwarela-elected-new-tshwane-mayor/)

**Source checks:** [SABC · 28 Feb 2023](https://www.sabcnews.com/sabcnews/dr-makwarela-elected-new-tshwane-mayor/): checked — SABC, 28 February 2023: COPE nominee Makwarela, nominated by ATM with ANC/EFF backing, elected 112–101.

**Code:** src/lib/seats/local-history.ts · tshwane-anc-cope:truce

### REL-23-X · Clarified

> Compromise candidate, uncompromising partners.
> ANC and EFF agree neither should take the mayor’s job. Both insist on choosing who does. {actor} leaves with the shortlist.

**When:** Test a majority containing ANC + EFF. Tshwane.

**Context:** ANC and EFF supported COPE’s Murunwa Makwarela in Tshwane’s February 2023 mayoral election. He defeated the DA’s Cilliers Brink by 112 votes to 101. Voting together did not itself establish a permanent coalition.

**Meaning:** Invented scene: partners fight over choosing a mayor from outside their own parties.

**Previous wording:** Compromise candidate, uncompromising partners.
ANC and EFF agree neither should take the top job. Both insist on choosing who does. {actor} leaves with the shortlist.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Makes “the top job” explicit.

**Current backstory — Tshwane · 28 February 2023:** ANC and EFF supported COPE’s Murunwa Makwarela in Tshwane’s February 2023 mayoral election. He defeated the DA’s Cilliers Brink by 112 votes to 101. Voting together did not itself establish a permanent coalition.

**Sources:** [SABC · 28 Feb 2023](https://www.sabcnews.com/sabcnews/dr-makwarela-elected-new-tshwane-mayor/) · [The Citizen · 28 Feb 2023](https://www.citizen.co.za/news/tshwane-mayor-elected-february-2023/)

**Source checks:** [SABC · 28 Feb 2023](https://www.sabcnews.com/sabcnews/dr-makwarela-elected-new-tshwane-mayor/): checked — SABC, 28 February 2023: COPE nominee Makwarela, nominated by ATM with ANC/EFF backing, elected 112–101.; [The Citizen · 28 Feb 2023](https://www.citizen.co.za/news/tshwane-mayor-elected-february-2023/): checked — Citizen, 28 February 2023: 112–101 election result by secret ballot. Does not independently establish individual councillor votes.

**Code:** src/lib/seats/local-history.ts · tshwane-anc-eff:walkout

### REL-23-T · Clarified

> One nomination. Finally.
> ANC and EFF settle the mayoral nomination before the Speaker finishes calling the meeting to order. All your partners stay. The microphones look underemployed.

**When:** Test a majority containing ANC + EFF. Tshwane.

**Context:** ANC and EFF supported COPE’s Murunwa Makwarela in Tshwane’s February 2023 mayoral election. He defeated the DA’s Cilliers Brink by 112 votes to 101. Voting together did not itself establish a permanent coalition.

**Meaning:** Invented scene: the nomination is agreed early enough to spare the usual speeches.

**Previous wording:** One nomination. Finally.
ANC and EFF settle the nomination before the Speaker finishes calling the meeting to order. All your partners stay. The microphones look underemployed.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Identifies what is being nominated.

**Current backstory — Tshwane · 28 February 2023:** ANC and EFF supported COPE’s Murunwa Makwarela in Tshwane’s February 2023 mayoral election. He defeated the DA’s Cilliers Brink by 112 votes to 101. Voting together did not itself establish a permanent coalition.

**Sources:** [SABC · 28 Feb 2023](https://www.sabcnews.com/sabcnews/dr-makwarela-elected-new-tshwane-mayor/) · [The Citizen · 28 Feb 2023](https://www.citizen.co.za/news/tshwane-mayor-elected-february-2023/)

**Source checks:** [SABC · 28 Feb 2023](https://www.sabcnews.com/sabcnews/dr-makwarela-elected-new-tshwane-mayor/): checked — SABC, 28 February 2023: COPE nominee Makwarela, nominated by ATM with ANC/EFF backing, elected 112–101.; [The Citizen · 28 Feb 2023](https://www.citizen.co.za/news/tshwane-mayor-elected-february-2023/): checked — Citizen, 28 February 2023: 112–101 election result by secret ballot. Does not independently establish individual councillor votes.

**Code:** src/lib/seats/local-history.ts · tshwane-anc-eff:truce

### REL-24-X · Clarified

> Return ticket. Terms apply.
> DA and EFF agree to put a mayor back in office, then disagree whether the support lasts beyond the welcome-back speech. {actor} leaves. The chair is still warm.

**When:** Test a majority containing DA + EFF. Ekurhuleni.

**Context:** After ANC–EFF talks failed, Tania Campbell was re-elected Ekurhuleni mayor on 8 November 2022. Daily Maverick attributed her 124–99 victory to EFF backing alongside the DA’s existing partners; EFF Gauteng chair Nkululeko Dunga denied voting with the DA. The result did not establish a formal DA–EFF coalition.

**Meaning:** Fictional support for a comeback expires immediately.

**Previous wording:** Return ticket. Terms apply.
DA and EFF agree on a mayor, then disagree whether support included the return journey. {actor} leaves. The chair is still warm.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Replaces an unexplained “return journey” with a clear mayoral comeback and short-lived support.

**Current backstory — Ekurhuleni · 8 November 2022:** After ANC–EFF talks failed, Tania Campbell was re-elected Ekurhuleni mayor on 8 November 2022. Daily Maverick attributed her 124–99 victory to EFF backing alongside the DA’s existing partners; EFF Gauteng chair Nkululeko Dunga denied voting with the DA. The result did not establish a formal DA–EFF coalition.

**Sources:** [Daily Maverick · 8 Nov 2022](https://www.dailymaverick.co.za/article/2022-11-08-how-the-anc-eff-partnership-failed-in-ekurhuleni-and-led-to-the-re-election-of-mayor-tania-campbell/)

**Source checks:** [Daily Maverick · 8 Nov 2022](https://www.dailymaverick.co.za/article/2022-11-08-how-the-anc-eff-partnership-failed-in-ekurhuleni-and-led-to-the-re-election-of-mayor-tania-campbell/): checked — Daily Maverick, 8 November 2022: attributes Campbell’s 124–99 return to EFF backing after failed ANC–EFF talks; also records Dunga’s denial. Revised fact preserves that caveat.

**Code:** src/lib/seats/local-history.ts · ekurhuleni-da-eff:walkout

### REL-24-T · Revised

> Back by unexpected demand.
> DA and EFF agree to keep the deal going for today’s work. Nobody calls it a friendship. Everyone stays anyway.

**When:** Test a majority containing DA + EFF. Ekurhuleni.

**Context:** After ANC–EFF talks failed, Tania Campbell was re-elected Ekurhuleni mayor on 8 November 2022. Daily Maverick attributed her 124–99 victory to EFF backing alongside the DA’s existing partners; EFF Gauteng chair Nkululeko Dunga denied voting with the DA. The result did not establish a formal DA–EFF coalition.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Make the disputed voting attribution explicit and replace Don’t ask with a joke inviting curiosity about an awkward result.

**Current backstory — Ekurhuleni · 8 November 2022:** After ANC–EFF talks failed, Tania Campbell was re-elected Ekurhuleni mayor on 8 November 2022. Daily Maverick attributed her 124–99 victory to EFF backing alongside the DA’s existing partners; EFF Gauteng chair Nkululeko Dunga denied voting with the DA. The result did not establish a formal DA–EFF coalition.

**Sources:** [Daily Maverick · 8 Nov 2022](https://www.dailymaverick.co.za/article/2022-11-08-how-the-anc-eff-partnership-failed-in-ekurhuleni-and-led-to-the-re-election-of-mayor-tania-campbell/)

**Source checks:** [Daily Maverick · 8 Nov 2022](https://www.dailymaverick.co.za/article/2022-11-08-how-the-anc-eff-partnership-failed-in-ekurhuleni-and-led-to-the-re-election-of-mayor-tania-campbell/): checked — Daily Maverick, 8 November 2022: attributes Campbell’s 124–99 return to EFF backing after failed ANC–EFF talks; also records Dunga’s denial. Revised fact preserves that caveat.

**Code:** src/lib/seats/local-history.ts · ekurhuleni-da-eff:truce

### REL-25-X · Kept

> The deputy has notes.
> ANC and ABC agree on the mayoral team. The deputy’s job description arrives with track changes and an exit clause. {actor} uses the exit.

**When:** Test a majority containing ANC + ABC. eThekwini.

**Context:** ABC leader Philani Mavundla lost his eThekwini executive-committee position and deputy mayoralty in December 2022. The ANC brought the removal motion; the council minutes record ANC and EFF votes in favour.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — eThekwini · 13 December 2022:** ABC leader Philani Mavundla lost his eThekwini executive-committee position and deputy mayoralty in December 2022. The ANC brought the removal motion; the council minutes record ANC and EFF votes in favour.

**Sources:** [eThekwini council minutes · 13 Dec 2022](https://dag.durban.gov.za/uploads/0000/6/2025/08/10/minutes-council-2022-12-13.pdf) · [SABC · 13 Dec 2022](https://www.sabcnews.com/sabcnews/ethekwini-deputy-mayor-philani-mavundla-ousted/)

**Source checks:** [eThekwini council minutes · 13 Dec 2022](https://dag.durban.gov.za/uploads/0000/6/2025/08/10/minutes-council-2022-12-13.pdf): checked — eThekwini minutes, 13 December 2022, urgent notice of motion: Young proposed, Mngonyama seconded; 125 supported removal including ANC 90 and EFF 23. Read original extracted text, not the erroneous automated query assessment.; [SABC · 13 Dec 2022](https://www.sabcnews.com/sabcnews/ethekwini-deputy-mayor-philani-mavundla-ousted/): checked — SABC, 13 December 2022: reports ANC removal motion with EFF and smaller-party support.

**Code:** src/lib/seats/local-history.ts · ethekwini-anc-abc:walkout

### REL-25-T · Kept

> Deputy, not temporary.
> ANC and ABC settle the deputy’s role before the first meeting. The nameplate can finally be screwed in. Nobody leaves.

**When:** Test a majority containing ANC + ABC. eThekwini.

**Context:** ABC leader Philani Mavundla lost his eThekwini executive-committee position and deputy mayoralty in December 2022. The ANC brought the removal motion; the council minutes record ANC and EFF votes in favour.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — eThekwini · 13 December 2022:** ABC leader Philani Mavundla lost his eThekwini executive-committee position and deputy mayoralty in December 2022. The ANC brought the removal motion; the council minutes record ANC and EFF votes in favour.

**Sources:** [eThekwini council minutes · 13 Dec 2022](https://dag.durban.gov.za/uploads/0000/6/2025/08/10/minutes-council-2022-12-13.pdf) · [SABC · 13 Dec 2022](https://www.sabcnews.com/sabcnews/ethekwini-deputy-mayor-philani-mavundla-ousted/)

**Source checks:** [eThekwini council minutes · 13 Dec 2022](https://dag.durban.gov.za/uploads/0000/6/2025/08/10/minutes-council-2022-12-13.pdf): checked — eThekwini minutes, 13 December 2022, urgent notice of motion: Young proposed, Mngonyama seconded; 125 supported removal including ANC 90 and EFF 23. Read original extracted text, not the erroneous automated query assessment.; [SABC · 13 Dec 2022](https://www.sabcnews.com/sabcnews/ethekwini-deputy-mayor-philani-mavundla-ousted/): checked — SABC, 13 December 2022: reports ANC removal motion with EFF and smaller-party support.

**Code:** src/lib/seats/local-history.ts · ethekwini-anc-abc:truce

### REL-26-X · Restored

> Two posters. One promise.
> DA and IFP promise not to step on each other’s toes. Both book the same campaign lamppost. {actor} leaves over the fine print.

**When:** Test a majority containing DA + IFP. eThekwini.

**Context:** The DA did not contest eThekwini’s ward 99 by-election on 14 December 2022, and the IFP won the ward from the ANC. In its announcement the next day, the IFP acknowledged the DA’s decision as cooperation between the parties. This ward-level arrangement was not a citywide governing coalition.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Restore a distinct Durban ward episode and DA–IFP pairing. The electoral-cooperation lesson is useful even with another example in Newcastle. Use the verified IFP primary statement to remove ambiguity over which party stood aside; keep the lamppost/loudspeaker exaggeration.

**Current backstory — eThekwini · December 2022:** The DA did not contest eThekwini’s ward 99 by-election on 14 December 2022, and the IFP won the ward from the ANC. In its announcement the next day, the IFP acknowledged the DA’s decision as cooperation between the parties. This ward-level arrangement was not a citywide governing coalition.

**Sources:** [IFP statement · 15 Dec 2022](https://ifp.org.za/newsroom/ifp-wins-the-historic-ethekwini-ward-99/)

**Source checks:** [IOL / The Star retrospective · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/): checked — IOL/The Star, 8 February 2023: joint press conference confirms IFP standing aside in Newcastle ward 31 for TSSA; alleged threats are disputed. Its eThekwini paragraph is ambiguously worded; IFP’s December statement independently confirms DA stood aside there.; [IFP statement · 15 Dec 2022](https://ifp.org.za/newsroom/ifp-wins-the-historic-ethekwini-ward-99/): checked in first source audit — Supporting source verified in the earlier local-history review; restored copy keeps the narrow documented claim.

**Code:** src/lib/seats/local-history.ts · ethekwini-da-ifp:walkout

### REL-26-T · Clarified

> After you.
> DA and IFP agree which party will stand in this ward. One campaign loudspeaker switches off voluntarily. All your councillors stay.

**When:** Test a majority containing DA + IFP. eThekwini.

**Context:** The DA did not contest eThekwini’s ward 99 by-election on 14 December 2022, and the IFP won the ward from the ANC. In its announcement the next day, the IFP acknowledged the DA’s decision as cooperation between the parties. This ward-level arrangement was not a citywide governing coalition.

**Meaning:** Invented scene: cooperation means one campaign voluntarily standing aside.

**Previous wording:** After you.
DA and IFP agree who gets this turn. One campaign loudspeaker switches off voluntarily. All your councillors stay.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Explains what “this turn” meant and why a loudspeaker goes quiet. Restored humour retained.

**Current backstory — eThekwini · December 2022:** The DA did not contest eThekwini’s ward 99 by-election on 14 December 2022, and the IFP won the ward from the ANC. In its announcement the next day, the IFP acknowledged the DA’s decision as cooperation between the parties. This ward-level arrangement was not a citywide governing coalition.

**Sources:** [IFP statement · 15 Dec 2022](https://ifp.org.za/newsroom/ifp-wins-the-historic-ethekwini-ward-99/)

**Source checks:** [IOL / The Star retrospective · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/): checked — IOL/The Star, 8 February 2023: joint press conference confirms IFP standing aside in Newcastle ward 31 for TSSA; alleged threats are disputed. Its eThekwini paragraph is ambiguously worded; IFP’s December statement independently confirms DA stood aside there.; [IFP statement · 15 Dec 2022](https://ifp.org.za/newsroom/ifp-wins-the-historic-ethekwini-ward-99/): checked in first source audit — Supporting source verified in the earlier local-history review; restored copy keeps the narrow documented claim.

**Code:** src/lib/seats/local-history.ts · ethekwini-da-ifp:truce

### REL-27-X · Clarified

> Seven parties, one diary.
> DA and ACDP revisit their old seven-party Cape Town coalition. The meeting invitation needs seven approvals. {actor} leaves before a date is found.

**When:** Test a majority containing DA + ACDP. Cape Town.

**Context:** In 2006, the DA assembled a seven-party Cape Town coalition including the ACDP, FF+ and UDM. Helen Zille became mayor and ACDP councillor Andrew Arnolds became deputy mayor.

**Meaning:** Invented scene: a large coalition makes even arranging a meeting difficult.

**Previous wording:** Seven parties, one diary.
DA and ACDP revisit Cape Town’s coalition prequel. The meeting invitation needs seven approvals. {actor} leaves before a date is found.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Puts the seven-party setup in the story itself.

**Current backstory — Cape Town · March 2006:** In 2006, the DA assembled a seven-party Cape Town coalition including the ACDP, FF+ and UDM. Helen Zille became mayor and ACDP councillor Andrew Arnolds became deputy mayor.

**Sources:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf)

**Source checks:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf): checked — ACCORD/Jolobe chapter, printed page 100: DA plus six named partners in 2006; Zille mayor 106–103, Arnolds deputy and Smit speaker. Automated query falsely counted eight; checked original text.

**Code:** src/lib/seats/local-history.ts · cape-town-da-acdp:walkout

### REL-27-T · Clarified

> The prequel gets a happy ending.
> DA and ACDP remember the seven-party deal and all the calls it took. They answer on the first ring this time. Everyone stays.

**When:** Test a majority containing DA + ACDP. Cape Town.

**Context:** In 2006, the DA assembled a seven-party Cape Town coalition including the ACDP, FF+ and UDM. Helen Zille became mayor and ACDP councillor Andrew Arnolds became deputy mayor.

**Meaning:** Invented scene: experience with many partners makes cooperation quicker this time.

**Previous wording:** The prequel gets a happy ending.
DA and ACDP remember how many calls the old deal took. They answer on the first ring this time. Everyone stays.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Explains why the old deal involved so many calls.

**Current backstory — Cape Town · March 2006:** In 2006, the DA assembled a seven-party Cape Town coalition including the ACDP, FF+ and UDM. Helen Zille became mayor and ACDP councillor Andrew Arnolds became deputy mayor.

**Sources:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf)

**Source checks:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf): checked — ACCORD/Jolobe chapter, printed page 100: DA plus six named partners in 2006; Zille mayor 106–103, Arnolds deputy and Smit speaker. Automated query falsely counted eight; checked original text.

**Code:** src/lib/seats/local-history.ts · cape-town-da-acdp:truce

### REL-28-X · Kept

> The prequel has a director’s cut.
> DA and FF+ retell the 2006 coalition story. Each has a different main character. {actor} walks out before the credits.

**When:** Test a majority containing DA + FF+. Cape Town.

**Context:** The FF+ joined Cape Town’s DA-led seven-party coalition in 2006. Its councillor Dirk Smit became speaker. This historical coalition predates the DA’s later outright city majorities.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — Cape Town · March 2006:** The FF+ joined Cape Town’s DA-led seven-party coalition in 2006. Its councillor Dirk Smit became speaker. This historical coalition predates the DA’s later outright city majorities.

**Sources:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf)

**Source checks:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf): checked — ACCORD/Jolobe chapter, printed page 100: DA plus six named partners in 2006; Zille mayor 106–103, Arnolds deputy and Smit speaker. Automated query falsely counted eight; checked original text.

**Code:** src/lib/seats/local-history.ts · cape-town-da-ff:walkout

### REL-28-T · Kept

> Roll the original credits.
> DA and FF+ agree that every partner gets a credit in the coalition story. Then they get through the actual council agenda. Everyone stays.

**When:** Test a majority containing DA + FF+. Cape Town.

**Context:** The FF+ joined Cape Town’s DA-led seven-party coalition in 2006. Its councillor Dirk Smit became speaker. This historical coalition predates the DA’s later outright city majorities.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — Cape Town · March 2006:** The FF+ joined Cape Town’s DA-led seven-party coalition in 2006. Its councillor Dirk Smit became speaker. This historical coalition predates the DA’s later outright city majorities.

**Sources:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf)

**Source checks:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf): checked — ACCORD/Jolobe chapter, printed page 100: DA plus six named partners in 2006; Zille mayor 106–103, Arnolds deputy and Smit speaker. Automated query falsely counted eight; checked original text.

**Code:** src/lib/seats/local-history.ts · cape-town-da-ff:truce

### REL-29-X · Clarified

> The old save file loads.
> The DA caucus argues over who gets credit for the city’s old seven-party coalition. Half of {actor}’s delegation withholds support until the credits are rewritten.

**When:** Test a majority containing DA. Cape Town.

**Context:** The DA formed Cape Town’s governing coalition with six partner parties in 2006. Helen Zille won the mayoral vote 106–103. This is an earlier chapter, not a description of the present council.

**Meaning:** Invented scene: the party argues over who deserves credit for its coalition past.

**Previous wording:** The old save file loads.
The DA caucus argues over who gets credit for the city’s coalition origin story. Half of {actor}’s delegation withholds support until the credits are rewritten.

**Game effect:** Half this party’s support is withheld, rounded up. Council seats are unchanged.

**Review decision:** Clarity pass: Replaces a vague origin story with the relevant seven-party setup. Restored humour retained.

**Current backstory — Cape Town · March 2006:** The DA formed Cape Town’s governing coalition with six partner parties in 2006. Helen Zille won the mayoral vote 106–103. This is an earlier chapter, not a description of the present council.

**Sources:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf)

**Source checks:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf): checked — ACCORD/Jolobe chapter, printed page 100: DA plus six named partners in 2006; Zille mayor 106–103, Arnolds deputy and Smit speaker. Automated query falsely counted eight; checked original text.

**Code:** src/lib/seats/local-history.ts · cape-town-da-memory:walkout

### REL-29-T · Restored

> Multiplayer experience pays off.
> The DA caucus remembers the six-partner days and a lot of phone calls. They agree on the work plan before the phone starts ringing. Everyone stays.

**When:** Test a majority containing DA. Cape Town.

**Context:** The DA formed Cape Town’s governing coalition with six partner parties in 2006. Helen Zille won the mayoral vote 106–103. This is an earlier chapter, not a description of the present council.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** Multiplayer experience pays off.
The DA caucus remembers that a majority once required six partners and a lot of phone calls. Everyone agrees to finish the work plan. All seats stay.

**Game effect:** No support lost.

**Review decision:** Restore the valuable solo-DA local history: players need not select ACDP/FF+ to learn Cape Town’s coalition past. Replace the fictional documentary-omission insinuation with a clearly metaphorical backing band; retain the game/save-file personality.

**Current backstory — Cape Town · March 2006:** The DA formed Cape Town’s governing coalition with six partner parties in 2006. Helen Zille won the mayoral vote 106–103. This is an earlier chapter, not a description of the present council.

**Sources:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf)

**Source checks:** [ACCORD / Zwelethu Jolobe · 2006 coalition history](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf): checked — ACCORD/Jolobe chapter, printed page 100: DA plus six named partners in 2006; Zille mayor 106–103, Arnolds deputy and Smit speaker. Automated query falsely counted eight; checked original text.

**Code:** src/lib/seats/local-history.ts · cape-town-da-memory:truce

### REL-30-X · Clarified

> The ballot did not read the memo.
> ANC and DA announce that everyone knows who to vote for. The councillors ask which of the competing memos to follow. {actor} leaves before nominations close.

**When:** Test a majority containing ANC + DA. Mangaung.

**Context:** DA councillor Maryke Davies became Mangaung speaker in March 2023. News24 reported that ANC councillors voted against their party’s choice. These were cross-party votes, not an ANC–DA coalition agreement.

**Meaning:** Invented scene: the fictional voting plan falls apart because its instructions conflict.

**Previous wording:** The ballot did not read the memo.
ANC and DA announce that everyone knows the plan. The plan asks for clarification. {actor} leaves before the Speaker gets to nominations.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Replaces an abstract plan asking for clarification with councillors facing contradictory instructions. Restored humour retained.

**Current backstory — Mangaung · 29 March 2023:** DA councillor Maryke Davies became Mangaung speaker in March 2023. News24 reported that ANC councillors voted against their party’s choice. These were cross-party votes, not an ANC–DA coalition agreement.

**Sources:** [News24 · 29 Mar 2023](https://www.news24.com/news24/politics/government/anc-councillors-in-mangaung-defy-party-and-vote-das-maryke-davies-in-as-new-speaker-20230329) · [DA election announcement · 29 Mar 2023](https://www.da.org.za/2023/03/da-cllr-maryke-davies-voted-in-as-speaker-of-the-mangaung-metropolitan-municipality)

**Source checks:** [News24 · 29 Mar 2023](https://www.news24.com/news24/politics/government/anc-councillors-in-mangaung-defy-party-and-vote-das-maryke-davies-in-as-new-speaker-20230329): checked — News24, 29 March 2023: Davies elected speaker; reports ANC councillors supporting her against party choice. Attribution retained; this is not proof of a formal ANC–DA agreement.; [Mangaung council record · 29 Mar 2023](https://www.mangaung.co.za/2023/03/27/council-meeting-29-march-2023/): checked — Mangaung linked council page returned 404; removed with the redundant ANC–DA record. DA’s dated announcement independently confirms election.; [DA election announcement · 29 Mar 2023](https://www.da.org.za/2023/03/da-cllr-maryke-davies-voted-in-as-speaker-of-the-mangaung-metropolitan-municipality): checked in first source audit — Supporting source verified in the earlier local-history review; restored copy keeps the narrow documented claim.

**Code:** src/lib/seats/local-history.ts · mangaung-anc-da:walkout

### REL-30-T · Clarified

> The votes and the memo agree.
> ANC and DA agree on a nominee before the ballot. Their councillors follow the plan. The last-minute persuasion speech goes back in the drawer.

**When:** Test a majority containing ANC + DA. Mangaung.

**Context:** DA councillor Maryke Davies became Mangaung speaker in March 2023. News24 reported that ANC councillors voted against their party’s choice. These were cross-party votes, not an ANC–DA coalition agreement.

**Meaning:** Invented scene: an agreed voting plan removes the need for frantic persuasion.

**Previous wording:** The votes and the memo agree.
ANC and DA settle the speaking rules before the ballot. Everyone follows the same plan. The whip checks that this is really Mangaung.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Makes the agreement about votes and gives the joke a visible payoff without requiring knowledge of Mangaung’s history or a whip’s role. Restored humour retained.

**Current backstory — Mangaung · 29 March 2023:** DA councillor Maryke Davies became Mangaung speaker in March 2023. News24 reported that ANC councillors voted against their party’s choice. These were cross-party votes, not an ANC–DA coalition agreement.

**Sources:** [News24 · 29 Mar 2023](https://www.news24.com/news24/politics/government/anc-councillors-in-mangaung-defy-party-and-vote-das-maryke-davies-in-as-new-speaker-20230329) · [DA election announcement · 29 Mar 2023](https://www.da.org.za/2023/03/da-cllr-maryke-davies-voted-in-as-speaker-of-the-mangaung-metropolitan-municipality)

**Source checks:** [News24 · 29 Mar 2023](https://www.news24.com/news24/politics/government/anc-councillors-in-mangaung-defy-party-and-vote-das-maryke-davies-in-as-new-speaker-20230329): checked — News24, 29 March 2023: Davies elected speaker; reports ANC councillors supporting her against party choice. Attribution retained; this is not proof of a formal ANC–DA agreement.; [Mangaung council record · 29 Mar 2023](https://www.mangaung.co.za/2023/03/27/council-meeting-29-march-2023/): checked — Mangaung linked council page returned 404; removed with the redundant ANC–DA record. DA’s dated announcement independently confirms election.; [DA election announcement · 29 Mar 2023](https://www.da.org.za/2023/03/da-cllr-maryke-davies-voted-in-as-speaker-of-the-mangaung-metropolitan-municipality): checked in first source audit — Supporting source verified in the earlier local-history review; restored copy keeps the narrow documented claim.

**Code:** src/lib/seats/local-history.ts · mangaung-anc-da:truce

### REL-31-X · Revised

> The caucus memo gets a reply-all.
> The ANC caucus sends out one instruction. The replies contain two alternative instructions. Half of {actor}’s delegation withholds support.

**When:** Test a majority containing ANC. Mangaung.

**Context:** In March 2023, some ANC councillors backed the DA’s Maryke Davies for Mangaung speaker against their party’s choice, according to contemporary reporting. The episode illustrates internal caucus discipline, not a formal coalition.

**Meaning:** Invented disagreement. Part of this party’s delegation withholds support.

**Game effect:** Half this party’s support is withheld, rounded up. Council seats are unchanged.

**Review decision:** Restore sharp caucus-discipline satire tied to the documented split vote, while retaining attribution in the factual paragraph.

**Current backstory — Mangaung · March 2023:** In March 2023, some ANC councillors backed the DA’s Maryke Davies for Mangaung speaker against their party’s choice, according to contemporary reporting. The episode illustrates internal caucus discipline, not a formal coalition.

**Sources:** [News24 · 29 Mar 2023](https://www.news24.com/news24/politics/government/anc-councillors-in-mangaung-defy-party-and-vote-das-maryke-davies-in-as-new-speaker-20230329) · [DA election announcement · 29 Mar 2023](https://www.da.org.za/2023/03/da-cllr-maryke-davies-voted-in-as-speaker-of-the-mangaung-metropolitan-municipality)

**Source checks:** [News24 · 29 Mar 2023](https://www.news24.com/news24/politics/government/anc-councillors-in-mangaung-defy-party-and-vote-das-maryke-davies-in-as-new-speaker-20230329): checked — News24, 29 March 2023: Davies elected speaker; reports ANC councillors supporting her against party choice. Attribution retained; this is not proof of a formal ANC–DA agreement.; [DA election announcement · 29 Mar 2023](https://www.da.org.za/2023/03/da-cllr-maryke-davies-voted-in-as-speaker-of-the-mangaung-metropolitan-municipality): checked

**Code:** src/lib/seats/local-history.ts · mangaung-anc-caucus:walkout

### REL-31-T · Clarified

> One caucus. One instruction.
> The ANC caucus agrees how its councillors will vote before entering the chamber. The party whip can finally put down the headcount clipboard. Everyone keeps supporting the deal.

**When:** Test a majority containing ANC. Mangaung.

**Context:** In March 2023, some ANC councillors backed the DA’s Maryke Davies for Mangaung speaker against their party’s choice, according to contemporary reporting. The episode illustrates internal caucus discipline, not a formal coalition.

**Meaning:** Invented scene: a united caucus gives its vote organiser a break.

**Previous wording:** One caucus. One instruction.
The ANC caucus agrees on its position before entering the chamber. The whip briefly runs out of things to worry about. Everyone keeps supporting the deal.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Explains what the caucus agrees and gives the whip’s role a practical clue.

**Current backstory — Mangaung · March 2023:** In March 2023, some ANC councillors backed the DA’s Maryke Davies for Mangaung speaker against their party’s choice, according to contemporary reporting. The episode illustrates internal caucus discipline, not a formal coalition.

**Sources:** [News24 · 29 Mar 2023](https://www.news24.com/news24/politics/government/anc-councillors-in-mangaung-defy-party-and-vote-das-maryke-davies-in-as-new-speaker-20230329) · [DA election announcement · 29 Mar 2023](https://www.da.org.za/2023/03/da-cllr-maryke-davies-voted-in-as-speaker-of-the-mangaung-metropolitan-municipality)

**Source checks:** [News24 · 29 Mar 2023](https://www.news24.com/news24/politics/government/anc-councillors-in-mangaung-defy-party-and-vote-das-maryke-davies-in-as-new-speaker-20230329): checked — News24, 29 March 2023: Davies elected speaker; reports ANC councillors supporting her against party choice. Attribution retained; this is not proof of a formal ANC–DA agreement.; [DA election announcement · 29 Mar 2023](https://www.da.org.za/2023/03/da-cllr-maryke-davies-voted-in-as-speaker-of-the-mangaung-metropolitan-municipality): checked

**Code:** src/lib/seats/local-history.ts · mangaung-anc-caucus:truce

### REL-32-X · Kept

> The nameplate has been recalled.
> The ANC caucus agrees it wants change. It cannot agree whose office should change first. Half of {actor}’s delegation withholds support.

**When:** Test a majority containing ANC. Buffalo City.

**Context:** The ANC recalled Buffalo City mayor Xola Pakati in March 2023. Princess Faku replaced him on 23 March, winning 62 votes to the DA candidate’s 22. The ANC held a majority; this was an internal leadership change, not a coalition collapse.

**Meaning:** Invented disagreement. Part of this party’s delegation withholds support.

**Game effect:** Half this party’s support is withheld, rounded up. Council seats are unchanged.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — Buffalo City · March 2023:** The ANC recalled Buffalo City mayor Xola Pakati in March 2023. Princess Faku replaced him on 23 March, winning 62 votes to the DA candidate’s 22. The ANC held a majority; this was an internal leadership change, not a coalition collapse.

**Sources:** [SABC · 23 Mar 2023](https://www.sabcnews.com/sabcnews/princess-faku-elected-as-buffalo-city-metro-mayor/)

**Source checks:** [SABC · 23 Mar 2023](https://www.sabcnews.com/sabcnews/princess-faku-elected-as-buffalo-city-metro-mayor/): checked — SABC, 23 March 2023: Faku elected 62–22 after ANC recalled Pakati; ANC majority explicitly reported.

**Code:** src/lib/seats/local-history.ts · buffalo-city-anc-recall:walkout

### REL-32-T · Revised

> Same team after the reshuffle.
> The ANC caucus settles the leadership question and keeps the service plan. The nameplate changes; your support does not. Everyone keeps supporting the deal.

**When:** Test a majority containing ANC. Buffalo City.

**Context:** The ANC recalled Buffalo City mayor Xola Pakati in March 2023. Princess Faku replaced him on 23 March, winning 62 votes to the DA candidate’s 22. The ANC held a majority; this was an internal leadership change, not a coalition collapse.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** Same team after the reshuffle.
The ANC caucus settles the leadership question and keeps the service plan. The nameplate changes; your support does not. All seats stay.

**Game effect:** No support lost.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — Buffalo City · March 2023:** The ANC recalled Buffalo City mayor Xola Pakati in March 2023. Princess Faku replaced him on 23 March, winning 62 votes to the DA candidate’s 22. The ANC held a majority; this was an internal leadership change, not a coalition collapse.

**Sources:** [SABC · 23 Mar 2023](https://www.sabcnews.com/sabcnews/princess-faku-elected-as-buffalo-city-metro-mayor/)

**Source checks:** [SABC · 23 Mar 2023](https://www.sabcnews.com/sabcnews/princess-faku-elected-as-buffalo-city-metro-mayor/): checked — SABC, 23 March 2023: Faku elected 62–22 after ANC recalled Pakati; ANC majority explicitly reported.

**Code:** src/lib/seats/local-history.ts · buffalo-city-anc-recall:truce

### REL-33-X · Kept

> The keyring is up for negotiation.
> ANC and ATM agree on the mayoral office, then disagree on who keeps the spare keys. {actor} leaves before the handover.

**When:** Test a majority containing ANC + ATM. Mogale City.

**Context:** Mogale City elected ATM’s Danny Thupane mayor in April 2023, replacing the DA-led administration. The municipality named ATM, ANC and EFF as participants in the new Government of Local Unity.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — Mogale City · 25 April 2023:** Mogale City elected ATM’s Danny Thupane mayor in April 2023, replacing the DA-led administration. The municipality named ATM, ANC and EFF as participants in the new Government of Local Unity.

**Sources:** [Mogale City statement · 25 Apr 2023](https://mogalecity.gov.za/wp-content/uploads/Pdfs/Media%20Room/Press%20Release/Mogale%20City%20elects%20new%20execitive%20mayor.pdf)

**Source checks:** [Mogale City statement · 25 Apr 2023](https://mogalecity.gov.za/wp-content/uploads/Pdfs/Media%20Room/Press%20Release/Mogale%20City%20elects%20new%20execitive%20mayor.pdf): checked — Mogale official statement, 25 April 2023, pages 1–2: ATM mayor Danny Thupane, ANC speaker Lucky Sele, EFF whip Tsholofelo Ramaisa; ATM–ANC–EFF GLU.

**Code:** src/lib/seats/local-history.ts · mogale-anc-atm:walkout

### REL-33-T · Kept

> Small party, signed mandate.
> ANC and ATM put the mayor’s duties in writing. The keys and the responsibility go to the same person. Everyone stays.

**When:** Test a majority containing ANC + ATM. Mogale City.

**Context:** Mogale City elected ATM’s Danny Thupane mayor in April 2023, replacing the DA-led administration. The municipality named ATM, ANC and EFF as participants in the new Government of Local Unity.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — Mogale City · 25 April 2023:** Mogale City elected ATM’s Danny Thupane mayor in April 2023, replacing the DA-led administration. The municipality named ATM, ANC and EFF as participants in the new Government of Local Unity.

**Sources:** [Mogale City statement · 25 Apr 2023](https://mogalecity.gov.za/wp-content/uploads/Pdfs/Media%20Room/Press%20Release/Mogale%20City%20elects%20new%20execitive%20mayor.pdf)

**Source checks:** [Mogale City statement · 25 Apr 2023](https://mogalecity.gov.za/wp-content/uploads/Pdfs/Media%20Room/Press%20Release/Mogale%20City%20elects%20new%20execitive%20mayor.pdf): checked — Mogale official statement, 25 April 2023, pages 1–2: ATM mayor Danny Thupane, ANC speaker Lucky Sele, EFF whip Tsholofelo Ramaisa; ATM–ANC–EFF GLU.

**Code:** src/lib/seats/local-history.ts · mogale-anc-atm:truce

### REL-34-X · Restored

> The leadership call drops.
> ANC and EFF arrange a leadership call. Both arrive convinced they are chairing it. {actor} leaves the deal and the call.

**When:** Test a majority containing ANC + EFF. Mogale City.

**Context:** Mogale City’s April 2023 leadership change installed an ATM mayor, ANC speaker and EFF council whip. The official statement described an ATM–ANC–EFF Government of Local Unity.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Previous wording:** The three-way call drops.
ANC and EFF arrange a three-way leadership call. Everyone talks; nobody knows who is chairing. {actor} leaves the deal and the call.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Restore the ANC–EFF pairing so this local leadership arrangement can appear without ATM in the player’s selection. Calling the mayor boss is obvious political shorthand, not a legal assertion about party control. Fix the fictional call so it does not invent an unselected third party.

**Current backstory — Mogale City · April 2023:** Mogale City’s April 2023 leadership change installed an ATM mayor, ANC speaker and EFF council whip. The official statement described an ATM–ANC–EFF Government of Local Unity.

**Sources:** [Mogale City statement · 25 Apr 2023](https://mogalecity.gov.za/wp-content/uploads/Pdfs/Media%20Room/Press%20Release/Mogale%20City%20elects%20new%20execitive%20mayor.pdf)

**Source checks:** [Mogale City statement · 25 Apr 2023](https://mogalecity.gov.za/wp-content/uploads/Pdfs/Media%20Room/Press%20Release/Mogale%20City%20elects%20new%20execitive%20mayor.pdf): checked — Mogale official statement, 25 April 2023, pages 1–2: ATM mayor Danny Thupane, ANC speaker Lucky Sele, EFF whip Tsholofelo Ramaisa; ATM–ANC–EFF GLU.

**Code:** src/lib/seats/local-history.ts · mogale-anc-eff:walkout

### REL-34-T · Clarified

> The speaking order works.
> ANC and EFF agree which jobs belong to which office. For once, the job chart survives the meeting. All your partners stay.

**When:** Test a majority containing ANC + EFF. Mogale City.

**Context:** Mogale City’s April 2023 leadership change installed an ATM mayor, ANC speaker and EFF council whip. The official statement described an ATM–ANC–EFF Government of Local Unity.

**Meaning:** Invented scene: the agreed division of roles survives discussion.

**Previous wording:** The speaking order works.
ANC and EFF agree which jobs belong to which office. For once, the organogram survives the meeting. All your partners stay.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Replaces “organogram” with plain language. Restored humour retained.

**Current backstory — Mogale City · April 2023:** Mogale City’s April 2023 leadership change installed an ATM mayor, ANC speaker and EFF council whip. The official statement described an ATM–ANC–EFF Government of Local Unity.

**Sources:** [Mogale City statement · 25 Apr 2023](https://mogalecity.gov.za/wp-content/uploads/Pdfs/Media%20Room/Press%20Release/Mogale%20City%20elects%20new%20execitive%20mayor.pdf)

**Source checks:** [Mogale City statement · 25 Apr 2023](https://mogalecity.gov.za/wp-content/uploads/Pdfs/Media%20Room/Press%20Release/Mogale%20City%20elects%20new%20execitive%20mayor.pdf): checked — Mogale official statement, 25 April 2023, pages 1–2: ATM mayor Danny Thupane, ANC speaker Lucky Sele, EFF whip Tsholofelo Ramaisa; ATM–ANC–EFF GLU.

**Code:** src/lib/seats/local-history.ts · mogale-anc-eff:truce

### REL-35-X · Revised

> The small print has a caucus.
> ANC and PA draft the Vaal deal. The smaller partners arrive with amendments to the amendments. {actor} leaves before the appendix is finished.

**When:** Test a majority containing ANC + PA. Emfuleni.

**Context:** After the 2021 election, the ANC held 38 of Emfuleni’s 90 seats. MISTRA lists ANC, PA and four other parties in the November 2021 administration, totalling 45 seats: a minority arrangement, one short of an outright majority. These are the partners recorded at formation.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Correct false majority implication: the published formation record classifies45/90 as a minority arrangement. Explain the actual arithmetic.

**Current backstory — Emfuleni · November 2021:** After the 2021 election, the ANC held 38 of Emfuleni’s 90 seats. MISTRA lists ANC, PA and four other parties in the November 2021 administration, totalling 45 seats: a minority arrangement, one short of an outright majority. These are the partners recorded at formation.

**Sources:** [MISTRA dataset · Emfuleni EMF_01, formed 22 Nov 2021](https://coalitions.mistra.org.za/)

**Source checks:** [MISTRA dataset · Emfuleni EMF_01, formed 22 Nov 2021](https://coalitions.mistra.org.za/): checked — Published MISTRA 2026 download page checked; original vendored municipal_administrations.csv reviewed. EMF_01 lists ANC38/90 and member parties totalling45, classified Minority. TBZ_01 includes EFF; TBZ_02 codes EFF Opposition from October2022. Zip not readable by web tool; CSV provenance retained in repo.

**Code:** src/lib/seats/local-history.ts · emfuleni-anc-pa:walkout

### REL-35-T · Revised

> The whole table gets a say.
> ANC and PA hear the community partners out. The repair schedule gets approved before the next round of introductions. Everyone stays.

**When:** Test a majority containing ANC + PA. Emfuleni.

**Context:** After the 2021 election, the ANC held 38 of Emfuleni’s 90 seats. MISTRA lists ANC, PA and four other parties in the November 2021 administration, totalling 45 seats: a minority arrangement, one short of an outright majority. These are the partners recorded at formation.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Correct false majority implication: the published formation record classifies45/90 as a minority arrangement. Explain the actual arithmetic.

**Current backstory — Emfuleni · November 2021:** After the 2021 election, the ANC held 38 of Emfuleni’s 90 seats. MISTRA lists ANC, PA and four other parties in the November 2021 administration, totalling 45 seats: a minority arrangement, one short of an outright majority. These are the partners recorded at formation.

**Sources:** [MISTRA dataset · Emfuleni EMF_01, formed 22 Nov 2021](https://coalitions.mistra.org.za/)

**Source checks:** [MISTRA dataset · Emfuleni EMF_01, formed 22 Nov 2021](https://coalitions.mistra.org.za/): checked — Published MISTRA 2026 download page checked; original vendored municipal_administrations.csv reviewed. EMF_01 lists ANC38/90 and member parties totalling45, classified Minority. TBZ_01 includes EFF; TBZ_02 codes EFF Opposition from October2022. Zip not readable by web tool; CSV provenance retained in repo.

**Code:** src/lib/seats/local-history.ts · emfuleni-anc-pa:truce

### REL-36-X · Restored

> Small party. Long list.
> ANC and AIC agree every partner matters. Then the smaller party unfolds its wish list. It reaches the floor. {actor} leaves before item two.

**When:** Test a majority containing ANC + AIC. Rustenburg.

**Context:** MISTRA records a post-2021 governing agreement in Rustenburg between the ANC, AIC and local party Arona. The ANC did not hold an outright majority on its own. The agreement put the ANC’s candidates in the mayor and speaker positions.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Previous wording:** Small seat count. Large invoice of demands.
ANC and AIC agree every partner matters. Then they discuss exactly how much. {actor} leaves with its list of conditions.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Restore geographic and small-party variety using the verified narrow coalition fact. Avoid the source’s inconsistent 45/89–90 majority arithmetic. The platinum wish list is explicit comic exaggeration about bargaining priorities, replacing invoice/payment implications.

**Current backstory — Rustenburg · November 2021:** MISTRA records a post-2021 governing agreement in Rustenburg between the ANC, AIC and local party Arona. The ANC did not hold an outright majority on its own. The agreement put the ANC’s candidates in the mayor and speaker positions.

**Sources:** [MISTRA Coalitions Barometer · 2021–2023, North West chapter](https://mistra.org.za/wp-content/uploads/2024/04/MISTRA-COALITION-BAROMETER_final-25-April-2024.pdf)

**Source checks:** [MISTRA Coalitions Barometer · 2021–2023, North West chapter](https://mistra.org.za/wp-content/uploads/2024/04/MISTRA-COALITION-BAROMETER_final-25-April-2024.pdf): checked — MISTRA 2021–23 printed pages241–245: JB Marks ANC33/67 and PA2. Rustenburg coalition partners confirmed, but text/table disagree on 89/90 seats and whether45 is a majority; do not retain that majority claim.

**Code:** src/lib/seats/local-history.ts · rustenburg-anc-aic:walkout

### REL-36-T · Restored

> The little partner gets heard.
> ANC and AIC put the smaller partners’ priorities into the service plan. The agreement fits on the table. Everyone stays.

**When:** Test a majority containing ANC + AIC. Rustenburg.

**Context:** MISTRA records a post-2021 governing agreement in Rustenburg between the ANC, AIC and local party Arona. The ANC did not hold an outright majority on its own. The agreement put the ANC’s candidates in the mayor and speaker positions.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Restore geographic and small-party variety using the verified narrow coalition fact. Avoid the source’s inconsistent 45/89–90 majority arithmetic. The platinum wish list is explicit comic exaggeration about bargaining priorities, replacing invoice/payment implications.

**Current backstory — Rustenburg · November 2021:** MISTRA records a post-2021 governing agreement in Rustenburg between the ANC, AIC and local party Arona. The ANC did not hold an outright majority on its own. The agreement put the ANC’s candidates in the mayor and speaker positions.

**Sources:** [MISTRA Coalitions Barometer · 2021–2023, North West chapter](https://mistra.org.za/wp-content/uploads/2024/04/MISTRA-COALITION-BAROMETER_final-25-April-2024.pdf)

**Source checks:** [MISTRA Coalitions Barometer · 2021–2023, North West chapter](https://mistra.org.za/wp-content/uploads/2024/04/MISTRA-COALITION-BAROMETER_final-25-April-2024.pdf): checked — MISTRA 2021–23 printed pages241–245: JB Marks ANC33/67 and PA2. Rustenburg coalition partners confirmed, but text/table disagree on 89/90 seats and whether45 is a majority; do not retain that majority claim.

**Code:** src/lib/seats/local-history.ts · rustenburg-anc-aic:truce

### REL-37-X · Clarified

> The top-up has terms.
> ANC and PA agree to combine their seats. The final two lines of the agreement take longer than the first twenty. {actor} leaves over the wording.

**When:** Test a majority containing ANC + PA. JB Marks.

**Context:** In the 2021 JB Marks election, the ANC won 33 of 67 seats, one below an outright majority. Its coalition with the PA, which held two seats, crossed that threshold.

**Meaning:** Invented scene: a small addition to the seat total leads to a long negotiation.

**Previous wording:** The top-up has terms.
ANC and PA agree on the majority. The final two lines of the agreement take longer than the first twenty. {actor} leaves over the wording.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Replaces the vague phrase “agree on the majority” with the action being negotiated.

**Current backstory — JB Marks · November 2021:** In the 2021 JB Marks election, the ANC won 33 of 67 seats, one below an outright majority. Its coalition with the PA, which held two seats, crossed that threshold.

**Sources:** [MISTRA Coalitions Barometer · 2021–2023, North West chapter](https://mistra.org.za/wp-content/uploads/2024/04/MISTRA-COALITION-BAROMETER_final-25-April-2024.pdf)

**Source checks:** [MISTRA Coalitions Barometer · 2021–2023, North West chapter](https://mistra.org.za/wp-content/uploads/2024/04/MISTRA-COALITION-BAROMETER_final-25-April-2024.pdf): checked — MISTRA 2021–23 printed pages241–245: JB Marks ANC33/67 and PA2. Rustenburg coalition partners confirmed, but text/table disagree on 89/90 seats and whether45 is a majority; do not retain that majority claim.

**Code:** src/lib/seats/local-history.ts · jb-marks-anc-pa:walkout

### REL-37-T · Kept

> The last signature lands.
> ANC and PA agree that the final signatures matter as much as the first. The Potch deal holds, with everyone still at the table.

**When:** Test a majority containing ANC + PA. JB Marks.

**Context:** In the 2021 JB Marks election, the ANC won 33 of 67 seats, one below an outright majority. Its coalition with the PA, which held two seats, crossed that threshold.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Replace unsupported expensive/transactional insinuation with the documented arithmetic of small-party bargaining power.

**Current backstory — JB Marks · November 2021:** In the 2021 JB Marks election, the ANC won 33 of 67 seats, one below an outright majority. Its coalition with the PA, which held two seats, crossed that threshold.

**Sources:** [MISTRA Coalitions Barometer · 2021–2023, North West chapter](https://mistra.org.za/wp-content/uploads/2024/04/MISTRA-COALITION-BAROMETER_final-25-April-2024.pdf)

**Source checks:** [MISTRA Coalitions Barometer · 2021–2023, North West chapter](https://mistra.org.za/wp-content/uploads/2024/04/MISTRA-COALITION-BAROMETER_final-25-April-2024.pdf): checked — MISTRA 2021–23 printed pages241–245: JB Marks ANC33/67 and PA2. Rustenburg coalition partners confirmed, but text/table disagree on 89/90 seats and whether45 is a majority; do not retain that majority claim.

**Code:** src/lib/seats/local-history.ts · jb-marks-anc-pa:truce

### REL-39-X · Kept

> Whose action list is this?
> LCF and EFF bring competing lists from the same community meeting. Both are marked urgent. {actor} leaves before the lists can be combined.

**When:** Test a majority containing LCF + EFF. Lekwa.

**Context:** After the 2021 election, Lekwa Community Forum candidates won the mayor and speaker positions, while an EFF councillor became chief whip. The result ended ANC control of the municipality.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — Lekwa · 22 November 2021:** After the 2021 election, Lekwa Community Forum candidates won the mayor and speaker positions, while an EFF councillor became chief whip. The result ended ANC control of the municipality.

**Sources:** [City Press · 22 Nov 2021](https://www.news24.com/citypress/politics/anc-loses-control-of-mpumalangas-lekwa-municipality-to-community-forum-20211122)

**Source checks:** [City Press · 22 Nov 2021](https://www.news24.com/citypress/politics/anc-loses-control-of-mpumalangas-lekwa-municipality-to-community-forum-20211122): checked — City Press, 22 November 2021: LCF won Lekwa mayor and speaker; EFF won chief whip; first change from ANC municipal leadership.

**Code:** src/lib/seats/local-history.ts · lekwa-lcf-eff:walkout

### REL-39-T · Kept

> The local list wins.
> LCF and EFF compare their repair lists and discover the same streets. They agree to start there. Every partner stays.

**When:** Test a majority containing LCF + EFF. Lekwa.

**Context:** After the 2021 election, Lekwa Community Forum candidates won the mayor and speaker positions, while an EFF councillor became chief whip. The result ended ANC control of the municipality.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — Lekwa · 22 November 2021:** After the 2021 election, Lekwa Community Forum candidates won the mayor and speaker positions, while an EFF councillor became chief whip. The result ended ANC control of the municipality.

**Sources:** [City Press · 22 Nov 2021](https://www.news24.com/citypress/politics/anc-loses-control-of-mpumalangas-lekwa-municipality-to-community-forum-20211122)

**Source checks:** [City Press · 22 Nov 2021](https://www.news24.com/citypress/politics/anc-loses-control-of-mpumalangas-lekwa-municipality-to-community-forum-20211122): checked — City Press, 22 November 2021: LCF won Lekwa mayor and speaker; EFF won chief whip; first change from ANC municipal leadership.

**Code:** src/lib/seats/local-history.ts · lekwa-lcf-eff:truce

### REL-40-X · Kept

> Head office has entered the chat.
> ANC and EFF complete the local handshake. A national office calls to ask who authorised the handshake. {actor} leaves to “consult”.

**When:** Test a majority containing ANC + EFF. Metsimaholo.

**Context:** EFF mayor Selloane Motjeane resigned in November 2021 after her party’s national leadership objected to her election with ANC support. The DA’s Jeff Zwane succeeded her in December. Local support and national instructions had diverged.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — Metsimaholo · November–December 2021:** EFF mayor Selloane Motjeane resigned in November 2021 after her party’s national leadership objected to her election with ANC support. The DA’s Jeff Zwane succeeded her in December. Local support and national instructions had diverged.

**Sources:** [The Citizen · 3 Dec 2021](https://www.citizen.co.za/news/south-africa/politics/das-jeff-zwane-elected-new-mayor-of-metsimaholo-3-december-2021/)

**Source checks:** [The Citizen · 3 Dec 2021](https://www.citizen.co.za/news/south-africa/politics/das-jeff-zwane-elected-new-mayor-of-metsimaholo-3-december-2021/): checked — Citizen, 3 December 2021: Zwane elected after Motjeane resigned on EFF national leadership instruction over ANC support.

**Code:** src/lib/seats/local-history.ts · metsimaholo-anc-eff:walkout

### REL-40-T · Clarified

> Everyone cleared the handshake.
> ANC and EFF check the local plan with their party leaders before the meeting. The phones stay silent. Everyone keeps supporting the deal.

**When:** Test a majority containing ANC + EFF. Metsimaholo.

**Context:** EFF mayor Selloane Motjeane resigned in November 2021 after her party’s national leadership objected to her election with ANC support. The DA’s Jeff Zwane succeeded her in December. Local support and national instructions had diverged.

**Meaning:** Invented scene: prior agreement avoids an interrupting call from party leadership.

**Previous wording:** Everyone cleared the handshake.
ANC and EFF check the local plan with their structures before the meeting. The phones stay silent. Everyone keeps supporting the deal.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Replaces the insider term “structures” with the people it means.

**Current backstory — Metsimaholo · November–December 2021:** EFF mayor Selloane Motjeane resigned in November 2021 after her party’s national leadership objected to her election with ANC support. The DA’s Jeff Zwane succeeded her in December. Local support and national instructions had diverged.

**Sources:** [The Citizen · 3 Dec 2021](https://www.citizen.co.za/news/south-africa/politics/das-jeff-zwane-elected-new-mayor-of-metsimaholo-3-december-2021/)

**Source checks:** [The Citizen · 3 Dec 2021](https://www.citizen.co.za/news/south-africa/politics/das-jeff-zwane-elected-new-mayor-of-metsimaholo-3-december-2021/): checked — Citizen, 3 December 2021: Zwane elected after Motjeane resigned on EFF national leadership instruction over ANC support.

**Code:** src/lib/seats/local-history.ts · metsimaholo-anc-eff:truce

### REL-41-X · Restored

> The mayoral chain needs an extension.
> ANC and AIC agree to share responsibility. Both pull the mayoral chain in their direction. {actor} lets go and leaves the deal.

**When:** Test a majority containing ANC + AIC. Metsimaholo.

**Context:** AIC councillor Jack Malindi became Metsimaholo mayor unopposed in August 2023 after DA mayor Jeff Zwane’s removal. SABC reported that ATM nominated him and ANC seconded the nomination. This records that election, not a permanent coalition agreement.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Restore a distinct 2023 mayoral election and AIC pairing; the retained EFF episode concerns 2021. The oversized-chain joke is harmless exaggeration about party size and office, and this adds local history instead of another national fallback.

**Current backstory — Metsimaholo · August 2023:** AIC councillor Jack Malindi became Metsimaholo mayor unopposed in August 2023 after DA mayor Jeff Zwane’s removal. SABC reported that ATM nominated him and ANC seconded the nomination. This records that election, not a permanent coalition agreement.

**Sources:** [SABC · 19 Aug 2023](https://www.sabcnews.com/sabcnews/atm-anc-join-forces-as-aics-malindi-elected-metsimaholo-mayor/)

**Source checks:** [SABC · 19 Aug 2023](https://www.sabcnews.com/sabcnews/atm-anc-join-forces-as-aics-malindi-elected-metsimaholo-mayor/): checked — SABC, 19 August 2023: AIC’s Malindi elected unopposed, nominated by ATM and seconded by ANC after Zwane’s removal.

**Code:** src/lib/seats/local-history.ts · metsimaholo-anc-aic:walkout

### REL-41-T · Restored

> The chain stays in one piece.
> ANC and AIC agree who does the job and who checks the work. The chain needs no repairs. Everyone stays.

**When:** Test a majority containing ANC + AIC. Metsimaholo.

**Context:** AIC councillor Jack Malindi became Metsimaholo mayor unopposed in August 2023 after DA mayor Jeff Zwane’s removal. SABC reported that ATM nominated him and ANC seconded the nomination. This records that election, not a permanent coalition agreement.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Restore a distinct 2023 mayoral election and AIC pairing; the retained EFF episode concerns 2021. The oversized-chain joke is harmless exaggeration about party size and office, and this adds local history instead of another national fallback.

**Current backstory — Metsimaholo · August 2023:** AIC councillor Jack Malindi became Metsimaholo mayor unopposed in August 2023 after DA mayor Jeff Zwane’s removal. SABC reported that ATM nominated him and ANC seconded the nomination. This records that election, not a permanent coalition agreement.

**Sources:** [SABC · 19 Aug 2023](https://www.sabcnews.com/sabcnews/atm-anc-join-forces-as-aics-malindi-elected-metsimaholo-mayor/)

**Source checks:** [SABC · 19 Aug 2023](https://www.sabcnews.com/sabcnews/atm-anc-join-forces-as-aics-malindi-elected-metsimaholo-mayor/): checked — SABC, 19 August 2023: AIC’s Malindi elected unopposed, nominated by ATM and seconded by ANC after Zwane’s removal.

**Code:** src/lib/seats/local-history.ts · metsimaholo-anc-aic:truce

### REL-42-X · Revised

> Oversight needs its own oversight.
> MAP16 and EFF agree that somebody must check the work. They disagree about who checks the checker. {actor} leaves before the first report.

**When:** Test a majority containing MAP16 + EFF. Maluti a Phofung.

**Context:** MAP16 secured a November 2021 agreement to lead Maluti-a-Phofung with backing from the EFF and smaller parties. MAP16 said the EFF would oversee the municipal public accounts committee rather than co-govern. The DA and FF+ offered support for electing officeholders without joining the agreement.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Keep the already corrected spending-scrutiny tease; name MPAC explicitly so oversight is not confused with an audit job.

**Current backstory — Maluti-a-Phofung · November 2021:** MAP16 secured a November 2021 agreement to lead Maluti-a-Phofung with backing from the EFF and smaller parties. MAP16 said the EFF would oversee the municipal public accounts committee rather than co-govern. The DA and FF+ offered support for electing officeholders without joining the agreement.

**Sources:** [News24Wire / Polity · 18 Nov 2021](https://www.polity.org.za/article/anc-out-as-former-party-members-map-16-clinch-coalition-deal-in-maluti-a-phofung-2021-11-18)

**Source checks:** [News24Wire / Polity · 18 Nov 2021](https://www.polity.org.za/article/anc-out-as-former-party-members-map-16-clinch-coalition-deal-in-maluti-a-phofung-2021-11-18): checked — News24Wire/Polity, 18 November 2021: MAP16 spokesperson described EFF oversight of MPAC without co-governing, and DA/FF+ support for officeholder elections outside agreement.

**Code:** src/lib/seats/local-history.ts · maluti-map16-eff:walkout

### REL-42-T · Revised

> The repair list outranks the titles.
> MAP16 and EFF settle who delivers and who asks the awkward questions. The first repair gets a date. Everyone stays.

**When:** Test a majority containing MAP16 + EFF. Maluti a Phofung.

**Context:** MAP16 secured a November 2021 agreement to lead Maluti-a-Phofung with backing from the EFF and smaller parties. MAP16 said the EFF would oversee the municipal public accounts committee rather than co-govern. The DA and FF+ offered support for electing officeholders without joining the agreement.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Keep the already corrected spending-scrutiny tease; name MPAC explicitly so oversight is not confused with an audit job.

**Current backstory — Maluti-a-Phofung · November 2021:** MAP16 secured a November 2021 agreement to lead Maluti-a-Phofung with backing from the EFF and smaller parties. MAP16 said the EFF would oversee the municipal public accounts committee rather than co-govern. The DA and FF+ offered support for electing officeholders without joining the agreement.

**Sources:** [News24Wire / Polity · 18 Nov 2021](https://www.polity.org.za/article/anc-out-as-former-party-members-map-16-clinch-coalition-deal-in-maluti-a-phofung-2021-11-18)

**Source checks:** [News24Wire / Polity · 18 Nov 2021](https://www.polity.org.za/article/anc-out-as-former-party-members-map-16-clinch-coalition-deal-in-maluti-a-phofung-2021-11-18): checked — News24Wire/Polity, 18 November 2021: MAP16 spokesperson described EFF oversight of MPAC without co-governing, and DA/FF+ support for officeholder elections outside agreement.

**Code:** src/lib/seats/local-history.ts · maluti-map16-eff:truce

### REL-43-X · Restored

> The sweet deal turns sticky.
> IFP and Team Sugar agree to give each other space. Both turn up with a campaign gazebo for the same corner. {actor} packs up and leaves.

**When:** Test a majority containing IFP + TSSA. Newcastle.

**Context:** In February 2023, the IFP announced that it would not contest Newcastle’s ward 31 by-election and would support coalition partner Team Sugar South Africa. The two parties confirmed the arrangement at a joint press conference. It applied to that by-election, not all Newcastle wards.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Restore the actual two-party local relationship, which is a different gameplay context from solo IFP. Team Sugar wordplay and the competing gazebos are light, comprehensible humour. Retain the precise ward and avoid speculation about threats.

**Current backstory — Newcastle · February 2023:** In February 2023, the IFP announced that it would not contest Newcastle’s ward 31 by-election and would support coalition partner Team Sugar South Africa. The two parties confirmed the arrangement at a joint press conference. It applied to that by-election, not all Newcastle wards.

**Sources:** [IOL / The Star · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/)

**Source checks:** [IOL / The Star · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/): checked — IOL/The Star, 8 February 2023: joint press conference confirms IFP standing aside in Newcastle ward 31 for TSSA; alleged threats are disputed. Its eThekwini paragraph is ambiguously worded; IFP’s December statement independently confirms DA stood aside there.

**Code:** src/lib/seats/local-history.ts · newcastle-ifp-tssa:walkout

### REL-43-T · Restored

> One gazebo. Shared shade.
> IFP and Team Sugar settle who takes the lead before the posters arrive. The agreement is sweet enough without another negotiation. Everyone stays.

**When:** Test a majority containing IFP + TSSA. Newcastle.

**Context:** In February 2023, the IFP announced that it would not contest Newcastle’s ward 31 by-election and would support coalition partner Team Sugar South Africa. The two parties confirmed the arrangement at a joint press conference. It applied to that by-election, not all Newcastle wards.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Restore the actual two-party local relationship, which is a different gameplay context from solo IFP. Team Sugar wordplay and the competing gazebos are light, comprehensible humour. Retain the precise ward and avoid speculation about threats.

**Current backstory — Newcastle · February 2023:** In February 2023, the IFP announced that it would not contest Newcastle’s ward 31 by-election and would support coalition partner Team Sugar South Africa. The two parties confirmed the arrangement at a joint press conference. It applied to that by-election, not all Newcastle wards.

**Sources:** [IOL / The Star · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/)

**Source checks:** [IOL / The Star · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/): checked — IOL/The Star, 8 February 2023: joint press conference confirms IFP standing aside in Newcastle ward 31 for TSSA; alleged threats are disputed. Its eThekwini paragraph is ambiguously worded; IFP’s December statement independently confirms DA stood aside there.

**Code:** src/lib/seats/local-history.ts · newcastle-ifp-tssa:truce

### REL-44-X · Clarified

> The campaign team misses the memo.
> The IFP delegation debates whether to sit out a ward election for a partner. Half has already booked campaign loudspeakers. Half of {actor}’s delegation withholds support while the booking is disputed.

**When:** Test a majority containing IFP. Newcastle.

**Context:** In February 2023 the IFP announced that it would stand aside in Newcastle’s ward 31 by-election to support Team Sugar South Africa. This was a specific ward-level electoral arrangement, not evidence that Team Sugar is part of your selected deal.

**Meaning:** Invented scene: a campaign team has prepared to contest a ward it may stand aside in.

**Previous wording:** The campaign team misses the memo.
The IFP delegation debates when to give a partner space. Half has already booked campaign loudspeakers. Half of {actor}’s delegation withholds support while the booking is disputed.

**Game effect:** Half this party’s support is withheld, rounded up. Council seats are unchanged.

**Review decision:** Clarity pass: Explains what giving a partner space means before the loudspeaker joke.

**Current backstory — Newcastle · February 2023:** In February 2023 the IFP announced that it would stand aside in Newcastle’s ward 31 by-election to support Team Sugar South Africa. This was a specific ward-level electoral arrangement, not evidence that Team Sugar is part of your selected deal.

**Sources:** [IOL / The Star · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/)

**Source checks:** [IOL / The Star · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/): checked — IOL/The Star, 8 February 2023: joint press conference confirms IFP standing aside in Newcastle ward 31 for TSSA; alleged threats are disputed. Its eThekwini paragraph is ambiguously worded; IFP’s December statement independently confirms DA stood aside there.

**Code:** src/lib/seats/local-history.ts · newcastle-ifp-support:walkout

### REL-44-T · Clarified

> The campaign team gets the memo.
> The IFP delegation agrees that backing a partner can mean staying off the ballot. The loudspeakers get a day off, and all your councillors stay.

**When:** Test a majority containing IFP. Newcastle.

**Context:** In February 2023 the IFP announced that it would stand aside in Newcastle’s ward 31 by-election to support Team Sugar South Africa. This was a specific ward-level electoral arrangement, not evidence that Team Sugar is part of your selected deal.

**Meaning:** Invented scene: the delegation accepts an electoral cooperation arrangement.

**Previous wording:** The campaign team gets the memo.
The IFP delegation agrees that cooperation sometimes means taking turns. The loudspeaker booking is sorted, and all your councillors stay.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Makes the campaign decision and the quiet loudspeakers’ payoff explicit.

**Current backstory — Newcastle · February 2023:** In February 2023 the IFP announced that it would stand aside in Newcastle’s ward 31 by-election to support Team Sugar South Africa. This was a specific ward-level electoral arrangement, not evidence that Team Sugar is part of your selected deal.

**Sources:** [IOL / The Star · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/)

**Source checks:** [IOL / The Star · 8 Feb 2023](https://thestar.co.za/news/politics/2023-02-08-ifp-pulls-out-of-newcastle--by-elections-to-preserve-ward-for-its-coalition-partner/): checked — IOL/The Star, 8 February 2023: joint press conference confirms IFP standing aside in Newcastle ward 31 for TSSA; alleged threats are disputed. Its eThekwini paragraph is ambiguously worded; IFP’s December statement independently confirms DA stood aside there.

**Code:** src/lib/seats/local-history.ts · newcastle-ifp-support:truce

### REL-45-X · Revised

> Both want to be captain.
> IFP and EFF agree to steer the Richards Bay deal together. Both arrive wearing the captain’s hat. {actor} abandons ship, taking its support with it.

**When:** Test a majority containing IFP + EFF. uMhlathuze.

**Context:** The IFP and EFF’s local cooperation broke down in January 2023. In its public account of talks, the IFP said it rejected an EFF request to lead uMhlathuze. That is the IFP’s account of the negotiations, not an agreed finding about blame.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Previous wording:** Both want to be captain.
IFP and EFF agree to steer the Richards Bay deal together. Both arrive wearing the captain’s hat. {actor} abandons ship, taking its seats.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Avoid declaring the mayoral chair the settled cause of the breakup; keep the attributed competing accounts and frame the joke as a fictional reunion.

**Current backstory — uMhlathuze · January 2023:** The IFP and EFF’s local cooperation broke down in January 2023. In its public account of talks, the IFP said it rejected an EFF request to lead uMhlathuze. That is the IFP’s account of the negotiations, not an agreed finding about blame.

**Sources:** [IFP account of negotiations · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/) · [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/01/29-01-23_EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM-OF-THE-2nd-NATIONAL-PEOPLES-ASSEMBLY.pdf)

**Source checks:** [IFP account of negotiations · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/): checked — IFP, 30 January 2023: its own account describes EFF request to lead uMhlathuze and IFP refusal. Attribution is necessary.; [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/01/29-01-23_EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM-OF-THE-2nd-NATIONAL-PEOPLES-ASSEMBLY.pdf): checked — EFF, 29 January 2023, pages4–5: cut ties with IFP, instructed deputy mayors to resign, criticised IFP. Competing partisan accounts do not settle blame.

**Code:** src/lib/seats/local-history.ts · umhlathuze-ifp-eff:walkout

### REL-45-T · Kept

> The harbour pilot has a plan.
> IFP and EFF agree on the route before debating who steers. The deal docks safely, with every partner aboard.

**When:** Test a majority containing IFP + EFF. uMhlathuze.

**Context:** The IFP and EFF’s local cooperation broke down in January 2023. In its public account of talks, the IFP said it rejected an EFF request to lead uMhlathuze. That is the IFP’s account of the negotiations, not an agreed finding about blame.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Avoid declaring the mayoral chair the settled cause of the breakup; keep the attributed competing accounts and frame the joke as a fictional reunion.

**Current backstory — uMhlathuze · January 2023:** The IFP and EFF’s local cooperation broke down in January 2023. In its public account of talks, the IFP said it rejected an EFF request to lead uMhlathuze. That is the IFP’s account of the negotiations, not an agreed finding about blame.

**Sources:** [IFP account of negotiations · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/) · [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/01/29-01-23_EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM-OF-THE-2nd-NATIONAL-PEOPLES-ASSEMBLY.pdf)

**Source checks:** [IFP account of negotiations · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/): checked — IFP, 30 January 2023: its own account describes EFF request to lead uMhlathuze and IFP refusal. Attribution is necessary.; [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/01/29-01-23_EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM-OF-THE-2nd-NATIONAL-PEOPLES-ASSEMBLY.pdf): checked — EFF, 29 January 2023, pages4–5: cut ties with IFP, instructed deputy mayors to resign, criticised IFP. Competing partisan accounts do not settle blame.

**Code:** src/lib/seats/local-history.ts · umhlathuze-ifp-eff:truce

### REL-46-X · Restored

> The deputy’s card is at the printer.
> DA and IFP agree on the executive. The business cards arrive before the duties are settled. {actor} leaves; the printer charges for another batch.

**When:** Test a majority containing DA + IFP. uMhlathuze.

**Context:** DA councillor Christo Botha became uMhlathuze deputy mayor in August 2023 under IFP mayor Xolani Ngwezi. ACCORD’s timeline records support from IFP, DA and smaller parties, after the earlier EFF deputy’s departure.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Restore a different local pairing and deputy appointment. Fictional feelings and repeated printing are recognisable coalition jokes, not factual allegations. Replace only the incoherent Print once/Govern twice title and give its truce a clearer stationery payoff.

**Current backstory — uMhlathuze · August 2023:** DA councillor Christo Botha became uMhlathuze deputy mayor in August 2023 under IFP mayor Xolani Ngwezi. ACCORD’s timeline records support from IFP, DA and smaller parties, after the earlier EFF deputy’s departure.

**Sources:** [ACCORD · uMhlathuze historical timeline](https://coalitions.accord.org.za/coalition/umhlathuze-2/)

**Source checks:** [ACCORD · uMhlathuze historical timeline](https://coalitions.accord.org.za/coalition/umhlathuze-2/): checked — ACCORD uMhlathuze timeline: Botha deputy from10 August2023; Ngwezi IFP mayor; earlier EFF deputy ended31 January2023. Unrelated headline seat arithmetic on tracker is erroneous and unused.

**Code:** src/lib/seats/local-history.ts · umhlathuze-da-ifp:walkout

### REL-46-T · Restored

> The nameplate can unpack.
> DA and IFP settle the mayor and deputy’s duties before ordering stationery. Everyone stays. The printer takes them off speed dial.

**When:** Test a majority containing DA + IFP. uMhlathuze.

**Context:** DA councillor Christo Botha became uMhlathuze deputy mayor in August 2023 under IFP mayor Xolani Ngwezi. ACCORD’s timeline records support from IFP, DA and smaller parties, after the earlier EFF deputy’s departure.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** Print once. Govern twice.
DA and IFP agree on the mayor and deputy’s duties before ordering stationery. All partners stay. Even the printer approves.

**Game effect:** No support lost.

**Review decision:** Restore a different local pairing and deputy appointment. Fictional feelings and repeated printing are recognisable coalition jokes, not factual allegations. Replace only the incoherent Print once/Govern twice title and give its truce a clearer stationery payoff.

**Current backstory — uMhlathuze · August 2023:** DA councillor Christo Botha became uMhlathuze deputy mayor in August 2023 under IFP mayor Xolani Ngwezi. ACCORD’s timeline records support from IFP, DA and smaller parties, after the earlier EFF deputy’s departure.

**Sources:** [ACCORD · uMhlathuze historical timeline](https://coalitions.accord.org.za/coalition/umhlathuze-2/)

**Source checks:** [ACCORD · uMhlathuze historical timeline](https://coalitions.accord.org.za/coalition/umhlathuze-2/): checked — ACCORD uMhlathuze timeline: Botha deputy from10 August2023; Ngwezi IFP mayor; earlier EFF deputy ended31 January2023. Unrelated headline seat arithmetic on tracker is erroneous and unused.

**Code:** src/lib/seats/local-history.ts · umhlathuze-da-ifp:truce

### REL-47-X · Clarified

> Welcome back. Which badge?
> ANC and ABC arrange a reunion with Mavundla, a former ANC mayor who returned under the ABC badge. Someone uses his old party logo on the invitation. {actor} leaves before the welcome speech.

**When:** Test a majority containing ANC + ABC. uMvoti.

**Context:** ABC leader Philani Mavundla became uMvoti mayor in June 2023 through an agreement with the ANC. He had previously been the municipality’s mayor as an ANC member. The new arrangement displaced the IFP-led administration.

**Meaning:** Invented scene: a fictional invitation uses a returning politician’s former party branding.

**Previous wording:** Welcome back. Which badge?
ANC and ABC arrange the Greytown reunion. Someone uses the old party logo on the invitation. {actor} leaves before the welcome speech.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Provides the changed affiliation needed to understand the wrong-logo joke.

**Current backstory — uMvoti · June 2023:** ABC leader Philani Mavundla became uMvoti mayor in June 2023 through an agreement with the ANC. He had previously been the municipality’s mayor as an ANC member. The new arrangement displaced the IFP-led administration.

**Sources:** [TimesLIVE · 21 Jun 2023](https://www.timeslive.co.za/politics/2023-06-21-philani-mavundla-is-the-mayor-of-umvoti-again/)

**Source checks:** [TimesLIVE · 21 Jun 2023](https://www.timeslive.co.za/politics/2023-06-21-philani-mavundla-is-the-mayor-of-umvoti-again/): checked — TimesLIVE, 21 June 2023: Mavundla returned as ABC mayor with ANC; previously ANC mayor2011–13; displaced IFP–ABC–DA arrangement.

**Code:** src/lib/seats/local-history.ts · umvoti-anc-abc:walkout

### REL-47-T · Kept

> Familiar streets, new agreement.
> ANC and ABC leave the old party badges out of the planning meeting. The roads have not changed their demands. Everyone stays to tackle them.

**When:** Test a majority containing ANC + ABC. uMvoti.

**Context:** ABC leader Philani Mavundla became uMvoti mayor in June 2023 through an agreement with the ANC. He had previously been the municipality’s mayor as an ANC member. The new arrangement displaced the IFP-led administration.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Dated factual basis supported; joke targets political coordination without an unsupported allegation or excessive negativity.

**Current backstory — uMvoti · June 2023:** ABC leader Philani Mavundla became uMvoti mayor in June 2023 through an agreement with the ANC. He had previously been the municipality’s mayor as an ANC member. The new arrangement displaced the IFP-led administration.

**Sources:** [TimesLIVE · 21 Jun 2023](https://www.timeslive.co.za/politics/2023-06-21-philani-mavundla-is-the-mayor-of-umvoti-again/)

**Source checks:** [TimesLIVE · 21 Jun 2023](https://www.timeslive.co.za/politics/2023-06-21-philani-mavundla-is-the-mayor-of-umvoti-again/): checked — TimesLIVE, 21 June 2023: Mavundla returned as ABC mayor with ANC; previously ANC mayor2011–13; displaced IFP–ABC–DA arrangement.

**Code:** src/lib/seats/local-history.ts · umvoti-anc-abc:truce

### REL-48-X · Clarified

> The old chat gets reactivated.
> IFP and ABC reopen their old Greytown group chat. First message: “so, about ABC switching to the ANC…” {actor} leaves before anyone starts typing an apology.

**When:** Test a majority containing IFP + ABC. uMvoti.

**Context:** An IFP–ABC–DA arrangement governed uMvoti after the 2021 election. In June 2023, ABC switched to an agreement with the ANC and its leader Philani Mavundla became mayor.

**Meaning:** Invented scene: an awkward reunion immediately raises the previous change of partners.

**Previous wording:** The old chat gets reactivated.
IFP and ABC reopen their old Greytown group chat. The first message is “so, about June”. {actor} leaves before anyone starts typing an apology.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Replaces the unexplained date “June” with the event itself. Restored humour retained.

**Current backstory — uMvoti · 2021–June 2023:** An IFP–ABC–DA arrangement governed uMvoti after the 2021 election. In June 2023, ABC switched to an agreement with the ANC and its leader Philani Mavundla became mayor.

**Sources:** [TimesLIVE · 21 Jun 2023](https://www.timeslive.co.za/politics/2023-06-21-philani-mavundla-is-the-mayor-of-umvoti-again/)

**Source checks:** [TimesLIVE · 21 Jun 2023](https://www.timeslive.co.za/politics/2023-06-21-philani-mavundla-is-the-mayor-of-umvoti-again/): checked — TimesLIVE, 21 June 2023: Mavundla returned as ABC mayor with ANC; previously ANC mayor2011–13; displaced IFP–ABC–DA arrangement.

**Code:** src/lib/seats/local-history.ts · umvoti-ifp-abc:walkout

### REL-48-T · Restored

> Archive the argument.
> IFP and ABC archive the old messages and agree on a fresh work plan. Nobody restores the backup. Every partner stays.

**When:** Test a majority containing IFP + ABC. uMvoti.

**Context:** An IFP–ABC–DA arrangement governed uMvoti after the 2021 election. In June 2023, ABC switched to an agreement with the ANC and its leader Philani Mavundla became mayor.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Restore the old-partner perspective of Greytown’s switch: IFP–ABC players may not choose ANC and otherwise miss this local history. The awkward reunion invitation and old group chat work without asserting wrongdoing or private facts.

**Current backstory — uMvoti · 2021–June 2023:** An IFP–ABC–DA arrangement governed uMvoti after the 2021 election. In June 2023, ABC switched to an agreement with the ANC and its leader Philani Mavundla became mayor.

**Sources:** [TimesLIVE · 21 Jun 2023](https://www.timeslive.co.za/politics/2023-06-21-philani-mavundla-is-the-mayor-of-umvoti-again/)

**Source checks:** [TimesLIVE · 21 Jun 2023](https://www.timeslive.co.za/politics/2023-06-21-philani-mavundla-is-the-mayor-of-umvoti-again/): checked — TimesLIVE, 21 June 2023: Mavundla returned as ABC mayor with ANC; previously ANC mayor2011–13; displaced IFP–ABC–DA arrangement.

**Code:** src/lib/seats/local-history.ts · umvoti-ifp-abc:truce

### REL-49-X · Clarified

> Heads, we need another meeting.
> DA and EFF remember the mayoral election settled by a coin toss. This time they cannot agree who gets to call it. {actor} leaves. Your seats are still counted normally.

**When:** Test a majority containing DA + EFF. Modimolle-Mookgophong.

**Context:** Marlene van Staden was re-elected Modimolle-Mookgophong mayor in December 2021 after tied votes were settled by a coin toss. EFF and FF+ councillors had supported the DA candidate. This records voting support, not a formal DA–EFF coalition.

**Meaning:** Invented scene: the fictional partners cannot even agree how to organise their old tiebreaker.

**Previous wording:** Heads, we need another meeting.
DA and EFF remember the famous coin toss. This time they cannot agree who gets to call it. {actor} leaves. Your seats are still counted normally.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Explains what the “famous coin toss” decided.

**Current backstory — Modimolle-Mookgophong · 2 December 2021:** Marlene van Staden was re-elected Modimolle-Mookgophong mayor in December 2021 after tied votes were settled by a coin toss. EFF and FF+ councillors had supported the DA candidate. This records voting support, not a formal DA–EFF coalition.

**Sources:** [DA statement · 2 Dec 2021](https://www.da.org.za/2021/12/da-wins-mayor-position-in-modimolle-mookgophong) · [SABC · 2 Dec 2021](https://www.sabcnews.com/sabcnews/das-marlene-van-staden-re-elected-modimolle-mookgophong-mayor-through-toss-of-a-coin/)

**Source checks:** [DA statement · 2 Dec 2021](https://www.da.org.za/2021/12/da-wins-mayor-position-in-modimolle-mookgophong): checked — DA, 2 December 2021: van Staden elected after two tied14–14 rounds with EFF/FF+ support; four previous meetings. Keep attribution for exact number of mayoral rounds.; [SABC · 2 Dec 2021](https://www.sabcnews.com/sabcnews/das-marlene-van-staden-re-elected-modimolle-mookgophong-mayor-through-toss-of-a-coin/): checked — SABC, 2 December 2021: coin toss and combined opposition14 versus ANC14 confirmed. Its fifth-tie wording mixes the sequence of prior sittings/speaker deadlocks; exact mayoral-round detail comes from DA account.

**Code:** src/lib/seats/local-history.ts · modimolle-da-eff:walkout

### REL-49-T · Clarified

> Leave the coin in your pocket.
> DA and EFF remember that a coin once settled the mayor’s job. This time, they agree on the plan before anyone asks for loose change. Everyone keeps supporting the deal.

**When:** Test a majority containing DA + EFF. Modimolle-Mookgophong.

**Context:** Marlene van Staden was re-elected Modimolle-Mookgophong mayor in December 2021 after tied votes were settled by a coin toss. EFF and FF+ councillors had supported the DA candidate. This records voting support, not a formal DA–EFF coalition.

**Meaning:** Invented scene: agreement avoids repeating the historical need for a random tiebreaker.

**Previous wording:** Leave the coin in your pocket.
DA and EFF agree on the work plan before anyone asks for loose change. Everyone keeps supporting the deal. This roll needs no historical tiebreaker.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Places the coin’s historical role directly in the story.

**Current backstory — Modimolle-Mookgophong · 2 December 2021:** Marlene van Staden was re-elected Modimolle-Mookgophong mayor in December 2021 after tied votes were settled by a coin toss. EFF and FF+ councillors had supported the DA candidate. This records voting support, not a formal DA–EFF coalition.

**Sources:** [DA statement · 2 Dec 2021](https://www.da.org.za/2021/12/da-wins-mayor-position-in-modimolle-mookgophong) · [SABC · 2 Dec 2021](https://www.sabcnews.com/sabcnews/das-marlene-van-staden-re-elected-modimolle-mookgophong-mayor-through-toss-of-a-coin/)

**Source checks:** [DA statement · 2 Dec 2021](https://www.da.org.za/2021/12/da-wins-mayor-position-in-modimolle-mookgophong): checked — DA, 2 December 2021: van Staden elected after two tied14–14 rounds with EFF/FF+ support; four previous meetings. Keep attribution for exact number of mayoral rounds.; [SABC · 2 Dec 2021](https://www.sabcnews.com/sabcnews/das-marlene-van-staden-re-elected-modimolle-mookgophong-mayor-through-toss-of-a-coin/): checked — SABC, 2 December 2021: coin toss and combined opposition14 versus ANC14 confirmed. Its fifth-tie wording mixes the sequence of prior sittings/speaker deadlocks; exact mayoral-round detail comes from DA account.

**Code:** src/lib/seats/local-history.ts · modimolle-da-eff:truce

### REL-50-X · Clarified

> The coin needs a subcommittee.
> DA and FF+ remember the tied mayoral election settled by a coin toss. Their emergency coin now needs three sign-offs. {actor} leaves before the procurement form is complete.

**When:** Test a majority containing DA + FF+. Modimolle-Mookgophong.

**Context:** The DA reported that EFF and FF+ councillors backed Marlene van Staden in December 2021, with two mayoral votes tied at 14–14 before a coin toss settled the election. The game keeps its usual majority threshold.

**Meaning:** Invented scene: a fictional emergency tiebreaker gets buried in bureaucracy.

**Previous wording:** The coin needs a subcommittee.
DA and FF+ agree they should be prepared. The proposed tiebreaker coin needs three sign-offs. {actor} leaves before the procurement form is complete.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Explains why the partners are trying to procure a coin.

**Current backstory — Modimolle-Mookgophong · December 2021:** The DA reported that EFF and FF+ councillors backed Marlene van Staden in December 2021, with two mayoral votes tied at 14–14 before a coin toss settled the election. The game keeps its usual majority threshold.

**Sources:** [DA statement · 2 Dec 2021](https://www.da.org.za/2021/12/da-wins-mayor-position-in-modimolle-mookgophong)

**Source checks:** [DA statement · 2 Dec 2021](https://www.da.org.za/2021/12/da-wins-mayor-position-in-modimolle-mookgophong): checked — DA, 2 December 2021: van Staden elected after two tied14–14 rounds with EFF/FF+ support; four previous meetings. Keep attribution for exact number of mayoral rounds.

**Code:** src/lib/seats/local-history.ts · modimolle-da-ff:walkout

### REL-50-T · Clarified

> Agreement beats loose change.
> DA and FF+ remember needing a coin toss to settle a tied mayoral vote. This time they settle the plan in writing. The emergency coin stays in a drawer. Everyone keeps supporting the deal.

**When:** Test a majority containing DA + FF+. Modimolle-Mookgophong.

**Context:** The DA reported that EFF and FF+ councillors backed Marlene van Staden in December 2021, with two mayoral votes tied at 14–14 before a coin toss settled the election. The game keeps its usual majority threshold.

**Meaning:** Invented scene: an agreed plan makes the old tiebreaker unnecessary.

**Previous wording:** Agreement beats loose change.
DA and FF+ settle the plan in writing. The emergency coin stays in a drawer. Everyone keeps supporting the deal.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Explains why an emergency coin exists.

**Current backstory — Modimolle-Mookgophong · December 2021:** The DA reported that EFF and FF+ councillors backed Marlene van Staden in December 2021, with two mayoral votes tied at 14–14 before a coin toss settled the election. The game keeps its usual majority threshold.

**Sources:** [DA statement · 2 Dec 2021](https://www.da.org.za/2021/12/da-wins-mayor-position-in-modimolle-mookgophong)

**Source checks:** [DA statement · 2 Dec 2021](https://www.da.org.za/2021/12/da-wins-mayor-position-in-modimolle-mookgophong): checked — DA, 2 December 2021: van Staden elected after two tied14–14 rounds with EFF/FF+ support; four previous meetings. Keep attribution for exact number of mayoral rounds.

**Code:** src/lib/seats/local-history.ts · modimolle-da-ff:truce

### REL-51-X · Revised

> Two versions of the same meeting.
> DA and EFF arrive with different agendas, each marked official. {actor} leaves to convene another discussion about this discussion.

**When:** Test a majority containing DA + EFF. Thabazimbi.

**Context:** MISTRA records EFF participation in Thabazimbi’s initial DA-led 2021 coalition, followed by its departure in 2022. Prolonged disputes over council leadership preceded the council’s dissolution in 2024.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Remove misleading implication that DA–EFF cooperation lasted until the council was dissolved. Keep the dated sequence and add parliamentary corroboration.

**Current backstory — Thabazimbi · 2021–2024:** MISTRA records EFF participation in Thabazimbi’s initial DA-led 2021 coalition, followed by its departure in 2022. Prolonged disputes over council leadership preceded the council’s dissolution in 2024.

**Sources:** [MISTRA dataset · Thabazimbi TBZ_01 and TBZ_02](https://coalitions.mistra.org.za/) · [eNCA · 4 Oct 2024](https://www.enca.com/news/thabazimbi-municipality-premier-announces-municipal-council-dissolution) · [Parliament oversight report · 2 Oct 2024](https://www.parliament.gov.za/storage/app/media/Docs/atc/ce69ce3c-e5d9-4dc3-b038-1f0cc106e53a.pdf)

**Source checks:** [MISTRA dataset · Thabazimbi TBZ_01 and TBZ_02](https://coalitions.mistra.org.za/): checked — Published MISTRA 2026 download page checked; original vendored municipal_administrations.csv reviewed. EMF_01 lists ANC38/90 and member parties totalling45, classified Minority. TBZ_01 includes EFF; TBZ_02 codes EFF Opposition from October2022. Zip not readable by web tool; CSV provenance retained in repo.; [eNCA · 4 Oct 2024](https://www.enca.com/news/thabazimbi-municipality-premier-announces-municipal-council-dissolution): checked — eNCA, 4 October 2024: dissolution followed extended competing administrations. Parliament’s 2 October2024 oversight report independently confirms original five-party coalition and later dissolution process.; [Parliament oversight report · 2 Oct 2024](https://www.parliament.gov.za/storage/app/media/Docs/atc/ce69ce3c-e5d9-4dc3-b038-1f0cc106e53a.pdf): checked

**Code:** src/lib/seats/local-history.ts · thabazimbi-da-eff:walkout

### REL-51-T · Revised

> One agenda. One room.
> DA and EFF agree on the meeting rules before sitting down. The secretary only needs one set of minutes. Everyone stays.

**When:** Test a majority containing DA + EFF. Thabazimbi.

**Context:** MISTRA records EFF participation in Thabazimbi’s initial DA-led 2021 coalition, followed by its departure in 2022. Prolonged disputes over council leadership preceded the council’s dissolution in 2024.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Remove misleading implication that DA–EFF cooperation lasted until the council was dissolved. Keep the dated sequence and add parliamentary corroboration.

**Current backstory — Thabazimbi · 2021–2024:** MISTRA records EFF participation in Thabazimbi’s initial DA-led 2021 coalition, followed by its departure in 2022. Prolonged disputes over council leadership preceded the council’s dissolution in 2024.

**Sources:** [MISTRA dataset · Thabazimbi TBZ_01 and TBZ_02](https://coalitions.mistra.org.za/) · [eNCA · 4 Oct 2024](https://www.enca.com/news/thabazimbi-municipality-premier-announces-municipal-council-dissolution) · [Parliament oversight report · 2 Oct 2024](https://www.parliament.gov.za/storage/app/media/Docs/atc/ce69ce3c-e5d9-4dc3-b038-1f0cc106e53a.pdf)

**Source checks:** [MISTRA dataset · Thabazimbi TBZ_01 and TBZ_02](https://coalitions.mistra.org.za/): checked — Published MISTRA 2026 download page checked; original vendored municipal_administrations.csv reviewed. EMF_01 lists ANC38/90 and member parties totalling45, classified Minority. TBZ_01 includes EFF; TBZ_02 codes EFF Opposition from October2022. Zip not readable by web tool; CSV provenance retained in repo.; [eNCA · 4 Oct 2024](https://www.enca.com/news/thabazimbi-municipality-premier-announces-municipal-council-dissolution): checked — eNCA, 4 October 2024: dissolution followed extended competing administrations. Parliament’s 2 October2024 oversight report independently confirms original five-party coalition and later dissolution process.; [Parliament oversight report · 2 Oct 2024](https://www.parliament.gov.za/storage/app/media/Docs/atc/ce69ce3c-e5d9-4dc3-b038-1f0cc106e53a.pdf): checked

**Code:** src/lib/seats/local-history.ts · thabazimbi-da-eff:truce

### REL-52-X · Clarified

> The office swap hits a snag.
> DA and NCM agree it is time to swap the mayor and Speaker’s offices. Both want to keep the chair with good back support. {actor} leaves before moving day.

**When:** Test a majority containing DA + NCM. NAMA KHOI.

**Context:** On 9 July 2024, the DA announced that Rodney Kritzinger and NCM councillor Gustav Bock had exchanged the mayor and speaker positions. The party said this implemented the rotation agreed with the Namakwa Civic Movement in 2021. This is the announcement date, not a verified date of the office swap.

**Meaning:** Invented scene: an agreed role swap is fictionally derailed by office furniture.

**Previous wording:** The office swap hits a snag.
DA and NCM agree it is time to swap offices. Both want to keep the chair with good back support. {actor} leaves before moving day.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Names the roles behind the office swap.

**Current backstory — Nama Khoi · announced 9 July 2024:** On 9 July 2024, the DA announced that Rodney Kritzinger and NCM councillor Gustav Bock had exchanged the mayor and speaker positions. The party said this implemented the rotation agreed with the Namakwa Civic Movement in 2021. This is the announcement date, not a verified date of the office swap.

**Sources:** [DA statement · 9 Jul 2024](https://nc.da.org.za/2024/07/da-takes-up-mayoral-position-in-nama-khoi-coalition-municipality)

**Source checks:** [DA statement · 9 Jul 2024](https://nc.da.org.za/2024/07/da-takes-up-mayoral-position-in-nama-khoi-coalition-municipality): checked — DA, 9 July 2024: announces Kritzinger/Bock mayor–speaker rotation under2021 agreement. Does not specify effective date; existing qualified announcement date retained.

**Code:** src/lib/seats/local-history.ts · nama-khoi-da-ncm:walkout

### REL-52-T · Clarified

> Musical chairs, as scheduled.
> DA and NCM swap the mayor and Speaker roles exactly as agreed. Even the pot plants make it to the right offices. Everyone stays in the deal.

**When:** Test a majority containing DA + NCM. NAMA KHOI.

**Context:** On 9 July 2024, the DA announced that Rodney Kritzinger and NCM councillor Gustav Bock had exchanged the mayor and speaker positions. The party said this implemented the rotation agreed with the Namakwa Civic Movement in 2021. This is the announcement date, not a verified date of the office swap.

**Meaning:** Invented scene: the agreed role rotation runs smoothly.

**Previous wording:** Musical chairs, as scheduled.
DA and NCM swap roles exactly as agreed. Even the pot plants make it to the right offices. Everyone stays in the deal.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Names the roles rather than relying on the backstory.

**Current backstory — Nama Khoi · announced 9 July 2024:** On 9 July 2024, the DA announced that Rodney Kritzinger and NCM councillor Gustav Bock had exchanged the mayor and speaker positions. The party said this implemented the rotation agreed with the Namakwa Civic Movement in 2021. This is the announcement date, not a verified date of the office swap.

**Sources:** [DA statement · 9 Jul 2024](https://nc.da.org.za/2024/07/da-takes-up-mayoral-position-in-nama-khoi-coalition-municipality)

**Source checks:** [DA statement · 9 Jul 2024](https://nc.da.org.za/2024/07/da-takes-up-mayoral-position-in-nama-khoi-coalition-municipality): checked — DA, 9 July 2024: announces Kritzinger/Bock mayor–speaker rotation under2021 agreement. Does not specify effective date; existing qualified announcement date retained.

**Code:** src/lib/seats/local-history.ts · nama-khoi-da-ncm:truce

### REL-53-X · Clarified

> The deputy chair squeaks.
> DA and UDM discuss who sits where. The deputy mayor’s chair remembers the last no-confidence vote and starts squeaking. {actor} leaves the deal.

**When:** Test a majority containing DA + UDM. Nelson Mandela Bay.

**Context:** On 24 August 2017, a no-confidence vote removed UDM deputy mayor Mongameli Bobani in Nelson Mandela Bay. The DA’s statement recorded support for the motion from its ACDP and COPE partners. This was a dispute within the governing coalition.

**Meaning:** Invented scene: the furniture dreads another removal vote.

**Previous wording:** The deputy chair squeaks.
DA and UDM discuss who sits where. The deputy mayor’s chair makes a noise suspiciously like “remember 2017?” {actor} leaves the deal.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Replaces “remember 2017?” with the event being remembered.

**Current backstory — Nelson Mandela Bay · August 2017:** On 24 August 2017, a no-confidence vote removed UDM deputy mayor Mongameli Bobani in Nelson Mandela Bay. The DA’s statement recorded support for the motion from its ACDP and COPE partners. This was a dispute within the governing coalition.

**Sources:** [DA statement · 24 Aug 2017](https://www.da.org.za/2017/08/da-welcomes-successful-motion-no-confidence-bobani)

**Source checks:** [Nelson Mandela Bay annual report · 2016/17](https://www.nelsonmandelabay.gov.za/DataRepository/Documents/adopted-2016-17-annual-report.pdf): unavailable-404; [DA statement · 24 Aug 2017](https://www.da.org.za/2017/08/da-welcomes-successful-motion-no-confidence-bobani): verified

**Code:** src/lib/seats/local-history.ts · bay-da-udm:walkout

### REL-53-T · Revised

> A chair with clear instructions.
> DA and UDM agree the deputy’s responsibilities before the meeting. The chair goes back to being furniture. Every partner stays.

**When:** Test a majority containing DA + UDM. Nelson Mandela Bay.

**Context:** On 24 August 2017, a no-confidence vote removed UDM deputy mayor Mongameli Bobani in Nelson Mandela Bay. The DA’s statement recorded support for the motion from its ACDP and COPE partners. This was a dispute within the governing coalition.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** A chair with clear instructions.
DA and UDM agree the deputy’s responsibilities before the meeting. The furniture stays put. So does every coalition partner.

**Game effect:** No support lost.

**Review decision:** Restore personification of a chair; it does not diagnose a person. Keep the corrected dated vote and working source.

**Current backstory — Nelson Mandela Bay · August 2017:** On 24 August 2017, a no-confidence vote removed UDM deputy mayor Mongameli Bobani in Nelson Mandela Bay. The DA’s statement recorded support for the motion from its ACDP and COPE partners. This was a dispute within the governing coalition.

**Sources:** [DA statement · 24 Aug 2017](https://www.da.org.za/2017/08/da-welcomes-successful-motion-no-confidence-bobani)

**Source checks:** [Nelson Mandela Bay annual report · 2016/17](https://www.nelsonmandelabay.gov.za/DataRepository/Documents/adopted-2016-17-annual-report.pdf): unavailable-404; [DA statement · 24 Aug 2017](https://www.da.org.za/2017/08/da-welcomes-successful-motion-no-confidence-bobani): verified

**Code:** src/lib/seats/local-history.ts · bay-da-udm:truce

### REL-54-X · Revised

> The reunion needs another appendix.
> DA and FF+ reopen the George agreement. The appendices have developed their own appendices. {actor} leaves before the stapler gives up.

**When:** Test a majority containing DA + FF+. George.

**Context:** In June 2024, the DA announced it was ending its George coalition with the FF+; the FF+ disputed whether the termination procedure was complete. In November 2025, the DA announced a new agreement with FF+ and ACDP, including the deputy mayor’s position for FF+. These are dated announcements, not a claim about the current administration.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Attribute contested termination announcement and retain FF+ procedural response; distinguish announced allocation from current officeholding.

**Current backstory — George · June 2024–November 2025:** In June 2024, the DA announced it was ending its George coalition with the FF+; the FF+ disputed whether the termination procedure was complete. In November 2025, the DA announced a new agreement with FF+ and ACDP, including the deputy mayor’s position for FF+. These are dated announcements, not a claim about the current administration.

**Sources:** [George Herald · 27 Jun 2024](https://www.georgeherald.com/News/Article/Politics/da-exits-coalition-with-ff-plus-in-george-202406270418) · [DA agreement announcement · 18 Nov 2025](https://www.da.org.za/2025/11/stability-for-george-council-as-new-coalition-agreement-signed)

**Source checks:** [George Herald · 27 Jun 2024](https://www.georgeherald.com/News/Article/Politics/da-exits-coalition-with-ff-plus-in-george-202406270418): verified; [DA agreement announcement · 18 Nov 2025](https://www.da.org.za/2025/11/stability-for-george-council-as-new-coalition-agreement-signed): verified

**Code:** src/lib/seats/local-history.ts · george-da-ff:walkout

### REL-54-T · Revised

> Back together. In writing.
> DA and FF+ sign the reunion agreement and file the old argument under lessons learned. Everyone stays. The stapler survives.

**When:** Test a majority containing DA + FF+. George.

**Context:** In June 2024, the DA announced it was ending its George coalition with the FF+; the FF+ disputed whether the termination procedure was complete. In November 2025, the DA announced a new agreement with FF+ and ACDP, including the deputy mayor’s position for FF+. These are dated announcements, not a claim about the current administration.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Attribute contested termination announcement and retain FF+ procedural response; distinguish announced allocation from current officeholding.

**Current backstory — George · June 2024–November 2025:** In June 2024, the DA announced it was ending its George coalition with the FF+; the FF+ disputed whether the termination procedure was complete. In November 2025, the DA announced a new agreement with FF+ and ACDP, including the deputy mayor’s position for FF+. These are dated announcements, not a claim about the current administration.

**Sources:** [George Herald · 27 Jun 2024](https://www.georgeherald.com/News/Article/Politics/da-exits-coalition-with-ff-plus-in-george-202406270418) · [DA agreement announcement · 18 Nov 2025](https://www.da.org.za/2025/11/stability-for-george-council-as-new-coalition-agreement-signed)

**Source checks:** [George Herald · 27 Jun 2024](https://www.georgeherald.com/News/Article/Politics/da-exits-coalition-with-ff-plus-in-george-202406270418): verified; [DA agreement announcement · 18 Nov 2025](https://www.da.org.za/2025/11/stability-for-george-council-as-new-coalition-agreement-signed): verified

**Code:** src/lib/seats/local-history.ts · george-da-ff:truce

### REL-55-X · Clarified

> The portfolio comes with paperwork.
> DA and ACDP settle who gets the Corporate Services portfolio, then see the pile of forms that comes with it. {actor} leaves to renegotiate the meaning of “shared responsibility”.

**When:** Test a majority containing DA + ACDP. George.

**Context:** The DA’s November 2025 George coalition announcement named ACDP and FF+ as partners. It allocated the corporate-services mayoral-committee portfolio to ACDP. This is the announced agreement at that date.

**Meaning:** Invented scene: an agreed political role brings an unwelcome pile of fictional paperwork.

**Previous wording:** The portfolio comes with paperwork.
DA and ACDP settle the title, then see the pile of forms that comes with it. {actor} leaves to renegotiate the meaning of “shared responsibility”.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Identifies the title being allocated. Restored humour retained.

**Current backstory — George · 18 November 2025:** The DA’s November 2025 George coalition announcement named ACDP and FF+ as partners. It allocated the corporate-services mayoral-committee portfolio to ACDP. This is the announced agreement at that date.

**Sources:** [DA agreement announcement · 18 Nov 2025](https://www.da.org.za/2025/11/stability-for-george-council-as-new-coalition-agreement-signed)

**Source checks:** [DA agreement announcement · 18 Nov 2025](https://www.da.org.za/2025/11/stability-for-george-council-as-new-coalition-agreement-signed): verified

**Code:** src/lib/seats/local-history.ts · george-da-acdp:walkout

### REL-55-T · Restored

> The paperwork gets a partner.
> DA and ACDP divide the work as well as the titles. The corporate-services inbox has an owner. Everyone stays.

**When:** Test a majority containing DA + ACDP. George.

**Context:** The DA’s November 2025 George coalition announcement named ACDP and FF+ as partners. It allocated the corporate-services mayoral-committee portfolio to ACDP. This is the announced agreement at that date.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** Someone actually takes the forms.
DA and ACDP divide the work as well as the titles. The corporate-services inbox finally has an owner. Everyone stays.

**Game effect:** No support lost.

**Review decision:** Restore a distinct ACDP pairing and documented portfolio deal. Prayers answered by Corporate Services is a clear, mild political-party joke; religious wordplay alone is not a reason to cut it. Remove the suggestion that the inbox previously had no owner.

**Current backstory — George · 18 November 2025:** The DA’s November 2025 George coalition announcement named ACDP and FF+ as partners. It allocated the corporate-services mayoral-committee portfolio to ACDP. This is the announced agreement at that date.

**Sources:** [DA agreement announcement · 18 Nov 2025](https://www.da.org.za/2025/11/stability-for-george-council-as-new-coalition-agreement-signed)

**Source checks:** [DA agreement announcement · 18 Nov 2025](https://www.da.org.za/2025/11/stability-for-george-council-as-new-coalition-agreement-signed): verified

**Code:** src/lib/seats/local-history.ts · george-da-acdp:truce

### REL-56-X · Clarified

> The campaign leaflet resurfaces.
> ANC and FF+ agree to work together. Someone leaves a campaign leaflet criticising the other party on the meeting table. {actor} leaves before page two.

**When:** Test a majority containing ANC + FF+. Oudtshoorn.

**Context:** FF+ councillor Johan Allers became Oudtshoorn mayor on 1 August 2024 under a new arrangement including ANC, PA and local parties, after FF+ backed the July removal of DA mayor Chris Macpherson. ANC councillor Mziwoxolo Tyatya became deputy mayor.

**Meaning:** Invented scene: a fictional campaign attack becomes awkward after the parties agree to cooperate.

**Previous wording:** The campaign leaflet resurfaces.
ANC and FF+ agree to work together. Someone leaves last election’s campaign leaflet on the meeting table. {actor} leaves before page two.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Explains why the leaflet is embarrassing.

**Current backstory — Oudtshoorn · August 2024:** FF+ councillor Johan Allers became Oudtshoorn mayor on 1 August 2024 under a new arrangement including ANC, PA and local parties, after FF+ backed the July removal of DA mayor Chris Macpherson. ANC councillor Mziwoxolo Tyatya became deputy mayor.

**Sources:** [SABC · 1 Aug 2024](https://www.sabcnews.com/sabcnews/ff-plus-cements-alliance-with-anc-in-oudtshoorn-municipality/)

**Source checks:** [SABC · 1 Aug 2024](https://www.sabcnews.com/sabcnews/ff-plus-cements-alliance-with-anc-in-oudtshoorn-municipality/): verified

**Code:** src/lib/seats/local-history.ts · oudtshoorn-anc-ff:walkout

### REL-56-T · Revised

> The ostriches are less surprised.
> ANC and FF+ agree on the town’s repair plan. The local ostriches have seen enough politics to keep walking. Every partner stays.

**When:** Test a majority containing ANC + FF+. Oudtshoorn.

**Context:** FF+ councillor Johan Allers became Oudtshoorn mayor on 1 August 2024 under a new arrangement including ANC, PA and local parties, after FF+ backed the July removal of DA mayor Chris Macpherson. ANC councillor Mziwoxolo Tyatya became deputy mayor.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Retain stronger local ostrich satire while supplying exact verified election date and the preceding FF+ vote, so removed duplicate history is not lost.

**Current backstory — Oudtshoorn · August 2024:** FF+ councillor Johan Allers became Oudtshoorn mayor on 1 August 2024 under a new arrangement including ANC, PA and local parties, after FF+ backed the July removal of DA mayor Chris Macpherson. ANC councillor Mziwoxolo Tyatya became deputy mayor.

**Sources:** [SABC · 1 Aug 2024](https://www.sabcnews.com/sabcnews/ff-plus-cements-alliance-with-anc-in-oudtshoorn-municipality/)

**Source checks:** [SABC · 1 Aug 2024](https://www.sabcnews.com/sabcnews/ff-plus-cements-alliance-with-anc-in-oudtshoorn-municipality/): verified

**Code:** src/lib/seats/local-history.ts · oudtshoorn-anc-ff:truce

### REL-57-X · Restored

> The folder is called FINAL, again.
> DA and FF+ open their old Oudtshoorn agreement. The revision history is longer than the document. {actor} leaves before accepting the changes.

**When:** Test a majority containing DA + FF+. Oudtshoorn.

**Context:** In July 2024 the FF+ backed a no-confidence motion against DA mayor Chris Macpherson. Its Johan Allers became mayor in August with ANC and other parties, ending the earlier DA–FF+ partnership in Oudtshoorn.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Restore the former-partner side of Oudtshoorn’s change of government. DA–FF+ players do not necessarily select the ANC and therefore may never encounter the retained ANC–FF+ story. Keep local feathers and the FINAL-document joke; drop the claim that the real breakup was predictable.

**Current backstory — Oudtshoorn · July–August 2024:** In July 2024 the FF+ backed a no-confidence motion against DA mayor Chris Macpherson. Its Johan Allers became mayor in August with ANC and other parties, ending the earlier DA–FF+ partnership in Oudtshoorn.

**Sources:** [SABC · 1 Aug 2024](https://www.sabcnews.com/sabcnews/ff-plus-cements-alliance-with-anc-in-oudtshoorn-municipality/)

**Source checks:** [SABC · 1 Aug 2024](https://www.sabcnews.com/sabcnews/ff-plus-cements-alliance-with-anc-in-oudtshoorn-municipality/): verified

**Code:** src/lib/seats/local-history.ts · oudtshoorn-da-ff:walkout

### REL-57-T · Restored

> A fresh page in the Karoo.
> DA and FF+ write down what they agree on today. Nobody pastes in the old argument. Everyone keeps supporting the deal.

**When:** Test a majority containing DA + FF+. Oudtshoorn.

**Context:** In July 2024 the FF+ backed a no-confidence motion against DA mayor Chris Macpherson. Its Johan Allers became mayor in August with ANC and other parties, ending the earlier DA–FF+ partnership in Oudtshoorn.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** A fresh page in the Karoo.
DA and FF+ write down what they agree on today. Nobody pastes in the old argument. All your seats stay in the deal.

**Game effect:** No support lost.

**Review decision:** Restore the former-partner side of Oudtshoorn’s change of government. DA–FF+ players do not necessarily select the ANC and therefore may never encounter the retained ANC–FF+ story. Keep local feathers and the FINAL-document joke; drop the claim that the real breakup was predictable.

**Current backstory — Oudtshoorn · July–August 2024:** In July 2024 the FF+ backed a no-confidence motion against DA mayor Chris Macpherson. Its Johan Allers became mayor in August with ANC and other parties, ending the earlier DA–FF+ partnership in Oudtshoorn.

**Sources:** [SABC · 1 Aug 2024](https://www.sabcnews.com/sabcnews/ff-plus-cements-alliance-with-anc-in-oudtshoorn-municipality/)

**Source checks:** [SABC · 1 Aug 2024](https://www.sabcnews.com/sabcnews/ff-plus-cements-alliance-with-anc-in-oudtshoorn-municipality/): verified

**Code:** src/lib/seats/local-history.ts · oudtshoorn-da-ff:truce

### REL-58-X · Kept

> The coalition changes direction.
> ANC and GOOD set a course together. At the next junction, both announce they know a better route. {actor} leaves with the map.

**When:** Test a majority containing ANC + GOOD. Theewaterskloof.

**Context:** GOOD helped the ANC and PA govern Theewaterskloof after the 2021 election. In August 2024, GOOD changed alignment and backed the DA, resulting in new mayoral and speaker appointments.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Retain: dated source supports the factual basis; metaphor is intelligible and not an allegation of personal misconduct.

**Current backstory — Theewaterskloof · 2021–August 2024:** GOOD helped the ANC and PA govern Theewaterskloof after the 2021 election. In August 2024, GOOD changed alignment and backed the DA, resulting in new mayoral and speaker appointments.

**Sources:** [GroundUp · Theewaterskloof coalition history, 2025](https://groundup.org.za/article/out-of-the-black-and-into-the-red-theewaterskloof-municipalitys-rapid-decline/)

**Source checks:** [GroundUp · Theewaterskloof coalition history, 2025](https://groundup.org.za/article/out-of-the-black-and-into-the-red-theewaterskloof-municipalitys-rapid-decline/): verified

**Code:** src/lib/seats/local-history.ts · theewaterskloof-anc-good:walkout

### REL-58-T · Kept

> Same route, fewer detours.
> ANC and GOOD agree on the destination before setting off. The service plan survives the journey. Everyone stays.

**When:** Test a majority containing ANC + GOOD. Theewaterskloof.

**Context:** GOOD helped the ANC and PA govern Theewaterskloof after the 2021 election. In August 2024, GOOD changed alignment and backed the DA, resulting in new mayoral and speaker appointments.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Retain: dated source supports the factual basis; metaphor is intelligible and not an allegation of personal misconduct.

**Current backstory — Theewaterskloof · 2021–August 2024:** GOOD helped the ANC and PA govern Theewaterskloof after the 2021 election. In August 2024, GOOD changed alignment and backed the DA, resulting in new mayoral and speaker appointments.

**Sources:** [GroundUp · Theewaterskloof coalition history, 2025](https://groundup.org.za/article/out-of-the-black-and-into-the-red-theewaterskloof-municipalitys-rapid-decline/)

**Source checks:** [GroundUp · Theewaterskloof coalition history, 2025](https://groundup.org.za/article/out-of-the-black-and-into-the-red-theewaterskloof-municipalitys-rapid-decline/): verified

**Code:** src/lib/seats/local-history.ts · theewaterskloof-anc-good:truce

### REL-59-X · Kept

> The seating chart needs updating.
> DA and GOOD sit down on the same side of the table. Their briefing notes still say “the opposition”. {actor} leaves to request a corrected copy.

**When:** Test a majority containing DA + GOOD. Theewaterskloof.

**Context:** GOOD backed a DA-led arrangement in Theewaterskloof in August 2024 after leaving its alignment with ANC and PA. GOOD’s John Michels became speaker and the DA’s Lincoln de Bruyn became mayor.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Retain: dated source supports the factual basis; metaphor is intelligible and not an allegation of personal misconduct.

**Current backstory — Theewaterskloof · August 2024:** GOOD backed a DA-led arrangement in Theewaterskloof in August 2024 after leaving its alignment with ANC and PA. GOOD’s John Michels became speaker and the DA’s Lincoln de Bruyn became mayor.

**Sources:** [GroundUp · Theewaterskloof coalition history, 2025](https://groundup.org.za/article/out-of-the-black-and-into-the-red-theewaterskloof-municipalitys-rapid-decline/)

**Source checks:** [GroundUp · Theewaterskloof coalition history, 2025](https://groundup.org.za/article/out-of-the-black-and-into-the-red-theewaterskloof-municipalitys-rapid-decline/): verified

**Code:** src/lib/seats/local-history.ts · theewaterskloof-da-good:walkout

### REL-59-T · Kept

> A GOOD day for the minutes.
> DA and GOOD update the seating chart and agree on the water-services agenda. The meeting ends without another furniture rearrangement.

**When:** Test a majority containing DA + GOOD. Theewaterskloof.

**Context:** GOOD backed a DA-led arrangement in Theewaterskloof in August 2024 after leaving its alignment with ANC and PA. GOOD’s John Michels became speaker and the DA’s Lincoln de Bruyn became mayor.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Retain: dated source supports the factual basis; metaphor is intelligible and not an allegation of personal misconduct.

**Current backstory — Theewaterskloof · August 2024:** GOOD backed a DA-led arrangement in Theewaterskloof in August 2024 after leaving its alignment with ANC and PA. GOOD’s John Michels became speaker and the DA’s Lincoln de Bruyn became mayor.

**Sources:** [GroundUp · Theewaterskloof coalition history, 2025](https://groundup.org.za/article/out-of-the-black-and-into-the-red-theewaterskloof-municipalitys-rapid-decline/)

**Source checks:** [GroundUp · Theewaterskloof coalition history, 2025](https://groundup.org.za/article/out-of-the-black-and-into-the-red-theewaterskloof-municipalitys-rapid-decline/): verified

**Code:** src/lib/seats/local-history.ts · theewaterskloof-da-good:truce

### REL-60-X · Revised

> Same town. Different priorities.
> DA and PDC agree on the destination, then disagree on which repair should come first. {actor} leaves the deal. The timetable goes out with the tide.

**When:** Test a majority containing DA + PDC. Bitou.

**Context:** The DA, Plett Democratic Congress and Active United Front formed Bitou’s post-2021 coalition. PDC left in February 2024. Its Claude Terblanche was elected mayor on 2 February under an arrangement including ANC, PA and Ikhwezi Political Movement.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Previous wording:** The sea view is under negotiation.
DA and PDC agree on a fresh Plett deal. The discussion reaches who gets the office with the sea view. {actor} leaves before low tide.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Keep distinctive local-party kingmaker episode, date it precisely and retain full membership after duplicate is cut. Replace fictional personal-office motive with legitimate disagreement over service priorities.

**Current backstory — Bitou · 2021–February 2024:** The DA, Plett Democratic Congress and Active United Front formed Bitou’s post-2021 coalition. PDC left in February 2024. Its Claude Terblanche was elected mayor on 2 February under an arrangement including ANC, PA and Ikhwezi Political Movement.

**Sources:** [Daily Maverick · 19 Aug 2024](https://www.dailymaverick.co.za/article/2024-08-19-council-fracas-in-bitou-as-governing-anc-led-coalition-collapses/) · [Knysna-Plett Herald · 2 Feb 2024](https://www.knysnaplettherald.com/News/Article/Politics/bitou-s-new-mayor-confirmed-202402020122)

**Source checks:** [Daily Maverick · 19 Aug 2024](https://www.dailymaverick.co.za/article/2024-08-19-council-fracas-in-bitou-as-governing-anc-led-coalition-collapses/): verified; [Knysna-Plett Herald · 2 Feb 2024](https://www.knysnaplettherald.com/News/Article/Politics/bitou-s-new-mayor-confirmed-202402020122): verified

**Code:** src/lib/seats/local-history.ts · bitou-da-pdc:walkout

### REL-60-T · Revised

> The view can wait.
> DA and PDC agree which repairs come first and put dates beside them. Everyone stays. The sea remains entirely unimpressed.

**When:** Test a majority containing DA + PDC. Bitou.

**Context:** The DA, Plett Democratic Congress and Active United Front formed Bitou’s post-2021 coalition. PDC left in February 2024. Its Claude Terblanche was elected mayor on 2 February under an arrangement including ANC, PA and Ikhwezi Political Movement.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** The view can wait.
DA and PDC agree the town needs a work plan before an office tour. Everyone stays. The sea remains entirely unimpressed.

**Game effect:** No support lost.

**Review decision:** Keep distinctive local-party kingmaker episode, date it precisely and retain full membership after duplicate is cut. Replace fictional personal-office motive with legitimate disagreement over service priorities.

**Current backstory — Bitou · 2021–February 2024:** The DA, Plett Democratic Congress and Active United Front formed Bitou’s post-2021 coalition. PDC left in February 2024. Its Claude Terblanche was elected mayor on 2 February under an arrangement including ANC, PA and Ikhwezi Political Movement.

**Sources:** [Daily Maverick · 19 Aug 2024](https://www.dailymaverick.co.za/article/2024-08-19-council-fracas-in-bitou-as-governing-anc-led-coalition-collapses/) · [Knysna-Plett Herald · 2 Feb 2024](https://www.knysnaplettherald.com/News/Article/Politics/bitou-s-new-mayor-confirmed-202402020122)

**Source checks:** [Daily Maverick · 19 Aug 2024](https://www.dailymaverick.co.za/article/2024-08-19-council-fracas-in-bitou-as-governing-anc-led-coalition-collapses/): verified; [Knysna-Plett Herald · 2 Feb 2024](https://www.knysnaplettherald.com/News/Article/Politics/bitou-s-new-mayor-confirmed-202402020122): verified

**Code:** src/lib/seats/local-history.ts · bitou-da-pdc:truce

### REL-61-X · Restored

> Checkout time for the coalition.
> ANC and PA book the coalition’s future. One reads the booking as long-term, the other as a weekend stay. {actor} checks out of the deal.

**When:** Test a majority containing ANC + PA. Bitou.

**Context:** In February 2024, ANC, PA, PDC and IPM formed the arrangement that replaced Bitou’s DA-led administration. PDC councillor Claude Terblanche became mayor. The arrangement changed again later that year.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Previous wording:** Checkout time for the coalition.
ANC and PA book the coalition’s future. One reads the booking as long-term, the other as a weekend stay. {actor} checks out with its seats.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Restore the ANC–PA pairing and the formation side of Bitou’s 2024 realignment; the retained DA–PDC story describes the displaced arrangement. Holiday accommodation is recognisable Plett humour. Make the invented booking metaphor clear and avoid a supposed real checkout deadline.

**Current backstory — Bitou · February 2024:** In February 2024, ANC, PA, PDC and IPM formed the arrangement that replaced Bitou’s DA-led administration. PDC councillor Claude Terblanche became mayor. The arrangement changed again later that year.

**Sources:** [Daily Maverick · 19 Aug 2024](https://www.dailymaverick.co.za/article/2024-08-19-council-fracas-in-bitou-as-governing-anc-led-coalition-collapses/)

**Source checks:** [Daily Maverick · 19 Aug 2024](https://www.dailymaverick.co.za/article/2024-08-19-council-fracas-in-bitou-as-governing-anc-led-coalition-collapses/): verified

**Code:** src/lib/seats/local-history.ts · bitou-anc-pa:walkout

### REL-61-T · Restored

> The booking gets extended.
> ANC and PA agree the work needs more than a weekend. Everyone stays to finish the plan. Nobody asks for an early checkout.

**When:** Test a majority containing ANC + PA. Bitou.

**Context:** In February 2024, ANC, PA, PDC and IPM formed the arrangement that replaced Bitou’s DA-led administration. PDC councillor Claude Terblanche became mayor. The arrangement changed again later that year.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Restore the ANC–PA pairing and the formation side of Bitou’s 2024 realignment; the retained DA–PDC story describes the displaced arrangement. Holiday accommodation is recognisable Plett humour. Make the invented booking metaphor clear and avoid a supposed real checkout deadline.

**Current backstory — Bitou · February 2024:** In February 2024, ANC, PA, PDC and IPM formed the arrangement that replaced Bitou’s DA-led administration. PDC councillor Claude Terblanche became mayor. The arrangement changed again later that year.

**Sources:** [Daily Maverick · 19 Aug 2024](https://www.dailymaverick.co.za/article/2024-08-19-council-fracas-in-bitou-as-governing-anc-led-coalition-collapses/)

**Source checks:** [Daily Maverick · 19 Aug 2024](https://www.dailymaverick.co.za/article/2024-08-19-council-fracas-in-bitou-as-governing-anc-led-coalition-collapses/): verified

**Code:** src/lib/seats/local-history.ts · bitou-anc-pa:truce

### REL-62-X · Kept

> The nameplate is still warm.
> ANC and PA order a permanent mayoral nameplate. The person fitting it asks whether they are sure. {actor} leaves before the first screw goes in.

**When:** Test a majority containing ANC + PA. Beaufort West.

**Context:** Beaufort West’s post-2021 coalition included ANC, PA and Karoo Democratic Force. Several mayoral changes followed; by February 2024, reporting described another change as the municipality’s fifth mayor in under three years.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Retain: dated source supports the factual basis; metaphor is intelligible and not an allegation of personal misconduct.

**Current backstory — Beaufort West · 2021–2024:** Beaufort West’s post-2021 coalition included ANC, PA and Karoo Democratic Force. Several mayoral changes followed; by February 2024, reporting described another change as the municipality’s fifth mayor in under three years.

**Sources:** [GroundUp · Beaufort West political history, 2026](https://groundup.org.za/article/beaufort-west/) · [Daily Maverick · 12 Feb 2024](https://www.dailymaverick.co.za/article/2024-02-12-mayor-5-for-beaufort-west-gayton-mckenzie-announces-leadership-changes/)

**Source checks:** [GroundUp · Beaufort West political history, 2026](https://groundup.org.za/article/beaufort-west/): verified; [Daily Maverick · 12 Feb 2024](https://www.dailymaverick.co.za/article/2024-02-12-mayor-5-for-beaufort-west-gayton-mckenzie-announces-leadership-changes/): verified

**Code:** src/lib/seats/local-history.ts · beaufort-west-anc-pa:walkout

### REL-62-T · Kept

> Same nameplate tomorrow.
> ANC and PA agree on the plan and stick to it. The council carpenter gets a day off from changing signs. Everyone stays.

**When:** Test a majority containing ANC + PA. Beaufort West.

**Context:** Beaufort West’s post-2021 coalition included ANC, PA and Karoo Democratic Force. Several mayoral changes followed; by February 2024, reporting described another change as the municipality’s fifth mayor in under three years.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Retain: dated source supports the factual basis; metaphor is intelligible and not an allegation of personal misconduct.

**Current backstory — Beaufort West · 2021–2024:** Beaufort West’s post-2021 coalition included ANC, PA and Karoo Democratic Force. Several mayoral changes followed; by February 2024, reporting described another change as the municipality’s fifth mayor in under three years.

**Sources:** [GroundUp · Beaufort West political history, 2026](https://groundup.org.za/article/beaufort-west/) · [Daily Maverick · 12 Feb 2024](https://www.dailymaverick.co.za/article/2024-02-12-mayor-5-for-beaufort-west-gayton-mckenzie-announces-leadership-changes/)

**Source checks:** [GroundUp · Beaufort West political history, 2026](https://groundup.org.za/article/beaufort-west/): verified; [Daily Maverick · 12 Feb 2024](https://www.dailymaverick.co.za/article/2024-02-12-mayor-5-for-beaufort-west-gayton-mckenzie-announces-leadership-changes/): verified

**Code:** src/lib/seats/local-history.ts · beaufort-west-anc-pa:truce

### REL-63-X · Clarified

> The comeback needs a map.
> DA and Cederberg First plan a coalition comeback. The route map has a turn marked “where we fell out last time”. {actor} takes the off-ramp.

**When:** Test a majority containing DA + CFRA. Cederberg.

**Context:** Cederberg First, DA and FF+ formed a coalition after the 2021 election. ANC and PA took over in July 2022. A by-election win gave the earlier partners enough votes to return Cederberg First’s Ruben Richards as mayor in March 2023.

**Meaning:** Invented scene: the old coalition’s problems reappear on a fictional reunion route.

**Previous wording:** The comeback needs a map.
DA and Cederberg First attempt the reunion route. They disagree at the first turn marked “last time”. {actor} takes the off-ramp.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Explains the comeback and replaces a vague “last time” sign with its meaning.

**Current backstory — Cederberg · 2021–March 2023:** Cederberg First, DA and FF+ formed a coalition after the 2021 election. ANC and PA took over in July 2022. A by-election win gave the earlier partners enough votes to return Cederberg First’s Ruben Richards as mayor in March 2023.

**Sources:** [Son · 2 Mar 2023](https://www.son.co.za/nuus/kaapse-nuus/richards-weer-cederberg-mayor-20230302)

**Source checks:** [Son · 2 Mar 2023](https://www.son.co.za/nuus/kaapse-nuus/richards-weer-cederberg-mayor-20230302): verified; [MISTRA dataset · Cederberg CED_01–03](https://coalitions.mistra.org.za/): landing-page-only; direct alternate source checked

**Code:** src/lib/seats/local-history.ts · cederberg-da-cfra:walkout

### REL-63-T · Revised

> Back on the same mountain road.
> DA and Cederberg First turn their reunion into an agreed work plan. Everyone stays. The route gets a timetable as well as a map.

**When:** Test a majority containing DA + CFRA. Cederberg.

**Context:** Cederberg First, DA and FF+ formed a coalition after the 2021 election. ANC and PA took over in July 2022. A by-election win gave the earlier partners enough votes to return Cederberg First’s Ruben Richards as mayor in March 2023.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** Back on the same mountain road.
DA and Cederberg First use the old experience to agree on a new route. Every partner makes it to the meeting together.

**Game effect:** No support lost.

**Review decision:** Replace generic mountain/reunion tease with the by-election mechanism; remove indirect source and avoid implying the earlier administration lacked a work plan.

**Current backstory — Cederberg · 2021–March 2023:** Cederberg First, DA and FF+ formed a coalition after the 2021 election. ANC and PA took over in July 2022. A by-election win gave the earlier partners enough votes to return Cederberg First’s Ruben Richards as mayor in March 2023.

**Sources:** [Son · 2 Mar 2023](https://www.son.co.za/nuus/kaapse-nuus/richards-weer-cederberg-mayor-20230302)

**Source checks:** [Son · 2 Mar 2023](https://www.son.co.za/nuus/kaapse-nuus/richards-weer-cederberg-mayor-20230302): verified; [MISTRA dataset · Cederberg CED_01–03](https://coalitions.mistra.org.za/): landing-page-only; direct alternate source checked

**Code:** src/lib/seats/local-history.ts · cederberg-da-cfra:truce

### REL-64-X · Revised

> The deciding chair is empty.
> DA and FF+ agree the next meeting is crucial. Then they disagree about the nomination before it even starts. {actor} leaves; the empty chair becomes the main attraction.

**When:** Test a majority containing DA + FF+. Swellendam.

**Context:** On 3 February 2025, Swellendam’s mayoral candidates each received five votes after FF+ speaker Juan van Schalkwyk abstained. He then resigned from the council. The DA and ANC each held five seats; FF+ held one. An abstention and a resignation are different actions: the vote tied before his council seat became vacant.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Restore the seating-plan personification while retaining abstention, rather than the misleading suggestion that a departure caused the tied vote.

**Current backstory — Swellendam · February 2025:** On 3 February 2025, Swellendam’s mayoral candidates each received five votes after FF+ speaker Juan van Schalkwyk abstained. He then resigned from the council. The DA and ANC each held five seats; FF+ held one. An abstention and a resignation are different actions: the vote tied before his council seat became vacant.

**Sources:** [Daily Maverick · 3 Feb 2025](https://www.dailymaverick.co.za/article/2025-02-03-swellendam-has-a-da-and-ff-plus-problem-sudden-resignation-leaves-no-mayor-no-speaker/)

**Source checks:** [Daily Maverick · 3 Feb 2025](https://www.dailymaverick.co.za/article/2025-02-03-swellendam-has-a-da-and-ff-plus-problem-sudden-resignation-leaves-no-mayor-no-speaker/): verified

**Code:** src/lib/seats/local-history.ts · swellendam-da-ff:walkout

### REL-64-T · Revised

> A nomination everyone can support.
> DA and FF+ settle the nomination before the crucial meeting. All selected partners stay. The deciding chair finally gets some peace.

**When:** Test a majority containing DA + FF+. Swellendam.

**Context:** On 3 February 2025, Swellendam’s mayoral candidates each received five votes after FF+ speaker Juan van Schalkwyk abstained. He then resigned from the council. The DA and ANC each held five seats; FF+ held one. An abstention and a resignation are different actions: the vote tied before his council seat became vacant.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** Everyone actually sits down.
DA and FF+ settle their differences before the crucial meeting. All selected partners stay. The deciding chair finally gets some peace.

**Game effect:** No support lost.

**Review decision:** Restore the seating-plan personification while retaining abstention, rather than the misleading suggestion that a departure caused the tied vote.

**Current backstory — Swellendam · February 2025:** On 3 February 2025, Swellendam’s mayoral candidates each received five votes after FF+ speaker Juan van Schalkwyk abstained. He then resigned from the council. The DA and ANC each held five seats; FF+ held one. An abstention and a resignation are different actions: the vote tied before his council seat became vacant.

**Sources:** [Daily Maverick · 3 Feb 2025](https://www.dailymaverick.co.za/article/2025-02-03-swellendam-has-a-da-and-ff-plus-problem-sudden-resignation-leaves-no-mayor-no-speaker/)

**Source checks:** [Daily Maverick · 3 Feb 2025](https://www.dailymaverick.co.za/article/2025-02-03-swellendam-has-a-da-and-ff-plus-problem-sudden-resignation-leaves-no-mayor-no-speaker/): verified

**Code:** src/lib/seats/local-history.ts · swellendam-da-ff:truce

### REL-65-X · Revised

> The tugboat has conditions.
> DA and FF+ agree to bring the deal into port. The last tugboat wants its instructions in writing. {actor} withdraws its support.

**When:** Test a majority containing DA + FF+. Saldanha Bay.

**Context:** After the 2021 election, Saldanha Bay’s DA held 13 of 27 council seats. Its coalition with FF+, which held one seat, reached the 14-seat majority. These are historical seat figures, separate from your selected deal.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Previous wording:** The tugboat has conditions.
DA and FF+ agree to bring the deal into port. The last tugboat wants its instructions in writing. {actor} leaves the negotiation with its seats.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Keep strong pivotal-seat birthday joke and confirmed numbers; say support withdrawn, not seats lost, and remove redundant general source.

**Current backstory — Saldanha Bay · Post-2021 council:** After the 2021 election, Saldanha Bay’s DA held 13 of 27 council seats. Its coalition with FF+, which held one seat, reached the 14-seat majority. These are historical seat figures, separate from your selected deal.

**Sources:** [ACCORD · Saldanha’s post-2021 council](https://coalitions.accord.org.za/coalition/saldanha/)

**Source checks:** [ACCORD · Saldanha’s post-2021 council](https://coalitions.accord.org.za/coalition/saldanha/): verified; [MISTRA dataset · Saldanha SAL_01](https://coalitions.mistra.org.za/): landing-page-only; direct alternate source checked

**Code:** src/lib/seats/local-history.ts · saldanha-da-ff:walkout

### REL-65-T · Revised

> All boats pull together.
> DA and FF+ agree on the route into harbour. Nobody lets go of the rope. All your partners keep supporting the deal.

**When:** Test a majority containing DA + FF+. Saldanha Bay.

**Context:** After the 2021 election, Saldanha Bay’s DA held 13 of 27 council seats. Its coalition with FF+, which held one seat, reached the 14-seat majority. These are historical seat figures, separate from your selected deal.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** All boats pull together.
DA and FF+ agree on the route into harbour. Nobody lets go of the rope. All your seats stay in the deal.

**Game effect:** No support lost.

**Review decision:** Keep strong pivotal-seat birthday joke and confirmed numbers; say support withdrawn, not seats lost, and remove redundant general source.

**Current backstory — Saldanha Bay · Post-2021 council:** After the 2021 election, Saldanha Bay’s DA held 13 of 27 council seats. Its coalition with FF+, which held one seat, reached the 14-seat majority. These are historical seat figures, separate from your selected deal.

**Sources:** [ACCORD · Saldanha’s post-2021 council](https://coalitions.accord.org.za/coalition/saldanha/)

**Source checks:** [ACCORD · Saldanha’s post-2021 council](https://coalitions.accord.org.za/coalition/saldanha/): verified; [MISTRA dataset · Saldanha SAL_01](https://coalitions.mistra.org.za/): landing-page-only; direct alternate source checked

**Code:** src/lib/seats/local-history.ts · saldanha-da-ff:truce

### REL-66-X · Kept

> The comeback gets a committee.
> The DA delegation agrees a comeback needs a plan. Two groups volunteer to write completely different plans. Half of {actor}’s delegation withholds support.

**When:** Test a majority containing DA. Witzenberg.

**Context:** Trevor Abrahams was elected Witzenberg executive mayor on 14 December 2023. Contemporary reporting described the DA’s return after an ANC-aligned administration. The municipality confirms the appointment date; this story does not infer the exact partner lineup.

**Meaning:** Invented disagreement. Part of this party’s delegation withholds support.

**Game effect:** Half this party’s support is withheld, rounded up. Council seats are unchanged.

**Review decision:** Keep verified local comeback and restrained lineup claim; make the truce constructive and about reporting progress rather than an unsupported publicity motive.

**Current backstory — Witzenberg · 14 December 2023:** Trevor Abrahams was elected Witzenberg executive mayor on 14 December 2023. Contemporary reporting described the DA’s return after an ANC-aligned administration. The municipality confirms the appointment date; this story does not infer the exact partner lineup.

**Sources:** [Witzenberg Municipality · leadership record](https://www.witzenberg.gov.za/leadership) · [News24 · 14 Dec 2023](https://www.news24.com/southafrica/news/da-regains-control-of-witzenberg-municipality-after-ousting-anc-coalition-20231214)

**Source checks:** [Witzenberg Municipality · leadership record](https://www.witzenberg.gov.za/leadership): verified; [News24 · 14 Dec 2023](https://www.news24.com/southafrica/news/da-regains-control-of-witzenberg-municipality-after-ousting-anc-coalition-20231214): headline-and-caption-verified; body-paywalled

**Code:** src/lib/seats/local-history.ts · witzenberg-da-return:walkout

### REL-66-T · Revised

> The comeback gets to work.
> The DA delegation agrees on the next repairs and how to report progress to residents. Everyone stays. The comeback gets a to-do list.

**When:** Test a majority containing DA. Witzenberg.

**Context:** Trevor Abrahams was elected Witzenberg executive mayor on 14 December 2023. Contemporary reporting described the DA’s return after an ANC-aligned administration. The municipality confirms the appointment date; this story does not infer the exact partner lineup.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** The comeback gets to work.
The DA delegation puts its comeback speeches away and agrees on the next repairs. Everyone stays; the ribbon scissors stay in the drawer.

**Game effect:** No support lost.

**Review decision:** Keep verified local comeback and restrained lineup claim; make the truce constructive and about reporting progress rather than an unsupported publicity motive.

**Current backstory — Witzenberg · 14 December 2023:** Trevor Abrahams was elected Witzenberg executive mayor on 14 December 2023. Contemporary reporting described the DA’s return after an ANC-aligned administration. The municipality confirms the appointment date; this story does not infer the exact partner lineup.

**Sources:** [Witzenberg Municipality · leadership record](https://www.witzenberg.gov.za/leadership) · [News24 · 14 Dec 2023](https://www.news24.com/southafrica/news/da-regains-control-of-witzenberg-municipality-after-ousting-anc-coalition-20231214)

**Source checks:** [Witzenberg Municipality · leadership record](https://www.witzenberg.gov.za/leadership): verified; [News24 · 14 Dec 2023](https://www.news24.com/southafrica/news/da-regains-control-of-witzenberg-municipality-after-ousting-anc-coalition-20231214): headline-and-caption-verified; body-paywalled

**Code:** src/lib/seats/local-history.ts · witzenberg-da-return:truce

### REL-67-X · Kept

> The budget reopens the argument.
> DA and FF+ reach the budget item. Someone mentions the 2024 breakup. {actor} leaves before the new spending plan gets a vote.

**When:** Test a majority containing DA + FF+. Langeberg.

**Context:** The DA and FF+ formed Langeberg’s post-2021 governing coalition. In August 2024 the DA said the relationship had ended, citing the FF+’s refusal to back the May budget among its reasons. That explanation is attributed to the DA.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Retain: dated source supports the factual basis; metaphor is intelligible and not an allegation of personal misconduct.

**Current backstory — Langeberg · May–August 2024:** The DA and FF+ formed Langeberg’s post-2021 governing coalition. In August 2024 the DA said the relationship had ended, citing the FF+’s refusal to back the May budget among its reasons. That explanation is attributed to the DA.

**Sources:** [EWN · 8 Aug 2024](https://www.ewn.co.za/2024/08/08/wc-da-explains-why-it-ended-relationship-with-freedom-front-plus)

**Source checks:** [EWN · 8 Aug 2024](https://www.ewn.co.za/2024/08/08/wc-da-explains-why-it-ended-relationship-with-freedom-front-plus): verified

**Code:** src/lib/seats/local-history.ts · langeberg-da-ff:walkout

### REL-67-T · Kept

> The totals finally reconcile.
> DA and FF+ settle the budget line by line. Even the old argument gets a closing date. Everyone stays for the vote.

**When:** Test a majority containing DA + FF+. Langeberg.

**Context:** The DA and FF+ formed Langeberg’s post-2021 governing coalition. In August 2024 the DA said the relationship had ended, citing the FF+’s refusal to back the May budget among its reasons. That explanation is attributed to the DA.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Retain: dated source supports the factual basis; metaphor is intelligible and not an allegation of personal misconduct.

**Current backstory — Langeberg · May–August 2024:** The DA and FF+ formed Langeberg’s post-2021 governing coalition. In August 2024 the DA said the relationship had ended, citing the FF+’s refusal to back the May budget among its reasons. That explanation is attributed to the DA.

**Sources:** [EWN · 8 Aug 2024](https://www.ewn.co.za/2024/08/08/wc-da-explains-why-it-ended-relationship-with-freedom-front-plus)

**Source checks:** [EWN · 8 Aug 2024](https://www.ewn.co.za/2024/08/08/wc-da-explains-why-it-ended-relationship-with-freedom-front-plus): verified

**Code:** src/lib/seats/local-history.ts · langeberg-da-ff:truce

### REL-68-X · Clarified

> A memo arrives from upstairs.
> ANC and ICOSA finish the local agreement just as ANC’s provincial office sends the opposite instruction. The documents disagree. {actor} leaves to find out which one applies.

**When:** Test a majority containing ANC + ICOSA. Kannaland.

**Context:** An ANC–ICOSA arrangement followed Kannaland’s November 2021 election. The ANC’s provincial leadership instructed its councillors to withdraw in December. The Dullah Omar Institute documents the resulting changes in council alignments.

**Meaning:** Invented scene: local and provincial instructions conflict in the fictional deal.

**Previous wording:** A memo arrives from upstairs.
ANC and ICOSA finish the local agreement just as another instruction arrives. The documents disagree. {actor} leaves to find out which one applies.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Identifies the source of the instruction arriving “from upstairs”.

**Current backstory — Kannaland · November–December 2021:** An ANC–ICOSA arrangement followed Kannaland’s November 2021 election. The ANC’s provincial leadership instructed its councillors to withdraw in December. The Dullah Omar Institute documents the resulting changes in council alignments.

**Sources:** [Dullah Omar Institute · 18 Nov 2022](https://dullahomarinstitute.org.za/our-work/multilevel-govt/local-government-bulletin/archives/volume-17-issue-4-november-2022/rogue-leadership-and-lawlessness-in-kannaland-municipality)

**Source checks:** [Dullah Omar Institute · 18 Nov 2022](https://dullahomarinstitute.org.za/our-work/multilevel-govt/local-government-bulletin/archives/volume-17-issue-4-november-2022/rogue-leadership-and-lawlessness-in-kannaland-municipality): verified; [News24Wire / Polity ·2Dec2021](https://www.polity.org.za/article/anc-withdraws-from-coalition-with-icosa-in-kannaland-municipality-2021-12-02): verified

**Code:** src/lib/seats/local-history.ts · kannaland-anc-icosa:walkout

### REL-68-T · Kept

> The documents tell the same story.
> ANC and ICOSA get everyone to sign the same version before entering the chamber. All your partners stay. The filing cabinet can relax.

**When:** Test a majority containing ANC + ICOSA. Kannaland.

**Context:** An ANC–ICOSA arrangement followed Kannaland’s November 2021 election. The ANC’s provincial leadership instructed its councillors to withdraw in December. The Dullah Omar Institute documents the resulting changes in council alignments.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Retain: dated source supports the factual basis; metaphor is intelligible and not an allegation of personal misconduct.

**Current backstory — Kannaland · November–December 2021:** An ANC–ICOSA arrangement followed Kannaland’s November 2021 election. The ANC’s provincial leadership instructed its councillors to withdraw in December. The Dullah Omar Institute documents the resulting changes in council alignments.

**Sources:** [Dullah Omar Institute · 18 Nov 2022](https://dullahomarinstitute.org.za/our-work/multilevel-govt/local-government-bulletin/archives/volume-17-issue-4-november-2022/rogue-leadership-and-lawlessness-in-kannaland-municipality)

**Source checks:** [Dullah Omar Institute · 18 Nov 2022](https://dullahomarinstitute.org.za/our-work/multilevel-govt/local-government-bulletin/archives/volume-17-issue-4-november-2022/rogue-leadership-and-lawlessness-in-kannaland-municipality): verified; [News24Wire / Polity ·2Dec2021](https://www.polity.org.za/article/anc-withdraws-from-coalition-with-icosa-in-kannaland-municipality-2021-12-02): verified

**Code:** src/lib/seats/local-history.ts · kannaland-anc-icosa:truce

### REL-69-X · Revised

> Signed, sealed… nearly.
> DA and CSA get to the signature page as the meeting starts. Someone asks for one more clause. {actor} leaves; the pen is still being passed around.

**When:** Test a majority containing DA + CSA. Dr. Beyers Naude.

**Context:** The DA announced a coalition with Compatriots of South Africa and FF+ shortly before Dr Beyers Naudé’s inaugural November 2021 council meeting. DA’s Ewald Loock became mayor and CSA’s Laughton Hoffman became speaker.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Previous wording:** The printer beats the negotiators.
DA and CSA reach the final page as the meeting starts. The signatures are ready; the agreement is not. {actor} leaves before the roll call.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Restore the last-minute agreement punchline. The hypothetical agenda argument is satirical scene-setting, not a sourced historical allegation.

**Current backstory — Dr Beyers Naudé · 23 November 2021:** The DA announced a coalition with Compatriots of South Africa and FF+ shortly before Dr Beyers Naudé’s inaugural November 2021 council meeting. DA’s Ewald Loock became mayor and CSA’s Laughton Hoffman became speaker.

**Sources:** [DA statement · 23 Nov 2021](https://www.da.org.za/2021/11/da-cllr-ewald-loock-elected-as-mayor-of-the-dr-beyers-naude-municipality)

**Source checks:** [DA statement · 23 Nov 2021](https://www.da.org.za/2021/11/da-cllr-ewald-loock-elected-as-mayor-of-the-dr-beyers-naude-municipality): verified

**Code:** src/lib/seats/local-history.ts · beyers-naude-da-csa:walkout

### REL-69-T · Revised

> Signed before the meeting.
> DA and CSA finish their agreement just in time. The Speaker calls the meeting, and everyone is still there. All your partners keep supporting the deal.

**When:** Test a majority containing DA + CSA. Dr. Beyers Naude.

**Context:** The DA announced a coalition with Compatriots of South Africa and FF+ shortly before Dr Beyers Naudé’s inaugural November 2021 council meeting. DA’s Ewald Loock became mayor and CSA’s Laughton Hoffman became speaker.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** Signed before the bell.
DA and CSA finish their agreement just in time. The Speaker calls the meeting, and everyone is still there. All your seats stay.

**Game effect:** No support lost.

**Review decision:** Restore the last-minute agreement punchline. The hypothetical agenda argument is satirical scene-setting, not a sourced historical allegation.

**Current backstory — Dr Beyers Naudé · 23 November 2021:** The DA announced a coalition with Compatriots of South Africa and FF+ shortly before Dr Beyers Naudé’s inaugural November 2021 council meeting. DA’s Ewald Loock became mayor and CSA’s Laughton Hoffman became speaker.

**Sources:** [DA statement · 23 Nov 2021](https://www.da.org.za/2021/11/da-cllr-ewald-loock-elected-as-mayor-of-the-dr-beyers-naude-municipality)

**Source checks:** [DA statement · 23 Nov 2021](https://www.da.org.za/2021/11/da-cllr-ewald-loock-elected-as-mayor-of-the-dr-beyers-naude-municipality): verified

**Code:** src/lib/seats/local-history.ts · beyers-naude-da-csa:truce

### REL-70-X · Restored

> One last clause before roll call.
> DA and FF+ reach the last page of the Karoo deal. Someone adds a final clause as the Speaker calls their names. {actor} leaves before signing.

**When:** Test a majority containing DA + FF+. Dr. Beyers Naude.

**Context:** DA, FF+ and Compatriots of South Africa concluded a coalition agreement shortly before Dr Beyers Naudé’s inaugural council meeting on 23 November 2021. The DA’s Ewald Loock was elected mayor.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Restore: the deadline is sourced, the matric-project comparison is recognisable South African humour, and the DA–FF+ pairing exposes this history without requiring CSA to be selected. Overlap with the CSA episode does not make this variation useless.

**Current backstory — Dr Beyers Naudé · November 2021:** DA, FF+ and Compatriots of South Africa concluded a coalition agreement shortly before Dr Beyers Naudé’s inaugural council meeting on 23 November 2021. The DA’s Ewald Loock was elected mayor.

**Sources:** [DA statement · 23 Nov 2021](https://www.da.org.za/2021/11/da-cllr-ewald-loock-elected-as-mayor-of-the-dr-beyers-naude-municipality)

**Source checks:** [DA statement · 23 Nov 2021](https://www.da.org.za/2021/11/da-cllr-ewald-loock-elected-as-mayor-of-the-dr-beyers-naude-municipality): verified

**Code:** src/lib/seats/local-history.ts · beyers-naude-da-ff:walkout

### REL-70-T · Restored

> The ink makes it in time.
> DA and FF+ finish the agreement before the opening bell. Everyone is present, on the same page and still supporting the deal.

**When:** Test a majority containing DA + FF+. Dr. Beyers Naude.

**Context:** DA, FF+ and Compatriots of South Africa concluded a coalition agreement shortly before Dr Beyers Naudé’s inaugural council meeting on 23 November 2021. The DA’s Ewald Loock was elected mayor.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** The ink makes it in time.
DA and FF+ finish the agreement before the opening bell. Everyone is present and on the same page. All your seats stay.

**Game effect:** No support lost.

**Review decision:** Restore: the deadline is sourced, the matric-project comparison is recognisable South African humour, and the DA–FF+ pairing exposes this history without requiring CSA to be selected. Overlap with the CSA episode does not make this variation useless.

**Current backstory — Dr Beyers Naudé · November 2021:** DA, FF+ and Compatriots of South Africa concluded a coalition agreement shortly before Dr Beyers Naudé’s inaugural council meeting on 23 November 2021. The DA’s Ewald Loock was elected mayor.

**Sources:** [DA statement · 23 Nov 2021](https://www.da.org.za/2021/11/da-cllr-ewald-loock-elected-as-mayor-of-the-dr-beyers-naude-municipality)

**Source checks:** [DA statement · 23 Nov 2021](https://www.da.org.za/2021/11/da-cllr-ewald-loock-elected-as-mayor-of-the-dr-beyers-naude-municipality): verified

**Code:** src/lib/seats/local-history.ts · beyers-naude-da-ff:truce

### REL-71-X · Clarified

> Local knowledge. Different directions.
> DA and KIM both know the way around Knysna. They disagree on the route to an agreement. {actor} takes a turn marked “exit”.

**When:** Test a majority containing DA + KIM. Knysna.

**Context:** DA and Knysna Independent Movement governed together after the 2021 election, with EFF voting support helping them take office. A council vote removed their administration in August 2022, making way for an arrangement including ANC, PA, EFF and Plaaslike Besorgde Inwoners. This is the earlier coalition chapter.

**Meaning:** Invented scene: the negotiation’s route map ends in a walkout.

**Previous wording:** Local knowledge. Different directions.
DA and KIM both know the way around Knysna. They disagree on the route to an agreement. {actor} leaves before anyone reaches the Heads.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Replaces a punchline dependent on knowing the Knysna Heads with an immediately readable route joke.

**Current backstory — Knysna · 2021–August 2022:** DA and Knysna Independent Movement governed together after the 2021 election, with EFF voting support helping them take office. A council vote removed their administration in August 2022, making way for an arrangement including ANC, PA, EFF and Plaaslike Besorgde Inwoners. This is the earlier coalition chapter.

**Sources:** [Daily Maverick retrospective · 6 Sep 2023](https://www.dailymaverick.co.za/article/2023-09-06-patriotic-alliance-breaks-knysna-coalition-with-anc-says-it-wont-vote-in-council/)

**Source checks:** [Daily Maverick retrospective · 6 Sep 2023](https://www.dailymaverick.co.za/article/2023-09-06-patriotic-alliance-breaks-knysna-coalition-with-anc-says-it-wont-vote-in-council/): verified

**Code:** src/lib/seats/local-history.ts · knysna-da-kim:walkout

### REL-71-T · Revised

> The local map helps.
> DA and KIM use the old coalition experience to agree on the next repair route. The lagoon stays calm. So does your deal.

**When:** Test a majority containing DA + KIM. Knysna.

**Context:** DA and Knysna Independent Movement governed together after the 2021 election, with EFF voting support helping them take office. A council vote removed their administration in August 2022, making way for an arrangement including ANC, PA, EFF and Plaaslike Besorgde Inwoners. This is the earlier coalition chapter.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Correct incomplete replacement coalition membership and distinguish EFF voting support from joining the earlier DA/KIM coalition.

**Current backstory — Knysna · 2021–August 2022:** DA and Knysna Independent Movement governed together after the 2021 election, with EFF voting support helping them take office. A council vote removed their administration in August 2022, making way for an arrangement including ANC, PA, EFF and Plaaslike Besorgde Inwoners. This is the earlier coalition chapter.

**Sources:** [Daily Maverick retrospective · 6 Sep 2023](https://www.dailymaverick.co.za/article/2023-09-06-patriotic-alliance-breaks-knysna-coalition-with-anc-says-it-wont-vote-in-council/)

**Source checks:** [Daily Maverick retrospective · 6 Sep 2023](https://www.dailymaverick.co.za/article/2023-09-06-patriotic-alliance-breaks-knysna-coalition-with-anc-says-it-wont-vote-in-council/): verified

**Code:** src/lib/seats/local-history.ts · knysna-da-kim:truce

### REL-72-X · Revised

> The reshuffle gets reshuffled.
> The ANC delegation agrees the team needs a reshuffle. Then everyone nominates a different team. Half of {actor}’s delegation withholds support.

**When:** Test a majority containing ANC. Msunduzi.

**Context:** In August 2019, the ANC announced that Msunduzi mayor Themba Njilo and its other executive-committee members would be redeployed as part of leadership changes in KwaZulu-Natal municipalities. This was an internal party decision, not a coalition breakup or an election by residents.

**Meaning:** Invented disagreement. Part of this party’s delegation withholds support.

**Game effect:** Half this party’s support is withheld, rounded up. Council seats are unchanged.

**Review decision:** Match source to party announcement, explain its institutional scope and use support wording in fictional outcome.

**Current backstory — Msunduzi · August 2019:** In August 2019, the ANC announced that Msunduzi mayor Themba Njilo and its other executive-committee members would be redeployed as part of leadership changes in KwaZulu-Natal municipalities. This was an internal party decision, not a coalition breakup or an election by residents.

**Sources:** [News24Wire / Polity · 13 Aug 2019](https://www.polity.org.za/article/zandile-gumede-themba-njilo-officially-out-as-anc-in-kzn-makes-sweeping-leadership-changes-2019-08-13)

**Source checks:** [News24Wire / Polity · 13 Aug 2019](https://www.polity.org.za/article/zandile-gumede-themba-njilo-officially-out-as-anc-in-kzn-makes-sweeping-leadership-changes-2019-08-13): verified

**Code:** src/lib/seats/local-history.ts · msunduzi-anc-recall:walkout

### REL-72-T · Revised

> Same repair list after the reshuffle.
> The ANC delegation settles its leadership discussion and keeps the city’s repair list on the desk. Everyone keeps supporting the plan.

**When:** Test a majority containing ANC. Msunduzi.

**Context:** In August 2019, the ANC announced that Msunduzi mayor Themba Njilo and its other executive-committee members would be redeployed as part of leadership changes in KwaZulu-Natal municipalities. This was an internal party decision, not a coalition breakup or an election by residents.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Previous wording:** Same repair list after the reshuffle.
The ANC delegation settles its leadership discussion and keeps the city’s repair list on the desk. All your seats stay.

**Game effect:** No support lost.

**Review decision:** Match source to party announcement, explain its institutional scope and use support wording in fictional outcome.

**Current backstory — Msunduzi · August 2019:** In August 2019, the ANC announced that Msunduzi mayor Themba Njilo and its other executive-committee members would be redeployed as part of leadership changes in KwaZulu-Natal municipalities. This was an internal party decision, not a coalition breakup or an election by residents.

**Sources:** [News24Wire / Polity · 13 Aug 2019](https://www.polity.org.za/article/zandile-gumede-themba-njilo-officially-out-as-anc-in-kzn-makes-sweeping-leadership-changes-2019-08-13)

**Source checks:** [News24Wire / Polity · 13 Aug 2019](https://www.polity.org.za/article/zandile-gumede-themba-njilo-officially-out-as-anc-in-kzn-makes-sweeping-leadership-changes-2019-08-13): verified

**Code:** src/lib/seats/local-history.ts · msunduzi-anc-recall:truce

### REL-73-X · Clarified

> The national handshake needs a local sequel.
> ANC and IFP bring a photo of their national unity government. It does not say who gets the local mayor’s office. {actor} leaves to renegotiate.

**When:** Test a majority containing ANC + IFP. Any municipality (national backstory).

**Context:** ANC and IFP were named as participants in the national GNU in June 2024. This does not establish a local coalition.

**Meaning:** Invented scene: a national unity-government photo cannot settle which local partner gets the mayor’s office.

**Previous wording:** The national handshake needs a local sequel.
ANC and IFP bring their GNU group photo to the meeting. It does not answer who gets the local office. {actor} leaves to renegotiate.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Expands GNU and names the local mayoral job instead of an unspecified office; this remains a fictional local scenario.

**Current backstory — National government · June 2024:** ANC and IFP were named as participants in the national GNU in June 2024. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/relationship-history.ts · anc-ifp-gnu:walkout

### REL-73-T · Revised

> The local sequel gets a happy ending.
> ANC and IFP agree on the road repairs before the press conference. Both can take a photo with the same repaired road. Everyone stays.

**When:** Test a majority containing ANC + IFP. Any municipality (national backstory).

**Context:** ANC and IFP were named as participants in the national GNU in June 2024. This does not establish a local coalition.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Restore the recognisable awkward-partners caricature; painful smiles are obvious exaggeration, not a factual health or motive claim.

**Current backstory — National government · June 2024:** ANC and IFP were named as participants in the national GNU in June 2024. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/relationship-history.ts · anc-ifp-gnu:truce

### REL-74-X · Clarified

> The national handshake needs a local sequel.
> ANC and FF+ bring a photo of their national unity government. It does not say who gets the local mayor’s office. {actor} leaves to renegotiate.

**When:** Test a majority containing ANC + FF+. Any municipality (national backstory).

**Context:** ANC and FF+ were named as participants in the national GNU in June 2024. This does not establish a local coalition.

**Meaning:** Invented scene: a national unity-government photo cannot settle which local partner gets the mayor’s office.

**Previous wording:** The national handshake needs a local sequel.
ANC and FF+ bring their GNU group photo to the meeting. It does not answer who gets the local office. {actor} leaves to renegotiate.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Expands GNU and names the local mayoral job instead of an unspecified office; this remains a fictional local scenario.

**Current backstory — National government · June 2024:** ANC and FF+ were named as participants in the national GNU in June 2024. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/relationship-history.ts · anc-ff-gnu:walkout

### REL-74-T · Revised

> The local sequel gets a happy ending.
> ANC and FF+ agree on the road repairs before the press conference. Both can take a photo with the same repaired road. Everyone stays.

**When:** Test a majority containing ANC + FF+. Any municipality (national backstory).

**Context:** ANC and FF+ were named as participants in the national GNU in June 2024. This does not establish a local coalition.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Keep poster reversal joke; remove unrelated portfolio details from the background.

**Current backstory — National government · June 2024:** ANC and FF+ were named as participants in the national GNU in June 2024. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/relationship-history.ts · anc-ff-gnu:truce

### REL-75-X · Clarified

> The national handshake needs a local sequel.
> IFP and PA bring a photo of their national unity government. It does not say who gets the local mayor’s office. {actor} leaves to renegotiate.

**When:** Test a majority containing IFP + PA. Any municipality (national backstory).

**Context:** IFP and PA were named as participants in the national GNU in June 2024. IFP’s Velenkosini Hlabisa received Cooperative Governance and Traditional Affairs; PA’s Gayton McKenzie received Sport, Arts and Culture. This does not establish a local coalition.

**Meaning:** Invented scene: a national unity-government photo cannot settle which local partner gets the mayor’s office.

**Previous wording:** The national handshake needs a local sequel.
IFP and PA bring their GNU group photo to the meeting. It does not answer who gets the local office. {actor} leaves to renegotiate.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Expands GNU and names the local mayoral job instead of an unspecified office; this remains a fictional local scenario.

**Current backstory — National government · June 2024:** IFP and PA were named as participants in the national GNU in June 2024. IFP’s Velenkosini Hlabisa received Cooperative Governance and Traditional Affairs; PA’s Gayton McKenzie received Sport, Arts and Culture. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/relationship-history.ts · ifp-pa-gnu:walkout

### REL-75-T · Revised

> The local sequel gets a happy ending.
> IFP and PA agree on the road repairs before the press conference. Both can take a photo with the same repaired road. Everyone stays.

**When:** Test a majority containing IFP + PA. Any municipality (national backstory).

**Context:** IFP and PA were named as participants in the national GNU in June 2024. IFP’s Velenkosini Hlabisa received Cooperative Governance and Traditional Affairs; PA’s Gayton McKenzie received Sport, Arts and Culture. This does not establish a local coalition.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Restore the personality and portfolio wordplay. The scene is fictional and does not report either minister’s conduct.

**Current backstory — National government · June 2024:** IFP and PA were named as participants in the national GNU in June 2024. IFP’s Velenkosini Hlabisa received Cooperative Governance and Traditional Affairs; PA’s Gayton McKenzie received Sport, Arts and Culture. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/relationship-history.ts · ifp-pa-gnu:truce

### REL-76-X · Clarified

> The national handshake needs a local sequel.
> IFP and FF+ bring a photo of their national unity government. It does not say who gets the local mayor’s office. {actor} leaves to renegotiate.

**When:** Test a majority containing IFP + FF+. Any municipality (national backstory).

**Context:** IFP and FF+ were named as participants in the national GNU in June 2024. IFP and FF+ had also joined the August 2023 Charter talks aimed at replacing the ANC government. This does not establish a local coalition.

**Meaning:** Invented scene: a national unity-government photo cannot settle which local partner gets the mayor’s office.

**Previous wording:** The national handshake needs a local sequel.
IFP and FF+ bring their GNU group photo to the meeting. It does not answer who gets the local office. {actor} leaves to renegotiate.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Expands GNU and names the local mayoral job instead of an unspecified office; this remains a fictional local scenario.

**Current backstory — National government · June 2024:** IFP and FF+ were named as participants in the national GNU in June 2024. IFP and FF+ had also joined the August 2023 Charter talks aimed at replacing the ANC government. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024) · [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.

**Code:** src/lib/seats/relationship-history.ts · ifp-ff-gnu:walkout

### REL-76-T · Revised

> The local sequel gets a happy ending.
> IFP and FF+ agree on the road repairs before the press conference. Both can take a photo with the same repaired road. Everyone stays.

**When:** Test a majority containing IFP + FF+. Any municipality (national backstory).

**Context:** IFP and FF+ were named as participants in the national GNU in June 2024. IFP and FF+ had also joined the August 2023 Charter talks aimed at replacing the ANC government. This does not establish a local coalition.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Keep Charter-to-GNU contradiction; remove unrelated portfolio details.

**Current backstory — National government · June 2024:** IFP and FF+ were named as participants in the national GNU in June 2024. IFP and FF+ had also joined the August 2023 Charter talks aimed at replacing the ANC government. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024) · [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.

**Code:** src/lib/seats/relationship-history.ts · ifp-ff-gnu:truce

### REL-77-X · Clarified

> The national handshake needs a local sequel.
> PA and FF+ bring a photo of their national unity government. It does not say who gets the local mayor’s office. {actor} leaves to renegotiate.

**When:** Test a majority containing PA + FF+. Any municipality (national backstory).

**Context:** PA and FF+ were named as participants in the national GNU in June 2024. PA’s Gayton McKenzie received Sport, Arts and Culture; FF+’s Pieter Groenewald received Correctional Services. This does not establish a local coalition.

**Meaning:** Invented scene: a national unity-government photo cannot settle which local partner gets the mayor’s office.

**Previous wording:** The national handshake needs a local sequel.
PA and FF+ bring their GNU group photo to the meeting. It does not answer who gets the local office. {actor} leaves to renegotiate.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Expands GNU and names the local mayoral job instead of an unspecified office; this remains a fictional local scenario.

**Current backstory — National government · June 2024:** PA and FF+ were named as participants in the national GNU in June 2024. PA’s Gayton McKenzie received Sport, Arts and Culture; FF+’s Pieter Groenewald received Correctional Services. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/relationship-history.ts · pa-ff-gnu:walkout

### REL-77-T · Revised

> The local sequel gets a happy ending.
> PA and FF+ agree on the road repairs before the press conference. Both can take a photo with the same repaired road. Everyone stays.

**When:** Test a majority containing PA + FF+. Any municipality (national backstory).

**Context:** PA and FF+ were named as participants in the national GNU in June 2024. PA’s Gayton McKenzie received Sport, Arts and Culture; FF+’s Pieter Groenewald received Correctional Services. This does not establish a local coalition.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Keep sport/prison extra-time wordplay about portfolios; include only the two relevant appointments.

**Current backstory — National government · June 2024:** PA and FF+ were named as participants in the national GNU in June 2024. PA’s Gayton McKenzie received Sport, Arts and Culture; FF+’s Pieter Groenewald received Correctional Services. This does not establish a local coalition.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/relationship-history.ts · pa-ff-gnu:truce

### REL-78-X · Revised

> The old pact gets new demands.
> IFP and ActionSA open the old agreement. Each has brought a different updated version. {actor} leaves before they agree which one to read.

**When:** Test a majority containing IFP + ActionSA. Any municipality (national backstory).

**Context:** IFP and ActionSA participated in the August 2023 Multi-Party Charter talks, aimed at replacing the ANC government and keeping the EFF out. In 2024, IFP joined the ANC-inclusive GNU, while ActionSA’s Nasiphi Moya became Tshwane mayor with ANC and EFF support. These later national and local choices explain the reunion joke; they do not establish a pact in this municipality.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Strengthen Moya election support with official minutes and completed-election reporting.

**Current backstory — National party negotiations · August 2023:** IFP and ActionSA participated in the August 2023 Multi-Party Charter talks, aimed at replacing the ANC government and keeping the EFF out. In 2024, IFP joined the ANC-inclusive GNU, while ActionSA’s Nasiphi Moya became Tshwane mayor with ANC and EFF support. These later national and local choices explain the reunion joke; they do not establish a pact in this municipality.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024) · [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997) · [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.; [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/relationship-history.ts · ifp-actionsa-charter:walkout

### REL-78-T · Clarified

> The reunion finishes its homework.
> IFP and ActionSA agree on the road repairs and put deadlines in writing. Everyone stays. The calendar has joined the coalition.

**When:** Test a majority containing IFP + ActionSA. Any municipality (national backstory).

**Context:** IFP and ActionSA participated in the August 2023 Multi-Party Charter talks, aimed at replacing the ANC government and keeping the EFF out. In 2024, IFP joined the ANC-inclusive GNU, while ActionSA’s Nasiphi Moya became Tshwane mayor with ANC and EFF support. These later national and local choices explain the reunion joke; they do not establish a pact in this municipality.

**Meaning:** Invented scene: the reunion produces actual road-repair deadlines, making the calendar an imaginary new coalition partner.

**Previous wording:** The reunion finishes its homework.
IFP and ActionSA agree that the local roads need a new plan, even if the party badges are familiar. Everyone signs and stays.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Gives the homework title a concrete payoff instead of an unexplained reference to familiar badges.

**Current backstory — National party negotiations · August 2023:** IFP and ActionSA participated in the August 2023 Multi-Party Charter talks, aimed at replacing the ANC government and keeping the EFF out. In 2024, IFP joined the ANC-inclusive GNU, while ActionSA’s Nasiphi Moya became Tshwane mayor with ANC and EFF support. These later national and local choices explain the reunion joke; they do not establish a pact in this municipality.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024) · [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997) · [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.; [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/relationship-history.ts · ifp-actionsa-charter:truce

### REL-79-X · Revised

> The old pact gets new demands.
> FF+ and ActionSA open the old agreement. Each has brought a different updated version. {actor} leaves before they agree which one to read.

**When:** Test a majority containing FF+ + ActionSA. Any municipality (national backstory).

**Context:** FF+ and ActionSA participated in the August 2023 Multi-Party Charter talks, aimed at replacing the ANC government and keeping the EFF out. In 2024, FF+ joined the ANC-inclusive GNU, while ActionSA’s Nasiphi Moya became Tshwane mayor with ANC and EFF support. These later national and local choices explain the reunion joke; they do not establish a pact in this municipality.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Strengthen Moya election support with official minutes and completed-election reporting.

**Current backstory — National party negotiations · August 2023:** FF+ and ActionSA participated in the August 2023 Multi-Party Charter talks, aimed at replacing the ANC government and keeping the EFF out. In 2024, FF+ joined the ANC-inclusive GNU, while ActionSA’s Nasiphi Moya became Tshwane mayor with ANC and EFF support. These later national and local choices explain the reunion joke; they do not establish a pact in this municipality.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024) · [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997) · [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.; [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/relationship-history.ts · ff-actionsa-charter:walkout

### REL-79-T · Clarified

> The reunion finishes its homework.
> FF+ and ActionSA agree on the road repairs and put deadlines in writing. Everyone stays. The calendar has joined the coalition.

**When:** Test a majority containing FF+ + ActionSA. Any municipality (national backstory).

**Context:** FF+ and ActionSA participated in the August 2023 Multi-Party Charter talks, aimed at replacing the ANC government and keeping the EFF out. In 2024, FF+ joined the ANC-inclusive GNU, while ActionSA’s Nasiphi Moya became Tshwane mayor with ANC and EFF support. These later national and local choices explain the reunion joke; they do not establish a pact in this municipality.

**Meaning:** Invented scene: the reunion produces actual road-repair deadlines, making the calendar an imaginary new coalition partner.

**Previous wording:** The reunion finishes its homework.
FF+ and ActionSA agree that the local roads need a new plan, even if the party badges are familiar. Everyone signs and stays.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Gives the homework title a concrete payoff instead of an unexplained reference to familiar badges.

**Current backstory — National party negotiations · August 2023:** FF+ and ActionSA participated in the August 2023 Multi-Party Charter talks, aimed at replacing the ANC government and keeping the EFF out. In 2024, FF+ joined the ANC-inclusive GNU, while ActionSA’s Nasiphi Moya became Tshwane mayor with ANC and EFF support. These later national and local choices explain the reunion joke; they do not establish a pact in this municipality.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024) · [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997) · [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.; [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/relationship-history.ts · ff-actionsa-charter:truce

### REL-80-X · Clarified

> The group photo needs a date.
> EFF and MK agree to look forward. Someone brings a group photo from before Floyd Shivambu left EFF for MK. {actor} leaves before the introductions are finished.

**When:** Test a majority containing EFF + MK. Any municipality (national backstory).

**Context:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This dated leadership transfer is a backstory, not his current role or proof of a local alliance.

**Meaning:** Invented scene: an old photo from before Shivambu changed parties interrupts a meeting that was supposed to look forward.

**Previous wording:** The old name tags come out.
EFF and MK agree to look forward. Someone brings the 2024 group photo. {actor} leaves before the introductions are finished.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Explains why the old photo is awkward and aligns the title with that prop.

**Current backstory — National party history · August 2024:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This dated leadership transfer is a backstory, not his current role or proof of a local alliance.

**Sources:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party) · [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party): read — EWN 15 August report confirms Shivambu leaving EFF and joining MK.; [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/relationship-history.ts · eff-mk-transfer:walkout

### REL-80-T · Clarified

> The reunion skips the awkward bit.
> EFF and MK put the old party badges away and agree on the water repairs. Everyone stays. Questions about who joined whom can wait.

**When:** Test a majority containing EFF + MK. Any municipality (national backstory).

**Context:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This dated leadership transfer is a backstory, not his current role or proof of a local alliance.

**Meaning:** Invented scene: the parties get on with repairs while putting awkward questions about changing parties aside.

**Previous wording:** The reunion skips the awkward bit.
EFF and MK put the old party badges away and agree on the water repairs. Everyone stays. No transfer-window questions at the briefing.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Replaces the transfer-window reference with plain language about who joined whom.

**Current backstory — National party history · August 2024:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This dated leadership transfer is a backstory, not his current role or proof of a local alliance.

**Sources:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party) · [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party): read — EWN 15 August report confirms Shivambu leaving EFF and joining MK.; [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/relationship-history.ts · eff-mk-transfer:truce

### REL-81-X · Kept

> About that mayoral chair…
> EFF and IFP agree the past is behind them. The first agenda item is who gets the mayoral chair. {actor} leaves with a strong sense of déjà vu.

**When:** Test a majority containing EFF + IFP. Any municipality (national backstory).

**Context:** IFP and EFF accounts describe the end of their cooperation in January 2023. The IFP said it declined an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their accounts of responsibility differed. National negotiations concerned particular councils, not every municipality.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — Party negotiations · January 2023:** IFP and EFF accounts describe the end of their cooperation in January 2023. The IFP said it declined an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their accounts of responsibility differed. National negotiations concerned particular councils, not every municipality.

**Sources:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/) · [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf)

**Source checks:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/): read — IFP 30 January statement sets out its account of uMhlathuze request/refusal; blame is not treated as fact.; [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf): read — EFF 29 January statement records ending ties, withdrawing support and deputy mayors returning to ordinary councillor roles; its accusations remain party claims.

**Code:** src/lib/seats/relationship-history.ts · eff-ifp-breakup:walkout

### REL-81-T · Clarified

> A different chair, a different ending.
> EFF and IFP agree who chairs the meeting and which roads get repaired. Nobody reopens the old fight over who gets the mayor’s job. Everyone stays.

**When:** Test a majority containing EFF + IFP. Any municipality (national backstory).

**Context:** IFP and EFF accounts describe the end of their cooperation in January 2023. The IFP said it declined an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their accounts of responsibility differed. National negotiations concerned particular councils, not every municipality.

**Meaning:** Invented scene: the partners settle the chairing and repairs instead of reopening their old mayoral-job dispute.

**Previous wording:** A different chair, a different ending.
EFF and IFP settle the speaking order and the repairs programme. Nobody reopens the 2023 argument. Everyone stays.

**Game effect:** No support lost.

**Review decision:** Clarity pass: States what the 2023 argument concerned instead of requiring the player to remember it.

**Current backstory — Party negotiations · January 2023:** IFP and EFF accounts describe the end of their cooperation in January 2023. The IFP said it declined an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their accounts of responsibility differed. National negotiations concerned particular councils, not every municipality.

**Sources:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/) · [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf)

**Source checks:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/): read — IFP 30 January statement sets out its account of uMhlathuze request/refusal; blame is not treated as fact.; [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf): read — EFF 29 January statement records ending ties, withdrawing support and deputy mayors returning to ordinary councillor roles; its accusations remain party claims.

**Code:** src/lib/seats/relationship-history.ts · eff-ifp-breakup:truce

### REL-82-X · Clarified

> The invitation meets the old conditions.
> EFF and FF+ sit down. Someone remembers that in 2024, the EFF ruled out sharing the national government with FF+. {actor} leaves before the welcome drinks.

**When:** Test a majority containing EFF + FF+. Any municipality (national backstory).

**Context:** In June 2024, the EFF said it would not join a GNU containing DA or FF+. By 6 November 2026, Daily Maverick reported treasurer-general Omphile Maotwe saying the party would not exclude potential partners on principle, while requiring agreement on a socialist programme. Positions and negotiating conditions can change; neither statement establishes a local agreement.

**Meaning:** Invented scene: a fictional meeting becomes awkward when someone remembers the EFF’s dated opposition to sharing national government with FF+.

**Previous wording:** The invitation meets the old conditions.
EFF and FF+ sit down. Someone reads the 2024 GNU conditions aloud. {actor} leaves before the welcome drinks.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Explains the specific 2024 condition while preserving its date and national scope.

**Current backstory — Party positions · June 2024 / November 2026:** In June 2024, the EFF said it would not join a GNU containing DA or FF+. By 6 November 2026, Daily Maverick reported treasurer-general Omphile Maotwe saying the party would not exclude potential partners on principle, while requiring agreement on a socialist programme. Positions and negotiating conditions can change; neither statement establishes a local agreement.

**Sources:** [SABC, reporting Malema’s briefing · 13 Jun 2024](https://www.sabcnews.com/sabcnews/eff-wont-join-gnu-if-da-and-ff-plus-part-of-it-malema-2/) · [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/)

**Source checks:** [SABC, reporting Malema’s briefing · 13 Jun 2024](https://www.sabcnews.com/sabcnews/eff-wont-join-gnu-if-da-and-ff-plus-part-of-it-malema-2/): read — SABC 13 June reports EFF refusal to join GNU containing DA/FF+; later 2026 stance added to avoid permanent-ban impression.; [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/): read — Daily Maverick 6 November 2026 explicitly reports Mashaba open to talks including MK with concerns; also Hill-Lewis cautious public stance and EFF new openness conditional on socialist programme.

**Code:** src/lib/seats/relationship-history.ts · eff-ff-gnu-terms:walkout

### REL-82-T · Revised

> The guest list gets a fictional rewrite.
> EFF and FF+ agree on one local repair plan in your imaginary deal. The press conference has more questions than chairs. Everyone stays.

**When:** Test a majority containing EFF + FF+. Any municipality (national backstory).

**Context:** In June 2024, the EFF said it would not join a GNU containing DA or FF+. By 6 November 2026, Daily Maverick reported treasurer-general Omphile Maotwe saying the party would not exclude potential partners on principle, while requiring agreement on a socialist programme. Positions and negotiating conditions can change; neither statement establishes a local agreement.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Restore the ideological-distance joke without claiming the abbreviations differ by exactly one character. Keep both the 2024 position and 2026 openness in the backstory.

**Current backstory — Party positions · June 2024 / November 2026:** In June 2024, the EFF said it would not join a GNU containing DA or FF+. By 6 November 2026, Daily Maverick reported treasurer-general Omphile Maotwe saying the party would not exclude potential partners on principle, while requiring agreement on a socialist programme. Positions and negotiating conditions can change; neither statement establishes a local agreement.

**Sources:** [SABC, reporting Malema’s briefing · 13 Jun 2024](https://www.sabcnews.com/sabcnews/eff-wont-join-gnu-if-da-and-ff-plus-part-of-it-malema-2/) · [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/)

**Source checks:** [SABC, reporting Malema’s briefing · 13 Jun 2024](https://www.sabcnews.com/sabcnews/eff-wont-join-gnu-if-da-and-ff-plus-part-of-it-malema-2/): read — SABC 13 June reports EFF refusal to join GNU containing DA/FF+; later 2026 stance added to avoid permanent-ban impression.; [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/): read — Daily Maverick 6 November 2026 explicitly reports Mashaba open to talks including MK with concerns; also Hill-Lewis cautious public stance and EFF new openness conditional on socialist programme.

**Code:** src/lib/seats/relationship-history.ts · eff-ff-gnu-terms:truce

### REL-83-X · Kept

> The plus-one is disputed.
> ANC and EFF agree to negotiate. They disagree about who else can join the meeting. {actor} leaves before anyone orders extra chairs.

**When:** Test a majority containing ANC + EFF. Any municipality (national backstory).

**Context:** During June 2024 negotiations, the EFF proposed cooperation with the ANC while excluding DA and FF+ participation. The ANC went on to form the GNU including those parties. This describes the negotiations, not an agreement reached between ANC and EFF.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — National negotiations · June 2024:** During June 2024 negotiations, the EFF proposed cooperation with the ANC while excluding DA and FF+ participation. The ANC went on to form the GNU including those parties. This describes the negotiations, not an agreement reached between ANC and EFF.

**Sources:** [EWN · 30 Jun 2024](https://www.ewn.co.za/2024/06/30/eff-proposes-coalition-with-anc-without-the-da-or-ff-plus) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [EWN · 30 Jun 2024](https://www.ewn.co.za/2024/06/30/eff-proposes-coalition-with-anc-without-the-da-or-ff-plus): read — EWN 30 June reports EFF proposal for ANC agreement excluding DA/FF+; records proposal, not completed alliance.

**Code:** src/lib/seats/relationship-history.ts · anc-eff-gnu-terms:walkout

### REL-83-T · Kept

> The guest list closes.
> ANC and EFF settle on a work plan for the people already at the table. Everyone stays. Further invitations can wait.

**When:** Test a majority containing ANC + EFF. Any municipality (national backstory).

**Context:** During June 2024 negotiations, the EFF proposed cooperation with the ANC while excluding DA and FF+ participation. The ANC went on to form the GNU including those parties. This describes the negotiations, not an agreement reached between ANC and EFF.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — National negotiations · June 2024:** During June 2024 negotiations, the EFF proposed cooperation with the ANC while excluding DA and FF+ participation. The ANC went on to form the GNU including those parties. This describes the negotiations, not an agreement reached between ANC and EFF.

**Sources:** [EWN · 30 Jun 2024](https://www.ewn.co.za/2024/06/30/eff-proposes-coalition-with-anc-without-the-da-or-ff-plus) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [EWN · 30 Jun 2024](https://www.ewn.co.za/2024/06/30/eff-proposes-coalition-with-anc-without-the-da-or-ff-plus): read — EWN 30 June reports EFF proposal for ANC agreement excluding DA/FF+; records proposal, not completed alliance.

**Code:** src/lib/seats/relationship-history.ts · anc-eff-gnu-terms:truce

### REL-84-X · Kept

> Available to talk. Still talking.
> ActionSA and MK agree that talks are possible. The first round is about the conditions for round two. {actor} leaves before round three is scheduled.

**When:** Test a majority containing ActionSA + MK. Any municipality (national backstory).

**Context:** On 6 November 2026, Daily Maverick reported Herman Mashaba’s openness to negotiations including MK, alongside his concerns about the party. Openness to talks is not a signed coalition or evidence that the concerns were resolved.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Confirmed 6 November 2026 report; reuse the verified source constant.

**Current backstory — Party negotiations · November 2026:** On 6 November 2026, Daily Maverick reported Herman Mashaba’s openness to negotiations including MK, alongside his concerns about the party. Openness to talks is not a signed coalition or evidence that the concerns were resolved.

**Sources:** [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/)

**Source checks:** [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/): read — Daily Maverick 6 November 2026 explicitly reports Mashaba open to talks including MK with concerns; also Hill-Lewis cautious public stance and EFF new openness conditional on socialist programme.

**Code:** src/lib/seats/relationship-history.ts · actionsa-mk-talks:walkout

### REL-84-T · Kept

> The talks reach an actual sentence.
> ActionSA and MK turn a willingness to talk into a fictional local repair plan. Everyone stays. The questions get an appendix.

**When:** Test a majority containing ActionSA + MK. Any municipality (national backstory).

**Context:** On 6 November 2026, Daily Maverick reported Herman Mashaba’s openness to negotiations including MK, alongside his concerns about the party. Openness to talks is not a signed coalition or evidence that the concerns were resolved.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Confirmed 6 November 2026 report; reuse the verified source constant.

**Current backstory — Party negotiations · November 2026:** On 6 November 2026, Daily Maverick reported Herman Mashaba’s openness to negotiations including MK, alongside his concerns about the party. Openness to talks is not a signed coalition or evidence that the concerns were resolved.

**Sources:** [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/)

**Source checks:** [Daily Maverick · 6 Nov 2026](https://www.dailymaverick.co.za/article/2026-11-06-from-actionsa-to-mk-what-gautengs-top-parties-will-demand-in-coalition-talks/): read — Daily Maverick 6 November 2026 explicitly reports Mashaba open to talks including MK with concerns; also Hill-Lewis cautious public stance and EFF new openness conditional on socialist programme.

**Code:** src/lib/seats/relationship-history.ts · actionsa-mk-talks:truce

### REL-85-X · Revised

> The policy discussion reaches page two.
> MK and FF+ agree on the meeting time. Their policy documents prove less cooperative. {actor} leaves after a very long first paragraph.

**When:** Test a majority containing MK + FF+. Any municipality (national backstory).

**Context:** At the FF+ voter-registration campaign launch in May 2026, Corné Mulder said the party preferred not to form coalitions with MK, EFF or ANC because of policy differences, while remaining open to coalition government. A stated preference is not an unconditional refusal to negotiate.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Specify voter-registration campaign, and retain Mulder’s explicit preference not to partner with MK/EFF/ANC while distinguishing preference from a blanket prohibition.

**Current backstory — National party positions · May 2026:** At the FF+ voter-registration campaign launch in May 2026, Corné Mulder said the party preferred not to form coalitions with MK, EFF or ANC because of policy differences, while remaining open to coalition government. A stated preference is not an unconditional refusal to negotiate.

**Sources:** [SABC · 21 May 2026](https://www.sabcnews.com/sabcnews/ff-plus-says-its-time-for-it-to-govern-south-africa/)

**Source checks:** [SABC · 21 May 2026](https://www.sabcnews.com/sabcnews/ff-plus-says-its-time-for-it-to-govern-south-africa/): read — SABC 21 May 2026 records voter-registration campaign launch and Mulder preferring not to form coalitions with MK/EFF/ANC over policy disagreement; not an unconditional ban.

**Code:** src/lib/seats/relationship-history.ts · mk-ff-policy-gap:walkout

### REL-85-T · Revised

> One road. Two policy documents.
> MK and FF+ disagree on plenty but approve the same local road repair in this fictional deal. Everyone stays; the wider debate gets another date.

**When:** Test a majority containing MK + FF+. Any municipality (national backstory).

**Context:** At the FF+ voter-registration campaign launch in May 2026, Corné Mulder said the party preferred not to form coalitions with MK, EFF or ANC because of policy differences, while remaining open to coalition government. A stated preference is not an unconditional refusal to negotiate.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Specify voter-registration campaign, and retain Mulder’s explicit preference not to partner with MK/EFF/ANC while distinguishing preference from a blanket prohibition.

**Current backstory — National party positions · May 2026:** At the FF+ voter-registration campaign launch in May 2026, Corné Mulder said the party preferred not to form coalitions with MK, EFF or ANC because of policy differences, while remaining open to coalition government. A stated preference is not an unconditional refusal to negotiate.

**Sources:** [SABC · 21 May 2026](https://www.sabcnews.com/sabcnews/ff-plus-says-its-time-for-it-to-govern-south-africa/)

**Source checks:** [SABC · 21 May 2026](https://www.sabcnews.com/sabcnews/ff-plus-says-its-time-for-it-to-govern-south-africa/): read — SABC 21 May 2026 records voter-registration campaign launch and Mulder preferring not to form coalitions with MK/EFF/ANC over policy disagreement; not an unconditional ban.

**Code:** src/lib/seats/relationship-history.ts · mk-ff-policy-gap:truce

### REL-86-X · Kept

> Two versions of who won.
> IFP and MK each explain why they should chair the meeting. Both explanations come with the 2024 results. {actor} leaves before a chair is chosen.

**When:** Test a majority containing IFP + MK. KwaZulu-Natal.

**Context:** MK won the largest share in KwaZulu-Natal in 2024 without an outright majority. IFP’s Thami Ntuli became premier after a 41–39 legislature vote. This provincial rivalry is not proof of a municipal agreement or a permanent ban on cooperation.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — KwaZulu-Natal · June 2024:** MK won the largest share in KwaZulu-Natal in 2024 without an outright majority. IFP’s Thami Ntuli became premier after a 41–39 legislature vote. This provincial rivalry is not proof of a municipal agreement or a permanent ban on cooperation.

**Sources:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/) · [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** src/lib/seats/relationship-history.ts · kzn-ifp-mk-premier:walkout

### REL-86-T · Kept

> The chair takes turns.
> IFP and MK agree on the repairs and a speaking order. The 2024 result can stay in the history books for one meeting. Everyone stays.

**When:** Test a majority containing IFP + MK. KwaZulu-Natal.

**Context:** MK won the largest share in KwaZulu-Natal in 2024 without an outright majority. IFP’s Thami Ntuli became premier after a 41–39 legislature vote. This provincial rivalry is not proof of a municipal agreement or a permanent ban on cooperation.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — KwaZulu-Natal · June 2024:** MK won the largest share in KwaZulu-Natal in 2024 without an outright majority. IFP’s Thami Ntuli became premier after a 41–39 legislature vote. This provincial rivalry is not proof of a municipal agreement or a permanent ban on cooperation.

**Sources:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/) · [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** src/lib/seats/relationship-history.ts · kzn-ifp-mk-premier:truce

### REL-87-X · Revised

> Who gets the credit this time?
> EFF and ActionSA agree that the mayoral win was historic. Both want their logo first on the anniversary poster. {actor} leaves before it goes to print.

**When:** Test a majority containing EFF + ActionSA. Tshwane.

**Context:** EFF support helped ActionSA’s Nasiphi Moya become Tshwane mayor in October 2024, alongside the ANC and other parties. This was a particular local arrangement, despite the earlier national Charter’s aim to keep the EFF out.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Strengthen the completed-election evidence; do not confuse support with a permanent universal alliance.

**Current backstory — Tshwane · October 2024:** EFF support helped ActionSA’s Nasiphi Moya become Tshwane mayor in October 2024, alongside the ANC and other parties. This was a particular local arrangement, despite the earlier national Charter’s aim to keep the EFF out.

**Sources:** [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997) · [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/) · [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/)

**Source checks:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.; [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/relationship-history.ts · tshwane-eff-actionsa:walkout

### REL-87-T · Revised

> The remix gets an encore.
> EFF and ActionSA agree that the next repair matters more than who gets first billing. Everyone stays in the deal.

**When:** Test a majority containing EFF + ActionSA. Tshwane.

**Context:** EFF support helped ActionSA’s Nasiphi Moya become Tshwane mayor in October 2024, alongside the ANC and other parties. This was a particular local arrangement, despite the earlier national Charter’s aim to keep the EFF out.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Strengthen the completed-election evidence; do not confuse support with a permanent universal alliance.

**Current backstory — Tshwane · October 2024:** EFF support helped ActionSA’s Nasiphi Moya become Tshwane mayor in October 2024, alongside the ANC and other parties. This was a particular local arrangement, despite the earlier national Charter’s aim to keep the EFF out.

**Sources:** [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997) · [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/) · [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/)

**Source checks:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.; [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/relationship-history.ts · tshwane-eff-actionsa:truce

### REL-88-X · Clarified

> The welcome-back package needs work.
> PA and ActionSA discuss who gets which council job. The welcome-back card has more conditions than signatures. {actor} leaves to make a counteroffer.

**When:** Test a majority containing PA + ActionSA. Johannesburg.

**Context:** ActionSA said it offered two mayoral committee positions in January 2023 to restore PA support for Johannesburg’s coalition. Its account said the negotiating teams, including PA and DA, accepted the proposal but the DA Federal Executive rejected it. This records ActionSA’s account of negotiations, not posts ultimately received by PA.

**Meaning:** Invented scene: a welcome-back offer becomes a negotiation over council jobs with more conditions than signatures.

**Previous wording:** The welcome-back package needs work.
PA and ActionSA discuss the office allocation. The welcome-back card has more conditions than signatures. {actor} leaves to make a counteroffer.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Clarity pass: Names the council jobs behind office allocation.

**Current backstory — Johannesburg · January 2023:** ActionSA said it offered two mayoral committee positions in January 2023 to restore PA support for Johannesburg’s coalition. Its account said the negotiating teams, including PA and DA, accepted the proposal but the DA Federal Executive rejected it. This records ActionSA’s account of negotiations, not posts ultimately received by PA.

**Sources:** [ActionSA account of negotiations · 25 Jan 2023](https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/)

**Source checks:** [ActionSA account of negotiations · 25 Jan 2023](https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/): read — ActionSA 25 January statement says two MMC positions offered, negotiating teams accepted, DA Federal Executive rejected; no three-position total stated.

**Code:** src/lib/seats/relationship-history.ts · joburg-pa-actionsa:walkout

### REL-88-T · Revised

> The offer finally has an answer.
> PA and ActionSA settle the roles in your fictional deal. The public announcement fits on one page. Everyone stays.

**When:** Test a majority containing PA + ActionSA. Johannesburg.

**Context:** ActionSA said it offered two mayoral committee positions in January 2023 to restore PA support for Johannesburg’s coalition. Its account said the negotiating teams, including PA and DA, accepted the proposal but the DA Federal Executive rejected it. This records ActionSA’s account of negotiations, not posts ultimately received by PA.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Attribute the reported two-portfolio offer, remove unsupported two-of-three detail, and distinguish negotiating-team acceptance from final approval and posts received.

**Current backstory — Johannesburg · January 2023:** ActionSA said it offered two mayoral committee positions in January 2023 to restore PA support for Johannesburg’s coalition. Its account said the negotiating teams, including PA and DA, accepted the proposal but the DA Federal Executive rejected it. This records ActionSA’s account of negotiations, not posts ultimately received by PA.

**Sources:** [ActionSA account of negotiations · 25 Jan 2023](https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/)

**Source checks:** [ActionSA account of negotiations · 25 Jan 2023](https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/): read — ActionSA 25 January statement says two MMC positions offered, negotiating teams accepted, DA Federal Executive rejected; no three-position total stated.

**Code:** src/lib/seats/relationship-history.ts · joburg-pa-actionsa:truce

### REL-89-X · Kept

> The unity briefing has two finales.
> EFF and PA both prepare the closing speech. The microphone has only one switch. {actor} leaves before the final final word.

**When:** Test a majority containing EFF + PA. Johannesburg.

**Context:** Johannesburg’s 2022/23 annual report lists EFF and PA among parties in the Government of Local Unity formed in January 2023. This was a wider coalition, not a standalone EFF–PA pact.

**Meaning:** Invented disagreement. Either relevant selected partner can be the actor; that does not assign historical blame.

**Game effect:** The chosen party withdraws its support. Compare remaining support with the fixed game target; council seats are unchanged.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — Johannesburg · January 2023:** Johannesburg’s 2022/23 annual report lists EFF and PA among parties in the Government of Local Unity formed in January 2023. This was a wider coalition, not a standalone EFF–PA pact.

**Sources:** [Johannesburg annual report · 2022/23](https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf)

**Source checks:** [Johannesburg annual report · 2022/23](https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf): read — Johannesburg annual report pages 35 and 40 lists ANC/EFF/PA and other parties in January 2023 GLU.

**Code:** src/lib/seats/relationship-history.ts · joburg-eff-pa:walkout

### REL-89-T · Kept

> The spotlight has room for two.
> EFF and PA agree to share the briefing and get on with the repairs. Everyone stays. The microphone survives.

**When:** Test a majority containing EFF + PA. Johannesburg.

**Context:** Johannesburg’s 2022/23 annual report lists EFF and PA among parties in the Government of Local Unity formed in January 2023. This was a wider coalition, not a standalone EFF–PA pact.

**Meaning:** Invented cooperation: the selected councillors keep supporting the deal. The source does not report this scene.

**Game effect:** No support lost.

**Review decision:** Source supports the dated historical background. Retained clear political satire without adopting disputed blame or alleging misconduct.

**Current backstory — Johannesburg · January 2023:** Johannesburg’s 2022/23 annual report lists EFF and PA among parties in the Government of Local Unity formed in January 2023. This was a wider coalition, not a standalone EFF–PA pact.

**Sources:** [Johannesburg annual report · 2022/23](https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf)

**Source checks:** [Johannesburg annual report · 2022/23](https://lg.treasury.gov.za/supportingdocs/JHB/JHB_Annual%20Report%20Draft_2023_Y_20240206T154952Z_ntuthuzeloa.pdf): read — Johannesburg annual report pages 35 and 40 lists ANC/EFF/PA and other parties in January 2023 GLU.

**Code:** src/lib/seats/relationship-history.ts · joburg-eff-pa:truce

## Fallback scenarios (16)

### FALLBACK-ANC-X · Clarified

> One party. Two plans.
> ANC’s councillors agree on the party name, then bring two different plans for the council. Half of {actor}’s delegation withholds support until they pick one.

**When:** Test a majority containing ANC. Only when no researched relationship or local history matches.

**Context:** The ANC lost its outright national majority in the 2024 election, after holding it since 1994. This is national election history, not this council’s result.

**Meaning:** Invented scene: councillors agree on their party name but cannot agree on one council plan, so half the delegation withholds support.

**Previous wording:** The caucus has two endings.
ANC agrees on the history but not the next chapter. Half of {actor}’s delegation withholds support until someone rewrites the plan.

**Game effect:** Half this party’s support is withheld, rounded up. Council seats are unchanged.

**Review decision:** Clarity pass: Makes the internal single-party disagreement concrete while preserving the half-delegation mechanic and actor placeholder.

**Current backstory — National election · May–June 2024:** The ANC lost its outright national majority in the 2024 election, after holding it since 1994. This is national election history, not this council’s result.

**Sources:** [AP · 1 Jun 2024](https://apnews.com/article/d9da7582ca98a4e00fec2da6a5fe1e91)

**Source checks:** [AP · 1 Jun 2024](https://apnews.com/article/d9da7582ca98a4e00fec2da6a5fe1e91): read — AP contemporary national results report supports loss of majority held since 1994.

**Code:** src/lib/seats/political-history.ts · national-party-anc:walkout

### FALLBACK-ANC-T · Clarified

> One party. One signed plan.
> ANC’s councillors agree which repairs come first and sign the same plan. All your councillors stay. Even the pens get a round of applause.

**When:** Test a majority containing ANC. Only when no researched relationship or local history matches.

**Context:** The ANC lost its outright national majority in the 2024 election, after holding it since 1994. This is national election history, not this council’s result.

**Meaning:** Invented scene: agreement on one repair plan earns even the signing pens an imaginary round of applause.

**Previous wording:** A new chapter everyone signs.
ANC puts the old speeches aside and agrees on the next repairs. All your councillors stay.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Replaces vague book-history references with a clear repair-plan agreement while keeping all councillors in the deal.

**Current backstory — National election · May–June 2024:** The ANC lost its outright national majority in the 2024 election, after holding it since 1994. This is national election history, not this council’s result.

**Sources:** [AP · 1 Jun 2024](https://apnews.com/article/d9da7582ca98a4e00fec2da6a5fe1e91)

**Source checks:** [AP · 1 Jun 2024](https://apnews.com/article/d9da7582ca98a4e00fec2da6a5fe1e91): read — AP contemporary national results report supports loss of majority held since 1994.

**Code:** src/lib/seats/political-history.ts · national-party-anc:truce

### FALLBACK-DA-X · Clarified

> One party. Two plans.
> DA’s councillors agree on the party name, then bring two different plans for the council. Half of {actor}’s delegation withholds support until they pick one.

**When:** Test a majority containing DA. Only when no researched relationship or local history matches.

**Context:** The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.

**Meaning:** Invented scene: councillors agree on their party name but cannot agree on one council plan, so half the delegation withholds support.

**Previous wording:** The caucus has two endings.
DA agrees on the history but not the next chapter. Half of {actor}’s delegation withholds support until someone rewrites the plan.

**Game effect:** Half this party’s support is withheld, rounded up. Council seats are unchanged.

**Review decision:** Clarity pass: Makes the internal single-party disagreement concrete while preserving the half-delegation mechanic and actor placeholder.

**Current backstory — National government · June 2024:** The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.

**Sources:** [DA election manifesto · 2024](https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [DA election manifesto · 2024](https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa): read — DA manifesto page explicitly frames Rescue Plan against ANC government.

**Code:** src/lib/seats/political-history.ts · national-party-da:walkout

### FALLBACK-DA-T · Clarified

> One party. One signed plan.
> DA’s councillors agree which repairs come first and sign the same plan. All your councillors stay. Even the pens get a round of applause.

**When:** Test a majority containing DA. Only when no researched relationship or local history matches.

**Context:** The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.

**Meaning:** Invented scene: agreement on one repair plan earns even the signing pens an imaginary round of applause.

**Previous wording:** A new chapter everyone signs.
DA puts the old speeches aside and agrees on the next repairs. All your councillors stay.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Replaces vague book-history references with a clear repair-plan agreement while keeping all councillors in the deal.

**Current backstory — National government · June 2024:** The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.

**Sources:** [DA election manifesto · 2024](https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [DA election manifesto · 2024](https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa): read — DA manifesto page explicitly frames Rescue Plan against ANC government.

**Code:** src/lib/seats/political-history.ts · national-party-da:truce

### FALLBACK-EFF-X · Clarified

> One party. Two plans.
> EFF’s councillors agree on the party name, then bring two different plans for the council. Half of {actor}’s delegation withholds support until they pick one.

**When:** Test a majority containing EFF. Only when no researched relationship or local history matches.

**Context:** EFF MPs arrived in Parliament in red workers’ overalls in May 2014. Contemporary reporting also recorded them buying food from street vendors rather than eating Parliament’s catering.

**Meaning:** Invented scene: councillors agree on their party name but cannot agree on one council plan, so half the delegation withholds support.

**Previous wording:** The caucus has two endings.
EFF agrees on the history but not the next chapter. Half of {actor}’s delegation withholds support until someone rewrites the plan.

**Game effect:** Half this party’s support is withheld, rounded up. Council seats are unchanged.

**Review decision:** Clarity pass: Makes the internal single-party disagreement concrete while preserving the half-delegation mechanic and actor placeholder.

**Current backstory — Parliament · May 2014:** EFF MPs arrived in Parliament in red workers’ overalls in May 2014. Contemporary reporting also recorded them buying food from street vendors rather than eating Parliament’s catering.

**Sources:** [Sowetan · 22 May 2014](https://www.sowetan.co.za/news/2014-05-22-eff-buys-own-food-at-parliament/)

**Source checks:** [Sowetan · 22 May 2014](https://www.sowetan.co.za/news/2014-05-22-eff-buys-own-food-at-parliament/): read — Sowetan contemporaneous report records red overalls and buying food from street vendors instead of the parliamentary catering.

**Code:** src/lib/seats/political-history.ts · national-party-eff:walkout

### FALLBACK-EFF-T · Clarified

> One party. One signed plan.
> EFF’s councillors agree which repairs come first and sign the same plan. All your councillors stay. Even the pens get a round of applause.

**When:** Test a majority containing EFF. Only when no researched relationship or local history matches.

**Context:** EFF MPs arrived in Parliament in red workers’ overalls in May 2014. Contemporary reporting also recorded them buying food from street vendors rather than eating Parliament’s catering.

**Meaning:** Invented scene: agreement on one repair plan earns even the signing pens an imaginary round of applause.

**Previous wording:** A new chapter everyone signs.
EFF puts the old speeches aside and agrees on the next repairs. All your councillors stay.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Replaces vague book-history references with a clear repair-plan agreement while keeping all councillors in the deal.

**Current backstory — Parliament · May 2014:** EFF MPs arrived in Parliament in red workers’ overalls in May 2014. Contemporary reporting also recorded them buying food from street vendors rather than eating Parliament’s catering.

**Sources:** [Sowetan · 22 May 2014](https://www.sowetan.co.za/news/2014-05-22-eff-buys-own-food-at-parliament/)

**Source checks:** [Sowetan · 22 May 2014](https://www.sowetan.co.za/news/2014-05-22-eff-buys-own-food-at-parliament/): read — Sowetan contemporaneous report records red overalls and buying food from street vendors instead of the parliamentary catering.

**Code:** src/lib/seats/political-history.ts · national-party-eff:truce

### FALLBACK-MK-X · Clarified

> One party. Two plans.
> MK’s councillors agree on the party name, then bring two different plans for the council. Half of {actor}’s delegation withholds support until they pick one.

**When:** Test a majority containing MK. Only when no researched relationship or local history matches.

**Context:** MK announced its public arrival on 16 December 2023. By its August 2024 organisational statement, it listed former South African president Jacob Zuma as party president. The joke contrasts a new party with a familiar leader; it does not identify today’s municipal candidates.

**Meaning:** Invented scene: councillors agree on their party name but cannot agree on one council plan, so half the delegation withholds support.

**Previous wording:** The caucus has two endings.
MK agrees on the history but not the next chapter. Half of {actor}’s delegation withholds support until someone rewrites the plan.

**Game effect:** Half this party’s support is withheld, rounded up. Council seats are unchanged.

**Review decision:** Clarity pass: Makes the internal single-party disagreement concrete while preserving the half-delegation mechanic and actor placeholder.

**Current backstory — National party history · December 2023–August 2024:** MK announced its public arrival on 16 December 2023. By its August 2024 organisational statement, it listed former South African president Jacob Zuma as party president. The joke contrasts a new party with a familiar leader; it does not identify today’s municipal candidates.

**Sources:** [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/political-history.ts · national-party-mk:walkout

### FALLBACK-MK-T · Clarified

> One party. One signed plan.
> MK’s councillors agree which repairs come first and sign the same plan. All your councillors stay. Even the pens get a round of applause.

**When:** Test a majority containing MK. Only when no researched relationship or local history matches.

**Context:** MK announced its public arrival on 16 December 2023. By its August 2024 organisational statement, it listed former South African president Jacob Zuma as party president. The joke contrasts a new party with a familiar leader; it does not identify today’s municipal candidates.

**Meaning:** Invented scene: agreement on one repair plan earns even the signing pens an imaginary round of applause.

**Previous wording:** A new chapter everyone signs.
MK puts the old speeches aside and agrees on the next repairs. All your councillors stay.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Replaces vague book-history references with a clear repair-plan agreement while keeping all councillors in the deal.

**Current backstory — National party history · December 2023–August 2024:** MK announced its public arrival on 16 December 2023. By its August 2024 organisational statement, it listed former South African president Jacob Zuma as party president. The joke contrasts a new party with a familiar leader; it does not identify today’s municipal candidates.

**Sources:** [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/political-history.ts · national-party-mk:truce

### FALLBACK-IFP-X · Clarified

> One party. Two plans.
> IFP’s councillors agree on the party name, then bring two different plans for the council. Half of {actor}’s delegation withholds support until they pick one.

**When:** Test a majority containing IFP. Only when no researched relationship or local history matches.

**Context:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Meaning:** Invented scene: councillors agree on their party name but cannot agree on one council plan, so half the delegation withholds support.

**Previous wording:** The caucus has two endings.
IFP agrees on the history but not the next chapter. Half of {actor}’s delegation withholds support until someone rewrites the plan.

**Game effect:** Half this party’s support is withheld, rounded up. Council seats are unchanged.

**Review decision:** Clarity pass: Makes the internal single-party disagreement concrete while preserving the half-delegation mechanic and actor placeholder.

**Current backstory — KwaZulu-Natal · June 2024:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Sources:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf) · [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** src/lib/seats/political-history.ts · national-party-ifp:walkout

### FALLBACK-IFP-T · Clarified

> One party. One signed plan.
> IFP’s councillors agree which repairs come first and sign the same plan. All your councillors stay. Even the pens get a round of applause.

**When:** Test a majority containing IFP. Only when no researched relationship or local history matches.

**Context:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Meaning:** Invented scene: agreement on one repair plan earns even the signing pens an imaginary round of applause.

**Previous wording:** A new chapter everyone signs.
IFP puts the old speeches aside and agrees on the next repairs. All your councillors stay.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Replaces vague book-history references with a clear repair-plan agreement while keeping all councillors in the deal.

**Current backstory — KwaZulu-Natal · June 2024:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Sources:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf) · [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** src/lib/seats/political-history.ts · national-party-ifp:truce

### FALLBACK-PA-X · Clarified

> One party. Two plans.
> PA’s councillors agree on the party name, then bring two different plans for the council. Half of {actor}’s delegation withholds support until they pick one.

**When:** Test a majority containing PA. Only when no researched relationship or local history matches.

**Context:** PA leader Gayton McKenzie was named Minister of Sport, Arts and Culture in June 2024. The sporting metaphors refer to that portfolio.

**Meaning:** Invented scene: councillors agree on their party name but cannot agree on one council plan, so half the delegation withholds support.

**Previous wording:** The caucus has two endings.
PA agrees on the history but not the next chapter. Half of {actor}’s delegation withholds support until someone rewrites the plan.

**Game effect:** Half this party’s support is withheld, rounded up. Council seats are unchanged.

**Review decision:** Clarity pass: Makes the internal single-party disagreement concrete while preserving the half-delegation mechanic and actor placeholder.

**Current backstory — National cabinet · June 2024:** PA leader Gayton McKenzie was named Minister of Sport, Arts and Culture in June 2024. The sporting metaphors refer to that portfolio.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/political-history.ts · national-party-pa:walkout

### FALLBACK-PA-T · Clarified

> One party. One signed plan.
> PA’s councillors agree which repairs come first and sign the same plan. All your councillors stay. Even the pens get a round of applause.

**When:** Test a majority containing PA. Only when no researched relationship or local history matches.

**Context:** PA leader Gayton McKenzie was named Minister of Sport, Arts and Culture in June 2024. The sporting metaphors refer to that portfolio.

**Meaning:** Invented scene: agreement on one repair plan earns even the signing pens an imaginary round of applause.

**Previous wording:** A new chapter everyone signs.
PA puts the old speeches aside and agrees on the next repairs. All your councillors stay.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Replaces vague book-history references with a clear repair-plan agreement while keeping all councillors in the deal.

**Current backstory — National cabinet · June 2024:** PA leader Gayton McKenzie was named Minister of Sport, Arts and Culture in June 2024. The sporting metaphors refer to that portfolio.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/political-history.ts · national-party-pa:truce

### FALLBACK-FF+-X · Clarified

> One party. Two plans.
> FF+’s councillors agree on the party name, then bring two different plans for the council. Half of {actor}’s delegation withholds support until they pick one.

**When:** Test a majority containing FF+. Only when no researched relationship or local history matches.

**Context:** FF+ leader at the time, Pieter Groenewald, was named Minister of Correctional Services in June 2024. The jokes concern the portfolio, not allegations about any coalition partner.

**Meaning:** Invented scene: councillors agree on their party name but cannot agree on one council plan, so half the delegation withholds support.

**Previous wording:** The caucus has two endings.
FF+ agrees on the history but not the next chapter. Half of {actor}’s delegation withholds support until someone rewrites the plan.

**Game effect:** Half this party’s support is withheld, rounded up. Council seats are unchanged.

**Review decision:** Clarity pass: Makes the internal single-party disagreement concrete while preserving the half-delegation mechanic and actor placeholder.

**Current backstory — National cabinet · June 2024:** FF+ leader at the time, Pieter Groenewald, was named Minister of Correctional Services in June 2024. The jokes concern the portfolio, not allegations about any coalition partner.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024) · [FF+ leadership statement · 22 Jul 2024](https://www.vfplus.org.za/media-releases/ministers-post-for-ff-plus-leader-necessitates-minor-changes-to-partys-parliamentary-leadership/)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [FF+ leadership statement · 22 Jul 2024](https://www.vfplus.org.za/media-releases/ministers-post-for-ff-plus-leader-necessitates-minor-changes-to-partys-parliamentary-leadership/): indexed-party-statement — Party identifies Groenewald as its leader and appointed Minister of Correctional Services in July 2024 statement.

**Code:** src/lib/seats/political-history.ts · national-party-ffplus:walkout

### FALLBACK-FF+-T · Clarified

> One party. One signed plan.
> FF+’s councillors agree which repairs come first and sign the same plan. All your councillors stay. Even the pens get a round of applause.

**When:** Test a majority containing FF+. Only when no researched relationship or local history matches.

**Context:** FF+ leader at the time, Pieter Groenewald, was named Minister of Correctional Services in June 2024. The jokes concern the portfolio, not allegations about any coalition partner.

**Meaning:** Invented scene: agreement on one repair plan earns even the signing pens an imaginary round of applause.

**Previous wording:** A new chapter everyone signs.
FF+ puts the old speeches aside and agrees on the next repairs. All your councillors stay.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Replaces vague book-history references with a clear repair-plan agreement while keeping all councillors in the deal.

**Current backstory — National cabinet · June 2024:** FF+ leader at the time, Pieter Groenewald, was named Minister of Correctional Services in June 2024. The jokes concern the portfolio, not allegations about any coalition partner.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024) · [FF+ leadership statement · 22 Jul 2024](https://www.vfplus.org.za/media-releases/ministers-post-for-ff-plus-leader-necessitates-minor-changes-to-partys-parliamentary-leadership/)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [FF+ leadership statement · 22 Jul 2024](https://www.vfplus.org.za/media-releases/ministers-post-for-ff-plus-leader-necessitates-minor-changes-to-partys-parliamentary-leadership/): indexed-party-statement — Party identifies Groenewald as its leader and appointed Minister of Correctional Services in July 2024 statement.

**Code:** src/lib/seats/political-history.ts · national-party-ffplus:truce

### FALLBACK-ActionSA-X · Clarified

> One party. Two plans.
> ActionSA’s councillors agree on the party name, then bring two different plans for the council. Half of {actor}’s delegation withholds support until they pick one.

**When:** Test a majority containing ActionSA. Only when no researched relationship or local history matches.

**Context:** Herman Mashaba served as Johannesburg mayor under the DA from 2016 to 2019 and launched ActionSA in August 2020. The reference is to those roles; it does not adopt either party’s accusations about their split.

**Meaning:** Invented scene: councillors agree on their party name but cannot agree on one council plan, so half the delegation withholds support.

**Previous wording:** The caucus has two endings.
ActionSA agrees on the history but not the next chapter. Half of {actor}’s delegation withholds support until someone rewrites the plan.

**Game effect:** Half this party’s support is withheld, rounded up. Council seats are unchanged.

**Review decision:** Clarity pass: Makes the internal single-party disagreement concrete while preserving the half-delegation mechanic and actor placeholder.

**Current backstory — Party history · 2016–2020:** Herman Mashaba served as Johannesburg mayor under the DA from 2016 to 2019 and launched ActionSA in August 2020. The reference is to those roles; it does not adopt either party’s accusations about their split.

**Sources:** [ActionSA organisational history](https://www.actionsa.org.za/ready-for-action/) · [ActionSA account of Mashaba’s DA mayoralty](https://www.actionsa.org.za/responding-to-often-raised-issues/) · [Johannesburg mayoral history](https://joburg.org.za/play_/Pages/Play%20in%20Joburg/Culture%20and%20Heritage/Links/Johannesburg%27s-mayors.aspx)

**Source checks:** [ActionSA organisational history](https://www.actionsa.org.za/ready-for-action/): read — ActionSA organisational page states party established 29 August 2020.; [ActionSA account of Mashaba’s DA mayoralty](https://www.actionsa.org.za/responding-to-often-raised-issues/): read — Mashaba’s 3 January 2025 account identifies former DA mayoralty and 2019 resignation. Accusations about motives are not adopted.; [Johannesburg mayoral history](https://joburg.org.za/play_/Pages/Play%20in%20Joburg/Culture%20and%20Heritage/Links/Johannesburg%27s-mayors.aspx): indexed-official-extract — City lists Herman Mashaba as mayor 2016–2019; also corroborated by official 2025 State of the City address.

**Code:** src/lib/seats/political-history.ts · national-party-actionsa:walkout

### FALLBACK-ActionSA-T · Clarified

> One party. One signed plan.
> ActionSA’s councillors agree which repairs come first and sign the same plan. All your councillors stay. Even the pens get a round of applause.

**When:** Test a majority containing ActionSA. Only when no researched relationship or local history matches.

**Context:** Herman Mashaba served as Johannesburg mayor under the DA from 2016 to 2019 and launched ActionSA in August 2020. The reference is to those roles; it does not adopt either party’s accusations about their split.

**Meaning:** Invented scene: agreement on one repair plan earns even the signing pens an imaginary round of applause.

**Previous wording:** A new chapter everyone signs.
ActionSA puts the old speeches aside and agrees on the next repairs. All your councillors stay.

**Game effect:** No support lost.

**Review decision:** Clarity pass: Replaces vague book-history references with a clear repair-plan agreement while keeping all councillors in the deal.

**Current backstory — Party history · 2016–2020:** Herman Mashaba served as Johannesburg mayor under the DA from 2016 to 2019 and launched ActionSA in August 2020. The reference is to those roles; it does not adopt either party’s accusations about their split.

**Sources:** [ActionSA organisational history](https://www.actionsa.org.za/ready-for-action/) · [ActionSA account of Mashaba’s DA mayoralty](https://www.actionsa.org.za/responding-to-often-raised-issues/) · [Johannesburg mayoral history](https://joburg.org.za/play_/Pages/Play%20in%20Joburg/Culture%20and%20Heritage/Links/Johannesburg%27s-mayors.aspx)

**Source checks:** [ActionSA organisational history](https://www.actionsa.org.za/ready-for-action/): read — ActionSA organisational page states party established 29 August 2020.; [ActionSA account of Mashaba’s DA mayoralty](https://www.actionsa.org.za/responding-to-often-raised-issues/): read — Mashaba’s 3 January 2025 account identifies former DA mayoralty and 2019 resignation. Accusations about motives are not adopted.; [Johannesburg mayoral history](https://joburg.org.za/play_/Pages/Play%20in%20Joburg/Culture%20and%20Heritage/Links/Johannesburg%27s-mayors.aspx): indexed-official-extract — City lists Herman Mashaba as mayor 2016–2019; also corroborated by official 2025 State of the City address.

**Code:** src/lib/seats/political-history.ts · national-party-actionsa:truce

## Generic scenarios (12)

### GEN-rogue · Clarified

> “We need to consult the party.”
> One councillor withholds support for an urgent party consultation. The only person consulted so far is the barista.

**When:** Any majority.

**Context:** Invented council satire; no specific historical incident.

**Meaning:** Invented scene: a supposedly urgent party consultation turns into a conversation with a barista.

**Previous wording:** “Consulting our structures.”
One councillor withholds support to consult their structures. The structures appear to be a coffee shop.

**Game effect:** One councillor withdraws support. Their council seat is unchanged.

**Review decision:** Clarity pass: Replace opaque party jargon with the plain excuse, then let the coffee shop supply the punchline.

**Code:** src/lib/seats/game.ts · rogue

### GEN-traffic · Revised

> The diversion has a diversion.
> One councillor misses the meeting after a road closure. The detour sign has developed a detour of its own.

**When:** Any majority.

**Context:** Invented council satire; no specific historical incident.

**Meaning:** An absurd detour prevents attendance; absence is distinct from losing a seat.

**Previous wording:** The blue-light delay.
One councillor misses the meeting. Their convoy is apparently stuck behind a very determined delivery scooter.

**Game effect:** One councillor is absent: support from 1 seat is unavailable in this scenario.

**Review decision:** Replace the generic VIP-convoy caricature with an ordinary detour; preserve the absence lesson.

**Code:** src/lib/seats/game.ts · traffic

### GEN-double-booked · Restored

> The ribbon-cutting clash.
> Two councillors choose a photo opportunity over the council meeting. The ribbon is cut. Your numbers are too.

**When:** Any majority.

**Context:** Invented council satire; no specific historical incident.

**Meaning:** Councillors chase a ribbon-cutting photo opportunity; “your numbers are too” turns cutting the ribbon into losing support at the meeting. The story uses one or two councillors to match the available seats.

**One-seat edge case.** The ribbon-cutting clash.
One councillor chooses a photo opportunity over the council meeting. The ribbon is cut. Your numbers are too.

**Game effect:** Support from 1 seat is unavailable through absence. Council seats are unchanged.

**Previous wording:** Two ribbon cuttings. One council.
Two councillors choose a photo opportunity over the council meeting. The ribbon is cut. Your numbers are too.

**Game effect:** Support from up to two seats is unavailable through absence. Council seats are unchanged.

**Review decision:** Restore the ribbon-cutting joke as obvious fictional publicity satire. Correct the one-seat edge case to one absent councillor and keep the attendance lesson and unchanged elected seats explicit.

**Code:** src/lib/seats/game.ts · double-booked

### GEN-committee-quarrel · Clarified

> The committee needs a committee.
> Half the {party} councillors withhold support while everyone argues over who gets to lead the committees. They agree to form another committee to decide.

**When:** Any majority.

**Context:** Invented council satire; no specific historical incident.

**Meaning:** Invented scene: an argument about committee leaders produces yet another committee.

**Previous wording:** The committee needs a committee.
Half the {party} delegation withholds support while councillors debate how to share committee roles. Madam Speaker asks who is chairing the discussion about chairs.

**Game effect:** Half the selected party’s support is withheld, rounded up.

**Review decision:** Clarity pass: Explain the leadership dispute directly and use unnecessary bureaucracy as the punchline.

**Code:** src/lib/seats/game.ts · committee-quarrel

### GEN-speaker-recess · Revised

> Madam Speaker calls tea.
> A tea break gives your councillors time to settle their disagreement. The biscuits are divided less successfully. Everyone stays.

**When:** Any majority.

**Context:** Invented council satire; no specific historical incident.

**Meaning:** A break helps settle disagreement; sharing the biscuits supplies the punchline.

**Previous wording:** Madam Speaker calls tea.
The argument is paused for tea. By the time the biscuits arrive, everyone has forgotten who threatened to leave.

**Game effect:** No support lost.

**Review decision:** Make compromise possible without implying councillors forgot the issue. Wording also fits solo-party play.

**Code:** src/lib/seats/game.ts · speaker-recess

### GEN-budget-truce · Revised

> The budget finds a majority.
> Your councillors agree which repairs come first and back the budget. Madam Speaker puts a tick next to “something we can actually do”.

**When:** Any majority.

**Context:** Invented council satire; no specific historical incident.

**Meaning:** Councillors agree spending priorities and turn their majority into a budget decision.

**Previous wording:** The budget actually passes.
Everyone agrees on the plan. The press gallery checks whether it has walked into the wrong building.

**Game effect:** No support lost.

**Review decision:** Make budgeting a normal useful outcome rather than treating competence as unbelievable. Wording also fits solo-party play.

**Code:** src/lib/seats/game.ts · budget-truce

### GEN-pothole-pact · Revised

> The pothole peace treaty.
> Residents bring photos and a repair request to the meeting. Your councillors agree on a plan. Common ground turns out to need resurfacing.

**When:** Any majority.

**Context:** Invented council satire; no specific historical incident.

**Meaning:** Residents prompt cooperation; common ground becomes a road-repair pun.

**Previous wording:** The pothole peace treaty.
Residents arrive with photographs of the same pothole from five different years. Suddenly, everyone finds common ground.

**Game effect:** No support lost.

**Review decision:** Show residents raising a repair priority and councillors agreeing on action; remove invented years of neglect.

**Code:** src/lib/seats/game.ts · pothole-pact

### GEN-photo-truce · Restored

> Just one more group photo.
> Nobody walks out: the photographer has not finished. For one glorious moment, everyone faces the same direction.

**When:** Any majority.

**Context:** Invented council satire; no specific historical incident.

**Meaning:** The wish to appear in a group photo briefly keeps everyone together. Facing the same direction is literal for the photo and figurative for agreement.

**Game effect:** No support lost.

**Review decision:** Restore a clear visual punchline about politicians staying for the group photo. It adds a lighter cooperation result alongside the service-delivery stories.

**Code:** src/lib/seats/game.ts · photo-truce

### GEN-small-exit · Restored

> “It’s a matter of principle.”
> {party} leaves the deal. The argument was definitely not about the deputy mayor’s office. Definitely.

**When:** Multi-party majority.

**Context:** Invented council satire; no specific historical incident.

**Meaning:** The repeated denial jokingly hints at a dispute over the deputy mayor’s office. This is an invented motive in a fictional scene, not an allegation about a real negotiation. The smallest party’s exit may or may not remove the majority.

**Game effect:** One selected party withdraws all its support.

**Review decision:** Restore the exaggerated principle-versus-office joke as fictional political satire. It reports no real party motive and works whether or not the departure ends the majority.

**Code:** src/lib/seats/game.ts · small-exit

### GEN-big-exit · Kept

> The big partner rage-quits.
> {party} exits the coalition WhatsApp. The others are “not panicking” at an urgent press conference.

**When:** Multi-party majority.

**Context:** Invented council satire; no specific historical incident.

**Meaning:** A major partner’s departure becomes a WhatsApp exit followed by a hurried press conference.

**Game effect:** One selected party withdraws all its support.

**Review decision:** Clearly fictional messaging-group joke, with no factual claim of misconduct.

**Code:** src/lib/seats/game.ts · big-exit

### GEN-random-exit · Kept

> The voice note was forwarded.
> {party} accidentally sends the private coalition voice note to the public group. The apology is seven minutes long. Then the party leaves.

**When:** Multi-party majority.

**Context:** Invented council satire; no specific historical incident.

**Meaning:** An invented forwarding mistake and long apology disrupt the deal. No real leak is alleged.

**Game effect:** One selected party withdraws all its support.

**Review decision:** Clearly fictional forwarding mistake; no real recording or quote is alleged.

**Code:** src/lib/seats/game.ts · random-exit

### GEN-caucus-split · Clarified

> One party. Two group chats.
> Half your party’s councillors refuse to back the deal. Both sides claim to speak for the whole party. Both have made a new group icon.

**When:** Solo-party majority.

**Context:** Invented council satire; no specific historical incident.

**Meaning:** Invented scene: a split within one party becomes rival group chats, each claiming to represent everyone.

**Previous wording:** The caucus has two group chats.
Half your caucus rebels. Both factions insist they are the real caucus. Both have made a new group icon.

**Game effect:** Half the selected party’s support is withheld, rounded up.

**Review decision:** Clarity pass: Name the party split without requiring the term caucus. State whose support is withheld while keeping the competing group icons.

**Code:** src/lib/seats/game.ts · caucus-split

## Loading & other flavour (20)

### LOAD-01 · Kept

> Muting the coalition group chat…

**When:** During a roll. Sets of lines cycle across successive rolls.

**Context:** Invented negotiation theatre.

**Meaning:** Imaginary coalition WhatsApp chatter is silenced before bargaining.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/client.ts

### LOAD-02 · Revised

> Comparing the parties’ priorities…

**When:** During a roll. Sets of lines cycle across successive rolls.

**Context:** Invented negotiation theatre.

**Meaning:** A fictional preparation step before the scenario is revealed.

**Previous wording:** Negotiating the parking bays…

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/client.ts

### LOAD-03 · Kept

> Counting who is still in the room…

**When:** During a roll. Sets of lines cycle across successive rolls.

**Context:** Invented negotiation theatre.

**Meaning:** The seat count becomes a literal headcount in the room.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/client.ts

### LOAD-04 · Kept

> Finding a bigger bargaining table…

**When:** During a roll. Sets of lines cycle across successive rolls.

**Context:** Invented negotiation theatre.

**Meaning:** The deal has enough parties to need more furniture.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/client.ts

### LOAD-05 · Kept

> Agreeing who gets the microphone…

**When:** During a roll. Sets of lines cycle across successive rolls.

**Context:** Invented negotiation theatre.

**Meaning:** Speaking time is treated as a prized political resource.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/client.ts

### LOAD-06 · Kept

> Checking the fine print…

**When:** During a roll. Sets of lines cycle across successive rolls.

**Context:** Invented negotiation theatre.

**Meaning:** The participants finally read what they agreed to.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/client.ts

### LOAD-07 · Clarified

> Calling an urgent party meeting…

**When:** During a roll. Sets of lines cycle across successive rolls.

**Context:** Invented negotiation theatre.

**Meaning:** The parties pause for an emergency discussion.

**Previous wording:** Calling an urgent caucus…

**Review decision:** Clarity pass: Use the everyday meaning of caucus in the loading line.

**Code:** src/lib/seats/client.ts

### LOAD-08 · Revised

> Reading the proposed agreement…

**When:** During a roll. Sets of lines cycle across successive rolls.

**Context:** Invented negotiation theatre.

**Meaning:** A fictional preparation step before the scenario is revealed.

**Previous wording:** Locating the missing minutes…

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/client.ts

### LOAD-09 · Kept

> Asking Madam Speaker to count again…

**When:** During a roll. Sets of lines cycle across successive rolls.

**Context:** Invented negotiation theatre.

**Meaning:** The bird/Speaker checks the arithmetic again.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/client.ts

### LOAD-00 · Kept

> Behind closed doors…

**When:** Loading heading.

**Context:** Fictional game framing, not a historical claim.

**Meaning:** A brief pause before the fictional result.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/components/CoalitionGame.astro

### DICE-ERROR · Kept

> The dice got stuck. Try again.

**When:** Random-municipality request fails.

**Context:** Fictional game framing, not a historical claim.

**Meaning:** A dice metaphor for trying again.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/lib/seats/client.ts

### DICE-ERROR-02 · Kept

> Couldn’t pick a council. Give it another roll.

**When:** Random-municipality request fails.

**Context:** Fictional game framing, not a historical claim.

**Meaning:** A playful retry message.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/pages/api/coalition/random.ts

### STORY-01 · Kept

> Madam Speaker takes the floor.

**When:** Introduction heading.

**Context:** Fictional game framing, not a historical claim.

**Meaning:** The Speaker starts her introduction.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/components/CoalitionStory.astro

### STORY-02 · Revised

> “I’m Madam Speaker. Secretary bird. Keeper of the gavel. Please don’t make me use it.

**When:** Madam Speaker’s introduction.

**Context:** Fictional game framing, not a historical claim.

**Meaning:** The fictional secretary bird hosts the bargaining table; players choose the partners.

**Previous wording:** “I’m Madam Speaker. Secretary bird. Keeper of the gavel. Apparently the only one who read the agenda.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/components/CoalitionStory.astro

### STORY-03 · Revised

> Welcome to the bargaining table in {municipality}. One mayoral chain, several competing plans. You bring the partners. I’ll put the kettle on.”

**When:** Madam Speaker’s introduction.

**Context:** Fictional game framing, not a historical claim.

**Meaning:** The fictional secretary bird hosts the bargaining table; players choose the partners.

**Previous wording:** Welcome to the bargaining table in {municipality}. The cast has arrived with old grudges, new friendships and very strong opinions about the mayor’s parking bay. You’re putting a deal together. I’m putting the kettle on. This could take a while.”

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/components/CoalitionStory.astro

### STORY-04 · Kept

> The honourable cast

**When:** Leader cameo strip.

**Context:** Fictional game framing, not a historical claim.

**Meaning:** A parliamentary form of address frames the leaders as a cast.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/components/CoalitionStory.astro

### PROMO-01 · Kept

> Keep {municipality} together.

**When:** Promotion naming a municipality.

**Context:** Fictional game framing, not a historical claim.

**Meaning:** Keep its fictional deal together.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/components/ChaosPromo.astro

### PROMO-02 · Kept

> Build a majority. Survive the drama.

**When:** Generic promotion.

**Context:** Fictional game framing, not a historical claim.

**Meaning:** Build support, then test fictional disruption.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/components/ChaosPromo.astro

### PICKER-01 · Kept

> Coalition Chaos · Choose your arena

**When:** Municipality picker.

**Context:** Fictional game framing, not a historical claim.

**Meaning:** Choosing a council becomes choosing a game arena.

**Review decision:** Reviewed all generic banter, deal names, loading lines, introduction, functional labels and rules against the runtime. Removed claims that every partner is pivotal when only some are; reduced insinuations about perks and incompetence. Historical dates are visible in closed disclosure summaries. An independent subagent checked solo-party wording and outcome consistency. A second editorial pass restores obvious personality exaggeration and fictional publicity jokes; those do not need literal proof. Factual premises and support arithmetic remain checked.

**Code:** src/components/CoalitionPicker.astro

### RULES-STORY · Revised

> Inspired by the kingmaker politics and shifting alliances documented in MISTRA’s Coalitions Barometer. In May 2023, Johannesburg elected Al Jama-ah’s Kabelo Gwamanda mayor with 139 votes: a small party can win a very big chair. City record ↗

**When:** Expanded Rules, real politics & sources below the game.

**Context:** Johannesburg elected Al Jama-ah’s Kabelo Gwamanda mayor with 139 votes in May 2023.

**Meaning:** A small party’s candidate can secure the mayoralty with wider support.

**Previous wording:** Inspired by the kingmaker politics and shifting alliances documented in MISTRA’s Coalitions Barometer. In May 2023, Johannesburg elected Al Jama-ah’s Kabelo Gwamanda mayor with 139 votes: a small party can win a very big chair.

**Review decision:** 139 means votes in the mayoral election, not Al Jama-ah’s own seats.

**Current backstory — Johannesburg · May 2023:** Johannesburg elected Al Jama-ah’s Kabelo Gwamanda mayor with 139 votes in May 2023.

**Sources:** [Johannesburg mayoral election record · May 2023](https://joburg.org.za/media_/Pages/Media/Media%20Statements/2023%20Media%20Statements/May/Joburg-elects-the-Executive-Mayor.aspx) · [MISTRA Coalitions Barometer](https://coalitions.mistra.org.za/)

**Source checks:** [https://joburg.org.za/media_/Pages/Media/Media%20Statements/2023%20Media%20Statements/May/Joburg-elects-the-Executive-Mayor.aspx](https://joburg.org.za/media_/Pages/Media/Media%20Statements/2023%20Media%20Statements/May/Joburg-elects-the-Executive-Mayor.aspx): read

**Code:** src/pages/2026/places/[slug]/coalition.astro

## Result & context copy (15)

### UI-01 · Revised

> {You still have a majority. / You lose your majority.}

**When:** Result verdict.

**Context:** Functional explanation, not a joke.

**Meaning:** Compares support with the fixed target.

**Previous wording:** You still have a majority. / You lose your majority.

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/lib/seats/client.ts

### UI-02 · Revised

> {original} − {lost} = {remaining}

**When:** Result arithmetic.

**Context:** Functional explanation, not a joke.

**Meaning:** Support withdrawn does not remove elected seats.

**Previous wording:** {original} − {lost} = {remaining} seats

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/lib/seats/client.ts

### UI-03 · Revised

> {target} needed · {margin}
> just enough. No seats to spare. / {spare} {seat / seats} to spare. / {shortfall} {seat / seats} short.

**When:** Result margin.

**Context:** Functional explanation, not a joke.

**Meaning:** Calculated against the same fixed target.

**Previous wording:** {target} needed · just enough. No seats to spare. / {spare} seat(s) to spare. / {shortfall} seat(s) short.

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/lib/seats/client.ts

### UI-04 · Revised

> Fresh roll · starting with all {original} seats
> This roll started with all {original} seats
> Restart with {original} seats

**When:** Loading, result and restart.

**Context:** Functional explanation, not a joke.

**Meaning:** Every roll starts from the original selection.

**Previous wording:** Fresh roll · starting with all {original} seats / This roll started with all {original} seats / Restart with {original} seats

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/lib/seats/client.ts

### UI-05 · Revised

> OUT · −{loss.lost} / −{loss.lost} support / In original deal / Stays / {exiting parties} {walks / walk} out

**When:** Party support and exit labels.

**Context:** Functional explanation, not a joke.

**Meaning:** Separates full exits from partial withdrawals.

**Previous wording:** OUT · −{lost} / −{lost} support / In original deal / Stays / {party} walks out / {parties} walk out

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/lib/seats/client.ts

### UI-06 · Revised

> Fictional scenario

**When:** Scenario heading.

**Context:** Functional explanation, not a joke.

**Meaning:** Labels the event as invented.

**Previous wording:** Fictional politics · fresh roll

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/components/CoalitionGame.astro

### UI-07 · Revised

> This scenario is invented for the game. Lost support does not remove elected seats. Your original deal is unchanged; the majority target stays fixed.

**When:** Scenario footer.

**Context:** Functional explanation, not a joke.

**Meaning:** Explains the limited support model.

**Previous wording:** Fictional seat test. Your original deal is unchanged; the majority target stays fixed.

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/components/CoalitionGame.astro

### UI-08 · Revised

> Hypothetical deal · {Estimated / Provisional IEC-reported} seats · Fictional scenario

**When:** Game data status.

**Context:** Functional explanation, not a joke.

**Meaning:** Distinguishes source data from fiction.

**Previous wording:** Hypothetical deal · Estimated / Provisional IEC-reported seats · Fictional drama

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/components/CoalitionGame.astro

### UI-09 · Revised

> Fictional scenario. Party cameos, not a full list of local candidates.

**When:** Leader caption.

**Context:** Functional explanation, not a joke.

**Meaning:** National portraits are not local-candidate claims.

**Previous wording:** National leader cameos, not local candidates. The drama is fictional.

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/components/CoalitionStory.astro

### UI-10 · Revised

> Historical context · {history.period}

**When:** Historical disclosure.

**Context:** Functional explanation, not a joke.

**Meaning:** Displays the period with the context.

**Previous wording:** The real backstory

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/lib/seats/client.ts

### UI-11 · Kept

> Tap parties to reach {majority} seats, then roll the dice for one fictional scenario. Every roll starts from your original deal. Previously drawn scenarios stay out of the deck until the applicable cards run out. Every party follows the same rules. A “key partner” is one whose departure would put your deal below the majority target. Plot twists do not change the real results or your selection.

**When:** Expanded rules.

**Context:** Functional explanation, not a joke.

**Meaning:** Explains selection, independent rolls and pivotal partners.

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/pages/2026/places/[slug]/coalition.astro

### UI-12 · Kept

> A seat majority does not confirm a governing agreement. The game uses a fixed majority of all council seats; real council votes can involve different attendance and voting rules. The caricatures represent national party leaders, not local candidates.

**When:** Expanded scope.

**Context:** Functional explanation, not a joke.

**Meaning:** Separates the game target from real council procedure.

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/pages/2026/places/[slug]/coalition.astro

### UI-13 · Kept

> Test the deal ↗ / Roll the dice / Try another coalition / Skip to result →

**When:** Action buttons.

**Context:** Functional explanation, not a joke.

**Meaning:** Test a scenario, return to selection or skip the animation.

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/components/CoalitionGame.astro

### UI-14 · Added

> Satire with sourced historical context. No affiliation or endorsement implied. Game context · Terms & liability limits · Report a concern

**When:** Satire and endorsement note.

**Context:** Functional explanation, not a joke.

**Meaning:** Explains the context and how to report concerns.

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/components/CoalitionGame.astro

### UI-15 · Added

> {unavailableSeats} independent seats are grouped in the source and can’t be invited separately.

**When:** Grouped independent seats.

**Context:** Functional explanation, not a joke.

**Meaning:** Explains why grouped data cannot be selected individually.

**Review decision:** Display alternatives are grouped; braces represent game values.

**Code:** src/components/CoalitionGame.astro

## Learning after a roll (8)

### LEARN-budget · Added

> A majority has work to do
> A council also decides how public money is spent. Its budget needs support from a majority of all council members, not just the largest party.
> How to have a say on the budget → /participate#budgets

**When:** Outcome lesson: budget.

**Context:** The resolved outcome and general council procedure.

**Meaning:** Explains the result and links to civic information or participation.

**Review decision:** Reviewed outcome explanations against code and Constitution section160: fixed game majority differs from actual voting rules; budgets need a majority of all members; withdrawal of support does not remove elected seats. Civic participation guidance is general and directs readers to local procedures.

**Source checks:** [https://www.justice.gov.za/constitution/chp07.html](https://www.justice.gov.za/constitution/chp07.html): read — Sections152 and160 support public involvement, quorum and voting distinctions.; [https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/](https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/): indexed-text-read — Official indexed text describes ward committees and community involvement in IDP/budgets. Direct opening timed out.

**Code:** src/lib/seats/learning.ts · lesson-budget

### LEARN-residents · Added

> Residents have a part to play
> In this story, residents give the parties a reason to cooperate. In real life, you can raise local priorities through ward meetings and comments on municipal plans.
> Ways to raise a local priority → /participate#priorities

**When:** Outcome lesson: residents.

**Context:** The resolved outcome and general council procedure.

**Meaning:** Explains the result and links to civic information or participation.

**Review decision:** Reviewed outcome explanations against code and Constitution section160: fixed game majority differs from actual voting rules; budgets need a majority of all members; withdrawal of support does not remove elected seats. Civic participation guidance is general and directs readers to local procedures.

**Source checks:** [https://www.justice.gov.za/constitution/chp07.html](https://www.justice.gov.za/constitution/chp07.html): read — Sections152 and160 support public involvement, quorum and voting distinctions.; [https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/](https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/): indexed-text-read — Official indexed text describes ward committees and community involvement in IDP/budgets. Direct opening timed out.

**Code:** src/lib/seats/learning.ts · lesson-residents

### LEARN-attendance · Added

> Attendance and support are different
> This roll leaves {remaining} {seat / seats} supporting your deal against the fixed {target}-seat game target. Real council votes also have quorum and voting rules; an absence does not remove an elected seat.
> How council decisions work → /participate#decisions

**When:** Outcome lesson: attendance.

**Context:** The resolved outcome and general council procedure.

**Meaning:** Explains the result and links to civic information or participation.

**Review decision:** Reviewed outcome explanations against code and Constitution section160: fixed game majority differs from actual voting rules; budgets need a majority of all members; withdrawal of support does not remove elected seats. Civic participation guidance is general and directs readers to local procedures.

**Source checks:** [https://www.justice.gov.za/constitution/chp07.html](https://www.justice.gov.za/constitution/chp07.html): read — Sections152 and160 support public involvement, quorum and voting distinctions.; [https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/](https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/): indexed-text-read — Official indexed text describes ward committees and community involvement in IDP/budgets. Direct opening timed out.

**Code:** src/lib/seats/learning.ts · lesson-attendance

### LEARN-cooperation · Added

> Agreement needs more than numbers
> All {original} {seat / seats} still support your deal. The numbers show a possible majority; a real governing agreement also needs people to agree on decisions and responsibilities.
> How council majorities work → /guide#outcomes

**When:** Outcome lesson: cooperation.

**Context:** The resolved outcome and general council procedure.

**Meaning:** Explains the result and links to civic information or participation.

**Review decision:** Reviewed outcome explanations against code and Constitution section160: fixed game majority differs from actual voting rules; budgets need a majority of all members; withdrawal of support does not remove elected seats. Civic participation guidance is general and directs readers to local procedures.

**Source checks:** [https://www.justice.gov.za/constitution/chp07.html](https://www.justice.gov.za/constitution/chp07.html): read — Sections152 and160 support public involvement, quorum and voting distinctions.; [https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/](https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/): indexed-text-read — Official indexed text describes ward committees and community involvement in IDP/budgets. Direct opening timed out.

**Code:** src/lib/seats/learning.ts · lesson-cooperation

### LEARN-caucus · Added

> A party can split on a vote
> Councillors from the same party can disagree on a vote and may face party discipline. Losing half a delegation’s support is a fictional game rule, not a prediction. Their elected seats stay unchanged in this roll.
> Real examples of a caucus split → /participate#caucuses

**When:** Outcome lesson: caucus.

**Context:** The resolved outcome and general council procedure.

**Meaning:** Explains the result and links to civic information or participation.

**Review decision:** Reviewed outcome explanations against code and Constitution section160: fixed game majority differs from actual voting rules; budgets need a majority of all members; withdrawal of support does not remove elected seats. Civic participation guidance is general and directs readers to local procedures.

**Source checks:** [https://www.justice.gov.za/constitution/chp07.html](https://www.justice.gov.za/constitution/chp07.html): read — Sections152 and160 support public involvement, quorum and voting distinctions.; [https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/](https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/): indexed-text-read — Official indexed text describes ward committees and community involvement in IDP/budgets. Direct opening timed out.

**Code:** src/lib/seats/learning.ts · lesson-caucus

### LEARN-cushion · Added

> {Your cushion is used up / Extra support gave you a cushion}
> Your deal started {original - target} {seat / seats} above the target. After losing support from {lost} {seat / seats}, it still reaches {target}{, with none to spare / , with {spare} to spare}.
> How council majorities work → /guide#outcomes

**When:** Outcome lesson: cushion.

**Context:** The resolved outcome and general council procedure.

**Meaning:** Explains the result and links to civic information or participation.

**Review decision:** Reviewed outcome explanations against code and Constitution section160: fixed game majority differs from actual voting rules; budgets need a majority of all members; withdrawal of support does not remove elected seats. Civic participation guidance is general and directs readers to local procedures.

**Source checks:** [https://www.justice.gov.za/constitution/chp07.html](https://www.justice.gov.za/constitution/chp07.html): read — Sections152 and160 support public involvement, quorum and voting distinctions.; [https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/](https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/): indexed-text-read — Official indexed text describes ward committees and community involvement in IDP/budgets. Direct opening timed out.

**Code:** src/lib/seats/learning.ts · lesson-cushion

### LEARN-pivotal · Added

> A key partner has bargaining power
> {party} held {party.seats} {seat / seats} in your deal. Without its support, you have {remaining} of the {target} needed.{ A partner can be decisive without holding a majority on its own. /  A deal depends on who continues to support it.}
> How council majorities work → /guide#outcomes

**When:** Outcome lesson: pivotal.

**Context:** The resolved outcome and general council procedure.

**Meaning:** Explains the result and links to civic information or participation.

**Review decision:** Reviewed outcome explanations against code and Constitution section160: fixed game majority differs from actual voting rules; budgets need a majority of all members; withdrawal of support does not remove elected seats. Civic participation guidance is general and directs readers to local procedures.

**Source checks:** [https://www.justice.gov.za/constitution/chp07.html](https://www.justice.gov.za/constitution/chp07.html): read — Sections152 and160 support public involvement, quorum and voting distinctions.; [https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/](https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/): indexed-text-read — Official indexed text describes ward committees and community involvement in IDP/budgets. Direct opening timed out.

**Code:** src/lib/seats/learning.ts · lesson-pivotal

### LEARN-support · Added

> Seats do not guarantee support
> Your deal began with {original} {seat / seats}, but only {remaining} support it in this scenario. Withholding support changes this deal's numbers, not the council's election result.
> How council majorities work → /guide#outcomes

**When:** Outcome lesson: support.

**Context:** The resolved outcome and general council procedure.

**Meaning:** Explains the result and links to civic information or participation.

**Review decision:** Reviewed outcome explanations against code and Constitution section160: fixed game majority differs from actual voting rules; budgets need a majority of all members; withdrawal of support does not remove elected seats. Civic participation guidance is general and directs readers to local procedures.

**Source checks:** [https://www.justice.gov.za/constitution/chp07.html](https://www.justice.gov.za/constitution/chp07.html): read — Sections152 and160 support public involvement, quorum and voting distinctions.; [https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/](https://www.cogta.gov.za/index.php/2023/08/28/municipal-ward-committees-need-know/): indexed-text-read — Official indexed text describes ward committees and community involvement in IDP/budgets. Direct opening timed out.

**Code:** src/lib/seats/learning.ts · lesson-support

## Removed copy (46)

### ANC-02 · Removed

> ANC: liberation movement meets “please RSVP”.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** The ANC lost its outright national majority in the 2024 election, after holding it since 1994. This is national election history, not this council’s result.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Replace the controller metaphor with the original main-character punchline: a clear caricature of a formerly dominant party after losing its majority. The claim of thirty years governing alone stays removed. Also retain the lost-majority/cooperation idea in clearer game-prompt wording: select a coalition partner to continue.

**Archived backstory — National election · May–June 2024:** The ANC lost its outright national majority in the 2024 election, after holding it since 1994. This is national election history, not this council’s result.

**Sources:** [AP · 1 Jun 2024](https://apnews.com/article/d9da7582ca98a4e00fec2da6a5fe1e91)

**Source checks:** [AP · 1 Jun 2024](https://apnews.com/article/d9da7582ca98a4e00fec2da6a5fe1e91): read — AP contemporary national results report supports loss of majority held since 1994.

**Code:** src/lib/seats/party-commentary.ts · intro-anc-majority

### ANC-07 · Removed

> ANC: apparently “renewal” comes with eleven sets of demands.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** The Presidency named eleven GNU participants in June 2024, including ANC and DA. It also said the need for inclusion prevented the planned reduction in government portfolios.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the remote-control joke as recognisable political-personality satire, not a literal claim about Cabinet behaviour. Keep the verified eleven-party context.

**Archived backstory — National government · June 2024:** The Presidency named eleven GNU participants in June 2024, including ANC and DA. It also said the need for inclusion prevented the planned reduction in government portfolios.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-anc-gnu

### ANC-12 · Removed

> ANC: the ex-president took “renewal” as permission to start another party.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the seeing-other-parties relationship joke. It describes Zuma backing MK without reintroducing the claim that he founded the party.

**Archived backstory — National party history · December 2023–January 2024:** Former ANC president Jacob Zuma backed MK in December 2023. The ANC announced his suspension in January 2024 over support for another party.

**Sources:** [ANC membership statement · 29 Jan 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/)

**Source checks:** [ANC membership statement · 29 Jan 2024](https://www.anc1912.org.za/statement-of-the-national-executive-committee-of-the-anc-on-the-membership-of-jacob-zuma/): read — ANC statement dated 29 January confirms 16 December support announcement and immediate suspension resolution.

**Code:** src/lib/seats/party-commentary.ts · intro-anc-zuma

### DA-04 · Removed

> DA: apparently the road out of ANC rule has a Cabinet stopover.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the sharper desk and rescue-into-a-meeting jokes. These are satirical opinions about a public political reversal, not evidence of private wrongdoing. Remove the weaker Cabinet-stopover variant to avoid excessive repetition.

**Archived backstory — National government · June 2024:** The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.

**Sources:** [DA election manifesto · 2024](https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [DA election manifesto · 2024](https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa): read — DA manifesto page explicitly frames Rescue Plan against ANC government.

**Code:** src/lib/seats/party-commentary.ts · intro-da-gnu

### DA-07 · Removed

> DA: from opposition benches to Agriculture. Same speeches, new fertiliser.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** John Steenhuisen, then the DA leader, was named Minister of Agriculture in the June 2024 cabinet announcement. The reference is to that appointment, not a current leadership roster.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore manure-management wordplay: the metaphor is obviously about political argument and farming, not an allegation requiring proof. Keep Steenhuisen’s surname and the corrected historical-role context.

**Archived backstory — National cabinet · June 2024:** John Steenhuisen, then the DA leader, was named Minister of Agriculture in the June 2024 cabinet announcement. The reference is to that appointment, not a current leadership roster.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-da-agriculture

### DA-08 · Removed

> DA: John got Agriculture. Turns out coalition partners also need rotating.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** John Steenhuisen, then the DA leader, was named Minister of Agriculture in the June 2024 cabinet announcement. The reference is to that appointment, not a current leadership roster.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore manure-management wordplay: the metaphor is obviously about political argument and farming, not an allegation requiring proof. Keep Steenhuisen’s surname and the corrected historical-role context.

**Archived backstory — National cabinet · June 2024:** John Steenhuisen, then the DA leader, was named Minister of Agriculture in the June 2024 cabinet announcement. The reference is to that appointment, not a current leadership roster.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-da-agriculture

### DA-11 · Removed

> DA: those old EFF votes are not invited to the campaign launch.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** The DA’s July 2019 account acknowledged EFF support on an issue-by-issue basis for DA-led councils after 2016. This was not a formal DA–EFF coalition. Later refusals do not erase those earlier votes.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the flexible-municipal-red-lines joke as commentary on dated positions. The factual paragraph still distinguishes issue-by-issue support from a formal coalition.

**Archived backstory — Municipal politics · 2016–2019:** The DA’s July 2019 account acknowledged EFF support on an issue-by-issue basis for DA-led councils after 2016. This was not a formal DA–EFF coalition. Later refusals do not erase those earlier votes.

**Sources:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power)

**Source checks:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power): read — DA July 2019 account explicitly distinguishes issue-by-issue EFF support from the formal governing coalition.; [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists): read — DA 17 July 2024 statement expressly says GNU role is to prevent MK/EFF access to executive power.

**Code:** src/lib/seats/party-commentary.ts · intro-da-eff-support

### DA-12 · Removed

> DA: the EFF chapter has been filed under “please don’t bring that up”.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** The DA’s July 2019 account acknowledged EFF support on an issue-by-issue basis for DA-led councils after 2016. This was not a formal DA–EFF coalition. Later refusals do not erase those earlier votes.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the flexible-municipal-red-lines joke as commentary on dated positions. The factual paragraph still distinguishes issue-by-issue support from a formal coalition.

**Archived backstory — Municipal politics · 2016–2019:** The DA’s July 2019 account acknowledged EFF support on an issue-by-issue basis for DA-led councils after 2016. This was not a formal DA–EFF coalition. Later refusals do not erase those earlier votes.

**Sources:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power)

**Source checks:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power): read — DA July 2019 account explicitly distinguishes issue-by-issue EFF support from the formal governing coalition.; [DA statement · 17 Jul 2024](https://www.da.org.za/2024/07/the-da-remains-sas-defence-against-the-radicals-and-anti-constitutionalists): read — DA 17 July 2024 statement expressly says GNU role is to prevent MK/EFF access to executive power.

**Code:** src/lib/seats/party-commentary.ts · intro-da-eff-support

### EFF-05 · Removed

> EFF: anti-DA on stage. Occasional technical support in council.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** After the 2016 municipal elections, the EFF supported some DA-led administrations on individual issues without joining a formal governing coalition. The DA acknowledged this arrangement in July 2019.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the principles/terms-and-conditions joke as a concise political contradiction grounded in the verified support arrangement.

**Archived backstory — Municipal politics · 2016–2019:** After the 2016 municipal elections, the EFF supported some DA-led administrations on individual issues without joining a formal governing coalition. The DA acknowledged this arrangement in July 2019.

**Sources:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power)

**Source checks:** [DA account of earlier EFF support · July 2019](https://www.da.org.za/2019/07/bokamoso-the-da-will-never-sacrifice-our-core-principles-on-the-altar-of-power): read — DA July 2019 account explicitly distinguishes issue-by-issue EFF support from the formal governing coalition.

**Code:** src/lib/seats/party-commentary.ts · intro-eff-kingmaker

### EFF-10 · Removed

> EFF: Floyd took “economic freedom” as permission to explore his options.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This describes that transfer, not his subsequent positions.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Use the clearer proposed deputy-to-MK joke and retain one T-shirt variant. Remove opaque freedom-of-movement/economic-freedom wordplay.

**Archived backstory — National party history · August 2024:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This describes that transfer, not his subsequent positions.

**Sources:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party) · [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party): read — EWN 15 August report confirms Shivambu leaving EFF and joining MK.; [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/party-commentary.ts · intro-eff-shivambu

### EFF-11 · Removed

> EFF: the revolution was going well until the deputy found another revolution.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This describes that transfer, not his subsequent positions.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Use the clearer proposed deputy-to-MK joke and retain one T-shirt variant. Remove opaque freedom-of-movement/economic-freedom wordplay.

**Archived backstory — National party history · August 2024:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This describes that transfer, not his subsequent positions.

**Sources:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party) · [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party): read — EWN 15 August report confirms Shivambu leaving EFF and joining MK.; [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/party-commentary.ts · intro-eff-shivambu

### MK-03 · Removed

> MK: a fresh start with a very familiar chorus.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** MK’s organisational statement dates its public arrival to 16 December 2023 and identifies former South African president Jacob Zuma as its leader. The joke concerns that launch, not today’s municipal candidates.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep the strongest new-party/familiar-president and lead-singer jokes; remove near duplicates. Distinguish December 2023 public launch from the August 2024 statement naming Zuma party president.

**Archived backstory — National party history · December 2023:** MK’s organisational statement dates its public arrival to 16 December 2023 and identifies former South African president Jacob Zuma as its leader. The joke concerns that launch, not today’s municipal candidates.

**Sources:** [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/party-commentary.ts · intro-mk-arrival

### MK-04 · Removed

> MK: new badge. The introductions still take thirty years.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** MK’s organisational statement dates its public arrival to 16 December 2023 and identifies former South African president Jacob Zuma as its leader. The joke concerns that launch, not today’s municipal candidates.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep the strongest new-party/familiar-president and lead-singer jokes; remove near duplicates. Distinguish December 2023 public launch from the August 2024 statement naming Zuma party president.

**Archived backstory — National party history · December 2023:** MK’s organisational statement dates its public arrival to 16 December 2023 and identifies former South African president Jacob Zuma as its leader. The joke concerns that launch, not today’s municipal candidates.

**Sources:** [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/party-commentary.ts · intro-mk-arrival

### MK-07 · Removed

> MK: the recruitment poster was apparently an EFF group photo.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** Floyd Shivambu moved from the EFF to MK in August 2024 and was named MK National Organiser on 22 August. This is a dated episode, not a statement about his current affiliation.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the spare-parts recruitment metaphor as ordinary satire of party-switching politicians. The misleading implication that Shivambu became MK deputy president remains removed.

**Archived backstory — National party history · August 2024:** Floyd Shivambu moved from the EFF to MK in August 2024 and was named MK National Organiser on 22 August. This is a dated episode, not a statement about his current affiliation.

**Sources:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party) · [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party): read — EWN 15 August report confirms Shivambu leaving EFF and joining MK.; [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/party-commentary.ts · intro-mk-recruit

### MK-08 · Removed

> MK: new-party smell. Previously employed leadership.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** Floyd Shivambu moved from the EFF to MK in August 2024 and was named MK National Organiser on 22 August. This is a dated episode, not a statement about his current affiliation.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the spare-parts recruitment metaphor as ordinary satire of party-switching politicians. The misleading implication that Shivambu became MK deputy president remains removed.

**Archived backstory — National party history · August 2024:** Floyd Shivambu moved from the EFF to MK in August 2024 and was named MK National Organiser on 22 August. This is a dated episode, not a statement about his current affiliation.

**Sources:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party) · [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party): read — EWN 15 August report confirms Shivambu leaving EFF and joining MK.; [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** src/lib/seats/party-commentary.ts · intro-mk-recruit

### MK-10 · Removed

> MK: brought the biggest KZN bloc to a coalition fight. Still lost the chair.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** MK won the largest share in KwaZulu-Natal in 2024 but not an outright majority. The legislature elected the IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This provincial episode does not describe the selected council.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep two jokes that teach largest bloc is not a majority; remove repeat versions.

**Archived backstory — KwaZulu-Natal · June 2024:** MK won the largest share in KwaZulu-Natal in 2024 but not an outright majority. The legislature elected the IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This provincial episode does not describe the selected council.

**Sources:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/) · [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** src/lib/seats/party-commentary.ts · intro-mk-kzn

### MK-12 · Removed

> MK: that KZN victory speech needed a coalition-shaped footnote.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** MK won the largest share in KwaZulu-Natal in 2024 but not an outright majority. The legislature elected the IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This provincial episode does not describe the selected council.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep two jokes that teach largest bloc is not a majority; remove repeat versions.

**Archived backstory — KwaZulu-Natal · June 2024:** MK won the largest share in KwaZulu-Natal in 2024 but not an outright majority. The legislature elected the IFP’s Thami Ntuli premier by 41 votes to 39 on 14 June. This provincial episode does not describe the selected council.

**Sources:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/) · [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** src/lib/seats/party-commentary.ts · intro-mk-kzn

### IFP-04 · Removed

> IFP: a premier’s office with more strings than a guitar shop.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the tea-break exaggeration about a close 41–39 vote. It makes no rule claim that one absence would automatically defeat the majority. Keep the approved cellphone-contract line.

**Archived backstory — KwaZulu-Natal · June 2024:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Sources:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf) · [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** src/lib/seats/party-commentary.ts · intro-ifp-premier

### IFP-06 · Removed

> IFP: Cooperative Governance. Please stop laughing; that’s the actual portfolio.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** IFP leader Velenkosini Hlabisa was named Minister of Cooperative Governance and Traditional Affairs in June 2024. The title and appointment inspire the wordplay.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore one strong ministry-name joke. Wishful thinking is plainly an opinion about the challenge of political cooperation, not a claim that COGTA legally manages GNU partners.

**Archived backstory — National cabinet · June 2024:** IFP leader Velenkosini Hlabisa was named Minister of Cooperative Governance and Traditional Affairs in June 2024. The title and appointment inspire the wordplay.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-ifp-cogta

### IFP-07 · Removed

> IFP: took Cooperative Governance. Still negotiating the “cooperative” bit.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** IFP leader Velenkosini Hlabisa was named Minister of Cooperative Governance and Traditional Affairs in June 2024. The title and appointment inspire the wordplay.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore one strong ministry-name joke. Wishful thinking is plainly an opinion about the challenge of political cooperation, not a claim that COGTA legally manages GNU partners.

**Archived backstory — National cabinet · June 2024:** IFP leader Velenkosini Hlabisa was named Minister of Cooperative Governance and Traditional Affairs in June 2024. The title and appointment inspire the wordplay.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-ifp-cogta

### IFP-08 · Removed

> IFP: Hlabisa’s portfolio is basically a request for everyone to behave.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** IFP leader Velenkosini Hlabisa was named Minister of Cooperative Governance and Traditional Affairs in June 2024. The title and appointment inspire the wordplay.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore one strong ministry-name joke. Wishful thinking is plainly an opinion about the challenge of political cooperation, not a claim that COGTA legally manages GNU partners.

**Archived backstory — National cabinet · June 2024:** IFP leader Velenkosini Hlabisa was named Minister of Cooperative Governance and Traditional Affairs in June 2024. The title and appointment inspire the wordplay.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-ifp-cogta

### IFP-09 · Removed

> IFP: happy to share power. Please stop pointing at that mayoral chair.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** IFP and EFF accounts describe an end to their cooperation in January 2023. The IFP said it had refused an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their explanations of responsibility differed.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep the reunion joke; remove language that takes the IFP account of the mayoral demand as an unattributed settled account.

**Archived backstory — Party negotiations · January 2023:** IFP and EFF accounts describe an end to their cooperation in January 2023. The IFP said it had refused an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their explanations of responsibility differed.

**Sources:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/) · [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf)

**Source checks:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/): read — IFP 30 January statement sets out its account of uMhlathuze request/refusal; blame is not treated as fact.; [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf): read — EFF 29 January statement records ending ties, withdrawing support and deputy mayors returning to ordinary councillor roles; its accusations remain party claims.

**Code:** src/lib/seats/party-commentary.ts · intro-ifp-eff-split

### IFP-10 · Removed

> IFP: the EFF asked for uMhlathuze. The relationship left instead.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** IFP and EFF accounts describe an end to their cooperation in January 2023. The IFP said it had refused an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their explanations of responsibility differed.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep the reunion joke; remove language that takes the IFP account of the mayoral demand as an unattributed settled account.

**Archived backstory — Party negotiations · January 2023:** IFP and EFF accounts describe an end to their cooperation in January 2023. The IFP said it had refused an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their explanations of responsibility differed.

**Sources:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/) · [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf)

**Source checks:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/): read — IFP 30 January statement sets out its account of uMhlathuze request/refusal; blame is not treated as fact.; [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf): read — EFF 29 January statement records ending ties, withdrawing support and deputy mayors returning to ordinary councillor roles; its accusations remain party claims.

**Code:** src/lib/seats/party-commentary.ts · intro-ifp-eff-split

### IFP-11 · Removed

> IFP: coalition unity stopped just short of handing over the keys.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** IFP and EFF accounts describe an end to their cooperation in January 2023. The IFP said it had refused an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their explanations of responsibility differed.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep the reunion joke; remove language that takes the IFP account of the mayoral demand as an unattributed settled account.

**Archived backstory — Party negotiations · January 2023:** IFP and EFF accounts describe an end to their cooperation in January 2023. The IFP said it had refused an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their explanations of responsibility differed.

**Sources:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/) · [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf)

**Source checks:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/): read — IFP 30 January statement sets out its account of uMhlathuze request/refusal; blame is not treated as fact.; [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf): read — EFF 29 January statement records ending ties, withdrawing support and deputy mayors returning to ordinary councillor roles; its accusations remain party claims.

**Code:** src/lib/seats/party-commentary.ts · intro-ifp-eff-split

### PA-01 · Removed

> PA: one portfolio, three titles, absolutely no inside voice.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** PA leader Gayton McKenzie was named Minister of Sport, Arts and Culture in June 2024. The sporting metaphors refer to that portfolio.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the Sport/passing-the-microphone joke as a public-persona caricature with a clear sporting pun.

**Archived backstory — National cabinet · June 2024:** PA leader Gayton McKenzie was named Minister of Sport, Arts and Culture in June 2024. The sporting metaphors refer to that portfolio.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-pa-sport

### PA-03 · Removed

> PA: the sports portfolio came with unlimited extra time at the microphone.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** PA leader Gayton McKenzie was named Minister of Sport, Arts and Culture in June 2024. The sporting metaphors refer to that portfolio.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the Sport/passing-the-microphone joke as a public-persona caricature with a clear sporting pun.

**Archived backstory — National cabinet · June 2024:** PA leader Gayton McKenzie was named Minister of Sport, Arts and Culture in June 2024. The sporting metaphors refer to that portfolio.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** src/lib/seats/party-commentary.ts · intro-pa-sport

### PA-05 · Removed

> PA: the Karoo got a mayoral chain and a national audition.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** Gayton McKenzie became Central Karoo district mayor in April 2022, in a coalition including the PA, ANC and Karoo Democratic Force. This is a district council episode, not a claim about this municipality.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the two strongest larger-than-life persona jokes. The speech-size and heavyweight-belt images are comic exaggeration. Explicitly identify Central Karoo as a district and do not restore the inaccurate small-town mayor line.

**Archived backstory — Central Karoo · April 2022:** Gayton McKenzie became Central Karoo district mayor in April 2022, in a coalition including the PA, ANC and Karoo Democratic Force. This is a district council episode, not a claim about this municipality.

**Sources:** [SABC · 12 Apr 2022](https://www.sabcnews.com/sabcnews/mckenzie-promises-to-reject-mayoral-benefits/)

**Source checks:** [SABC · 12 Apr 2022](https://www.sabcnews.com/sabcnews/mckenzie-promises-to-reject-mayoral-benefits/): read — SABC 12 April confirms McKenzie’s district mayoralty and ANC/KDF partners; does not support exaggerated speech size or personal ambition.

**Code:** src/lib/seats/party-commentary.ts · intro-pa-karoo

### PA-06 · Removed

> PA: small-town mayor. Stadium-sized entrance.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** Gayton McKenzie became Central Karoo district mayor in April 2022, in a coalition including the PA, ANC and Karoo Democratic Force. This is a district council episode, not a claim about this municipality.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the two strongest larger-than-life persona jokes. The speech-size and heavyweight-belt images are comic exaggeration. Explicitly identify Central Karoo as a district and do not restore the inaccurate small-town mayor line.

**Archived backstory — Central Karoo · April 2022:** Gayton McKenzie became Central Karoo district mayor in April 2022, in a coalition including the PA, ANC and Karoo Democratic Force. This is a district council episode, not a claim about this municipality.

**Sources:** [SABC · 12 Apr 2022](https://www.sabcnews.com/sabcnews/mckenzie-promises-to-reject-mayoral-benefits/)

**Source checks:** [SABC · 12 Apr 2022](https://www.sabcnews.com/sabcnews/mckenzie-promises-to-reject-mayoral-benefits/): read — SABC 12 April confirms McKenzie’s district mayoralty and ANC/KDF partners; does not support exaggerated speech size or personal ambition.

**Code:** src/lib/seats/party-commentary.ts · intro-pa-karoo

### PA-09 · Removed

> PA: the Joburg welcome-back hamper came with two council jobs.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** ActionSA said in January 2023 that it had offered two of its three mayoral committee positions to help restore PA support for Johannesburg’s coalition. This was a reported negotiating offer, not a completed agreement.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep one explicitly attributed, dated negotiating-offer joke. Remove completed-transaction/counteroffer implications. Remove unsupported two-of-three detail and accurately describe ActionSA’s account of acceptance by negotiating teams and rejection by DA Federal Executive.

**Archived backstory — Johannesburg negotiations · January 2023:** ActionSA said in January 2023 that it had offered two of its three mayoral committee positions to help restore PA support for Johannesburg’s coalition. This was a reported negotiating offer, not a completed agreement.

**Sources:** [ActionSA account of negotiations · 25 Jan 2023](https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/)

**Source checks:** [ActionSA account of negotiations · 25 Jan 2023](https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/): read — ActionSA 25 January statement says two MMC positions offered, negotiating teams accepted, DA Federal Executive rejected; no three-position total stated.

**Code:** src/lib/seats/party-commentary.ts · intro-pa-joburg

### PA-10 · Removed

> PA: why settle for a welcome-back card when there are portfolios?

**When:** Removed from First picks. Original wording retained for review only.

**Context:** ActionSA said in January 2023 that it had offered two of its three mayoral committee positions to help restore PA support for Johannesburg’s coalition. This was a reported negotiating offer, not a completed agreement.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep one explicitly attributed, dated negotiating-offer joke. Remove completed-transaction/counteroffer implications. Remove unsupported two-of-three detail and accurately describe ActionSA’s account of acceptance by negotiating teams and rejection by DA Federal Executive.

**Archived backstory — Johannesburg negotiations · January 2023:** ActionSA said in January 2023 that it had offered two of its three mayoral committee positions to help restore PA support for Johannesburg’s coalition. This was a reported negotiating offer, not a completed agreement.

**Sources:** [ActionSA account of negotiations · 25 Jan 2023](https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/)

**Source checks:** [ActionSA account of negotiations · 25 Jan 2023](https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/): read — ActionSA 25 January statement says two MMC positions offered, negotiating teams accepted, DA Federal Executive rejected; no three-position total stated.

**Code:** src/lib/seats/party-commentary.ts · intro-pa-joburg

### PA-12 · Removed

> PA: even the reunion invitation needed a counteroffer.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** ActionSA said in January 2023 that it had offered two of its three mayoral committee positions to help restore PA support for Johannesburg’s coalition. This was a reported negotiating offer, not a completed agreement.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep one explicitly attributed, dated negotiating-offer joke. Remove completed-transaction/counteroffer implications. Remove unsupported two-of-three detail and accurately describe ActionSA’s account of acceptance by negotiating teams and rejection by DA Federal Executive.

**Archived backstory — Johannesburg negotiations · January 2023:** ActionSA said in January 2023 that it had offered two of its three mayoral committee positions to help restore PA support for Johannesburg’s coalition. This was a reported negotiating offer, not a completed agreement.

**Sources:** [ActionSA account of negotiations · 25 Jan 2023](https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/)

**Source checks:** [ActionSA account of negotiations · 25 Jan 2023](https://www.actionsa.org.za/actionsa-calls-out-da-for-abandoning-phalatse-and-residents-of-johannesburg/): read — ActionSA 25 January statement says two MMC positions offered, negotiating teams accepted, DA Federal Executive rejected; no three-position total stated.

**Code:** src/lib/seats/party-commentary.ts · intro-pa-joburg

### FF+-02 · Removed

> FF+: the GNU put “Freedom” in charge of the cells.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** FF+ leader at the time, Pieter Groenewald, was named Minister of Correctional Services in June 2024. The jokes concern the portfolio, not allegations about any coalition partner.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep the portfolio/name wordplay with date and the plainly impossible long-speech sentence. Remove duplicates.

**Archived backstory — National cabinet · June 2024:** FF+ leader at the time, Pieter Groenewald, was named Minister of Correctional Services in June 2024. The jokes concern the portfolio, not allegations about any coalition partner.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [FF+ leadership statement · 22 Jul 2024](https://www.vfplus.org.za/media-releases/ministers-post-for-ff-plus-leader-necessitates-minor-changes-to-partys-parliamentary-leadership/): indexed-party-statement — Party identifies Groenewald as its leader and appointed Minister of Correctional Services in July 2024 statement.

**Code:** src/lib/seats/party-commentary.ts · intro-ffplus-corrections

### FF+-03 · Removed

> FF+: small party. Strict visiting hours.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** FF+ leader at the time, Pieter Groenewald, was named Minister of Correctional Services in June 2024. The jokes concern the portfolio, not allegations about any coalition partner.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep the portfolio/name wordplay with date and the plainly impossible long-speech sentence. Remove duplicates.

**Archived backstory — National cabinet · June 2024:** FF+ leader at the time, Pieter Groenewald, was named Minister of Correctional Services in June 2024. The jokes concern the portfolio, not allegations about any coalition partner.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [FF+ leadership statement · 22 Jul 2024](https://www.vfplus.org.za/media-releases/ministers-post-for-ff-plus-leader-necessitates-minor-changes-to-partys-parliamentary-leadership/): indexed-party-statement — Party identifies Groenewald as its leader and appointed Minister of Correctional Services in July 2024 statement.

**Code:** src/lib/seats/party-commentary.ts · intro-ffplus-corrections

### FF+-07 · Removed

> FF+: fighting the ANC, now from inside the same government.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. In June 2024 it was named among participants in the ANC-inclusive GNU.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the Cabinet-parking-bay joke as a figurative comment on the public change of political alignment, not a claim about an actual parking allocation.

**Archived backstory — National agreements · August 2023–June 2024:** FF+ participated in the August 2023 Multi-Party Charter talks aimed at replacing the ANC government. In June 2024 it was named among participants in the ANC-inclusive GNU.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.

**Code:** src/lib/seats/party-commentary.ts · intro-ffplus-charter

### FF+-11 · Removed

> FF+: seven parties in Cape Town. Naturally it wanted the chair with the bell.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** FF+ joined the DA-led seven-party Cape Town coalition in 2006, and its councillor Dirk Smit became speaker. This dated city example illustrates negotiating roles without being the largest party.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the Speaker-bell joke as a cartoon of procedural influence; the verified role remains Speaker, not executive mayor.

**Archived backstory — Cape Town · March 2006:** FF+ joined the DA-led seven-party Cape Town coalition in 2006, and its councillor Dirk Smit became speaker. This dated city example illustrates negotiating roles without being the largest party.

**Sources:** [ACCORD / Zwelethu Jolobe · Cape Town 2006](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf)

**Source checks:** [ACCORD / Zwelethu Jolobe · Cape Town 2006](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf): read — Jolobe ACCORD monograph, printed page 100 / PDF page 28, records seven-party coalition and FF+ Dirk Smit becoming speaker.

**Code:** src/lib/seats/party-commentary.ts · intro-ffplus-speaker

### FF+-12 · Removed

> FF+: tiny caucus, enormous enthusiasm for the speaking order.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** FF+ joined the DA-led seven-party Cape Town coalition in 2006, and its councillor Dirk Smit became speaker. This dated city example illustrates negotiating roles without being the largest party.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the Speaker-bell joke as a cartoon of procedural influence; the verified role remains Speaker, not executive mayor.

**Archived backstory — Cape Town · March 2006:** FF+ joined the DA-led seven-party Cape Town coalition in 2006, and its councillor Dirk Smit became speaker. This dated city example illustrates negotiating roles without being the largest party.

**Sources:** [ACCORD / Zwelethu Jolobe · Cape Town 2006](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf)

**Source checks:** [ACCORD / Zwelethu Jolobe · Cape Town 2006](https://www.accord.org.za/wp-content/uploads/2024/06/Monograph-2018-The-politics-of-dominance-and-survival-Coalition-politics-in-South-Africa-1994-2018.pdf): read — Jolobe ACCORD monograph, printed page 100 / PDF page 28, records seven-party coalition and FF+ Dirk Smit becoming speaker.

**Code:** src/lib/seats/party-commentary.ts · intro-ffplus-speaker

### ActionSA-01 · Removed

> ActionSA: the DA’s ex, with a new logo and the old arguments.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** Herman Mashaba served as Johannesburg mayor under the DA from 2016 to 2019 and launched ActionSA in August 2020. The reference is to those roles; it does not adopt either party’s accusations about their split.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Restore the recurring-breakup-season metaphor. It adds personality without suggesting ActionSA is literally a renamed DA.

**Archived backstory — Party history · 2016–2020:** Herman Mashaba served as Johannesburg mayor under the DA from 2016 to 2019 and launched ActionSA in August 2020. The reference is to those roles; it does not adopt either party’s accusations about their split.

**Sources:** [ActionSA organisational history](https://www.actionsa.org.za/ready-for-action/) · [ActionSA account of Mashaba’s DA mayoralty](https://www.actionsa.org.za/responding-to-often-raised-issues/)

**Source checks:** [ActionSA organisational history](https://www.actionsa.org.za/ready-for-action/): read — ActionSA organisational page states party established 29 August 2020.; [ActionSA account of Mashaba’s DA mayoralty](https://www.actionsa.org.za/responding-to-often-raised-issues/): read — Mashaba’s 3 January 2025 account identifies former DA mayoralty and 2019 resignation. Accusations about motives are not adopted.; [Johannesburg mayoral history](https://joburg.org.za/play_/Pages/Play%20in%20Joburg/Culture%20and%20Heritage/Links/Johannesburg%27s-mayors.aspx): indexed-official-extract — City lists Herman Mashaba as mayor 2016–2019; also corroborated by official 2025 State of the City address.

**Code:** src/lib/seats/party-commentary.ts · intro-actionsa-origins

### ActionSA-06 · Removed

> ActionSA: seven parties agreed on a pact. The voters were not consulted on the ending.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** ActionSA joined DA, IFP, FF+ and other parties at the August 2023 Multi-Party Charter talks. The stated aim was to replace the ANC government and keep the EFF out; this was a pre-election national pact.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep the familiar former-partner reunion joke. Remove implying voters were not consulted and generic binding/creative-differences variants.

**Archived backstory — National party negotiations · August 2023:** ActionSA joined DA, IFP, FF+ and other parties at the August 2023 Multi-Party Charter talks. The stated aim was to replace the ANC government and keep the EFF out; this was a pre-election national pact.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/)

**Source checks:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.

**Code:** src/lib/seats/party-commentary.ts · intro-actionsa-charter

### ActionSA-07 · Removed

> ActionSA: pre-election pact. Post-election creative differences.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** ActionSA joined DA, IFP, FF+ and other parties at the August 2023 Multi-Party Charter talks. The stated aim was to replace the ANC government and keep the EFF out; this was a pre-election national pact.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep the familiar former-partner reunion joke. Remove implying voters were not consulted and generic binding/creative-differences variants.

**Archived backstory — National party negotiations · August 2023:** ActionSA joined DA, IFP, FF+ and other parties at the August 2023 Multi-Party Charter talks. The stated aim was to replace the ANC government and keep the EFF out; this was a pre-election national pact.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/)

**Source checks:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.

**Code:** src/lib/seats/party-commentary.ts · intro-actionsa-charter

### ActionSA-08 · Removed

> ActionSA: the pact was beautifully bound. The partners, less so.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** ActionSA joined DA, IFP, FF+ and other parties at the August 2023 Multi-Party Charter talks. The stated aim was to replace the ANC government and keep the EFF out; this was a pre-election national pact.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep the familiar former-partner reunion joke. Remove implying voters were not consulted and generic binding/creative-differences variants.

**Archived backstory — National party negotiations · August 2023:** ActionSA joined DA, IFP, FF+ and other parties at the August 2023 Multi-Party Charter talks. The stated aim was to replace the ANC government and keep the EFF out; this was a pre-election national pact.

**Sources:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/)

**Source checks:** [Joint party statement · 16 Aug 2023](https://ifp.org.za/newsroom/multi-party-national-convention-makes-solid-progress-towards-a-pre-election-agreement/): read — Joint statement names DA/IFP/FF+/ActionSA among participants and states unseating ANC/keeping EFF out as the entry condition.

**Code:** src/lib/seats/party-commentary.ts · intro-actionsa-charter

### ActionSA-11 · Removed

> ActionSA: anti-ANC pact at home. ANC lift to the Tshwane mayor’s office.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** ActionSA’s Nasiphi Moya became Tshwane mayor in October 2024 with support including the ANC and EFF, after DA mayor Cilliers Brink was removed. This local history differs from ActionSA’s earlier national pact.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep two clear alignment-change jokes. Replace pre-vote liveblog with completed-election coverage and council minutes.

**Archived backstory — Tshwane · October 2024:** ActionSA’s Nasiphi Moya became Tshwane mayor in October 2024 with support including the ANC and EFF, after DA mayor Cilliers Brink was removed. This local history differs from ActionSA’s earlier national pact.

**Sources:** [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/)

**Source checks:** [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/party-commentary.ts · intro-actionsa-tshwane

### ActionSA-12 · Removed

> ActionSA: Tshwane’s mayoral chain really brought out its flexible side.

**When:** Removed from First picks. Original wording retained for review only.

**Context:** ActionSA’s Nasiphi Moya became Tshwane mayor in October 2024 with support including the ANC and EFF, after DA mayor Cilliers Brink was removed. This local history differs from ActionSA’s earlier national pact.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Keep two clear alignment-change jokes. Replace pre-vote liveblog with completed-election coverage and council minutes.

**Archived backstory — Tshwane · October 2024:** ActionSA’s Nasiphi Moya became Tshwane mayor in October 2024 with support including the ANC and EFF, after DA mayor Cilliers Brink was removed. This local history differs from ActionSA’s earlier national pact.

**Sources:** [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/)

**Source checks:** [SABC · 9 Oct 2024](https://www.sabcnews.com/sabcnews/932249-2/): read — SABC liveblog is dated 9 October 2024 but was written while voting was underway; it supports nomination/backing, not completed result. Replaced in game.; [Tshwane council minutes · 9 Oct 2024](https://www.tshwane.gov.za/wp-admin/admin-ajax.php?action=wpfd&juwpfisadmin=false&task=file.download&wpfd_category_id=501&wpfd_file_id=79997): indexed-official-extract-and-independent-corroboration — Search index exposes official minutes page 16: Moya elected 9 October 2024, 122–86. Citizen completed-election article independently confirms and identifies ANC/EFF support.; [The Citizen · 9 Oct 2024](https://www.citizen.co.za/news/south-africa/politics/just-in-nasiphi-moya-elected-mayor-of-tshwane-with-cross-party-support/): read — Completed election: Moya 122 votes, Brink 86; ANC and EFF among supporting parties.

**Code:** src/lib/seats/party-commentary.ts · intro-actionsa-tshwane

### REL-38 · Removed

> ANC + PA in Ditsobotla: that mayoral term barely outlasted a Home Affairs queue.

**When:** Removed from Relationships & local history. Original wording retained for review only.

**Context:** PA’s newly elected Ditsobotla mayor announced her resignation within hours in January 2023, amid a dispute over a municipal-manager appointment. This followed an ANC–PA-led agreement after the December 2022 rerun election.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Remove misleading term-length gag and same-day-breakup framing: Lethoko withdrew the resignation before processing, reported12 January. The omitted reversal undermines the premise; do not treat resignation announcement as completed tenure.

**Archived backstory — Ditsobotla · January 2023:** PA’s newly elected Ditsobotla mayor announced her resignation within hours in January 2023, amid a dispute over a municipal-manager appointment. This followed an ANC–PA-led agreement after the December 2022 rerun election.

**Sources:** [SABC · 11 Jan 2023](https://www.sabcnews.com/sabcnews/residents-decry-political-instability-at-disobotla-municipality/) · [DA account · 10 Jan 2023](https://nw.da.org.za/2023/01/anc-pa-coalition-in-ditsobotla-collapse-hours-into-inaugural-council-meeting)

**Source checks:** [SABC · 11 Jan 2023](https://www.sabcnews.com/sabcnews/residents-decry-political-instability-at-disobotla-municipality/): checked — SABC, 11 January 2023: Lethoko announced resignation hours after election amid municipal-manager dispute. Subsequent reversal makes the joke about a completed brief mayoral term misleading.; [DA account · 10 Jan 2023](https://nw.da.org.za/2023/01/anc-pa-coalition-in-ditsobotla-collapse-hours-into-inaugural-council-meeting): checked — DA, 10 January 2023: confirms its contemporary account of resignation and appointment dispute; partisan allegations about corruption/motives are not adopted.

**Code:** src/lib/seats/local-history.ts · ditsobotla-anc-pa

### REL-38-X · Removed

> The ink has not dried.
> ANC and PA sign the Ditsobotla deal. Someone asks about an appointment before the pens are capped. {actor} leaves. The laminator remains unplugged.

**When:** Removed from History scenarios. Original wording retained for review only.

**Context:** PA’s newly elected Ditsobotla mayor announced her resignation within hours in January 2023, amid a dispute over a municipal-manager appointment. This followed an ANC–PA-led agreement after the December 2022 rerun election.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Remove misleading term-length gag and same-day-breakup framing: Lethoko withdrew the resignation before processing, reported12 January. The omitted reversal undermines the premise; do not treat resignation announcement as completed tenure.

**Archived backstory — Ditsobotla · January 2023:** PA’s newly elected Ditsobotla mayor announced her resignation within hours in January 2023, amid a dispute over a municipal-manager appointment. This followed an ANC–PA-led agreement after the December 2022 rerun election.

**Sources:** [SABC · 11 Jan 2023](https://www.sabcnews.com/sabcnews/residents-decry-political-instability-at-disobotla-municipality/) · [DA account · 10 Jan 2023](https://nw.da.org.za/2023/01/anc-pa-coalition-in-ditsobotla-collapse-hours-into-inaugural-council-meeting)

**Source checks:** [SABC · 11 Jan 2023](https://www.sabcnews.com/sabcnews/residents-decry-political-instability-at-disobotla-municipality/): checked — SABC, 11 January 2023: Lethoko announced resignation hours after election amid municipal-manager dispute. Subsequent reversal makes the joke about a completed brief mayoral term misleading.; [DA account · 10 Jan 2023](https://nw.da.org.za/2023/01/anc-pa-coalition-in-ditsobotla-collapse-hours-into-inaugural-council-meeting): checked — DA, 10 January 2023: confirms its contemporary account of resignation and appointment dispute; partisan allegations about corruption/motives are not adopted.

**Code:** src/lib/seats/local-history.ts · ditsobotla-anc-pa:walkout

### REL-38-T · Removed

> It survives the first afternoon.
> ANC and PA settle the appointments process before signing. The agreement makes it past lunch. Everyone stays; the laminator gets the go-ahead.

**When:** Removed from History scenarios. Original wording retained for review only.

**Context:** PA’s newly elected Ditsobotla mayor announced her resignation within hours in January 2023, amid a dispute over a municipal-manager appointment. This followed an ANC–PA-led agreement after the December 2022 rerun election.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Remove misleading term-length gag and same-day-breakup framing: Lethoko withdrew the resignation before processing, reported12 January. The omitted reversal undermines the premise; do not treat resignation announcement as completed tenure.

**Archived backstory — Ditsobotla · January 2023:** PA’s newly elected Ditsobotla mayor announced her resignation within hours in January 2023, amid a dispute over a municipal-manager appointment. This followed an ANC–PA-led agreement after the December 2022 rerun election.

**Sources:** [SABC · 11 Jan 2023](https://www.sabcnews.com/sabcnews/residents-decry-political-instability-at-disobotla-municipality/) · [DA account · 10 Jan 2023](https://nw.da.org.za/2023/01/anc-pa-coalition-in-ditsobotla-collapse-hours-into-inaugural-council-meeting)

**Source checks:** [SABC · 11 Jan 2023](https://www.sabcnews.com/sabcnews/residents-decry-political-instability-at-disobotla-municipality/): checked — SABC, 11 January 2023: Lethoko announced resignation hours after election amid municipal-manager dispute. Subsequent reversal makes the joke about a completed brief mayoral term misleading.; [DA account · 10 Jan 2023](https://nw.da.org.za/2023/01/anc-pa-coalition-in-ditsobotla-collapse-hours-into-inaugural-council-meeting): checked — DA, 10 January 2023: confirms its contemporary account of resignation and appointment dispute; partisan allegations about corruption/motives are not adopted.

**Code:** src/lib/seats/local-history.ts · ditsobotla-anc-pa:truce

### GEN-breakaway · Removed

> The breakaway press conference.
> Two councillors launch a breakaway. The new logo is ready. The explanation is still loading.

**When:** Removed from Generic scenarios. Original wording retained for review only.

**Context:** Original fictional or functional copy.

**Meaning:** Archived wording; not served by the current game.

**Review decision:** Cut the new-party breakaway story: withdrawing support is distinct from leaving a party and retaining its council seat.

**Code:** src/lib/seats/game.ts · breakaway

## Archived proposals (6)

### DRAFT-DA · Not selected

> DA: the ANC was the problem. Until it had vacancies.

**When:** Not in the game; discussion reference only.

**Context:** The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.

**Meaning:** Recasts entering the GNU as job hunting.

**Review decision:** Not selected: implies an unsupported private motive and repeats office-perk jokes.

**Archived backstory — National government · June 2024:** The DA campaigned under its Rescue Plan for South Africa in 2024, positioning itself against ANC rule. It joined the ANC and other parties in the national GNU in June 2024. Cooperation nationally does not establish a local coalition.

**Sources:** [DA election manifesto · 2024](https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa) · [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.; [DA election manifesto · 2024](https://www.da.org.za/campaigns/the-da-rescue-plan-for-south-africa): read — DA manifesto page explicitly frames Rescue Plan against ANC government.

**Code:** Conversation proposal · intro-da-gnu

### DRAFT-IFP-1 · Not selected

> IFP: got the KZN premier’s chair. It came with three back-seat drivers.

**When:** Not in the game; discussion reference only.

**Context:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Meaning:** Three other parties backed the IFP premier in the 2024 arrangement.

**Review decision:** Not selected: duplicates the clearer approved cellphone-contract joke.

**Archived backstory — KwaZulu-Natal · June 2024:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Sources:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf) · [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** Conversation proposal · intro-ifp-premier

### DRAFT-IFP-2 · Not selected

> IFP: booked the KZN premier’s suite. Got three roommates.

**When:** Not in the game; discussion reference only.

**Context:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Meaning:** A metaphor for governing alongside ANC, DA and NFP.

**Review decision:** Not selected: duplicates the same power-sharing hook.

**Archived backstory — KwaZulu-Natal · June 2024:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Sources:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf) · [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** Conversation proposal · intro-ifp-premier

### DRAFT-IFP-4 · Not selected

> IFP: premier on the letterhead. Group project everywhere else.

**When:** Not in the game; discussion reference only.

**Context:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Meaning:** Holding the premiership still requires cooperation.

**Review decision:** Not selected: duplicates the approved line and could understate the premier’s authority.

**Archived backstory — KwaZulu-Natal · June 2024:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Sources:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf) · [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** Conversation proposal · intro-ifp-premier

### DRAFT-IFP-5 · Not selected

> IFP: happy to share power. Certain mayoral chairs excluded.

**When:** Not in the game; discussion reference only.

**Context:** IFP and EFF accounts describe an end to their cooperation in January 2023. The IFP said it had refused an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their explanations of responsibility differed.

**Meaning:** Refers to the dated dispute over uMhlathuze negotiations.

**Review decision:** Not selected: compresses disputed party accounts into an unqualified jibe.

**Archived backstory — Party negotiations · January 2023:** IFP and EFF accounts describe an end to their cooperation in January 2023. The IFP said it had refused an EFF request to lead uMhlathuze; the EFF announced the withdrawal of support. Their explanations of responsibility differed.

**Sources:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/) · [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf)

**Source checks:** [IFP account of coalition talks · January 2023](https://ifp.org.za/newsroom/ifp-press-conference-on-coalitions-in-south-africa/): read — IFP 30 January statement sets out its account of uMhlathuze request/refusal; blame is not treated as fact.; [EFF statement · 29 Jan 2023](https://effonline.org/wp-content/uploads/2024/09/29-01-2023-EFF-MEDIA-STATEMENT-FOLLOWING-THE-18th-CENTRAL-COMMAND-TEAM-MEETING-AND-4th-ANNUAL-PLENUM.pdf): read — EFF 29 January statement records ending ties, withdrawing support and deputy mayors returning to ordinary councillor roles; its accusations remain party claims.

**Code:** Conversation proposal · intro-ifp-eff-split

### DRAFT-IFP-6 · Not selected

> IFP: took Cooperative Governance. Clearly didn’t read the room.

**When:** Not in the game; discussion reference only.

**Context:** IFP leader Velenkosini Hlabisa was named Minister of Cooperative Governance and Traditional Affairs in June 2024. The title and appointment inspire the wordplay.

**Meaning:** Wordplay on a ministry’s name.

**Review decision:** Not selected: weak ministry-name pun; COGTA is not a department for managing coalition personalities.

**Archived backstory — National cabinet · June 2024:** IFP leader Velenkosini Hlabisa was named Minister of Cooperative Governance and Traditional Affairs in June 2024. The title and appointment inspire the wordplay.

**Sources:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024)

**Source checks:** [Presidency · 30 Jun 2024](https://www.gov.za/news/speeches/president-cyril-ramaphosa-appointment-members-national-executive-30-jun-2024): read — Presidency announcement lists eleven participants, Cabinet-size explanation and the named ministerial appointments.

**Code:** Conversation proposal · intro-ifp-cogta

## Applied proposals (2)

### DRAFT-EFF · Applied proposal

> EFF: wanted to take power. MK took the deputy.

**When:** Applied as EFF-09. This entry preserves the proposal reference.

**Context:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This describes that transfer, not his subsequent positions.

**Meaning:** Contrasts the EFF’s ambitions with Shivambu’s move to MK.

**Review decision:** Current game quote listed under First picks.

**Archived backstory — National party history · August 2024:** EFF deputy president Floyd Shivambu left for MK in August 2024. MK named him National Organiser on 22 August. This describes that transfer, not his subsequent positions.

**Sources:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party) · [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/)

**Source checks:** [EWN · 15 Aug 2024](https://www.ewn.co.za/2024/08/15/shivambu-quits-the-eff-joins-mk-party): read — EWN 15 August report confirms Shivambu leaving EFF and joining MK.; [MK organisational statement · 22 Aug 2024](https://mkparty.org.za/statement-by-president-jacob-gedleyihlekisa-zuma-on-the-establishment-of-umkhonto-wesizwe-party-structures-and-their-immediate-tasks-and-functions/): read — MK 22 August statement records 16 December public launch and names Shivambu as National Organiser, John Hlophe as Deputy President.

**Code:** Conversation proposal · intro-eff-shivambu

### DRAFT-IFP-3 · Applied proposal

> IFP: the premier’s chair came with more conditions than a cellphone contract.

**When:** Applied as IFP-03. This entry preserves the proposal reference.

**Context:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Meaning:** Coalition compromises are compared with cellphone-contract fine print.

**Review decision:** Current game quote listed under First picks.

**Archived backstory — KwaZulu-Natal · June 2024:** The IFP’s Thami Ntuli won the June 2024 premiership vote in the KwaZulu-Natal legislature, 41–39, after negotiations involving the IFP, ANC, DA and NFP. This is provincial history, not a municipal pact.

**Sources:** [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf) · [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/)

**Source checks:** [SABC · 12 Jun 2024](https://www.sabcnews.com/sabcnews/coalition-agreement-on-the-cards-in-kwazulu-natal/): read — SABC 12 June article records MK plurality without majority and negotiations among IFP/ANC/DA/NFP; does not yet report a completed provincial arrangement.; [KZN legislature minutes · 14 Jun 2024](https://kznlegislature.gov.za/wp-content/uploads/2024/11/MIN-14062024.pdf): read — KZN legislature minutes, page 7, record Ntuli 41, Chiliza 39 on 14 June; earlier pages list the 80 members.

**Code:** Conversation proposal · intro-ifp-premier

## Source fingerprints

- src/lib/seats/party-commentary.ts: c71bdcb37aabbc5b768be2a4d0900878110edbdfa1a7b1265492d0d3b7e51586

- src/lib/seats/political-history.ts: d293f8654e8ec64b542a41fb5f7ee4e84b51c255f6ef1af4f7ac5e4b5ee462ec

- src/lib/seats/local-history.ts: 2d0f6399cc01204de8062f3ff27521615d3324399f59b5fffb40869edc46f5fb

- src/lib/seats/relationship-history.ts: a05ba6b17424755ef51f488d7a8ad77e9b4c9622e5a865e8121f0448147ad6d1

- src/lib/seats/game.ts: f0ca841a039bab7378b3796abd15fb7524d8684803e4281cce03ff365a93fd27

- src/lib/seats/commentary.ts: c9314485d80f56fb11f0333efccb5aaa3da2ee42b269cce898e4925cb254d38f

- src/lib/seats/client.ts: 43ea41fcd542d36614e5c0d4bd7ffa858e5f9a290530e27ab33f10a79add29a2

- src/lib/seats/learning.ts: 4dd4124f400f1db81587adbc91cf1e3d86614172017d77a9517ee1b96a62c983

- src/lib/seats/leaders.ts: 5563b55a808c4c481dd2fa20a4c3d744c9302aec38766ac92da9957f528efd98

- src/lib/seats/share-image.ts: d7e7e06c7773dc563b9bc8476da92f6d348056f2561c6d0a13dc770ecfe94df8

- src/lib/sharing/image.ts: 281346648e77eb5b35cc330ef77f3c93c88f890da4b049742b96482dcc0b4652

- src/components/CoalitionGame.astro: bb15639f9f34daa5a2a7b6175afbc8ce098dda6019eb8022d9cbd61a562367f0

- src/components/CoalitionStory.astro: 8cddd9facdd624cbaa152116908201c92d85c5b04b53587c73db4e20f5a228aa

- src/components/ChaosPromo.astro: 3c86802dd09b8fa029c1468b470dcdabd1b91ff5bcdb2e3c4c3732da2cd8a8fa

- src/components/CoalitionPicker.astro: dd2365dd9b6d49a3d2840fca3a824a2ddfd1524871e943b8c69abbb2a3853750

- src/pages/api/coalition/random.ts: 3877912f11751e4697afafd134986b16c4fba674d4ee628e643b77a2b5af4238

- src/pages/2026/places/[slug]/coalition.astro: 68a4f78c61d05c3b0899bc64be1c56d62b4a739f478a16728c0be6a68c9d1cbc
