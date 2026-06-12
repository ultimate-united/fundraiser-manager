"""Default content sections seeded into a new event as an editable guideline.

Mirrored by migration 20260612000003 which backfills existing events. Keep the
two in sync if you change the copy.
"""

DEFAULT_SECTIONS = [
    {
        "kind": "rich_text",
        "title": "About This Event",
        "position": 0,
        "enabled": True,
        "content": {
            "body": "",
            "items": [
                {
                    "icon": "users",
                    "title": "Who Should Join",
                    "body": "Anyone passionate about making a difference in our community. Families, individuals, and corporate teams are all welcome.",
                },
                {
                    "icon": "heart",
                    "title": "What to Expect",
                    "body": "A day filled with meaningful activities, community bonding, and the joy of giving back.",
                },
                {
                    "icon": "building",
                    "title": "Impact",
                    "body": "100% of funds raised go directly to supporting the communities we serve.",
                },
            ],
        },
    },
    {
        "kind": "schedule",
        "title": "Event Schedule",
        "position": 1,
        "enabled": True,
        "content": {
            "body": "Here's what to expect throughout the day",
            "items": [
                {"time": "09:00", "title": "Registration & Welcome", "description": "Check in and settle in", "location": ""},
                {"time": "10:00", "title": "Main Programme", "description": "", "location": ""},
            ],
        },
    },
    {
        "kind": "contribution",
        "title": "How You Can Contribute",
        "position": 2,
        "enabled": True,
        "content": {
            "body": "There are many ways to support this event and make a difference",
            "items": [
                {"icon": "heart", "title": "Financial Support", "body": "Every dollar directly supports our cause.", "cta": "donate"},
                {"icon": "clock", "title": "Volunteer Your Time", "body": "Help us on event day — no experience needed!", "cta": "signup"},
                {"icon": "lightbulb", "title": "Share Your Skills", "body": "Photographer, first-aider, or coordinator? We need your expertise!", "cta": "signup"},
            ],
        },
    },
    {
        "kind": "sponsors",
        "title": "Our Sponsors",
        "position": 3,
        "enabled": True,
        "content": {
            "body": "We are grateful to the organizations that make this event possible",
            "items": [],
        },
    },
]
