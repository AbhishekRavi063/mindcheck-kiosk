# MindCheck PWA — Analytics & Metrics Framework

**TRANSiT Lab • IIT Kanpur**  
Version 1.0 • May 2026

This document defines all metrics tracked by the MindCheck PWA, organized by category. Metrics are derived from two data sources: the **Firebase Firestore cloud database** (for opted-in users) and **on-device encrypted storage** (for all users). All cloud data is anonymized and linked only to a randomly generated user ID.

---

## Table of Contents

1. [User Metrics](#1-user-metrics)
2. [Engagement & Feature Usage](#2-engagement--feature-usage)
3. [Clinical & Research Metrics](#3-clinical--research-metrics)
4. [Data Availability Summary](#4-data-availability-summary)
5. [Metrics Not Currently Tracked](#5-metrics-not-currently-tracked)
6. [Suggested Dashboard Views](#6-suggested-dashboard-views)

---

## 1. User Metrics

High-level metrics about the user base, consent, and engagement patterns.

### 1.1 User Base

| Metric | Description | Data Source | Firestore Path |
|--------|-------------|-------------|----------------|
| Total users | Count of all unique anonymous user IDs | Firestore | `/users/` (document count) |
| New users (daily/weekly/monthly) | Users whose first activity event falls within the period | Firestore | `/users/{uid}/activity` (app_open, first occurrence) |
| Returning users | Users with activity logs on 2 or more distinct calendar days | Firestore | `/users/{uid}/activity` |
| 7-day retention | Users who had activity in the last 7 days out of all users registered 7+ days ago | Firestore | `/users/{uid}/activity` |
| 30-day retention | Users active in last 30 days out of those registered 30+ days ago | Firestore | `/users/{uid}/activity` |

### 1.2 Consent & Cloud Sync

| Metric | Description | Data Source | Firestore Path |
|--------|-------------|-------------|----------------|
| Cloud sync opt-in rate | % of users who enabled cloud backup (I Agree in consent modal) | Firestore | `/users/{uid}` (cloudSyncEnabled: true) |
| Cloud sync opt-out rate | % who declined or later disabled sync | Firestore | `/users/{uid}` (cloudSyncEnabled: false) |
| Consent modal trigger point | Which trigger fired first: onboarding, post-check-in, or post-EMA | Firestore | `/users/{uid}/activity` (first_consent_shown) |
| Re-enable rate | Users who disabled then re-enabled sync | Firestore | `/users/{uid}/activity` (cloud_sync_enabled event) |

### 1.3 Notification Preferences

| Metric | Description | Data Source | Firestore Path |
|--------|-------------|-------------|----------------|
| Notifications enabled rate | % of users with reminders ON | Firestore | `/users/{uid}` (notificationPrefs.reminders: true) |
| Preferred time breakdown | Distribution across Morning / Afternoon / Evening | Firestore | `/users/{uid}` (notificationPrefs.timePreference) |
| Frequency breakdown | Distribution across Weekly / Twice a week / Monthly | Firestore | `/users/{uid}` (notificationPrefs.frequency) |
| FCM token registration rate | Users with a valid FCM token saved | Firestore | `/users/{uid}` (fcmToken exists) |

---

## 2. Engagement & Feature Usage

Tracks which features users interact with and how frequently.

### 2.1 App Opens & Session Behaviour

| Metric | Description | Data Source | Firestore Path / Key |
|--------|-------------|-------------|----------------------|
| Daily app opens | Count of app_open events per day across all users | Firestore | `/users/{uid}/activity` (event: app_open) |
| Average opens per user per week | Total opens / active users in 7-day window | Firestore | `/users/{uid}/activity` |
| Most active day of week | Day with highest app_open event count | Firestore | `/users/{uid}/activity` (_ts field) |
| Most active time of day | Hour with highest app_open count | Firestore | `/users/{uid}/activity` (_ts field) |
| Tab visit distribution | Which tabs users visit most: Home / Check-in / Trends / Journal / Profile | Firestore | `/users/{uid}/activity` (event: tab_visit, metadata.tab) |

### 2.2 Check-in Usage

| Metric | Description | Data Source | Firestore Path |
|--------|-------------|-------------|----------------|
| Total guided check-ins completed | Count of guided_checkin_completed events | Firestore | `/users/{uid}/activity` |
| Total individual check-ins completed | Count of individual_checkin_completed events | Firestore | `/users/{uid}/activity` |
| Guided vs individual ratio | % of check-ins that are guided vs individual | Firestore | `/users/{uid}/activity` |
| Check-in completion rate | guided_checkin_completed / guided_checkin_started | Firestore | `/users/{uid}/activity` |
| Most used individual questionnaire | Which of PHQ-9 / GAD-7 / PSS / RSES is chosen most in individual mode | Firestore | `/users/{uid}/activity` (metadata.questionnaire_type) |
| Average check-ins per user per week | Total check-ins / active users | Firestore | `/users/{uid}/questionnaires` |
| Check-in time of day | Distribution of check-ins across morning / afternoon / evening | Firestore | `/users/{uid}/questionnaires` (time_of_day) |
| Check-in day of week | Which days of the week users check in most | Firestore | `/users/{uid}/questionnaires` (_ts) |

### 2.3 Game Usage

| Metric | Description | Data Source | Firestore Path |
|--------|-------------|-------------|----------------|
| Total games played | Count of game docs where played: true | Firestore | `/users/{uid}/games` (played: true) |
| Game skip rate (overall) | % of game docs where played: false | Firestore | `/users/{uid}/games` (played: false) |
| Skip rate per game | Skip rate broken down by game_type | Firestore | `/users/{uid}/games` (game_type + played) |
| Most played game | Which game_type has highest played: true count | Firestore | `/users/{uid}/games` |
| Games played standalone vs guided | checkin_type: individual vs guided for game docs | Firestore | `/users/{uid}/games` (checkin_type) |
| Average reaction time (GoNoGo) | Mean averageReactionTime across all GoNoGo games played | Firestore | `/users/{uid}/games` (game_type: gonogo, metrics.averageReactionTime) |
| Average inhibition score (GoNoGo) | Mean inhibitionScore across all GoNoGo games | Firestore | `/users/{uid}/games` (metrics.inhibitionScore) |
| Average accuracy (Attention) | Mean accuracy across all Attention games | Firestore | `/users/{uid}/games` (game_type: attention, metrics.accuracy) |
| Average digit span (Memory) | Mean averageDigitSpan across DigitSpan games | Firestore | `/users/{uid}/games` (game_type: memory, metrics.averageDigitSpan) |
| Average counting accuracy | Mean accuracy across Counting games | Firestore | `/users/{uid}/games` (game_type: counting, metrics.accuracy) |

### 2.4 Journal Usage

| Metric | Description | Data Source | Firestore Path |
|--------|-------------|-------------|----------------|
| Total journal entries written | Count of journal docs where journaled: true | Firestore | `/users/{uid}/journal` |
| Journal skip rate (in guided flow) | journal docs where journaled: false / total guided journal docs | Firestore | `/users/{uid}/journal` (checkin_type: guided, journaled: false) |
| Guided vs standalone journal ratio | checkin_type: guided vs individual breakdown | Firestore | `/users/{uid}/journal` (checkin_type) |
| Prompted vs freely written ratio | prompt_type: prompted vs freely_written breakdown | Firestore | `/users/{uid}/journal` (prompt_type) |
| Average word count per entry | Mean word_count across all journal entries | Firestore | `/users/{uid}/journal` (word_count) |
| Entries with image attached | Count/% of entries where has_image: true | Firestore | `/users/{uid}/journal` (has_image: true) |
| Most common emotions logged | Frequency count of each emotion across all entries | Firestore | `/users/{uid}/journal` (emotions array) |
| Average mood intensity per emotion | Mean intensity per emotion type | Firestore | `/users/{uid}/journal` (mood_intensities) |

### 2.5 Day Log (EMA) Usage

| Metric | Description | Data Source | Firestore Path |
|--------|-------------|-------------|----------------|
| Total day log submissions | Count of daylog documents | Firestore | `/users/{uid}/daylogs` |
| Submissions per time slot | Morning / Afternoon / Evening breakdown | Firestore | `/users/{uid}/daylogs` (time_of_day) |
| Average day log submissions per user per week | Total daylogs / active users | Firestore | `/users/{uid}/daylogs` |
| Users who use EMA vs check-in only | Users with at least 1 daylog vs users with only questionnaire data | Firestore | Cross-collection query |

### 2.6 Support Resources

| Metric | Description | Data Source | Firestore Path |
|--------|-------------|-------------|----------------|
| Support resources viewed | Count of support_resources_viewed events | Firestore | `/users/{uid}/activity` |
| Users who viewed support resources | Unique user count with at least 1 support_resources_viewed event | Firestore | `/users/{uid}/activity` |
| Context of support resource access | Was it triggered by high distress score, home screen, or profile | Firestore | `/users/{uid}/activity` (metadata) |

---

## 3. Clinical & Research Metrics

Aggregated wellness data from opted-in users. All values are population-level — no individual scores are published. These metrics are for research use only.

> ⚠️ **Note:** All metrics in this section apply only to users who have enabled Cloud Backup. Individual scores are never shared — only aggregate statistics.

### 3.1 Questionnaire Score Distributions

| Metric | Description | Questionnaire | Firestore Path |
|--------|-------------|---------------|----------------|
| Mean total score | Average total_score across all submissions | PHQ-9 / GAD-7 / PSS / RSES | `/users/{uid}/questionnaires` (questionnaire_type + total_score) |
| Score distribution | Count of submissions per severity_label (minimal / mild / moderate / severe) | PHQ-9 / GAD-7 / PSS / RSES | `/users/{uid}/questionnaires` (severity_label) |
| High distress rate | % of PHQ-9 submissions with severity_label: moderately severe or severe | PHQ-9 | `/users/{uid}/questionnaires` |
| High anxiety rate | % of GAD-7 submissions with severity_label: moderate or severe | GAD-7 | `/users/{uid}/questionnaires` |
| High stress rate | % of PSS submissions scoring ≥27 (high stress band) | PSS | `/users/{uid}/questionnaires` |
| Low self-esteem rate | % of RSES submissions scoring ≤15 (low self-esteem band) | RSES | `/users/{uid}/questionnaires` |
| Score trend over time | Mean score per week across the study period | All | `/users/{uid}/questionnaires` (_ts + total_score) |
| Guided vs individual score comparison | Mean score for guided check-ins vs individual check-ins | All | `/users/{uid}/questionnaires` (checkin_type + total_score) |

### 3.2 Item-Level Analysis

| Metric | Description | Questionnaire | Firestore Path |
|--------|-------------|---------------|----------------|
| Mean score per question item | Average response for each individual question (Q1–Q10) | All | `/users/{uid}/questionnaires` (individual_question_scores) |
| Most endorsed symptom | Question item with highest mean response | PHQ-9 / GAD-7 / PSS | `/users/{uid}/questionnaires` (individual_question_scores) |
| Functional impairment rate (PHQ-9) | % of PHQ-9 responses where functional impairment item > 0 | PHQ-9 | `/users/{uid}/questionnaires` (individual_question_scores[8]) |

### 3.3 Cognitive Game Performance (Population)

| Metric | Description | Game | Firestore Path |
|--------|-------------|------|----------------|
| Population mean reaction time | Average averageReactionTime across all users | GoNoGo / Attention / Memory / Counting | `/users/{uid}/games` (metrics.averageReactionTime) |
| Population mean inhibition score | Average inhibitionScore across all users | GoNoGo | `/users/{uid}/games` (metrics.inhibitionScore) |
| Population mean digit span | Average averageDigitSpan | Memory (DigitSpan) | `/users/{uid}/games` (metrics.averageDigitSpan) |
| Population mean accuracy | Average accuracy across all users | Attention / Memory / Counting | `/users/{uid}/games` (metrics.accuracy) |
| Score correlation with questionnaire scores | Correlation between game metrics and PHQ-9/GAD-7/PSS scores for same user on same day | All games | Cross-collection: `/questionnaires` + `/games` (_ts proximity) |

### 3.4 Longitudinal Patterns

| Metric | Description | Data Source | Notes |
|--------|-------------|-------------|-------|
| Score improvement over time | Change in mean total_score between first and most recent submission per user | Firestore /questionnaires | Requires users with 3+ submissions |
| Check-in frequency vs score correlation | Do users who check in more frequently show different score trajectories? | Firestore /questionnaires + /activity | Research analysis |
| Notification reminder effectiveness | Do users with reminders ON have higher check-in frequency? | Firestore /activity + notificationPrefs | Compare reminders ON vs OFF group |
| Time-of-day effect on scores | Do morning vs evening check-ins show different mean scores? | Firestore /questionnaires (time_of_day) | Research analysis |
| EMA mood vs questionnaire score correlation | Do day log responses predict same-week questionnaire scores? | Firestore /daylogs + /questionnaires | Within-week analysis |

---

## 4. Data Availability Summary

Not all metrics are available for all users. This table summarises what data exists for each user group.

| Metric Category | All Users (Local Only) | Opted-In Users (Cloud Sync ON) |
|-----------------|------------------------|-------------------------------|
| Check-in scores & severity labels | On device only (encrypted) | ✓ Available in Firestore |
| Individual question responses | On device only (encrypted) | ✓ Available in Firestore |
| Game metrics | On device only (encrypted) | ✓ Available in Firestore |
| Journal text | On device only (encrypted) | ✓ Available in Firestore (text only, no images) |
| Day log responses | On device only (encrypted) | ✓ Available in Firestore |
| User activity events | Not stored | ✓ Available in Firestore |
| Notification preferences | On device only | ✓ Available in Firestore |
| Images attached to journal | On device only | ✘ Not synced to cloud |
| Export (JSON/CSV/TXT) | ✓ Available to user anytime | ✓ Available to user anytime |

---

## 5. Metrics Not Currently Tracked

The following metrics would require additional instrumentation if needed in future:

| Metric | Why Not Tracked | Effort to Add |
|--------|----------------|---------------|
| Session duration | No session start/end tracking implemented | Low — add session_start / session_end events to activity log |
| Drop-off point in check-in flow | No per-step abandonment tracking | Medium — add step_abandoned event with step name |
| Time spent per question | time_taken_seconds not yet instrumented | Medium — track start/end timestamp per question in CheckInFlow |
| Notification open rate | FCM delivery receipts not captured | High — requires server-side FCM analytics |
| Push notification click-through rate | Not tracked from service worker | High — requires service worker click event logging |
| Cross-device usage | Anonymous auth — no cross-device identity | High — requires Google login or similar |
| Export usage rate | Export action not logged in activity | Low — add data_exported event to activity log |
| Crisis resource link clicks (Treadwill) | treadwill_link_clicked removed from activity events | Low — re-add event to activity log |

---

## 6. Suggested Dashboard Views

For the research analytics dashboard, these views are recommended as the primary screens:

### View 1 — Overview (Home)
- Total users, opted-in users, active this week (3 stat cards)
- Daily active users line chart (last 30 days)
- Feature usage bar chart (check-ins vs games vs journal vs EMA)
- Consent rate donut chart

### View 2 — Check-in & Clinical
- Score distribution per questionnaire (stacked bar: minimal/mild/moderate/severe)
- Mean score trend over time per questionnaire (line chart)
- Guided vs individual check-in ratio (donut chart)
- Check-in time of day heatmap (day of week vs time slot)

### View 3 — Games
- Play vs skip rate per game (grouped bar chart)
- Population mean metrics per game (stat cards)
- Game metric trends over time (line chart per game)

### View 4 — Journal & EMA
- Journal entries per day (bar chart)
- Most common emotions (frequency bar chart)
- Prompted vs freely written ratio
- EMA submissions per time slot per day (heatmap)

### View 5 — Notifications
- % users with notifications ON
- Preferred time breakdown (pie chart)
- Frequency preference breakdown (pie chart)

---

*TRANSiT Lab • Department of Cognitive Science • IIT Kanpur*  
*transitlabiitk18@gmail.com • pbalasub@iitk.ac.in*
