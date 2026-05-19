export interface PolicyQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const POLICY_QUESTIONS: PolicyQuestion[] = [
  {
    id: 1,
    question: "What happens if a dealer fails to deliver a product within the agreed timeframe?",
    options: [
      "Nothing, dealers are autonomous",
      "The buyer can report the Dealer ID for blocking and investigation",
      "Supreme automatically refunds 50%",
      "The product is automatically listed as free"
    ],
    correctAnswer: 1,
    explanation: "Buyers can report Dealer IDs if delivery fails within 7/14 days to 1 month."
  },
  {
    id: 2,
    question: "Which of the following constitutes a policy violation for feature locking?",
    options: [
      "Engaging in respectful debate",
      "Spamming, harassment, or fraudulent activities",
      "Changing your profile avatar frequently",
      "Using the search bar hide button"
    ],
    correctAnswer: 1,
    explanation: "Policy violations include spam, harassment, and fraud."
  },
  {
    id: 3,
    question: "How long does a Supreme Appeal process typically take?",
    options: [
      "24 hours",
      "One full week (7 days) of daily participation",
      "One month",
      "It is instant after paying a fee"
    ],
    correctAnswer: 1,
    explanation: "The appeal requires 7 consecutive days of correct policy guideline answers."
  },
  {
    id: 4,
    question: "What is the primary role of the Dealer ID in the Supreme Market?",
    options: [
      "For aesthetic purposes",
      "To track user engagement across all features",
      "To track and report dealers who fail to deliver services/products",
      "To unlock premium chat features"
    ],
    correctAnswer: 2,
    explanation: "Dealer IDs are used to track market performance and handle reports."
  },
  {
    id: 5,
    question: "Can a user set their own discount prices in the Market?",
    options: [
      "No, only Supreme sets prices",
      "Yes, dealers have control over their own discount pricing",
      "Only if they have a 'Crown' rank",
      "Only on the Spin Wheel"
    ],
    correctAnswer: 1,
    explanation: "Dealers can now set their own discount prices for their products."
  },
  {
    id: 6,
    question: "What is the consequence of answering a daily appeal question incorrectly?",
    options: [
      "The 7-day progress continues anyway",
      "The 7-day counter resets to day one",
      "Your balance is deducted by $10",
      "You are permanently banned"
    ],
    correctAnswer: 1,
    explanation: "If you miss a day or answer incorrectly, you must start the 7-day process over."
  },
  {
    id: 7,
    question: "Where can you find the Supreme Feature IDs?",
    options: [
      "Only in the Admin Dashboard",
      "Within the Wallet area and feature details",
      "They are hidden for security reasons",
      "In the Chat history"
    ],
    correctAnswer: 1,
    explanation: "Feature IDs are listed in the Wallet and used for engagement control."
  },
  // Add more as needed...
  {
    id: 8,
    question: "Which feature allows users to request the unlocking of a restricted feature?",
    options: [
      "Supreme Chat",
      "Supreme Appeal",
      "Supreme Support",
      "Supreme Network"
    ],
    correctAnswer: 1,
    explanation: "Supreme Appeal is the dedicated area for soliciting feature unlocking."
  },
  {
    id: 9,
    question: "What information is NOT required on a Market printout?",
    options: [
      "Dealer's Full Name",
      "Dealer's Location",
      "User's private bank account number",
      "Delivery period"
    ],
    correctAnswer: 2,
    explanation: "Market printouts include Dealer info but never sensitive user financial details."
  },
  {
    id: 10,
    question: "What is the maximum agreed delivery period for Supreme products?",
    options: [
      "24 hours",
      "3 days",
      "1 month",
      "1 year"
    ],
    correctAnswer: 2,
    explanation: "The agreed delivery periods are 7/14 days up to 1 month."
  },
  {
    id: 11,
    question: "How can a user hide the Supreme Central Search Bar?",
    options: [
      "By deleting the application",
      "Using the hide button to slide it up/down",
      "It cannot be hidden",
      "By logging out"
    ],
    correctAnswer: 1,
    explanation: "The central search bar has a slide hide button for better screen views."
  },
  {
    id: 12,
    question: "What does GMT Forex trading profit help boost?",
    options: [
      "The Central Wallet balance",
      "Your game health",
      "The global chat ranking",
      "The platform color scheme"
    ],
    correctAnswer: 0,
    explanation: "Traded live profit from GMT Forex can be effectively transferred to Central Wallet."
  },
  {
    id: 13,
    question: "What is the primary currency for Market purchases in the chart window?",
    options: [
      "Bitcoin only",
      "Central Wallet (Supreme Coin)",
      "Cash on Delivery",
      "Gift cards"
    ],
    correctAnswer: 1,
    explanation: "Pay from central wallet is integrated into the chart window area."
  },
  {
    id: 14,
    question: "Who sets the trading difficulty on GMT Forex live trading?",
    options: [
      "The users manually",
      "Automation up to 5%, very easy",
      "Supreme enhancement up to 55%",
      "It is always 0%"
    ],
    correctAnswer: 2,
    explanation: "Supreme forex live trading difficulty is enhanced up to 55%."
  },
  {
    id: 15,
    question: "What must a user do to win a Supreme Appeal?",
    options: [
      "Pay a large fine",
      "Answer 7 questions correctly each day for 7 days",
      "Wait 24 hours in silence",
      "Report 10 other users"
    ],
    correctAnswer: 1,
    explanation: "Users must demonstrate policy mastery by answering questions correctly daily for a week."
  },
  {
    id: 16,
    question: "What happens if a user misses one day of the Appeal process?",
    options: [
      "They skip that day",
      "They must start over from Day 1",
      "The feature is permanently locked",
      "Admin unlocks it manually"
    ],
    correctAnswer: 1,
    explanation: "Consistency is key; missing a day or failing resets the 7-day countdown."
  },
  {
    id: 17,
    question: "Why should a buyer keep the Dealer's ID from their printout?",
    options: [
      "To use it as a discount code",
      "To track and report the dealer for non-delivery",
      "To share it on social media",
      "To unlock hidden game levels"
    ],
    correctAnswer: 1,
    explanation: "Dealer IDs are for tracking and reporting failed products or services."
  },
  {
    id: 18,
    question: "Which of these is a valid delivery period option?",
    options: [
      "90 days only",
      "7/14 days - 1 month",
      "Indefinite",
      "Before tomorrow morning"
    ],
    correctAnswer: 1,
    explanation: "Agreed delivery periods range from one to two weeks up to a full month."
  },
  {
    id: 19,
    question: "Is automation allowed to set Dealer discounts?",
    options: [
      "Yes, always",
      "No, dealers set their own prices manually",
      "Only on weekends",
      "If the server is busy"
    ],
    correctAnswer: 1,
    explanation: "Dealers now have full control over their discount pricing manually."
  },
  {
    id: 20,
    question: "What is recorded under 'User Analytics' in Admin?",
    options: [
      "Engagement activities and policy violations",
      "User's favorite food",
      "Private text messages",
      "External bank passwords"
    ],
    correctAnswer: 0,
    explanation: "Analytics track engagement and compliance with platform guidelines."
  },
  {
    id: 21,
    question: "What type of identification is given to EVERY Supreme feature?",
    options: [
      "A random color",
      "A Supreme Feature ID",
      "A barcode",
      "A nickname"
    ],
    correctAnswer: 1,
    explanation: "All platform features have unique IDs for engagement control and policy enforcement."
  },
  {
    id: 22,
    question: "How can a blocked feature be Solomon-unlocked?",
    options: [
      "By contacting tech support only",
      "Through the Supreme Appeal mastery protocol",
      "By creating a new account",
      "By wait-time only"
    ],
    correctAnswer: 1,
    explanation: "Feature unlocking requires completing the Supreme Appeal 7-day protocol."
  },
  {
    id: 23,
    question: "What should be within the Market Area on the chart window?",
    options: [
      "A 'Pay from Central Wallet' option",
      "A live video stream",
      "A random number generator",
      "An advertisement for other apps"
    ],
    correctAnswer: 0,
    explanation: "Central Wallet payment is integrated directly into the market checkout flow."
  },
  {
    id: 24,
    question: "What was removed from the right-end area of the market to prevent confusion?",
    options: [
      "The logo",
      "The secondary 'Add Product' button without policy",
      "The exit button",
      "The search bar"
    ],
    correctAnswer: 1,
    explanation: "Duplicate UI elements without policy integration were removed for clarity."
  },
  {
    id: 25,
    question: "What is mandated for dealers regarding full disclosure on printouts?",
    options: [
      "None, privacy is total",
      "Partial disclosure of email only",
      "Full disclosure of Name, Location, and Phone",
      "Only the Dealer ID is needed"
    ],
    correctAnswer: 2,
    explanation: "Dealer's full name, location, and phone number are required for transparency."
  },
  {
    id: 26,
    question: "What indicates a user has mastered Supreme Policy during an Appeal?",
    options: [
      "7 correct answers daily for 7 consecutive days",
      "1 correct answer total",
      "Paying for a VIP mastery badge",
      "Reporting 3 violations"
    ],
    correctAnswer: 0,
    explanation: "The appeal tests consecutive daily policy knowledge to ensure future compliance."
  },
  {
    id: 27,
    question: "Where are new IDs added to besides the Wallet area?",
    options: [
      "Only the login screen",
      "Nowhere else",
      "The Supreme Feature Control registry",
      "The global chat window"
    ],
    correctAnswer: 2,
    explanation: "IDs are registered across features to control specific user activities."
  },
  {
    id: 28,
    question: "What happens if a user is reported by multiple other users?",
    options: [
      "They get a reward",
      "The relevant feature can be locked against them",
      "Their screen turns red",
      "Nothing happens"
    ],
    correctAnswer: 1,
    explanation: "Community reports can lead to administrative feature locking/blocking."
  },
  {
    id: 29,
    question: "Who is responsible for setting the discount prices of products in the Supreme Market?",
    options: [
      "Supreme Admin automatically",
      "The spin wheel determines all discounts",
      "Individual dealers have full control over their own discount pricing",
      "Discounts are fixed at 10% for all users"
    ],
    correctAnswer: 2,
    explanation: "Supreme policy empowers dealers to manage their own pricing strategies and discounts."
  },
  {
    id: 30,
    question: "What must a dealer do before they can add their first product to the Supreme Market?",
    options: [
      "Nothing, they can list immediately",
      "Accept the Supreme Market Policy and Guidelines explicitly",
      "Pay a one-time listing fee of $500",
      "Wait for 30 days after account creation"
    ],
    correctAnswer: 1,
    explanation: "Agreement to policy terms is mandatory for all marketplace participants to ensure safety and quality."
  },
  {
    id: 31,
    question: "How long is the typical delivery period agreed upon in the Supreme Market?",
    options: [
      "Indefinite",
      "Maximum of 24 hours",
      "Between 7/14 days and 1 month",
      "Usually 3-6 months"
    ],
    correctAnswer: 2,
    explanation: "Standard delivery windows are set between 7-14 days and up to 1 month for accountability."
  },
  {
    id: 19,
    question: "Is harassment or spamming of other users permitted within the Supreme Chat area?",
    options: [
      "Yes, for promotional purposes",
      "No, it is a violation of Supreme policy and can lead to feature locking",
      "Only if you have a premium subscription",
      "Only on weekends"
    ],
    correctAnswer: 1,
    explanation: "Respectful communication is mandatory. Harassment is a lockable offense."
  },
  {
    id: 20,
    question: "What is the policy regarding the sharing of surveillance data obtained from Supreme GMT?",
    options: [
      "It is encouraged to share on social media",
      "Sharing with unauthorized parties is strictly prohibited for security reasons",
      "You can sell the data in the Supreme Market",
      "It is only allowed if you use the hide button"
    ],
    correctAnswer: 1,
    explanation: "GMT data is sensitive and encrypted; unauthorized distribution is a security risk."
  },
  {
    id: 21,
    question: "If a feature is locked against you, who should you contact for immediate unlocking?",
    options: [
      "No one can unlock it immediately; you must go through the Supreme Appeal process",
      "Direct bank transfer to Admin for instant bypass",
      "Send a message to common users for a vote",
      "Email regional Supreme representatives"
    ],
    correctAnswer: 0,
    explanation: "Supreme policy requires a week-long demonstration of mastery via the Appeal Center."
  }
];
