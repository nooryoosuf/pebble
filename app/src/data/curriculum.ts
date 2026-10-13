// ─── Pebble curriculum data ─────────────────────────────────────────────────
// Source of truth: content files in the project root.
//   curriculum_map_data.md  (stable IDs: ch-*, top-*, lo-*, printed pages)
//   chapter_{1..4}_content_file.md (keyTerms, flashcards fc-*, mcq-*, tf-*,
//     sa-*, business challenges bc-*, misconceptions misc-*)
//   exploring_business_studies_7_complete_lesson_notes.md (Learn notes)
//   achievements_and_milestones.md (ms-*, bdg-*)
//   mcq_question_bank_csv_export.md (MCQ export — same IDs as chapters)
// Do NOT invent textbook content: notes below are condensations of the
// approved lesson notes; page references are preserved verbatim.

export interface LearningObjective {
  objectiveId: string;
  text: string;
  skillTag: string;
}
export interface Topic {
  topicId: string;
  topicNumber: string;
  title: string;
  chapterId: string;
  pages: { start: number; end: number };
  learningObjectives: LearningObjective[];
}
export interface Chapter {
  chapterId: string;
  chapterNumber: number;
  title: string;
  pages: { start: number; end: number };
  topics: Topic[];
}
export interface KeyTerm { term: string; definition: string }
export interface Flashcard { id: string; front: string; back: string }
export interface MCQ {
  id: string; objectiveId: string; question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string; difficulty: string; skillTag: string;
}
export interface TrueFalse {
  id: string; objectiveId: string; statement: string;
  correctAnswer: boolean; explanation: string; difficulty: string; skillTag: string;
}
export interface ShortAnswer {
  id: string; objectiveId: string; question: string; difficulty: string;
  rubric: { totalMarks: number; criteria: { mark: number; description: string }[] };
}
export interface BusinessChallenge {
  challengeId: string; title: string; context: string; task: string; masteryCriteria: string;
}
export interface Misconception { id: string; misconception: string; intervention: string }
export interface LearnSection {
  heading: string;
  body: string[];
  notebookPrompt?: string;
}
export interface Lesson {
  lessonId: string; // stable: lesson-<topicNumber>
  topicId: string;
  chapterId: string;
  title: string;
  pages: { start: number; end: number };
  estimatedMinutes: number;
  keyTerms: KeyTerm[];
  learn: LearnSection[];
  flashcards: Flashcard[];
  mcqs: MCQ[];
  trueFalse: TrueFalse[];
  shortAnswer: ShortAnswer[];
  challenge: BusinessChallenge;
  misconceptions: Misconception[];
}

export const chapters: Chapter[] = [
  {
    chapterId: "ch-01", chapterNumber: 1, title: "Business Fundamentals",
    pages: { start: 1, end: 16 },
    topics: [
      {
        topicId: "top-1.1", topicNumber: "1.1", title: "Basic Economic Concepts",
        chapterId: "ch-01", pages: { start: 1, end: 8 },
        learningObjectives: [
          { objectiveId: "lo-1.1.1", text: "Define economics, scarcity, and distinguish between human needs and wants.", skillTag: "Knowledge & Understanding" },
          { objectiveId: "lo-1.1.2", text: "Classify resources into natural (renewable and non-renewable), human, and manufactured capital.", skillTag: "Classification & Analysis" },
          { objectiveId: "lo-1.1.3", text: "Define choice, opportunity cost, consumption, markets, and explain demand and supply mechanisms.", skillTag: "Application & Evaluation" },
        ],
      },
      {
        topicId: "top-1.2", topicNumber: "1.2", title: "Factors of Production",
        chapterId: "ch-01", pages: { start: 9, end: 12 },
        learningObjectives: [
          { objectiveId: "lo-1.2.1", text: "Identify and explain the four factors of production: land, labour, capital, and enterprise.", skillTag: "Knowledge & Understanding" },
          { objectiveId: "lo-1.2.2", text: "State and explain the respective economic rewards for each factor of production.", skillTag: "Application" },
        ],
      },
      {
        topicId: "top-1.3", topicNumber: "1.3", title: "Stakeholders",
        chapterId: "ch-01", pages: { start: 13, end: 16 },
        learningObjectives: [
          { objectiveId: "lo-1.3.1", text: "Define the concept of a stakeholder and differentiate internal from external stakeholders.", skillTag: "Knowledge & Classification" },
          { objectiveId: "lo-1.3.2", text: "Examine the competing objectives and roles of stakeholders in business operations.", skillTag: "Evaluation" },
        ],
      },
    ],
  },
  {
    chapterId: "ch-02", chapterNumber: 2, title: "Basic Financial Accounting",
    pages: { start: 17, end: 64 },
    topics: [
      {
        topicId: "top-2.1", topicNumber: "2.1", title: "The Role of Accounting and Book-keeping",
        chapterId: "ch-02", pages: { start: 17, end: 28 },
        learningObjectives: [
          { objectiveId: "lo-2.1.1", text: "Explain the role and purpose of bookkeeping and financial accounting.", skillTag: "Knowledge & Understanding" },
          { objectiveId: "lo-2.1.2", text: "Define and classify assets (tangible vs. intangible, current vs. non-current), liabilities, and owner's equity.", skillTag: "Classification & Analysis" },
          { objectiveId: "lo-2.1.3", text: "Apply the fundamental accounting equation (Assets = Capital + Liabilities).", skillTag: "Application & Calculation" },
        ],
      },
      {
        topicId: "top-2.2", topicNumber: "2.2", title: "Double Entry and Ledgers",
        chapterId: "ch-02", pages: { start: 29, end: 48 },
        learningObjectives: [
          { objectiveId: "lo-2.2.1", text: "Explain the duality principle and record debits and credits accurately in ledger accounts.", skillTag: "Application" },
        ],
      },
      {
        topicId: "top-2.3", topicNumber: "2.3", title: "Financial Statements of Sole Traders",
        chapterId: "ch-02", pages: { start: 49, end: 64 },
        learningObjectives: [
          { objectiveId: "lo-2.3.1", text: "Prepare an Income Statement to calculate Gross Profit and Net Profit.", skillTag: "Problem Solving & Calculation" },
          { objectiveId: "lo-2.3.2", text: "Draft a structured Balance Sheet showing assets, liabilities, and owner's equity.", skillTag: "Synthesis & Presentation" },
        ],
      },
    ],
  },
  {
    chapterId: "ch-03", chapterNumber: 3, title: "Entrepreneurship and Production",
    pages: { start: 65, end: 104 },
    topics: [
      {
        topicId: "top-3.1", topicNumber: "3.1", title: "Allocation of Resources",
        chapterId: "ch-03", pages: { start: 65, end: 70 },
        learningObjectives: [
          { objectiveId: "lo-3.1.1", text: "Explain resource allocation and analyze the three economic questions: what, how, and for whom to produce.", skillTag: "Analysis & Evaluation" },
        ],
      },
      {
        topicId: "top-3.2", topicNumber: "3.2", title: "Economic Systems",
        chapterId: "ch-03", pages: { start: 71, end: 76 },
        learningObjectives: [
          { objectiveId: "lo-3.2.1", text: "Compare market, planned, and mixed economic systems with reference to the Maldivian economy.", skillTag: "Comparative Analysis" },
        ],
      },
      {
        topicId: "top-3.3", topicNumber: "3.3", title: "Methods and Sectors of Production",
        chapterId: "ch-03", pages: { start: 77, end: 88 },
        learningObjectives: [
          { objectiveId: "lo-3.3.1", text: "Categorize economic activity into primary, secondary, and tertiary sectors.", skillTag: "Classification" },
          { objectiveId: "lo-3.3.2", text: "Differentiate job, batch, and flow production methods and compare labour-intensive with capital-intensive systems.", skillTag: "Evaluation" },
        ],
      },
      {
        topicId: "top-3.4", topicNumber: "3.4", title: "Division of Labour, Productivity, and Diminishing Returns",
        chapterId: "ch-03", pages: { start: 89, end: 96 },
        learningObjectives: [
          { objectiveId: "lo-3.4.1", text: "Evaluate the benefits and drawbacks of division of labour and calculate productivity ratios.", skillTag: "Calculation & Evaluation" },
          { objectiveId: "lo-3.4.2", text: "Explain total, average, and marginal product, and describe the Law of Diminishing Returns.", skillTag: "Economic Reasoning" },
        ],
      },
      {
        topicId: "top-3.5", topicNumber: "3.5", title: "Promotion and Marketing",
        chapterId: "ch-03", pages: { start: 97, end: 104 },
        learningObjectives: [
          { objectiveId: "lo-3.5.1", text: "Define promotion and distinguish between advertising, sales promotion, PR, and personal selling.", skillTag: "Application" },
        ],
      },
    ],
  },
  {
    chapterId: "ch-04", chapterNumber: 4, title: "Business Organisations",
    pages: { start: 105, end: 130 },
    topics: [
      {
        topicId: "top-4.1", topicNumber: "4.1", title: "Types of Business Ownership",
        chapterId: "ch-04", pages: { start: 105, end: 118 },
        learningObjectives: [
          { objectiveId: "lo-4.1.1", text: "Describe the features, advantages, and disadvantages of sole proprietorships and partnerships.", skillTag: "Analysis & Comparison" },
          { objectiveId: "lo-4.1.2", text: "Compare private limited companies (Ltd) and public limited companies (Plc) with emphasis on limited liability.", skillTag: "Evaluation" },
        ],
      },
      {
        topicId: "top-4.2", topicNumber: "4.2", title: "Alternative Structures, Public Sector, and Privatisation",
        chapterId: "ch-04", pages: { start: 119, end: 130 },
        learningObjectives: [
          { objectiveId: "lo-4.2.1", text: "Define franchises, joint ventures, and cooperatives.", skillTag: "Knowledge & Application" },
          { objectiveId: "lo-4.2.2", text: "Contrast the private and public sectors and evaluate the impacts of privatisation.", skillTag: "Critical Evaluation" },
        ],
      },
    ],
  },
];

