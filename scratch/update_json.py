import json

json_path = "/Users/vedang/PDFtoWebsite/.github/scripts/x-content.json"

new_posts = [
    {
        "id": "v2_001",
        "text": "RTO advocates are often just trying to escape their own home lives. Find remote teams that respect boundaries at cvin.bio/jobs",
        "img": "viral2/r_00_49089.jpg"
    },
    {
        "id": "v2_002",
        "text": "Getting CC'd on the internal email where they discuss why they're rejecting you is a new level of hiring dysfunction. Don't let disorganized recruitment pipelines define your worth. Find professional teams at cvin.bio/jobs",
        "img": "viral2/r_30_rejection.jpg"
    },
    {
        "id": "v2_003",
        "text": "You can literally risk your life in a warzone for your company and they will still lay you off to save a buck. Build your own brand at cvin.bio",
        "img": "viral2/r_02_40727.png"
    },
    {
        "id": "v2_004",
        "text": "130 years later and the struggle is still low wages and high rents. Protect yourself by keeping your career options open at cvin.bio",
        "img": "viral2/r_03_30676.jpg"
    },
    {
        "id": "v2_005",
        "text": "Decades of wage suppression have transferred trillions from workers to the top. Stop working for less than you're worth at cvin.bio/jobs",
        "img": "viral2/r_04_29741.png"
    },
    {
        "id": "v2_006",
        "text": "Marking a job as 'remote' but requiring 3 days a week in the office is not remote—it's a bait-and-switch. Find remote-first companies that actually respect WFH at cvin.bio/jobs",
        "img": "viral2/r_31_remote.jpg"
    },
    {
        "id": "v2_007",
        "text": "Squeezing 40 hours into 4 days isn't a progressive 4-day work week. Find companies that measure actual output over hours at cvin.bio/jobs",
        "img": "viral2/r_06_29314.jpg"
    },
    {
        "id": "v2_008",
        "text": "Companies would rather spend $20k replacing you than give you a $5k raise. Keep your profile updated and know your market rate at cvin.bio",
        "img": "viral2/r_07_28455.png"
    },
    {
        "id": "v2_009",
        "text": "We only get a brief moment on this planet and yet we're expected to spend it all in a fluorescent cubicle. Find WFH flexibility at cvin.bio/jobs",
        "img": "viral2/r_08_28441.jpg"
    },
    {
        "id": "v2_010",
        "text": "LinkedIn has become a performative hustle bubble. Skip the cringey corporate theater and share your actual work with a clean link at cvin.bio",
        "img": "viral2/r_09_28062.jpg"
    },
    {
        "id": "v2_011",
        "text": "Stop saying a salary is 'below market.' Tell them their budget is too low to afford your experience. Set your worth at cvin.bio",
        "img": "viral2/r_10_27485.jpg"
    },
    {
        "id": "v2_012",
        "text": "One person doing the actual building while five managers stand by holding clipboards. Find high-execution, low-bloat teams at cvin.bio/jobs",
        "img": "viral2/r_11_26182.png"
    },
    {
        "id": "v2_013",
        "text": "What is the point of making a living if all you do is work? Take back control of your schedule and find remote roles at cvin.bio/jobs",
        "img": "viral2/r_12_24805.jpg"
    },
    {
        "id": "v2_014",
        "text": "Being so anti-union that you avoid calling it a 'Labor Day' sale is peak corporate fear. Align with companies that respect labor at cvin.bio/jobs",
        "img": "viral2/r_13_24760.jpg"
    },
    {
        "id": "v2_015",
        "text": "When a massive company's hiring sign has a glaring typo, it tells you everything about their chaotic recruitment. Find better roles at cvin.bio/jobs",
        "img": "viral2/r_14_23406.jpg"
    },
    {
        "id": "v2_016",
        "text": "We don't need billionaire space tourism; we need grocery affordability and living wages. Find companies that pay real market rates at cvin.bio/jobs",
        "img": "viral2/r_15_23331.jpg"
    },
    {
        "id": "v2_017",
        "text": "They have $65k to spend on office monitors to force RTO, but no budget for raises. Bypass the corporate theater and go WFH at cvin.bio",
        "img": "viral2/r_16_22723.jpg"
    },
    {
        "id": "v2_018",
        "text": "Hiring campaigns often show exactly how chaotic a company's internal culture is. Find teams that align with your professional values at cvin.bio/jobs",
        "img": "viral2/r_17_21280.jpg"
    },
    {
        "id": "v2_019",
        "text": "An entry-level role requiring a master's and 5 years of experience is a massive red flag. Don't settle for broken hiring loops. Build your CV at cvin.bio",
        "img": "viral2/r_18_21161.jpg"
    },
    {
        "id": "v2_020",
        "text": "When your job commute drains you so much that you can't sleep properly, it's burnout, not laziness. Find a remote role that respects life at cvin.bio/jobs",
        "img": "viral2/r_19_21129.jpg"
    },
    {
        "id": "v2_021",
        "text": "Going through 5 rounds of interviews just to get ghosted is not a hiring process—it's a massive waste of your time. Stop settling for companies that don't respect your schedule. Find transparent employers at cvin.bio/jobs",
        "img": "viral2/r_32_final_interview.jpg"
    },
    {
        "id": "v2_022",
        "text": "Firing 30,000 workers to stop their options from vesting while giving a new CFO $29M is brutal. Treat your career like a business at cvin.bio",
        "img": "viral2/r_21_20752.jpg"
    },
    {
        "id": "v2_023",
        "text": "Demanding decent wages, healthcare, and a strong safety net isn't radical. Find companies that actually invest in their people at cvin.bio/jobs",
        "img": "viral2/r_22_20530.jpg"
    },
    {
        "id": "v2_024",
        "text": "If work was actually pleasant, the rich would keep it all for themselves. Build your own independence and stop the endless grind at cvin.bio",
        "img": "viral2/r_23_20423.jpg"
    },
    {
        "id": "v2_025",
        "text": "When 60% of the country is paycheck-to-paycheck while billionaires hoard historic wealth, the system is broken. Set your own worth at cvin.bio/jobs",
        "img": "viral2/r_24_20270.png"
    },
    {
        "id": "v2_026",
        "text": "Quitting with no plan is terrifying, but staying in a toxic job that destroys your mental health is worse. Find better opportunities at cvin.bio/jobs",
        "img": "viral2/r_25_20166.jpg"
    },
    {
        "id": "v2_027",
        "text": "Finding out you're getting laid off because your director accidentally leaked it in a Teams chat. Protect your future and be findable at cvin.bio",
        "img": "viral2/r_26_20045.jpg"
    },
    {
        "id": "v2_028",
        "text": "Getting mad when employees won't spend their Saturday at an unpaid 'fun work outing' is peak management disconnect. Find real remote teams at cvin.bio/jobs",
        "img": "viral2/r_27_20013.jpg"
    },
    {
        "id": "v2_029",
        "text": "A simple life around a campfire will always beat a lifetime spent in a fluorescent cubicle. Find a career that fits your actual lifestyle at cvin.bio",
        "img": "viral2/r_28_19876.jpg"
    },
    {
        "id": "v2_030",
        "text": "The US is plummeting in the World Happiness Report because of burnout and socioeconomic stress. Prioritize your well-being with a WFH role at cvin.bio",
        "img": "viral2/r_29_19750.png"
    }
]

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

engagement = data["engagement"]
print("Original engagement queue length:", len(engagement))

# Replace indices 55 to 84 (30 items total)
assert len(new_posts) == 30, f"Expected 30 new posts, got {len(new_posts)}"

engagement[55:85] = new_posts
print("New engagement queue length:", len(engagement))

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Successfully updated x-content.json!")
