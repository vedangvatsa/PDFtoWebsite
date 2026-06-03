import json
import os

content_path = '/Users/vedang/PDFtoWebsite/.github/scripts/x-content.json'

with open(content_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

posts = data.get('engagement', [])

# Exact mapping of indices 55 to 84 (the v2_001 to v2_030 posts)
oneliners = {
    "v2_001": "RTO advocates are often just trying to escape their own home lives, so find remote teams that respect boundaries at cvin.bio/jobs",
    "v2_002": "Getting CC'd on the internal email discussing why you're being rejected is exactly why you should find professional teams at cvin.bio/jobs",
    "v2_003": "You can literally risk your life in a warzone for a company and they will still lay you off, so build your own independence at cvin.bio",
    "v2_004": "130 years later and the struggle is still low wages and high rents, which is why keeping your options open is critical at cvin.bio",
    "v2_005": "Decades of wage suppression have transferred trillions from workers to the top, so stop working for less than you're worth at cvin.bio/jobs",
    "v2_006": "Marking a job as 'remote' but requiring 3 days a week in the office is a bait-and-switch, so find real remote-first teams at cvin.bio/jobs",
    "v2_007": "Squeezing 40 hours into 4 days isn't a progressive 4-day work week, so find teams that value actual output at cvin.bio/jobs",
    "v2_008": "Companies would rather spend $20k replacing you than give you a $5k raise, so make sure you know your market rate at cvin.bio",
    "v2_009": "We only get a brief moment on this planet and yet we're expected to spend it all in a cubicle, so find WFH flexibility at cvin.bio/jobs",
    "v2_010": "LinkedIn has become a performative hustle bubble, so skip the corporate theater and share your actual work at cvin.bio",
    "v2_011": "Stop saying a salary is 'below market' and tell them their budget is too low to afford your experience at cvin.bio",
    "v2_012": "One person doing the actual building while five managers stand by with clipboards is exactly why you need to find low-bloat teams at cvin.bio/jobs",
    "v2_013": "What is the point of making a living if all you do is work, so take back control and find remote roles at cvin.bio/jobs",
    "v2_014": "Being so anti-union that you avoid calling it a 'Labor Day' sale is peak corporate fear, so align with teams that respect labor at cvin.bio/jobs",
    "v2_015": "When a massive company's hiring sign has a glaring typo, it tells you everything about their chaotic recruitment, so search for better roles at cvin.bio/jobs",
    "v2_016": "We don't need billionaire space tourism when what we actually need is grocery affordability and living wages at cvin.bio/jobs",
    "v2_017": "They have $65k to spend on office monitors to force RTO but no budget for raises, so bypass the theater and go WFH at cvin.bio",
    "v2_018": "Hiring campaigns often show exactly how chaotic a company's internal culture is, so find teams that align with your values at cvin.bio/jobs",
    "v2_019": "An entry-level role requiring a master's and 5 years of experience is a red flag, so bypass broken hiring loops and build your CV at cvin.bio",
    "v2_020": "When your job commute drains you so much that you can't sleep properly, it's time to find a remote role that respects life at cvin.bio/jobs",
    "v2_021": "Going through 5 rounds of interviews just to get ghosted is exactly why you need to find companies that respect your schedule at cvin.bio/jobs",
    "v2_022": "Firing 30,000 workers to stop their options from vesting while giving a new CFO $29M is exactly why you should treat your career like a business at cvin.bio",
    "v2_023": "Demanding decent wages, healthcare, and a strong safety net isn't radical, so find companies that actually invest in their people at cvin.bio/jobs",
    "v2_024": "If work was actually pleasant, the rich would keep it all for themselves, so build your own independence at cvin.bio",
    "v2_025": "When 60% of the country lives paycheck-to-paycheck while billionaires hoard wealth, the system is broken, so set your own worth at cvin.bio/jobs",
    "v2_026": "Quitting with no plan is terrifying, but staying in a toxic job that destroys your mental health is worse, so find better roles at cvin.bio/jobs",
    "v2_027": "Finding out you're getting laid off because your director leaked it in a Teams chat is exactly why you need to be findable at cvin.bio",
    "v2_028": "Getting mad when employees won't spend Saturdays at unpaid 'fun work outings' is exactly why you should find real remote teams at cvin.bio/jobs",
    "v2_029": "A simple life around a campfire will always beat a lifetime spent in a fluorescent cubicle, so find a career that fits your lifestyle at cvin.bio",
    "v2_030": "The US is plummeting in the World Happiness Report because of stress, so prioritize your well-being with a WFH role at cvin.bio"
}

updated_count = 0
for post in posts:
    post_id = post.get('id')
    if post_id in oneliners:
        post['text'] = oneliners[post_id]
        updated_count += 1

print(f"Updated {updated_count} posts to pure oneliners.")

with open(content_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Saved x-content.json successfully.")
