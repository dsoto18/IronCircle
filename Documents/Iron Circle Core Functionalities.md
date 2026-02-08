# Iron Circle – Core Functionalities & Layout Notes
## Overall Layout

Vertical feed model (similar to Instagram, Strava, TikTok, etc.)

Big picture: a 3-tab main view

Users can slide or toggle between:

Workout activity from friends

Posts by influencers or brands

Workout plans and meal plans

Why This Works

3-tab vertical feed model is familiar to users

Vertical feeds scale well as content grows

Each tab has its own content contract, clearly separating its purpose and avoiding confusion

Each tab must answer a different user question

## Tab 1: Friends / Community Activity

Answers the question:

“What are people like me doing today?”

This tab includes activity only from:
- Friends
- Users you follow via a following mechanism
- It is dedicated to more personal or close relationships.
- Content Types
- Workout posts
- Gym sessions
- Runs, lifts, swims, etc.
- Statistics such as:
    - Time or duration
    - Distance (if applicable)
    - Calories burned
    - Personal records (PRs)

Additional notes:

Users can tag or mention other users who participated in the workout
File uploads are supported (images and short videos)
This is the default home tab
Should feel personal, motivating, and social

Design Notes
- Vertical feed
- Cards similar to Strava
- User avatar or profile photo and name
- Workout type badge (Run, Lift, HIIT)
- Optional image
- Stats row (possibly with icons)
- Ability to interact (like, comment)

## Tab 2: Influencers, Clubs, and Brands

Answers the question:

“What are the experts or organizations I follow sharing?”

This tab is not meant to be more of the same content as the Home tab.
It is intended to feel more aspirational.

Content Types
- Influencer workouts
- Brand challenges (new)
- Run club announcements
- Featured plans
- Educational posts (potentially)

Design Differences
- Larger hero images or banners
- Verified badges for credibility and “wow factor”
- Pinned posts or announcements
- Content should be less frequent but more polished

This content is kept separate to:
Prevent influencer content from overwhelming friend activity
Mimic real social behavior (users mentally separate peers from idols)

## Tab 3: Plans (Routines & Meal Plans)

Answers the question:

“What structured plan can help me reach a goal?”

This tab is not intended to feel like a social feed, but more like a library or marketplace (even though everything is free).

Content Types
- Workout plans
- Training programs
- Meal plans
- Supplement schedules (new)

Design Notes
- Shifts away from chronological feeds
- Card-based browsing
- Still vertical
- Card information may include:
    - Goal (Marathon, Weight Loss, Strength)
    - Duration
    - Difficulty
    - Average rating
- Filters based on goal, duration, difficulty, rating, etc.
- Clicking a card navigates to a details page, which may include:
    - Overview
    - Weekly breakdown
    - Detailed meals and workouts
    - Comments and testimonials

## Navigation & Profile Placement

Bottom navigation bar preferred (more modern and cleaner than top-only navigation)
Bottom nav used to toggle between:
- Home (Friends)
- Explore (Influencers)
- Plans
- Profile / Manage Profile

### Profile Page

The profile page should include:
- User stats (PRs, total workouts — with option to make private)
- Workout history
- Saved plans
- Badges and achievements

Concept: Strava + GitHub profile

### Challenges & Leaderboards

Not intended to be a main tab (at least initially).
Instead, treated as a feature layer accessible through multiple entry points.

Possible Placement
- Profile page (Challenges section)
- Influencer / Brand posts (e.g., “Join Challenge”)
- Modal or subpage from Home
- Possibly all of the above

This approach avoids tab overload.

### Leaderboard Metrics

- Days worked out (week, month, year)
- Total volume lifted
- Distance run
- Consistency streaks

### Overall Look & Feel Notes

- Vertical-first, thumb-friendly
- Social but not chaotic
- Data-rich but readable
- Motivational, not intimidating
- Free and community-driven (very important)