// ─── Lessons (one per topic ⇒ 12 lessons) ────────────────────────────────────

export const lessons: Lesson[] = [
  {
    lessonId: "lesson-1.1", topicId: "top-1.1", chapterId: "ch-01",
    title: "Basic Economic Concepts", pages: { start: 1, end: 8 }, estimatedMinutes: 20,
    keyTerms: [
      { term: "Needs", definition: "Basic requirements or necessities of life." },
      { term: "Want", definition: "Things that an individual desires to have." },
      { term: "Choice", definition: "Selection between two or more commodities." },
      { term: "Consumption", definition: "Using up of goods and services to satisfy human wants." },
      { term: "Market", definition: "Place where buyers and sellers meet." },
      { term: "Demand", definition: "Quantity of a product or service desired by buyers." },
      { term: "Supply", definition: "How much the market can offer of a specific product or service." },
    ],
    learn: [
      {
        heading: "The core problem: scarcity",
        body: [
          "Economics studies how individuals, businesses and governments use resources to satisfy unlimited wants with limited (scarce) resources.",
          "Scarcity happens because human wants are infinite but productive resources are finite. When one want is satisfied, a new one appears.",
        ],
        notebookPrompt: "In your notebook, write one need and one want from your own day, and explain why one is survival and the other is not.",
      },
      {
        heading: "Needs vs wants",
        body: [
          "Needs are physical necessities for survival — safe drinking water, nutritious food, protective clothing, secure shelter. Needs come before wants.",
          "Wants are desires you can live without — video games, branded goods, holidays, high-end phones. Wants are unlimited and keep growing.",
        ],
      },
      {
        heading: "Three kinds of resources",
        body: [
          "Natural resources come from nature: water, soil, fish, forests, oil, minerals. Renewable ones (sun, wind, sustainably managed trees) replenish; non-renewable ones (crude oil, coal, gas) take millions of years to form.",
          "Human resources are people's effort, time and intellect. Manufactured (capital) resources are tools, machinery, buildings and roads made by humans to help future production.",
        ],
        notebookPrompt: "List 3 natural, 2 human and 2 manufactured resources you can see around a Maldivian island.",
      },
      {
        heading: "Choice, opportunity cost, markets",
        body: [
          "Because resources are scarce, every choice means giving something up. Opportunity cost is the value of the next best alternative forgone — not the cash paid, but what you sacrificed.",
          "Consumption is using up goods and services. A market is where buyers and sellers meet. Demand is what buyers want to buy; supply is what producers offer for sale.",
        ],
      },
    ],
    flashcards: [
      { id: "fc-01-01", front: "What is the economic definition of scarcity?", back: "The basic economic problem where human wants are unlimited but the resources available to fulfill them are strictly limited." },
      { id: "fc-01-02", front: "What is the difference between a need and a want?", back: "A need is a basic survival necessity (e.g. food, water, shelter). A want is a desire that is not essential for survival (e.g. video games, luxury items)." },
      { id: "fc-01-04", front: "What is meant by opportunity cost?", back: "The value of the next best alternative given up when making an economic choice." },
    ],
    mcqs: [
      {
        id: "mcq-01-01", objectiveId: "lo-1.1.1",
        question: "Which of the following items is classified as a basic human need?",
        options: { A: "Smartwatch", B: "Clean drinking water", C: "Video game console", D: "Overseas holiday" },
        correctAnswer: "B",
        explanation: "Drinking water is essential for human biological survival, making it a need. All other choices are wants.",
        difficulty: "Easy", skillTag: "Knowledge & Understanding",
      },
      {
        id: "mcq-01-03", objectiveId: "lo-1.1.3",
        question: "A student has MVR 50 and must choose between buying a revision book or a cinema ticket. She buys the book. What is the opportunity cost?",
        options: { A: "The MVR 50 spent on the book", B: "The enjoyment of watching the film at the cinema", C: "The knowledge gained from reading the book", D: "The cost of transport to the bookshop" },
        correctAnswer: "B",
        explanation: "Opportunity cost is the benefit of the next best alternative forgone—in this case, the entertainment from the cinema ticket.",
        difficulty: "Medium", skillTag: "Application",
      },
    ],
    trueFalse: [
      { id: "tf-01-01", objectiveId: "lo-1.1.2", statement: "Crude oil is classified as a renewable natural resource because it is found in nature.", correctAnswer: false, explanation: "False. Although natural, crude oil takes millions of years to form and cannot be replaced within a reasonable timeframe once extracted; it is non-renewable.", difficulty: "Easy", skillTag: "Analysis" },
    ],
    shortAnswer: [
      {
        id: "sa-01-01", objectiveId: "lo-1.1.1",
        question: "Explain the statement: 'Resources are limited, but human wants are unlimited.'",
        difficulty: "Hard",
        rubric: {
          totalMarks: 4,
          criteria: [
            { mark: 1, description: "Clear definition of resource scarcity (finite productive inputs)." },
            { mark: 1, description: "Explanation of unlimited human wants (satisfying one creates another)." },
            { mark: 1, description: "Linking scarcity to the necessity of making choices." },
            { mark: 1, description: "Relevant illustrative example provided." },
          ],
        },
      },
    ],
    challenge: {
      challengeId: "bc-01-part-a", title: "Needs, wants & island resources",
      context: "You live on an island with one shop, one school and fishing boats.",
      task: "Sort these into needs/wants and natural/human/manufactured resources: drinking water, smartphone, tuna, teacher's work, fishing boat, beach holiday.",
      masteryCriteria: "Correctly classifies each item and justifies renewable vs non-renewable where relevant.",
    },
    misconceptions: [
      { id: "misc-01-01", misconception: "Opportunity cost means the monetary amount paid for an item.", intervention: "Highlight that opportunity cost is the real value of the next best alternative sacrificed, not the cash spent." },
    ],
  },
  {
    lessonId: "lesson-1.2", topicId: "top-1.2", chapterId: "ch-01",
    title: "Factors of Production", pages: { start: 9, end: 12 }, estimatedMinutes: 20,
    keyTerms: [
      { term: "Land", definition: "All natural gifts used in production; reward: rent." },
      { term: "Labour", definition: "Human physical and mental effort; reward: wages/salaries." },
      { term: "Capital", definition: "Man-made tools, machinery and funds; reward: interest." },
      { term: "Enterprise", definition: "Risk-taking organisation of production; reward: profit." },
    ],
    learn: [
      {
        heading: "The four factors",
        body: [
          "Land: all natural gifts — reefs, beaches, tuna, farmland, oil, water. Fixed in supply. Reward: rent.",
          "Labour: human effort — teachers, divers, factory workers, nurses. Reward: wages / salaries.",
          "Capital: man-made helpers — trawlers, canning machines, computers, buildings, cash funds. Reward: interest / return on investment.",
          "Enterprise: the entrepreneur's skill in combining the other three and taking risks. Reward: profit.",
        ],
        notebookPrompt: "Copy the 4-factor table into your notebook with one Maldivian example and reward for each.",
      },
      {
        heading: "Watch out: what capital really means",
        body: [
          "In economics, capital mainly means physical tools and machines — not just cash. Cash (financial capital) is used to buy those tools.",
        ],
      },
    ],
    flashcards: [
      { id: "fc-01-03", front: "What are the four factors of production and their rewards?", back: "Land (Rent), Labour (Wages/Salaries), Capital (Interest/Return on Investment), Enterprise (Profit)." },
    ],
    mcqs: [
      {
        id: "mcq-01-02", objectiveId: "lo-1.2.2",
        question: "What is the economic reward earned by the factor of production 'Land'?",
        options: { A: "Wages", B: "Interest", C: "Rent", D: "Profit" },
        correctAnswer: "C",
        explanation: "The payment received for allowing the use of land and natural resources is rent.",
        difficulty: "Medium", skillTag: "Knowledge",
      },
    ],
    trueFalse: [],
    shortAnswer: [],
    challenge: {
      challengeId: "bc-01", title: "Sarah's Island Bakery Startup",
      context: "Sarah plans to open a bakery on an island in the Maldives. She needs an oven, flour, sugar, a helper, and a shop space near the harbour.",
      task: "Identify each factor of production Sarah uses, state its reward, and identify two key stakeholders who will be affected by her business.",
      masteryCriteria: "Student correctly identifies the 4 factors, gives their correct economic rewards, and explains how at least two stakeholders (e.g. customers, suppliers) are involved.",
    },
    misconceptions: [
      { id: "misc-01-02", misconception: "Money (cash) is the factor of production known as 'Capital'.", intervention: "Clarify that in economics, capital primarily refers to man-made physical tools, machinery, and equipment used in production, while cash is financial capital used to acquire them." },
    ],
  },
  {
    lessonId: "lesson-1.3", topicId: "top-1.3", chapterId: "ch-01",
    title: "Stakeholders", pages: { start: 13, end: 16 }, estimatedMinutes: 18,
    keyTerms: [
      { term: "Stakeholder", definition: "Anyone directly or indirectly related to a specific business." },
    ],
    learn: [
      {
        heading: "Who is a stakeholder?",
        body: [
          "A stakeholder is anyone with a direct or indirect interest in a business's decisions and performance.",
          "Internal stakeholders work inside the firm: owners/shareholders, managers, employees. External stakeholders are outside: customers, suppliers, banks, government, community.",
        ],
        notebookPrompt: "Draw the internal vs external stakeholder map from the textbook (p.13–16) in your notebook.",
      },
      {
        heading: "What each stakeholder wants",
        body: [
          "Owners want profit and growth. Employees want fair pay, safety and security. Customers want quality and fair prices. Suppliers want on-time payment. Banks want loans repaid with interest. Government wants taxes and rule-following. The community wants jobs and a clean environment.",
          "These objectives compete — e.g. higher wages please workers but reduce profit. Businesses must balance them.",
        ],
      },
    ],
    flashcards: [
      { id: "fc-01-05", front: "Who is an external stakeholder?", back: "An individual or group outside the firm affected by its activities, such as customers, suppliers, banks, government, and the community." },
    ],
    mcqs: [],
    trueFalse: [
      { id: "tf-01-02", objectiveId: "lo-1.3.1", statement: "Employees and business managers are classified as internal stakeholders of a business.", correctAnswer: true, explanation: "True. Internal stakeholders operate directly within the organization.", difficulty: "Easy", skillTag: "Knowledge" },
    ],
    shortAnswer: [],
    challenge: {
      challengeId: "bc-01-part-b", title: "Bakery stakeholders",
      context: "Sarah's island bakery (see Lesson 1.2) opens near the harbour.",
      task: "Name two internal and two external stakeholders of the bakery and explain one objective of each.",
      masteryCriteria: "Correctly separates internal/external and states a valid competing objective for each.",
    },
    misconceptions: [],
  },
  {
    lessonId: "lesson-2.1", topicId: "top-2.1", chapterId: "ch-02",
    title: "The Role of Accounting and Book-keeping", pages: { start: 17, end: 28 }, estimatedMinutes: 22,
    keyTerms: [
      { term: "Book-keeping", definition: "The detailed recording of all the financial transactions of a business." },
      { term: "Asset", definition: "Something of measurable economic value owned by or owed to a business." },
      { term: "Liability", definition: "Debts or financial obligations owed by the business to external parties." },
      { term: "Owner's Equity", definition: "The difference between total asset value and total liability value; the owner's net investment in the business." },
    ],
    learn: [
      {
        heading: "Bookkeeping vs accounting",
        body: [
          "Bookkeeping is the daily, orderly recording of every financial transaction. Accounting is bigger: summarising, analysing, interpreting and communicating those records so owners and others can decide well.",
        ],
        notebookPrompt: "Write one sentence in your own words for bookkeeping and one for accounting.",
      },
      {
        heading: "Assets, liabilities, equity",
        body: [
          "Assets are what the business owns or is owed: tangible (vehicles, desks) vs intangible (brand, patents); non-current (premises, boats — used >1 year) vs current (inventory, receivables, bank — convertible within 12 months).",
          "Liabilities are debts to outsiders: current (payables, overdrafts — due within 12 months) and non-current (long-term loans). Owner's equity = Total Assets − Total Liabilities.",
        ],
      },
      {
        heading: "The accounting equation",
        body: [
          "Assets = Capital + Liabilities. Rearranged: Capital = Assets − Liabilities. Every transaction keeps this balanced.",
          "Example: assets MVR 150,000 and liabilities MVR 45,000 ⇒ capital = 150,000 − 45,000 = MVR 105,000.",
        ],
        notebookPrompt: "Solve: assets MVR 200,000, liabilities MVR 60,000. What is capital? Show your working.",
      },
    ],
    flashcards: [
      { id: "fc-02-01", front: "State the fundamental accounting equation.", back: "Assets = Capital + Liabilities (or Capital = Assets - Liabilities)." },
      { id: "fc-02-02", front: "What is the difference between a tangible asset and an intangible asset?", back: "Tangible assets have physical existence (e.g., premises, motor vehicles). Intangible assets do not have physical form (e.g., brand value, education, patents)." },
    ],
    mcqs: [
      {
        id: "mcq-02-01", objectiveId: "lo-2.1.2",
        question: "Which of the following is classified as a non-current asset?",
        options: { A: "Trade Receivables", B: "Bank Balance", C: "Business Delivery Boat (Motor Vehicle)", D: "Closing Inventory" },
        correctAnswer: "C",
        explanation: "A delivery boat is held for long-term operational use across multiple years, classifying it as a non-current asset.",
        difficulty: "Medium", skillTag: "Classification",
      },
      {
        id: "mcq-02-02", objectiveId: "lo-2.1.3",
        question: "If a business has total assets of MVR 150,000 and total liabilities of MVR 45,000, what is the owner's capital?",
        options: { A: "MVR 195,000", B: "MVR 105,000", C: "MVR 45,000", D: "MVR 150,000" },
        correctAnswer: "B",
        explanation: "Capital = Assets - Liabilities = 150,000 - 45,000 = MVR 105,000.",
        difficulty: "Easy", skillTag: "Calculation",
      },
    ],
    trueFalse: [
      { id: "tf-02-02", objectiveId: "lo-2.1.1", statement: "Bookkeeping and accounting refer to the exact same administrative task.", correctAnswer: false, explanation: "False. Bookkeeping is the routine recording of transactions, while accounting involves analyzing, reporting, and interpreting financial data.", difficulty: "Easy", skillTag: "Understanding" },
    ],
    shortAnswer: [],
    challenge: {
      challengeId: "bc-02-part-a", title: "Classify it!",
      context: "A speedboat shop lists: shop building, delivery boat, tuna inventory, customer IOUs, bank balance, supplier bill, 5-year loan.",
      task: "Classify each as non-current/current asset or current/non-current liability, and compute equity if assets total MVR 300,000 and liabilities MVR 90,000.",
      masteryCriteria: "All items correctly classified; equity correctly computed as MVR 210,000 with working shown.",
    },
    misconceptions: [],
  },
  {
    lessonId: "lesson-2.2", topicId: "top-2.2", chapterId: "ch-02",
    title: "Double Entry and Ledgers", pages: { start: 29, end: 48 }, estimatedMinutes: 22,
    keyTerms: [
      { term: "Duality", definition: "Every transaction has equal debit and credit entries." },
      { term: "Debit", definition: "Left side: increases assets/expenses; decreases liabilities/capital/revenue." },
      { term: "Credit", definition: "Right side: increases liabilities/capital/revenue; decreases assets/expenses." },
    ],
    learn: [
      {
        heading: "The duality rule",
        body: [
          "Every transaction hits at least two accounts: one debit, one matching credit of equal value.",
          "Debit (left): increases in assets, increases in expenses, decreases in liabilities, decreases in capital, decreases in revenue. Credit (right): the mirror image.",
        ],
        notebookPrompt: "Copy the debit/credit table (p.29–48) into your notebook from memory, then check.",
      },
      {
        heading: "Two quick rules to memorise",
        body: [
          "Assets increase with a debit. Liabilities increase with a credit. Test yourself: buying a boat with cash — debit boat (asset up), credit bank (asset down). Taking a loan — debit bank (asset up), credit loan (liability up).",
        ],
      },
    ],
    flashcards: [
      { id: "fc-02-03", front: "What is the double-entry rule for an increase in an asset?", back: "An increase in an asset is recorded as a Debit entry." },
    ],
    mcqs: [],
    trueFalse: [
      { id: "tf-02-01", objectiveId: "lo-2.2.1", statement: "In double-entry bookkeeping, an increase in a liability account is recorded with a credit entry.", correctAnswer: true, explanation: "True. Under double-entry rules, liabilities increase on the credit side.", difficulty: "Medium", skillTag: "Application" },
    ],
    shortAnswer: [],
    challenge: {
      challengeId: "bc-02-part-b", title: "Debit or credit?",
      context: "Four transactions: (1) owner puts MVR 50,000 cash in; (2) shop buys inventory on credit MVR 8,000; (3) pays supplier MVR 8,000 cash; (4) sells sweets for MVR 3,000 cash.",
      task: "For each, state the two accounts affected and whether each is debited or credited.",
      masteryCriteria: "All eight entries correct under duality; equation stays balanced.",
    },
    misconceptions: [],
  },
  {
    lessonId: "lesson-2.3", topicId: "top-2.3", chapterId: "ch-02",
    title: "Financial Statements of Sole Traders", pages: { start: 49, end: 64 }, estimatedMinutes: 25,
    keyTerms: [
      { term: "Gross Profit", definition: "Profit calculated as sales revenue minus cost of goods sold." },
      { term: "Net Profit", definition: "The final operating profit after deducting all operational overheads and expenses from gross profit." },
    ],
    learn: [
      {
        heading: "Income statement",
        body: [
          "Gross Profit = Net Revenue − Cost of Goods Sold (COGS). COGS = Opening Inventory + Purchases + Carriage Inwards − Closing Inventory.",
          "Net Profit = Gross Profit + Other Income − Total Operating Expenses. Gross profit ignores overheads; net profit is the final score.",
        ],
        notebookPrompt: "Revenue 80,000, COGS 45,000. Compute gross profit in your notebook (answer: 35,000).",
      },
      {
        heading: "Balance sheet snapshot",
        body: [
          "The balance sheet shows what the business owns (non-current + current assets), owes (liabilities), and the owner's equity (opening capital + net profit − drawings) on one date — e.g. Fahi Shopping at 31 October (textbook p.49–64).",
        ],
      },
    ],
    flashcards: [
      { id: "fc-02-04", front: "What does an Income Statement calculate?", back: "It calculates the Gross Profit (Trading section) and the Net Profit or Loss (Profit & Loss section) over an accounting period." },
    ],
    mcqs: [
      {
        id: "mcq-02-03", objectiveId: "lo-2.3.1",
        question: "Sales revenue is MVR 80,000 and Cost of Goods Sold is MVR 45,000. What is the Gross Profit?",
        options: { A: "MVR 125,000", B: "MVR 45,000", C: "MVR 35,000", D: "MVR 80,000" },
        correctAnswer: "C",
        explanation: "Gross Profit = Revenue - Cost of Goods Sold = 80,000 - 45,000 = MVR 35,000.",
        difficulty: "Easy", skillTag: "Calculation",
      },
    ],
    trueFalse: [],
    shortAnswer: [
      {
        id: "sa-02-01", objectiveId: "lo-2.3.1",
        question: "Explain the difference between Gross Profit and Net Profit.",
        difficulty: "Medium",
        rubric: {
          totalMarks: 3,
          criteria: [
            { mark: 1, description: "Defines Gross Profit as sales revenue less direct cost of sales." },
            { mark: 1, description: "Defines Net Profit as Gross Profit plus other income minus all operating expenses." },
            { mark: 1, description: "Accurately notes that Net Profit reflects the final profitability of the enterprise." },
          ],
        },
      },
    ],
    challenge: {
      challengeId: "bc-02", title: "Fahi Shopping Trial Balance Review",
      context: "Fahi Shopping extracts its trial balance on 31 October with Revenue MVR 198,000, Purchases MVR 53,000, and Operating Expenses of MVR 124,800. Closing inventory is valued at MVR 41,000.",
      task: "Calculate the Cost of Goods Sold, determine Gross Profit, and calculate Net Profit for the year.",
      masteryCriteria: "Correct calculation showing Cost of Goods Sold, Gross Profit, and the resulting Net Profit.",
    },
    misconceptions: [
      { id: "misc-02-01", misconception: "Gross profit represents the actual cash amount the business owner gets to take home.", intervention: "Demonstrate that Gross Profit only accounts for direct cost of sales; all operating overheads (rent, salaries, utility bills) must still be deducted to find Net Profit." },
    ],
  },
  {
    lessonId: "lesson-3.1", topicId: "top-3.1", chapterId: "ch-03",
    title: "Allocation of Resources", pages: { start: 65, end: 70 }, estimatedMinutes: 18,
    keyTerms: [
      { term: "Allocation of Resources", definition: "A strategic process whereby an organisation plans to use its available resources for the production of goods and services." },
    ],
    learn: [
      {
        heading: "Three questions every economy answers",
        body: [
          "What to produce? Which goods/services and how many — weighing opportunity costs.",
          "How to produce? Which mix of labour vs machines and technology.",
          "For whom to produce? How output is shared among the population.",
        ],
        notebookPrompt: "For your island: what would you produce, how, and for whom? Write 3 sentences.",
      },
    ],
    flashcards: [
      { id: "fc-03-01", front: "What are the three fundamental economic questions?", back: "1. What to produce? 2. How to produce? 3. For whom to produce?" },
    ],
    mcqs: [], trueFalse: [], shortAnswer: [],
    challenge: {
      challengeId: "bc-03-part-a", title: "Island council choice",
      context: "The island council has one budget: build a jetty or a library.",
      task: "Explain the three economic questions for this decision and name the opportunity cost of choosing the jetty.",
      masteryCriteria: "Applies what/how/for-whom correctly and identifies the library as the opportunity cost.",
    },
    misconceptions: [],
  },
  {
    lessonId: "lesson-3.2", topicId: "top-3.2", chapterId: "ch-03",
    title: "Economic Systems", pages: { start: 71, end: 76 }, estimatedMinutes: 20,
    keyTerms: [
      { term: "Market Economy", definition: "An economy where consumers determine what is produced, resources are allocated by the price mechanism, and capital is privately owned." },
      { term: "Planned Economy", definition: "An economy where government makes critical decisions, capital is state-owned, and resources are allocated by directives." },
      { term: "Mixed Economy", definition: "An economy in which both the private and public sectors play an important role." },
    ],
    learn: [
      {
        heading: "Market, planned, mixed",
        body: [
          "Market (free enterprise): prices and demand/supply decide; private ownership. Strengths: efficiency, choice, innovation. Weaknesses: inequality, missing public goods, pollution.",
          "Planned (command): government directives and quotas; state ownership. Strengths: welfare focus, jobs. Weaknesses: shortages, rigidity, slow innovation.",
          "Mixed: both market and government together — private drive plus public safety nets. The Maldives is a mixed economy: private tourism, fishing, retail and transport alongside government utilities, schools, hospitals and state-owned enterprises.",
        ],
        notebookPrompt: "Make a 3-column table: market / planned / mixed — one example and one pro/con each.",
      },
    ],
    flashcards: [
      { id: "fc-03-02", front: "What characterizes a mixed economy?", back: "An economic system where both the private enterprise sector and the government public sector allocate resources." },
    ],
    mcqs: [
      {
        id: "mcq-03-02", objectiveId: "lo-3.2.1",
        question: "What type of economic system operates in the Republic of Maldives?",
        options: { A: "Pure Planned Economy", B: "Pure Free Market Economy", C: "Mixed Economy", D: "Traditional Subsistence-Only Economy" },
        correctAnswer: "C",
        explanation: "The Maldives is a mixed economy where private businesses coexist with state-owned enterprises and public utilities.",
        difficulty: "Easy", skillTag: "Application",
      },
    ],
    trueFalse: [], shortAnswer: [],
    challenge: {
      challengeId: "bc-03-part-b", title: "Which system?",
      context: "Two islands: one where the price of tuna decides everything; one where the council sets all quotas.",
      task: "Identify each system, then explain why the Maldives as a whole is mixed.",
      masteryCriteria: "Correctly labels market vs planned and cites Maldivian private + public examples.",
    },
    misconceptions: [],
  },
  {
    lessonId: "lesson-3.3", topicId: "top-3.3", chapterId: "ch-03",
    title: "Methods and Sectors of Production", pages: { start: 77, end: 88 }, estimatedMinutes: 22,
    keyTerms: [
      { term: "Primary Industry", definition: "Industry that extracts raw materials directly from the earth or sea." },
      { term: "Secondary Industry", definition: "Industry that processes raw materials into manufactured goods." },
      { term: "Tertiary Industry", definition: "Industry that provides commercial and personal services." },
    ],
    learn: [
      {
        heading: "Three sectors",
        body: [
          "Primary extracts: pole-and-line tuna fishing, farming, mining. Secondary makes: Felivaru tuna canning, boat building, construction. Tertiary serves: resorts, transport, banking, shops.",
        ],
      },
      {
        heading: "Job, batch, flow",
        body: [
          "Job: one-off custom items (safari boat, tailored suit). Batch: groups of identical items per stage (200 loaves, then 300 pastries). Flow/mass: continuous assembly line (tuna cannery, bottling plant).",
          "Labour-intensive uses mostly people; capital-intensive uses mostly machines. Felivaru has both: conveyor (capital) plus line workers (labour).",
        ],
        notebookPrompt: "Give one Maldivian example each of job, batch and flow production.",
      },
    ],
    flashcards: [
      { id: "fc-03-03", front: "What is the difference between job production and flow production?", back: "Job production makes single, unique, custom items from start to finish. Flow production produces identical items continuously on an automated assembly line." },
    ],
    mcqs: [
      {
        id: "mcq-03-01", objectiveId: "lo-3.3.1",
        question: "Which of the following business activities belongs to the primary sector?",
        options: { A: "Canning tuna in a factory", B: "Pole-and-line tuna fishing at sea", C: "Operating a resort diving school", D: "Transporting passengers by speedboat" },
        correctAnswer: "B",
        explanation: "Pole-and-line fishing directly extracts a natural resource from the ocean, placing it in the primary sector.",
        difficulty: "Easy", skillTag: "Classification",
      },
    ],
    trueFalse: [
      { id: "tf-03-01", objectiveId: "lo-3.3.2", statement: "Flow production is best suited for unique, one-off customized products tailored to individual customer specifications.", correctAnswer: false, explanation: "False. Flow production is designed for mass production of standardized goods; customized products use job production.", difficulty: "Easy", skillTag: "Understanding" },
    ],
    shortAnswer: [],
    challenge: {
      challengeId: "bc-03", title: "Felivaru Tuna Processing Analysis",
      context: "Review the photograph of tuna processing (Activity 3.8, page 69). Workers stand along a conveyor belt filling and inspecting cans.",
      task: "Explain in 100-150 words whether this operation is labour-intensive or capital-intensive, justifying your evaluation with specific evidence.",
      masteryCriteria: "Provides a clear argument that recognizes elements of both methods (automated conveyor belt = capital; line of human sorters = labour) and justifies their conclusion.",
    },
    misconceptions: [],
  },
  {
    lessonId: "lesson-3.4", topicId: "top-3.4", chapterId: "ch-03",
    title: "Division of Labour, Productivity & Diminishing Returns", pages: { start: 89, end: 96 }, estimatedMinutes: 22,
    keyTerms: [
      { term: "Productivity", definition: "The amount of output that can be produced from a given input of resources." },
      { term: "Law of Diminishing Returns", definition: "Economic principle stating that adding variable inputs to a fixed factor eventually results in declining additions to total output." },
    ],
    learn: [
      {
        heading: "Division of labour",
        body: [
          "Splitting production into small specialised tasks makes workers faster, saves switching time and simplifies training. But extreme repetition causes boredom and low motivation, and one absence can stop the line.",
        ],
      },
      {
        heading: "Measuring productivity",
        body: [
          "Productivity = Total Output ÷ Total Input. Total Product (TP) is all output. Average Product AP = TP ÷ labour units. Marginal Product MP = change in TP from one more worker.",
          "Example: 600 souvenirs ÷ 5 craftsmen = 120 units each. Production (total made) is not the same as productivity (per input).",
        ],
        notebookPrompt: "A café makes 240 coffees with 4 staff. What is productivity per worker?",
      },
      {
        heading: "Diminishing returns",
        body: [
          "Adding more workers to fixed space/machines eventually adds less and less extra output — marginal product falls. That turning point is the Law of Diminishing Returns.",
        ],
      },
    ],
    flashcards: [
      { id: "fc-03-04", front: "State the Law of Diminishing Returns.", back: "As extra units of a variable factor (e.g. labour) are added to a fixed factor (e.g. land/machinery), Marginal Product eventually declines." },
    ],
    mcqs: [
      {
        id: "mcq-03-03", objectiveId: "lo-3.4.1",
        question: "A workshop produces 600 handcrafted wooden souvenirs using 5 craftsmen over one week. What is the labour productivity per craftsman?",
        options: { A: "3,000 units", B: "120 units", C: "60 units", D: "100 units" },
        correctAnswer: "B",
        explanation: "Productivity = Total Output / Total Input = 600 / 5 = 120 units per craftsman.",
        difficulty: "Medium", skillTag: "Calculation",
      },
    ],
    trueFalse: [
      { id: "tf-03-02", objectiveId: "lo-3.4.1", statement: "Division of labour can lead to employee boredom and lower motivation due to repetitive tasks.", correctAnswer: true, explanation: "True. Repeatedly performing a single narrow task can lead to job monotony and reduced employee satisfaction.", difficulty: "Easy", skillTag: "Evaluation" },
    ],
    shortAnswer: [
      {
        id: "sa-03-01", objectiveId: "lo-3.4.2",
        question: "Explain the difference between Total Product (TP) and Marginal Product (MP).",
        difficulty: "Medium",
        rubric: {
          totalMarks: 3,
          criteria: [
            { mark: 1, description: "Defines Total Product as the overall output produced by a business." },
            { mark: 1, description: "Defines Marginal Product as the change in total output resulting from adding one more unit of input." },
            { mark: 1, description: "Provides an illustrative example showing how MP reflects the extra output." },
          ],
        },
      },
    ],
    challenge: {
      challengeId: "bc-03-part-c", title: "Diminishing returns on the boat",
      context: "A small fishing boat fits 4 crew comfortably. The owner keeps adding crew to the same boat.",
      task: "Explain when diminishing returns set in and how TP, AP and MP change.",
      masteryCriteria: "Identifies the fixed factor (boat), explains MP eventually falls, distinguishes TP/AP/MP.",
    },
    misconceptions: [
      { id: "misc-03-01", misconception: "High production volume automatically means high productivity.", intervention: "Clarify that production is the total quantity of output, whereas productivity measures output generated per unit of input." },
    ],
  },
  {
    lessonId: "lesson-3.5", topicId: "top-3.5", chapterId: "ch-03",
    title: "Promotion and Marketing", pages: { start: 97, end: 104 }, estimatedMinutes: 15,
    keyTerms: [
      { term: "Promotion", definition: "Communication strategies to raise awareness, generate sales and build loyalty." },
    ],
    learn: [
      {
        heading: "Four promotion methods",
        body: [
          "Advertising: paid announcements (TV, radio, social media, print). Sales promotion: short-term incentives (discounts, buy-one-get-one-free, loyalty points).",
          "Personal selling: direct sales talk by a representative. Public relations (PR): good reputation via sponsorships, community work and press.",
        ],
        notebookPrompt: "Find one Maldivian example of each promotion method and note why it fits.",
      },
    ],
    flashcards: [],
    mcqs: [], trueFalse: [], shortAnswer: [],
    challenge: {
      challengeId: "bc-03-part-d", title: "Promote the guesthouse",
      context: "A new island guesthouse has 6 rooms and a small budget.",
      task: "Pick two promotion methods, explain why they suit a small guesthouse, and write one sample message.",
      masteryCriteria: "Justifies two fitting methods with a clear, appropriate sample message.",
    },
    misconceptions: [],
  },
  {
    lessonId: "lesson-4.1", topicId: "top-4.1", chapterId: "ch-04",
    title: "Types of Business Ownership", pages: { start: 105, end: 118 }, estimatedMinutes: 24,
    keyTerms: [
      { term: "Sole Proprietorship", definition: "A one-person business where the owner has unlimited liability." },
      { term: "Partnership", definition: "A business organisation of two or more people who share profits and are personally responsible for its debts." },
      { term: "Limited Liability", definition: "Legal protection where shareholders' liability for business debts is restricted to the value of their share investment." },
      { term: "Business Organisation", definition: "An organisation established with the purpose of producing and selling goods and services." },
    ],
    learn: [
      {
        heading: "Unincorporated vs incorporated",
        body: [
          "Unincorporated (no separate legal identity, unlimited liability): sole traders and partnerships. Incorporated (separate legal entity, limited liability): private limited (Ltd) and public limited (Plc) companies.",
          "Unlimited liability means personal assets can pay business debts. Limited liability means shareholders only lose what they invested — personal assets are safe (the company itself still owes its debts).",
        ],
      },
      {
        heading: "Sole trader & partnership",
        body: [
          "Sole trader: one owner. Pros: cheapest to start, keeps all profit, full control, private accounts. Cons: unlimited liability, hard to raise big capital, heavy workload, ends if the owner dies.",
          "Partnership (usually 2–20 partners with an agreement): more capital and skills, shared load and risk. Cons: unlimited liability for general partners, disagreements, one partner's decision binds all, profits shared.",
        ],
      },
      {
        heading: "Ltd vs Plc",
        body: [
          "Both are separate legal entities that can own property and be sued. Ltd sells shares privately to family/friends — cannot trade on the stock exchange, keeps control. Plc sells shares publicly on the exchange — raises huge capital but faces strict reports, audits and takeover risk.",
        ],
        notebookPrompt: "In your notebook, compare Ltd vs Plc in 4 rows: who can buy shares, capital raised, privacy, rules.",
      },
    ],
    flashcards: [
      { id: "fc-04-01", front: "What does unlimited liability mean for a sole trader?", back: "The owner is personally liable for all business debts; personal assets can be used to pay off creditors if the business cannot." },
      { id: "fc-04-02", front: "What is the key difference between an Ltd and a Plc?", back: "An Ltd sells shares privately and cannot trade them on the stock exchange. A Plc can offer and trade shares publicly on the stock exchange." },
    ],
    mcqs: [
      {
        id: "mcq-04-01", objectiveId: "lo-4.1.2",
        question: "What is the primary benefit of limited liability for shareholders?",
        options: { A: "They never have to pay tax on company profits.", B: "Their loss is limited to the money invested in shares; personal assets are safe.", C: "The company is exempt from filing annual financial reports.", D: "They can run the business without appointing directors." },
        correctAnswer: "B",
        explanation: "Limited liability protects personal assets; shareholders can only lose the value of the shares they subscribed to.",
        difficulty: "Medium", skillTag: "Understanding",
      },
      {
        id: "mcq-04-02", objectiveId: "lo-4.1.1",
        question: "Which business entity type is easiest and least expensive to register and start?",
        options: { A: "Public Limited Company (Plc)", B: "Joint Venture", C: "Sole Proprietorship", D: "Private Limited Company (Ltd)" },
        correctAnswer: "C",
        explanation: "Sole proprietorships have the fewest legal registration requirements and minimal startup costs.",
        difficulty: "Easy", skillTag: "Knowledge",
      },
    ],
    trueFalse: [
      { id: "tf-04-01", objectiveId: "lo-4.1.1", statement: "If a partnership business collapses with heavy debts, partners with unlimited liability can lose personal property.", correctAnswer: true, explanation: "True. General partners share unlimited personal liability for partnership debts.", difficulty: "Medium", skillTag: "Application" },
      { id: "tf-04-02", objectiveId: "lo-4.1.2", statement: "A Private Limited Company (Ltd) can freely advertise and sell its shares to the general public on the open stock exchange.", correctAnswer: false, explanation: "False. Only Public Limited Companies (Plc) can offer shares to the general public on an open stock exchange.", difficulty: "Easy", skillTag: "Knowledge" },
    ],
    shortAnswer: [
      {
        id: "sa-04-01", objectiveId: "lo-4.1.1",
        question: "Outline two advantages and two disadvantages of operating a business as a sole proprietorship.",
        difficulty: "Medium",
        rubric: {
          totalMarks: 4,
          criteria: [
            { mark: 1, description: "States first valid advantage (e.g., retains all profit, total control, privacy)." },
            { mark: 1, description: "States second valid advantage." },
            { mark: 1, description: "States first valid disadvantage (e.g., unlimited liability, difficult to raise large capital)." },
            { mark: 1, description: "States second valid disadvantage (e.g., lack of continuity, heavy personal workload)." },
          ],
        },
      },
    ],
    challenge: {
      challengeId: "bc-04", title: "Aisha's Enterprise Expansion Decision",
      context: "Aisha operates a successful boutique bakery as a sole trader. She plans to expand across three atolls, requiring MVR 850,000 for equipment and premises, which exceeds her personal savings.",
      task: "Advise Aisha on whether she should form an ordinary Partnership or incorporate as a Private Limited Company (Ltd). Justify your recommendation.",
      masteryCriteria: "Analyzes the risk of unlimited liability vs. limited liability, compares fundraising capacity, and provides a clear recommendation.",
    },
    misconceptions: [
      { id: "misc-04-01", misconception: "Limited liability means the business entity itself never has to pay its debts.", intervention: "Clarify that the company is still liable for all debts; limited liability protects the personal assets of the individual shareholders from company creditors." },
    ],
  },
  {
    lessonId: "lesson-4.2", topicId: "top-4.2", chapterId: "ch-04",
    title: "Alternative Structures, Public Sector & Privatisation", pages: { start: 119, end: 130 }, estimatedMinutes: 20,
    keyTerms: [
      { term: "Privatisation", definition: "The transfer of ownership and control of an enterprise from the public sector to the private sector." },
    ],
    learn: [
      {
        heading: "Franchise, joint venture, cooperative",
        body: [
          "Franchise: a franchisee buys the right to use a big brand's name, system and products (pays fees/royalties). Joint venture: two+ businesses team up on one project but stay separate. Cooperative: owned and run democratically by members (workers/consumers/producers); profits shared by participation.",
        ],
      },
      {
        heading: "Private vs public, privatisation",
        body: [
          "Private sector: owned by individuals/companies, driven by profit. Public sector: owned by government, provides services, welfare and infrastructure.",
          "Privatisation moves a business from public to private. For: efficiency, profit incentive, less public spending. Against: higher prices for essentials, job cuts, neglected welfare. Nationalisation is the reverse (private → public).",
        ],
        notebookPrompt: "List one for-argument and one against-argument for privatising an island ferry service.",
      },
    ],
    flashcards: [
      { id: "fc-04-03", front: "What is a franchise?", back: "A commercial setup where a franchisee buys the right to use an established brand name, system, and products of a franchisor." },
      { id: "fc-04-04", front: "What is privatisation?", back: "Selling state-owned public corporations to private sector owners." },
    ],
    mcqs: [
      {
        id: "mcq-04-03", objectiveId: "lo-4.2.2",
        question: "What is an argument often raised in favor of privatisation?",
        options: { A: "It guarantees that prices for essential utilities remain as low as possible.", B: "It increases operational efficiency due to the profit incentive and competition.", C: "It removes all commercial risk from business operations.", D: "It eliminates the need for advertising and marketing." },
        correctAnswer: "B",
        explanation: "Supporters of privatisation argue that profit incentives and competitive markets improve efficiency compared to state management.",
        difficulty: "Hard", skillTag: "Evaluation",
      },
    ],
    trueFalse: [], shortAnswer: [],
    challenge: {
      challengeId: "bc-04-part-b", title: "Ferry service: privatise?",
      context: "The government runs the only ferry between two atolls. It is reliable but loses money. A private company offers to buy it.",
      task: "Give one argument for and one against privatisation, then state your recommendation with a reason.",
      masteryCriteria: "Balanced for/against using efficiency vs price/access, with a justified recommendation.",
    },
    misconceptions: [],
  },
];

