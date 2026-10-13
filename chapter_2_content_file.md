{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "chapterId": "ch-02",
  "title": "Basic Financial Accounting",
  "reviewStatus": "Approved",
  "printedPageRange": { "start": 17, "end": 64 },
  "keyTerms": [
    { "term": "Book-keeping", "definition": "The detailed recording of all the financial transactions of a business." },
    { "term": "Asset", "definition": "Something of measurable economic value owned by or owed to a business." },
    { "term": "Liability", "definition": "Debts or financial obligations owed by the business to external parties." },
    { "term": "Owner's Equity", "definition": "The difference between total asset value and total liability value; the owner's net investment in the business." },
    { "term": "Gross Profit", "definition": "Profit calculated as sales revenue minus cost of goods sold." },
    { "term": "Net Profit", "definition": "The final operating profit after deducting all operational overheads and expenses from gross profit." }
  ],
  "flashcards": [
    {
      "id": "fc-02-01",
      "front": "State the fundamental accounting equation.",
      "back": "Assets = Capital + Liabilities (or Capital = Assets - Liabilities)."
    },
    {
      "id": "fc-02-02",
      "front": "What is the difference between a tangible asset and an intangible asset?",
      "back": "Tangible assets have physical existence (e.g., premises, motor vehicles). Intangible assets do not have physical form (e.g., brand value, education, patents)."
    },
    {
      "id": "fc-02-03",
      "front": "What is the double-entry rule for an increase in an asset?",
      "back": "An increase in an asset is recorded as a Debit entry."
    },
    {
      "id": "fc-02-04",
      "front": "What does an Income Statement calculate?",
      "back": "It calculates the Gross Profit (Trading section) and the Net Profit or Loss (Profit & Loss section) over an accounting period."
    }
  ],
  "questions": {
    "multipleChoice": [
      {
        "id": "mcq-02-01",
        "objectiveId": "lo-2.1.2",
        "question": "Which of the following is classified as a non-current asset?",
        "options": {
          "A": "Trade Receivables",
          "B": "Bank Balance",
          "C": "Business Delivery Boat (Motor Vehicle)",
          "D": "Closing Inventory"
        },
        "correctAnswer": "C",
        "explanation": "A delivery boat is held for long-term operational use across multiple years, classifying it as a non-current asset.",
        "difficulty": "Medium",
        "skillTag": "Classification"
      },
      {
        "id": "mcq-02-02",
        "objectiveId": "lo-2.1.3",
        "question": "If a business has total assets of MVR 150,000 and total liabilities of MVR 45,000, what is the owner's capital?",
        "options": {
          "A": "MVR 195,000",
          "B": "MVR 105,000",
          "C": "MVR 45,000",
          "D": "MVR 150,000"
        },
        "correctAnswer": "B",
        "explanation": "Capital = Assets - Liabilities = 150,000 - 45,000 = MVR 105,000.",
        "difficulty": "Easy",
        "skillTag": "Calculation"
      },
      {
        "id": "mcq-02-03",
        "objectiveId": "lo-2.3.1",
        "question": "Sales revenue is MVR 80,000 and Cost of Goods Sold is MVR 45,000. What is the Gross Profit?",
        "options": {
          "A": "MVR 125,000",
          "B": "MVR 45,000",
          "C": "MVR 35,000",
          "D": "MVR 80,000"
        },
        "correctAnswer": "C",
        "explanation": "Gross Profit = Revenue - Cost of Goods Sold = 80,000 - 45,000 = MVR 35,000.",
        "difficulty": "Easy",
        "skillTag": "Calculation"
      }
    ],
    "trueFalse": [
      {
        "id": "tf-02-01",
        "objectiveId": "lo-2.2.1",
        "statement": "In double-entry bookkeeping, an increase in a liability account is recorded with a credit entry.",
        "correctAnswer": true,
        "explanation": "True. Under double-entry rules, liabilities increase on the credit side.",
        "difficulty": "Medium",
        "skillTag": "Application"
      },
      {
        "id": "tf-02-02",
        "objectiveId": "lo-2.1.1",
        "statement": "Bookkeeping and accounting refer to the exact same administrative task.",
        "correctAnswer": false,
        "explanation": "False. Bookkeeping is the routine recording of transactions, while accounting involves analyzing, reporting, and interpreting financial data.",
        "difficulty": "Easy",
        "skillTag": "Understanding"
      }
    ],
    "shortAnswer": [
      {
        "id": "sa-02-01",
        "objectiveId": "lo-2.3.1",
        "question": "Explain the difference between Gross Profit and Net Profit.",
        "difficulty": "Medium",
        "rubric": {
          "totalMarks": 3,
          "criteria": [
            { "mark": 1, "description": "Defines Gross Profit as sales revenue less direct cost of sales." },
            { "mark": 1, "description": "Defines Net Profit as Gross Profit plus other income minus all operating expenses." },
            { "mark": 1, "description": "Accurately notes that Net Profit reflects the final profitability of the enterprise." }
          ]
        }
      }
    ]
  },
  "businessChallenge": {
    "challengeId": "bc-02",
    "title": "Fahi Shopping Trial Balance Review",
    "context": "Fahi Shopping extracts its trial balance on 31 October with Revenue MVR 198,000, Purchases MVR 53,000, and Operating Expenses of MVR 124,800. Closing inventory is valued at MVR 41,000.",
    "task": "Calculate the Cost of Goods Sold, determine Gross Profit, and calculate Net Profit for the year.",
    "masteryCriteria": "Correct calculation showing Cost of Goods Sold, Gross Profit, and the resulting Net Profit."
  },
  "misconceptions": [
    {
      "id": "misc-02-01",
      "misconception": "Gross profit represents the actual cash amount the business owner gets to take home.",
      "intervention": "Demonstrate that Gross Profit only accounts for direct cost of sales; all operating overheads (rent, salaries, utility bills) must still be deducted to find Net Profit."
    }
  ]
}