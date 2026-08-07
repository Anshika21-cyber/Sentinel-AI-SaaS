Step 1: Created Supabase client | src/lib/supabase.ts | done
Step 2: Configured project URL and publishable key | src/lib/supabase.ts | done
Step 3.1: Wired photo upload button to upload file to report-photos bucket and get public URL | src/pages/CommunityPage.tsx | done
Step 3.2: Bound title and area inputs to component state | src/pages/CommunityPage.tsx | done
Step 3.3: Configured Submit report button to insert row into reports table (title, area, category, severity, photo_url) | src/pages/CommunityPage.tsx | done
Step 3.4: Replaced static reports import with live fetch from Supabase ordered by created_at descending | src/pages/CommunityPage.tsx | done
Step 4: Implemented real credibility scoring & cross-validation (48h area lookup, base score 50, +15/+25 area match, +10 category match, cap 95, verified >= 70, explanation badge) | src/pages/CommunityPage.tsx | done
Step 5: Disabled FloatingNotifications rendering across the application | src/App.tsx | done
Step 6: Replaced top 4 KPI cards on Dashboard with live Supabase stats (Total Reports, Verified Reports, Areas Covered, Avg Trust Score) | src/pages/DashboardPage.tsx | done
Step 7: Added heuristic time-based 6h risk forecast to Live Risk Score section (night multiplier 1.25x for hours >= 21 or < 5, max cap 100, reason text, heuristic tag) | src/pages/CommunityPage.tsx | done