// ─── Achievements (from achievements_and_milestones.md) ──────────────────────

export interface Milestone {
  milestoneId: string; title: string; chapterId: string;
  description: string; xpReward: number; badgeGraphic: string;
}
export interface SpecialBadge {
  badgeId: string; title: string; criteria: string;
  linkedObjectiveIds: string[]; xpReward: number;
}

export const milestones: Milestone[] = [
  { milestoneId: "ms-01", title: "Foundations Scout", chapterId: "ch-01", description: "Demonstrate a complete understanding of economic fundamentals, resources, and stakeholders.", xpReward: 250, badgeGraphic: "badge-foundations-scout.png" },
  { milestoneId: "ms-02", title: "Master Bookkeeper", chapterId: "ch-02", description: "Master the fundamental accounting equation, ledger principles, and sole trader financial statements.", xpReward: 350, badgeGraphic: "badge-master-bookkeeper.png" },
  { milestoneId: "ms-03", title: "Venture Pioneer", chapterId: "ch-03", description: "Demonstrate understanding of resource allocation, economic systems, production methods, and productivity.", xpReward: 300, badgeGraphic: "badge-venture-pioneer.png" },
  { milestoneId: "ms-04", title: "Executive Strategist", chapterId: "ch-04", description: "Evaluate forms of business ownership, the benefits of limited liability, and sector structures.", xpReward: 400, badgeGraphic: "badge-executive-strategist.png" },
];

