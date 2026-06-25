# Case study (illustrative) — How a busy Melbourne practice cut document filing time by 85%

> **Illustrative scenario.** This is an example built from the CliniDoc workflow and
> representative practice volumes — not an account of a specific named customer. Figures show
> expected outcomes for a practice of this size. The quotes below are illustrative and are
> **not** attributed to real individuals. This is the legal-safe rewrite of the original
> "Bayside Family Medical Centre" draft, which presented a fictional practice and fabricated
> testimonials as if real. The live web version is at `/customers`.

A six-GP family practice processes more than 200 inbound clinical documents every week —
pathology results, specialist letters, discharge summaries and referrals — all arriving by
fax and email. Before CliniDoc, two practice managers spent almost three hours every day
sorting, matching and manually filing each document into their PMS. This example shows how a
practice of this size gets that time back.

## Example practice profile
| Field | Value |
|---|---|
| Practice | A six-GP family practice (illustrative) |
| Location | Suburban Melbourne, VIC |
| Size | 6 GPs, 2 practice managers, 4 reception staff |
| PMS | Cliniko |
| Volume | 180–220 inbound documents per week |
| Document types | Pathology, specialist letters, radiology, referrals, discharge summaries |
| Channels | Dedicated eFax number + forwarded pathology email |
| Plan | CliniDoc Starter, with PMS write-back |

## The challenge
A typical week meant the fax machine printing continuously from 7am. Reception collected the
pile, sorted it by type, then spent hours cross-referencing names and dates of birth against
the PMS before filing. Common issues:

- **Name mismatches** — referrals use a patient's legal name while the PMS holds a preferred name.
- **Missing Medicare numbers** — pathology results rarely include them, making matching name-and-DOB dependent.
- **Urgency blindness** — urgent results sat in the same pile as routine letters, with no triage.
- **No audit trail** — no systematic record of who filed what and when (medico-legal risk).
- **Lost documents** — faxes occasionally failed to transmit completely, with no way to recover them.

> *Illustrative:* "Two experienced practice managers spent the first half of every morning
> just processing the overnight fax pile. It took them away from patient-facing work, and on
> busy days things got missed."

## The solution
CliniDoc connects in a single afternoon: point the dedicated eFax number at CliniDoc's
ingest endpoint, and add a forwarding rule on the pathology email address. No on-premise
software; no changes to how specialists send documents.

Every inbound document is stored immediately in Australian-based object storage, then read by
Claude vision in a single pass to identify the patient (name, DOB, Medicare number), document
type, clinical urgency, and a plain-English summary of the key finding. Extracted fields are
scored against the practice roster using fuzzy name matching, exact DOB/Medicare comparison,
and phonetic matching — so a referral for "Caitlin Smith" correctly matches "Katelyn Smith".
High-confidence documents are marked auto-ready; ambiguous ones are flagged for attention.

Staff see only the review queue — a prioritised list with urgent documents at the top.
Auto-ready documents confirm in one click; flagged documents show the original image,
extracted fields and a suggested match side-by-side. Once confirmed, the document is written
into the patient's record. **A human confirms every document — no decision is made solely by a computer.**

> *Illustrative:* "It handles names spelled differently between the referral and our system.
> A patient called Maree comes through as Marie on almost every specialist letter, and it
> matches her correctly every time."

## Results at a glance (expected outcomes)
| 87% | 85% | 0 | < 2 min |
|---|---|---|---|
| Auto-ready rate (one-click filing) | Staff time saved per week | Documents lost | Avg. review time (down from ~15 min) |

## Before / after
| Before CliniDoc | After CliniDoc |
|---|---|
| 2–3 hours/day sorting and filing | ~25 minutes/day for the same volume |
| Manual patient lookup for every document | AI matches automatically; staff verify and confirm |
| No urgency triage — all documents equal | Urgent results surface at the top of the queue |
| Documents occasionally lost or mis-filed | Every document stored permanently |
| No systematic audit trail | Full audit log of who filed what, when |
| Monday backlog from weekend faxes | Weekend documents queued and ready Monday |

## Implementation — live within one business day
| When | Time | What |
|---|---|---|
| Day 1 AM | 1 hr | Account created; eFax number assigned; forwarding rule set on the pathology email. |
| Day 1 PM | 30 min | Patient roster imported; PMS API authorised so the roster syncs automatically. |
| Day 2 | 30 min | Staff walked through the review queue; test faxes confirm end-to-end flow. |
| Week 1 | Ongoing | Live on all inbound documents; email support throughout. |

## Privacy & compliance
- All clinical document data stored **exclusively on Australian servers** — never offshore.
- Tamper-evident **audit log** of every action, accessible to owners and administrators.
- **TLS 1.2+** in transit; encryption at rest.
- Short-lived session tokens (15 min) with re-authentication after inactivity.
- AI use disclosed to patients in line with the Australian Privacy Principles.

## Try CliniDoc
Free trial with trial credits — enough to process a typical week of inbound documents.
Setup takes under two hours with no IT support required.
**Start free:** https://clinidoc.com.au · **Contact:** k.kamel@clinidoc.com.au
**Integrations:** Cliniko, Halaxy, Best Practice, MedicalDirector
