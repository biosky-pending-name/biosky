# BioSky Product Roadmap

## Vision

BioSky is a decentralized biodiversity observation platform built on the AT Protocol, offering an alternative to iNaturalist with true data ownership and Bluesky integration.

---

## 1. Core Social Features

### Feed System
- **Home feed**: Observations from people you follow + nearby observations
- **Explore feed**: Global recent observations, filterable by taxon/location
- **Personal profile feed**: Your observations + identifications
- Leverage AT Protocol's existing feed generator architecture

### Following/Social Graph
- Follow other naturalists to see their observations
- "Expert follows" - follow taxonomic specialists for specific groups
- Import existing Bluesky social graph since you're on AT Protocol

### Reactions & Engagement
- "Fave" observations (bookmarking + social signal)
- Comments on observations (beyond just identifications)
- Share/repost notable sightings to your followers

---

## 2. Gamification & Motivation

### Achievement System
- Badges: "First observation", "100 species observed", "Research Grade contributor"
- Taxonomic milestones: "Butterfly expert" (50+ Lepidoptera IDs)
- Seasonal challenges: "Spring wildflower hunt", "Mushroom month"

### Leaderboards
- Top observers by region/time period
- Top identifiers by taxon group
- "Rising stars" for new active users

### Streaks & Goals
- Daily observation streaks
- Personal species life list with progress tracking
- Annual species goals

---

## 3. Enhanced Identification Workflow

### AI-Assisted ID Suggestions
- Integrate with existing models (iNaturalist's vision API, PlantNet, Merlin for birds)
- Show AI confidence alongside community IDs
- Use AI to prioritize "Needs ID" queue

### ID Request System
- Tag experts when you need help: "@bird_expert can you help with this?"
- "Request ID" button that notifies relevant taxonomic specialists
- Expert verification badge for trusted identifiers

### Disagreement Resolution
- Structured disagreement workflow (like iNat's "I don't think this can be identified")
- Flag for "cultivated/captive" vs wild
- Mark observations as "needs location review"

---

## 4. Projects & Collections

### User-Created Projects
- Geographic projects: "Birds of Golden Gate Park"
- Taxonomic projects: "California Native Orchids"
- Event projects: "City Nature Challenge 2026"
- Umbrella projects containing sub-projects

### Bioblitzes
- Time-limited observation events
- Real-time leaderboard during event
- Automatic species checklists generated

### Personal Collections
- "Life list" - all species you've observed
- Custom lists: "Yard birds", "Hiking finds"
- Wish list for species you want to find

---

## 5. Enhanced Taxonomy & Data

### Richer Taxon Pages
- Species profiles with range maps, seasonality charts
- Observation phenology (when species are seen)
- Similar species comparison tool
- Pull data from GBIF, Wikipedia, EOL

### Annotation System
- Life stage (egg, larva, adult, flowering, fruiting)
- Sex (male, female, unknown)
- Behavior (feeding, mating, nesting)
- Evidence type (organism, track, scat, feather)

### Data Quality Flags
- "Casual" observations (cultivated, captive, no evidence)
- Location accuracy grades
- Date accuracy grades
- Photo quality assessment

---

## 6. Mobile Experience

### Native Mobile Apps
- iOS and React Native apps
- Offline mode for field use
- Background location tracking for auto-tagging
- Quick-capture camera mode

### Field-Optimized UX
- One-handed operation
- Voice notes for field observations
- Batch upload when back online
- Low-battery mode

---

## 7. Notification System

### Smart Notifications
- Someone identified your observation
- Your ID reached consensus
- Rare species observed nearby
- New observation in your project
- Someone you follow posted

### Digest Options
- Real-time, daily, or weekly digests
- Per-project notification settings
- "Hot spots" alerts for unusual activity

---

## 8. Discovery & Exploration

### Enhanced Map Features
- Heatmaps by species/taxon
- Historical range vs current observations
- "Explore nearby" with species checklist
- Trip planning: "What can I see at X location?"

### Search & Filters
- Full-text search across observations
- Filter by: taxon, location, date, user, quality grade, has photos
- "Similar observations" recommendations
- "Identify" queue with smart sorting

---

## 9. Data Export & Integration

### Research Data Access
- GBIF data publishing pipeline
- Darwin Core Archive exports
- API for researchers
- Citizen science project partnerships

### Personal Data
- Export your observations (CSV, JSON, DwC-A)
- Integration with eBird, iNat (import/sync)
- Backup to personal storage

---

## 10. Trust & Safety

### Moderation Tools
- Flag inappropriate content
- Report spam/fake observations
- Location obscuring for sensitive species
- Block/mute users

### Privacy Controls
- Obscure exact locations (show to ~10km)
- Private observations (visible only to you)
- Control who can comment on your posts

---

## 11. Unique AT Protocol Advantages

### Decentralization Benefits
- Market this as "you own your data"
- Observations portable across platforms
- No platform lock-in
- Censorship-resistant nature records

### Bluesky Integration
- Cross-post observations to Bluesky feed
- Use Bluesky identity (no new account needed)
- Import Bluesky social graph
- Unified notification system

### Custom Feeds
- "Birds near me" algorithmic feed
- "Needs ID in my expertise" feed
- "Research grade this week" feed

---

## 12. Community Building

### Groups/Forums
- Regional groups: "Bay Area Naturalists"
- Taxonomic groups: "California Lichen Society"
- Skill-based: "Macro photography tips"

### Mentorship
- Connect beginners with experienced naturalists
- "Help wanted" for new observers
- Tutorial system for ID skills

### Events Calendar
- Local nature walks
- Virtual ID sessions
- Bioblitz announcements

---

## Implementation Phases

### Phase 1: Foundation
1. Mobile app (critical for field use)
2. Basic feed system
3. Notification system
4. Personal species list

### Phase 2: Growth
5. Projects system
6. Achievement/gamification
7. AI-assisted identification
8. Enhanced taxon pages

### Phase 3: Scale
9. GBIF data publishing
10. Advanced search/filters
11. Groups/forums
12. Events/bioblitzes

---

## Key Differentiators from iNaturalist

| Feature | iNaturalist | BioSky |
|---------|-------------|--------|
| Data ownership | Centralized (Cal Academy) | User-owned on personal PDS |
| Portability | Export only | Full data portability via AT Protocol |
| Social integration | Standalone | Integrated with Bluesky ecosystem |
| Identity | Platform-specific account | Decentralized identity (DID) |
| Algorithm control | Platform-controlled | User-customizable feeds |
| Censorship resistance | Platform-dependent | Protocol-level resilience |

---

## Current State (Already Implemented)

- AT Protocol OAuth authentication
- Darwin Core-compliant occurrence records
- Community identification with consensus algorithm
- PostGIS spatial queries (nearby, bounding box)
- Map visualization with clustering
- Multi-image upload with EXIF extraction
- Firehose ingestion for real-time sync
- GBIF/iNaturalist taxonomy integration
- Basic profile display