export const specialBadges: SpecialBadge[] = [
  { badgeId: "bdg-island-economist", title: "Island Economist", criteria: "Correctly classify 10 local Maldivian economic resources into Land, Labour, and Capital on the first attempt.", linkedObjectiveIds: ["lo-1.1.2", "lo-1.2.1"], xpReward: 150 },
  { badgeId: "bdg-flawless-balance", title: "Flawless Balance", criteria: "Balance an end-of-year trial balance and prepare a balance sheet without calculation errors.", linkedObjectiveIds: ["lo-2.1.3", "lo-2.3.2"], xpReward: 200 },
  { badgeId: "bdg-productivity-pro", title: "Productivity Pro", criteria: "Accurately compute total, average, and marginal product and correctly identify diminishing returns.", linkedObjectiveIds: ["lo-3.4.1", "lo-3.4.2"], xpReward: 150 },
  { badgeId: "bdg-corporate-architect", title: "Corporate Architect", criteria: "Recommend and justify the optimal ownership structure in the business scenario challenge.", linkedObjectiveIds: ["lo-4.1.1", "lo-4.1.2"], xpReward: 200 },
];

export const consistencyBadges = [
  { badgeId: "bdg-streak-3", title: "3-Day Splash", criteria: "Study 3 days in a row.", xpReward: 50 },
  { badgeId: "bdg-streak-7", title: "7-Day Wave", criteria: "Study 7 days in a row.", xpReward: 120 },
  { badgeId: "bdg-comeback", title: "Comeback Pebble", criteria: "Score 20%+ higher on a retry than your first attempt.", xpReward: 80 },
  { badgeId: "bdg-reviser", title: "Revision Ranger", criteria: "Complete the weekly revision challenge.", xpReward: 100 },
];

export function lessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.lessonId === id);
}
export function topicById(id: string): Topic | undefined {
  for (const c of chapters) for (const t of c.topics) if (t.topicId === id) return t;
  return undefined;
}
export function chapterById(id: string): Chapter | undefined {
  return chapters.find((c) => c.chapterId === id);
}
export function autoMarkableCount(lesson: Lesson): number {
  return lesson.mcqs.length + lesson.trueFalse.length;
}
