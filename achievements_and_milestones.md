{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "achievementSystemId": "gamification-ebs-grade7",
  "title": "Exploring Business Studies 7 - Platform Achievements & Milestones",
  "reviewStatus": "Approved",
  "milestones": [
    {
      "milestoneId": "ms-01",
      "title": "Foundations Scout",
      "chapterId": "ch-01",
      "description": "Demonstrate a complete understanding of economic fundamentals, resources, and stakeholders.",
      "requiredEvidence": [
        { "type": "objective_mastery", "id": "lo-1.1.1" },
        { "type": "objective_mastery", "id": "lo-1.2.1" },
        { "type": "challenge_completion", "id": "bc-01" },
        { "type": "quiz_threshold", "chapterId": "ch-01", "minimumScorePercent": 80 }
      ],
      "badgeGraphic": "badge-foundations-scout.png",
      "xpReward": 250
    },
    {
      "milestoneId": "ms-02",
      "title": "Master Bookkeeper",
      "chapterId": "ch-02",
      "description": "Master the fundamental accounting equation, ledger principles, and sole trader financial statements.",
      "requiredEvidence": [
        { "type": "objective_mastery", "id": "lo-2.1.2" },
        { "type": "objective_mastery", "id": "lo-2.1.3" },
        { "type": "challenge_completion", "id": "bc-02" },
        { "type": "quiz_threshold", "chapterId": "ch-02", "minimumScorePercent": 80 }
      ],
      "badgeGraphic": "badge-master-bookkeeper.png",
      "xpReward": 350
    },
    {
      "milestoneId": "ms-03",
      "title": "Venture Pioneer",
      "chapterId": "ch-03",
      "description": "Demonstrate understanding of resource allocation, economic systems, production methods, and productivity.",
      "requiredEvidence": [
        { "type": "objective_mastery", "id": "lo-3.2.1" },
        { "type": "objective_mastery", "id": "lo-3.3.2" },
        { "type": "challenge_completion", "id": "bc-03" },
        { "type": "quiz_threshold", "chapterId": "ch-03", "minimumScorePercent": 80 }
      ],
      "badgeGraphic": "badge-venture-pioneer.png",
      "xpReward": 300
    },
    {
      "milestoneId": "ms-04",
      "title": "Executive Strategist",
      "chapterId": "ch-04",
      "description": "Evaluate forms of business ownership, the benefits of limited liability, and sector structures.",
      "requiredEvidence": [
        { "type": "objective_mastery", "id": "lo-4.1.1" },
        { "type": "objective_mastery", "id": "lo-4.1.2" },
        { "type": "challenge_completion", "id": "bc-04" },
        { "type": "quiz_threshold", "chapterId": "ch-04", "minimumScorePercent": 80 }
      ],
      "badgeGraphic": "badge-executive-strategist.png",
      "xpReward": 400
    }
  ],
  "specialBadges": [
    {
      "badgeId": "bdg-island-economist",
      "title": "Island Economist",
      "criteria": "Correctly classify 10 local Maldivian economic resources into Land, Labour, and Capital on the first attempt.",
      "linkedObjectiveIds": ["lo-1.1.2", "lo-1.2.1"],
      "xpReward": 150
    },
    {
      "badgeId": "bdg-flawless-balance",
      "title": "Flawless Balance",
      "criteria": "Balance an end-of-year trial balance and prepare a balance sheet without calculation errors.",
      "linkedObjectiveIds": ["lo-2.1.3", "lo-2.3.2"],
      "xpReward": 200
    },
    {
      "badgeId": "bdg-productivity-pro",
      "title": "Productivity Pro",
      "criteria": "Accurately compute total, average, and marginal product and correctly identify diminishing returns.",
      "linkedObjectiveIds": ["lo-3.4.1", "lo-3.4.2"],
      "xpReward": 150
    },
    {
      "badgeId": "bdg-corporate-architect",
      "title": "Corporate Architect",
      "criteria": "Recommend and justify the optimal ownership structure in the business scenario challenge.",
      "linkedObjectiveIds": ["lo-4.1.1", "lo-4.1.2"],
      "xpReward": 200
    }
  ]
}