// StudyBuddy topic catalog: lessons + quiz banks (pure data, no DOM).
// Shared by the page script and the action bridge.

export const TOPICS = [
  {
    id: "binary", title: "Binary Numbers", subject: "Informatics",
    blurb: "How computers count with just 0 and 1.",
    lesson: [
      "Binary is base-2: it uses only the digits 0 and 1.",
      "Each position is a power of 2, from the right: 1, 2, 4, 8, 16, and so on.",
      "To convert binary to decimal, add the place values where the digit is 1.",
      "To convert decimal to binary, repeatedly divide by 2 and read the remainders from bottom to top.",
      "One binary digit is called a bit. Eight bits make one byte."
    ],
    quiz: [
      { q: "What is binary 101 in decimal?", options: ["3", "5", "6", "9"], answer: 1, explain: "101 = 4 + 0 + 1 = 5." },
      { q: "How many different values can 3 bits represent?", options: ["3", "6", "8", "9"], answer: 2, explain: "2^3 = 8 different values (000 to 111)." },
      { q: "What is decimal 13 in binary?", options: ["1011", "1101", "1100", "1010"], answer: 1, explain: "13 = 8 + 4 + 0 + 1 = 1101." },
      { q: "How many bits are in one byte?", options: ["2", "4", "8", "16"], answer: 2, explain: "One byte is 8 bits." },
      { q: "What is the place value of the leftmost digit in binary 1000?", options: ["4", "8", "16", "2"], answer: 1, explain: "From the right the places are 1, 2, 4, 8 — so the leftmost digit is worth 8." }
    ]
  },
  {
    id: "algorithms", title: "Algorithms & Flowcharts", subject: "Informatics",
    blurb: "Clear steps to solve a problem, drawn as a chart.",
    lesson: [
      "An algorithm is a finite sequence of clear steps that solves a problem.",
      "A flowchart draws the steps with shapes: oval for start/end, rectangle for a process, diamond for a decision, parallelogram for input/output.",
      "Pseudocode describes the steps in plain structured language — close to code, but not a real programming language.",
      "A good algorithm is correct, finite, unambiguous, and efficient.",
      "Common patterns are sequence (do this, then that), selection (if/else) and iteration (loops)."
    ],
    quiz: [
      { q: "What is an algorithm?", options: ["A programming language", "A finite sequence of clear steps to solve a problem", "A type of computer", "A flowchart symbol"], answer: 1, explain: "An algorithm is a finite, ordered set of clear steps that solves a problem." },
      { q: "Which flowchart shape represents a decision?", options: ["Oval", "Rectangle", "Diamond", "Parallelogram"], answer: 2, explain: "The diamond is the decision shape (yes/no branches)." },
      { q: "Which shape is used for start and end in a flowchart?", options: ["Diamond", "Rectangle", "Oval", "Parallelogram"], answer: 2, explain: "The oval (terminator) marks start and end." },
      { q: "What does a rectangle mean in a flowchart?", options: ["A decision", "Input or output", "A process or action", "The start"], answer: 2, explain: "A rectangle is a process or action step." },
      { q: "Which is a characteristic of a good algorithm?", options: ["It never ends", "It is ambiguous", "It is finite and unambiguous", "It uses only one step"], answer: 2, explain: "A good algorithm must finish (finite) and mean exactly one thing (unambiguous)." }
    ]
  },
  {
    id: "algebra", title: "Algebra Basics", subject: "Math",
    blurb: "Letters stand for numbers — solve for x.",
    lesson: [
      "A variable is a symbol, usually a letter, that stands for an unknown number.",
      "An expression combines numbers, variables and operations (for example 3x + 2). An equation states two expressions are equal (for example 3x + 2 = 11).",
      "To solve an equation, do the same operation to both sides until the variable is alone.",
      "Like terms have the same variable part: 3x and 5x are like terms, but 3x and 3y are not.",
      "The distributive law: a(b + c) = ab + ac."
    ],
    quiz: [
      { q: "Solve: x + 7 = 15.", options: ["6", "7", "8", "22"], answer: 2, explain: "x = 15 - 7 = 8." },
      { q: "Solve: 3x = 21.", options: ["6", "7", "9", "63"], answer: 1, explain: "x = 21 / 3 = 7." },
      { q: "Which pair are like terms?", options: ["3x and 3y", "4a and 7a", "2x and 2", "5 and 5x"], answer: 1, explain: "Like terms share the same variable part: 4a and 7a." },
      { q: "Expand: 2(x + 5).", options: ["2x + 5", "2x + 10", "x + 10", "2x + 7"], answer: 1, explain: "2(x + 5) = 2x + 10 by the distributive law." },
      { q: "Solve: 2x + 3 = 11.", options: ["3", "4", "5", "7"], answer: 1, explain: "2x = 8, so x = 4." }
    ]
  },
  {
    id: "percentages", title: "Percentages", subject: "Math",
    blurb: "Per hundred — discounts, increases, and shares.",
    lesson: [
      "Percent means per hundred: 1% = 1/100.",
      "To find a percentage of a number, multiply the number by the percentage and divide by 100.",
      "To turn a fraction into a percent, multiply it by 100.",
      "A discount reduces the price: sale price = original price minus the discount.",
      "Percentage increase = (increase / original price) x 100%."
    ],
    quiz: [
      { q: "What is 25% of 200?", options: ["25", "40", "50", "75"], answer: 2, explain: "25% of 200 = 200 x 25 / 100 = 50." },
      { q: "A shirt costs Rp80,000 with a 10% discount. What is the sale price?", options: ["Rp70,000", "Rp72,000", "Rp8,000", "Rp78,000"], answer: 1, explain: "Discount = 10% of 80,000 = 8,000. Sale price = 80,000 - 8,000 = 72,000." },
      { q: "What is 3/4 as a percentage?", options: ["34%", "43%", "75%", "70%"], answer: 2, explain: "3/4 = 0.75 = 75%." },
      { q: "A price rises from Rp50,000 to Rp60,000. What is the percentage increase?", options: ["10%", "20%", "12%", "60%"], answer: 1, explain: "Increase = 10,000. 10,000 / 50,000 x 100% = 20%." },
      { q: "What is 150% of 60?", options: ["75", "90", "60", "150"], answer: 1, explain: "150% of 60 = 60 x 150 / 100 = 90." }
    ]
  },
  {
    id: "photosynthesis", title: "Photosynthesis", subject: "Science",
    blurb: "How green plants make their own food.",
    lesson: [
      "Photosynthesis is how green plants make food using sunlight, water and carbon dioxide.",
      "The word equation is: carbon dioxide + water -> glucose + oxygen (using light energy and chlorophyll).",
      "It happens mainly in the leaves, inside chloroplasts, which contain chlorophyll.",
      "Chlorophyll is the green pigment that absorbs light, mostly red and blue light.",
      "Oxygen is released as a by-product. Glucose is used for energy and growth, or stored as starch."
    ],
    quiz: [
      { q: "What gas do plants take in for photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: 2, explain: "Plants take in carbon dioxide from the air." },
      { q: "Where does photosynthesis mainly happen?", options: ["Roots", "Stem", "Leaves", "Flowers"], answer: 2, explain: "Mostly in the leaves, inside chloroplasts." },
      { q: "What pigment absorbs light in photosynthesis?", options: ["Melanin", "Chlorophyll", "Carotene", "Hemoglobin"], answer: 1, explain: "Chlorophyll, the green pigment, absorbs light." },
      { q: "What is released as a by-product of photosynthesis?", options: ["Carbon dioxide", "Glucose", "Oxygen", "Water"], answer: 2, explain: "Oxygen is released as a by-product." },
      { q: "What is the main food product plants make?", options: ["Oxygen", "Glucose", "Starch only", "Protein"], answer: 1, explain: "The direct product is glucose; some is later stored as starch." }
    ]
  },
  {
    id: "tenses", title: "English Tenses", subject: "English",
    blurb: "When did it happen? Present, past, and future.",
    lesson: [
      "Present simple describes habits and facts: 'She studies every day.'",
      "Present continuous describes an action happening now: 'She is studying now.'",
      "Past simple describes a finished action: 'She studied yesterday.'",
      "Present perfect connects past and present: 'She has studied for two hours.' (have/has + past participle)",
      "Future simple uses 'will': 'She will study tomorrow.'"
    ],
    quiz: [
      { q: "Which sentence is present simple?", options: ["She is studying now.", "She studies every day.", "She studied yesterday.", "She will study tomorrow."], answer: 1, explain: "'She studies every day' is a habit — present simple." },
      { q: "Which sentence is present continuous?", options: ["She studies every day.", "She is studying now.", "She has studied.", "She studied."], answer: 1, explain: "'She is studying now' is happening right now — present continuous." },
      { q: "Choose the correct past simple: 'Yesterday, she ___ to school.'", options: ["goes", "go", "went", "going"], answer: 2, explain: "Past simple of 'go' is 'went'." },
      { q: "Which sentence uses present perfect?", options: ["She studies.", "She is studying.", "She has studied for two hours.", "She will study."], answer: 2, explain: "'Has studied' (have/has + past participle) is present perfect." },
      { q: "Choose the correct future: 'Tomorrow, I ___ visit the library.'", options: ["will", "am", "was", "have"], answer: 0, explain: "Future simple uses 'will': 'I will visit'." }
    ]
  }
];
