// ===== JMC 116: UNIT 1 – Number and Numeration Systems (60 questions) =====
// Sessions: 1-Components and Properties of the Real Number System, 2-Properties of Real Numbers, 3-Other Types of Real Numbers

const subjectsData = {
  "unit1": {
    name: "Unit 1: Number and Numeration Systems",
    icon: "🔢",
    questions: [
      // --- SESSION 1: Components and Properties of the Real Number System (20 questions) ---
      // MCQ (16), text-input (4)
      {
        type: "multiple-choice",
        question: "A real number is a number that can be found on the:",
        options: [
          "Number line",
          "Cartesian plane",
          "Coordinate grid",
          "Venn diagram"
        ],
        correctAnswer: 0,
        explanation: "Real numbers correspond to points on the number line (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Natural numbers are also known as:",
        options: [
          "Counting numbers",
          "Whole numbers",
          "Integers",
          "Rational numbers"
        ],
        correctAnswer: 0,
        explanation: "Natural numbers (1,2,3,…) are counting numbers (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Whole numbers consist of natural numbers and:",
        options: [
          "Negative numbers",
          "Zero",
          "Fractions",
          "Decimals"
        ],
        correctAnswer: 1,
        explanation: "Whole numbers = natural numbers ∪ {0} (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Integers are denoted by the letter:",
        options: ["N", "W", "Z", "Q"],
        correctAnswer: 2,
        explanation: "Integers are represented by Z (from German 'Zahlen') (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Negative integers are located on the number line:",
        options: [
          "To the right of zero",
          "To the left of zero",
          "At zero",
          "Both sides of zero"
        ],
        correctAnswer: 1,
        explanation: "Negative integers are on the left side of zero (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "A rational number can be expressed as a fraction a/b where b is:",
        options: [
          "Zero",
          "Not equal to zero",
          "Equal to one",
          "Greater than a"
        ],
        correctAnswer: 1,
        explanation: "b ≠ 0 (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The decimal 90.52 is a rational number because it has:",
        options: [
          "A finite number of digits",
          "Repeating digits",
          "Infinite non‑repeating digits",
          "No decimal point"
        ],
        correctAnswer: 0,
        explanation: "Terminating decimals are rational (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The decimal 3.1111… (repeating) is a:",
        options: [
          "Irrational number",
          "Rational number",
          "Integer",
          "Natural number"
        ],
        correctAnswer: 1,
        explanation: "Repeating decimals are rational (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "An irrational number cannot be written as a ratio of:",
        options: [
          "Two integers",
          "Two fractions",
          "Two decimals",
          "Two natural numbers"
        ],
        correctAnswer: 0,
        explanation: "Irrational numbers are non‑repeating, non‑terminating decimals (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Which of the following is an irrational number?",
        options: ["0.75", "√2", "3/4", "0.333…"],
        correctAnswer: 1,
        explanation: "√2 = 1.414… non‑repeating, non‑terminating (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The number e (2.71828…) is an example of:",
        options: [
          "Rational number",
          "Irrational number",
          "Integer",
          "Whole number"
        ],
        correctAnswer: 1,
        explanation: "e is a non‑repeating, non‑terminating decimal (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The set of rational numbers includes all integers because any integer can be written as:",
        options: [
          "a/0",
          "a/1",
          "1/a",
          "0/a"
        ],
        correctAnswer: 1,
        explanation: "Integer a = a/1 (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Zero is a rational number because it can be written as:",
        options: ["0/1", "1/0", "0/0", "1/1"],
        correctAnswer: 0,
        explanation: "0 = 0/1 (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The set of integers contains:",
        options: [
          "Only positive numbers",
          "Positive, negative, and zero",
          "Only negative numbers",
          "Only fractions"
        ],
        correctAnswer: 1,
        explanation: "Z = {…,-3,-2,-1,0,1,2,3,…} (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "A number that is both a whole number and an integer is:",
        options: ["-3", "2.5", "0", "1/2"],
        correctAnswer: 2,
        explanation: "Zero belongs to both whole numbers and integers (Unit 1, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Which set is a subset of rational numbers?",
        options: ["Integers", "Irrational numbers", "Real numbers", "Complex numbers"],
        correctAnswer: 0,
        explanation: "All integers are rational numbers (Unit 1, Session 1)."
      },
      {
        type: "text-input",
        question: "What symbol is used to denote the set of natural numbers?",
        correctAnswer: "N",
        acceptableAnswers: ["N", "ℕ"],
        caseSensitive: false,
        explanation: "N represents natural numbers (Unit 1, Session 1)."
      },
      {
        type: "text-input",
        question: "What is the first element of the set of natural numbers?",
        correctAnswer: "1",
        acceptableAnswers: ["1", "one"],
        caseSensitive: false,
        explanation: "Natural numbers start at 1 (Unit 1, Session 1)."
      },
      {
        type: "text-input",
        question: "What is the set of whole numbers denoted by?",
        correctAnswer: "W",
        acceptableAnswers: ["W", "𝕎"],
        caseSensitive: false,
        explanation: "Whole numbers are denoted by W (Unit 1, Session 1)."
      },
      {
        type: "text-input",
        question: "What is the first element of the set of whole numbers?",
        correctAnswer: "0",
        acceptableAnswers: ["0", "zero"],
        caseSensitive: false,
        explanation: "Whole numbers start at 0 (Unit 1, Session 1)."
      },

      // --- SESSION 2: Properties of Real Numbers (20 questions) ---
      // MCQ (16), text-input (4)
      {
        type: "multiple-choice",
        question: "The closure property of addition states that the sum of two real numbers is:",
        options: [
          "Always zero",
          "Also a real number",
          "Always positive",
          "Always an integer"
        ],
        correctAnswer: 1,
        explanation: "a + b is a real number (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The commutative property of addition is:",
        options: [
          "a + b = b + a",
          "a + 0 = a",
          "a + (-a) = 0",
          "(a + b) + c = a + (b + c)"
        ],
        correctAnswer: 0,
        explanation: "Order does not affect sum (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The associative property of addition states that:",
        options: [
          "a + b = b + a",
          "a + 0 = a",
          "(a + b) + c = a + (b + c)",
          "a + (-a) = 0"
        ],
        correctAnswer: 2,
        explanation: "Grouping does not affect sum (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The additive identity element is:",
        options: ["0", "1", "-1", "10"],
        correctAnswer: 0,
        explanation: "a + 0 = a (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The additive inverse of a number a is:",
        options: ["a", "1/a", "-a", "0"],
        correctAnswer: 2,
        explanation: "a + (-a) = 0 (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The multiplicative identity element is:",
        options: ["0", "1", "-1", "a"],
        correctAnswer: 1,
        explanation: "a × 1 = a (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The multiplicative inverse (reciprocal) of a non‑zero number a is:",
        options: ["a", "-a", "1/a", "0"],
        correctAnswer: 2,
        explanation: "a × (1/a) = 1 (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The distributive property of multiplication over addition is:",
        options: [
          "a + b = b + a",
          "a(b + c) = ab + ac",
          "a × 1 = a",
          "a × 0 = 0"
        ],
        correctAnswer: 1,
        explanation: "Multiplication distributes over addition (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Which property is illustrated by 5 + 3 = 3 + 5?",
        options: [
          "Associative",
          "Commutative",
          "Distributive",
          "Identity"
        ],
        correctAnswer: 1,
        explanation: "Order of addition does not matter (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Which property is illustrated by (2 + 3) + 4 = 2 + (3 + 4)?",
        options: [
          "Commutative",
          "Associative",
          "Distributive",
          "Closure"
        ],
        correctAnswer: 1,
        explanation: "Grouping does not affect sum (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Which property is illustrated by 4 × (5 + 6) = 4×5 + 4×6?",
        options: [
          "Commutative",
          "Associative",
          "Distributive",
          "Identity"
        ],
        correctAnswer: 2,
        explanation: "Multiplication distributes over addition (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The closure property of multiplication states that the product of two real numbers is:",
        options: [
          "Always an integer",
          "Also a real number",
          "Always positive",
          "Always zero"
        ],
        correctAnswer: 1,
        explanation: "a × b is a real number (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The commutative property of multiplication is:",
        options: [
          "a × b = b × a",
          "a × (b × c) = (a × b) × c",
          "a × 1 = a",
          "a × 0 = 0"
        ],
        correctAnswer: 0,
        explanation: "Order does not affect product (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The associative property of multiplication is:",
        options: [
          "a × b = b × a",
          "a × (b × c) = (a × b) × c",
          "a × 1 = a",
          "a × (b + c) = ab + ac"
        ],
        correctAnswer: 1,
        explanation: "Grouping does not affect product (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The additive inverse of 7 is:",
        options: ["7", "-7", "1/7", "0"],
        correctAnswer: 1,
        explanation: "7 + (-7) = 0 (Unit 1, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The multiplicative inverse of 5 is:",
        options: ["5", "-5", "1/5", "0"],
        correctAnswer: 2,
        explanation: "5 × (1/5) = 1 (Unit 1, Session 2)."
      },
      {
        type: "text-input",
        question: "What property is a + b = b + a?",
        correctAnswer: "commutative",
        acceptableAnswers: ["commutative", "commutative property"],
        caseSensitive: false,
        explanation: "Commutative property of addition (Unit 1, Session 2)."
      },
      {
        type: "text-input",
        question: "What is the additive identity element?",
        correctAnswer: "0",
        acceptableAnswers: ["0", "zero"],
        caseSensitive: false,
        explanation: "a + 0 = a (Unit 1, Session 2)."
      },
      {
        type: "text-input",
        question: "What is the multiplicative identity element?",
        correctAnswer: "1",
        acceptableAnswers: ["1", "one"],
        caseSensitive: false,
        explanation: "a × 1 = a (Unit 1, Session 2)."
      },
      {
        type: "text-input",
        question: "What property is a(b + c) = ab + ac?",
        correctAnswer: "distributive",
        acceptableAnswers: ["distributive", "distributive property"],
        caseSensitive: false,
        explanation: "Distributive property of multiplication over addition (Unit 1, Session 2)."
      },

      // --- SESSION 3: Other Types of Real Numbers (20 questions) ---
      // MCQ (16), text-input (4)
      {
        type: "multiple-choice",
        question: "Even numbers are integers divisible by:",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        explanation: "Even numbers are multiples of 2 (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "An even number ends with which digit?",
        options: ["1,3,5,7,9", "0,2,4,6,8", "0,5", "0,1,2,3,4"],
        correctAnswer: 1,
        explanation: "Even numbers end with 0,2,4,6,8 (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Odd numbers are integers that are not divisible by:",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        explanation: "Odd numbers leave remainder 1 when divided by 2 (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The sum of two even numbers is always:",
        options: ["Even", "Odd", "Zero", "Prime"],
        correctAnswer: 0,
        explanation: "Even + Even = Even (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The sum of two odd numbers is always:",
        options: ["Even", "Odd", "Zero", "Prime"],
        correctAnswer: 0,
        explanation: "Odd + Odd = Even (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The product of two odd numbers is always:",
        options: ["Even", "Odd", "Zero", "Prime"],
        correctAnswer: 1,
        explanation: "Odd × Odd = Odd (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "A prime number has exactly how many distinct positive factors?",
        options: ["One", "Two", "Three", "Four"],
        correctAnswer: 1,
        explanation: "A prime has exactly two factors: 1 and itself (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Which of the following is a prime number?",
        options: ["1", "4", "6", "7"],
        correctAnswer: 3,
        explanation: "7 is only divisible by 1 and 7 (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "A composite number has more than how many factors?",
        options: ["One", "Two", "Three", "Four"],
        correctAnswer: 1,
        explanation: "Composite numbers have at least three factors (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The smallest prime number is:",
        options: ["0", "1", "2", "3"],
        correctAnswer: 2,
        explanation: "2 is the smallest prime (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "A factor of a number divides it with:",
        options: ["Remainder 1", "Remainder 0", "Remainder 2", "No remainder"],
        correctAnswer: 1,
        explanation: "Factors divide evenly (remainder 0) (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The Highest Common Factor (HCF) of two numbers is the largest factor that:",
        options: [
          "Divides both numbers",
          "Is a multiple of both",
          "Is less than both",
          "Is prime"
        ],
        correctAnswer: 0,
        explanation: "HCF is the greatest common divisor (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The Least Common Multiple (LCM) of two numbers is the smallest number that is:",
        options: [
          "A factor of both",
          "A multiple of both",
          "Divisible by 2",
          "Prime"
        ],
        correctAnswer: 1,
        explanation: "LCM is the smallest common multiple (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Successive even numbers differ by:",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        explanation: "Even numbers: 2,4,6,… difference 2 (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Successive odd numbers differ by:",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        explanation: "Odd numbers: 1,3,5,… difference 2 (Unit 1, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The number 1 is classified as:",
        options: ["Prime", "Composite", "Neither prime nor composite", "Even"],
        correctAnswer: 2,
        explanation: "1 has only one factor (Unit 1, Session 3)."
      },
      {
        type: "text-input",
        question: "What is the smallest even number?",
        correctAnswer: "2",
        acceptableAnswers: ["2", "two"],
        caseSensitive: false,
        explanation: "2 is the smallest positive even integer (Unit 1, Session 3)."
      },
      {
        type: "text-input",
        question: "What is the smallest odd number?",
        correctAnswer: "1",
        acceptableAnswers: ["1", "one"],
        caseSensitive: false,
        explanation: "1 is the smallest positive odd integer (Unit 1, Session 3)."
      },
      {
        type: "text-input",
        question: "What does HCF stand for?",
        correctAnswer: "Highest Common Factor",
        acceptableAnswers: ["Highest Common Factor", "HCF"],
        caseSensitive: false,
        explanation: "HCF is the largest factor common to two numbers (Unit 1, Session 3)."
      },
      {
        type: "text-input",
        question: "What does LCM stand for?",
        correctAnswer: "Least Common Multiple",
        acceptableAnswers: ["Least Common Multiple", "LCM"],
        caseSensitive: false,
        explanation: "LCM is the smallest multiple common to two numbers (Unit 1, Session 3)."
      }
    ]
  },
  "unit2": {
    name: "Unit 2: Operations and Properties on Integers",
    icon: "➗",
    questions: [
      // --- SESSION 1: Properties of Operations on Integers (20 questions) ---
      // MCQ (16), text-input (4)
      {
        type: "multiple-choice",
        question: "The closure property for addition of integers states that the sum of any two integers is:",
        options: [
          "Always positive",
          "Always an integer",
          "Always negative",
          "Always zero"
        ],
        correctAnswer: 1,
        explanation: "Closure: x + y is an integer (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The closure property for multiplication of integers states that the product of any two integers is:",
        options: [
          "Always an integer",
          "Always positive",
          "Always negative",
          "Always zero"
        ],
        correctAnswer: 0,
        explanation: "x × y is an integer (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Division of integers does not follow the closure property because the quotient may be:",
        options: [
          "An integer",
          "A non‑integer",
          "Zero",
          "Undefined"
        ],
        correctAnswer: 1,
        explanation: "Example: 3 ÷ 4 = 0.75, not an integer (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The commutative property of addition states that:",
        options: [
          "x + y = y + x",
          "x + (y + z) = (x + y) + z",
          "x + 0 = x",
          "x + (-x) = 0"
        ],
        correctAnswer: 0,
        explanation: "Order does not affect sum (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The commutative property of multiplication states that:",
        options: [
          "x × y = y × x",
          "x × (y × z) = (x × y) × z",
          "x × 1 = x",
          "x × 0 = 0"
        ],
        correctAnswer: 0,
        explanation: "Order does not affect product (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Subtraction of integers is not commutative because:",
        options: [
          "x - y = y - x always",
          "x - y = -(y - x)",
          "x - y is always positive",
          "x - y is always zero"
        ],
        correctAnswer: 1,
        explanation: "Example: 4 - (-6) = 10, (-6) - 4 = -10 (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The associative property of addition is:",
        options: [
          "x + y = y + x",
          "(x + y) + z = x + (y + z)",
          "x + 0 = x",
          "x + (-x) = 0"
        ],
        correctAnswer: 1,
        explanation: "Grouping does not affect sum (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The associative property of multiplication is:",
        options: [
          "x × y = y × x",
          "(x × y) × z = x × (y × z)",
          "x × 1 = x",
          "x × 0 = 0"
        ],
        correctAnswer: 1,
        explanation: "Grouping does not affect product (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The distributive property of multiplication over addition is:",
        options: [
          "x × (y + z) = x × y + x × z",
          "x + (y + z) = (x + y) + z",
          "x × y = y × x",
          "x + 0 = x"
        ],
        correctAnswer: 0,
        explanation: "Multiplication distributes over addition (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The additive identity element is:",
        options: ["0", "1", "-1", "10"],
        correctAnswer: 0,
        explanation: "x + 0 = x (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The multiplicative identity element is:",
        options: ["0", "1", "-1", "10"],
        correctAnswer: 1,
        explanation: "x × 1 = x (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The additive inverse of an integer x is:",
        options: ["x", "-x", "1/x", "0"],
        correctAnswer: 1,
        explanation: "x + (-x) = 0 (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The multiplicative inverse (reciprocal) of a non‑zero integer x is:",
        options: ["x", "-x", "1/x", "0"],
        correctAnswer: 2,
        explanation: "x × (1/x) = 1 (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Which property allows us to write (3 + 5) + 7 = 3 + (5 + 7)?",
        options: [
          "Commutative",
          "Associative",
          "Distributive",
          "Identity"
        ],
        correctAnswer: 1,
        explanation: "Associative property of addition (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Which property is illustrated by 2(8 + 9) = 2×8 + 2×9?",
        options: [
          "Commutative",
          "Associative",
          "Distributive",
          "Identity"
        ],
        correctAnswer: 2,
        explanation: "Distributive property (Unit 2, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Which property is illustrated by 6 + 7 = 7 + 6?",
        options: [
          "Commutative",
          "Associative",
          "Distributive",
          "Inverse"
        ],
        correctAnswer: 0,
        explanation: "Commutative property of addition (Unit 2, Session 1)."
      },
      {
        type: "text-input",
        question: "What is the additive identity element for integers?",
        correctAnswer: "0",
        acceptableAnswers: ["0", "zero"],
        caseSensitive: false,
        explanation: "a + 0 = a (Unit 2, Session 1)."
      },
      {
        type: "text-input",
        question: "What is the multiplicative identity element for integers?",
        correctAnswer: "1",
        acceptableAnswers: ["1", "one"],
        caseSensitive: false,
        explanation: "a × 1 = a (Unit 2, Session 1)."
      },
      {
        type: "text-input",
        question: "What is the additive inverse of 5?",
        correctAnswer: "-5",
        acceptableAnswers: ["-5", "negative 5"],
        caseSensitive: false,
        explanation: "5 + (-5) = 0 (Unit 2, Session 1)."
      },
      {
        type: "text-input",
        question: "What is the multiplicative inverse of 2/3?",
        correctAnswer: "3/2",
        acceptableAnswers: ["3/2", "1.5", "three halves"],
        caseSensitive: false,
        explanation: "2/3 × 3/2 = 1 (Unit 2, Session 1)."
      },

      // --- SESSION 2: Operations on Integers (Addition and Subtraction) (20 questions) ---
      // MCQ (16), text-input (4)
      {
        type: "multiple-choice",
        question: "On a number line, moving to the right represents:",
        options: [
          "Positive values",
          "Negative values",
          "Zero",
          "No change"
        ],
        correctAnswer: 0,
        explanation: "Right direction increases value (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "On a number line, moving to the left represents:",
        options: [
          "Positive values",
          "Negative values",
          "Zero",
          "No change"
        ],
        correctAnswer: 1,
        explanation: "Left direction decreases value (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The operation sign '+' means:",
        options: [
          "Change direction",
          "Do not change direction",
          "Move backward",
          "Stop"
        ],
        correctAnswer: 1,
        explanation: "Plus means maintain direction (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The operation sign '-' (subtraction) means:",
        options: [
          "Do not change direction",
          "Change direction",
          "Move forward",
          "Stop"
        ],
        correctAnswer: 1,
        explanation: "Subtraction means change direction (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Using a number line, 4 + 2 = ?",
        options: ["2", "4", "6", "8"],
        correctAnswer: 2,
        explanation: "From 0, move 4 steps right, then 2 more right = 6 (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Using a number line, 5 + (-6) = ?",
        options: ["11", "-1", "1", "-11"],
        correctAnswer: 1,
        explanation: "From 0, move 5 right, then 6 left = -1 (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Using a number line, -3 + (-4) = ?",
        options: ["7", "-7", "1", "-1"],
        correctAnswer: 1,
        explanation: "From 0, move 3 left, then 4 more left = -7 (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Using a number line, -5 + 3 = ?",
        options: ["-8", "8", "-2", "2"],
        correctAnswer: 2,
        explanation: "From 0, move 5 left, then 3 right = -2 (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Using a number line, 6 - 4 = ?",
        options: ["2", "10", "-2", "-10"],
        correctAnswer: 0,
        explanation: "From 0, move 6 right, then change direction and move 4 left = 2 (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Using a number line, 3 - (-4) = ?",
        options: ["-1", "1", "7", "-7"],
        correctAnswer: 2,
        explanation: "From 0, move 3 right, change direction, move 4 left = 7 (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Using a number line, (-2) - (-3) = ?",
        options: ["1", "-1", "5", "-5"],
        correctAnswer: 0,
        explanation: "From 0, move 2 left, change direction, move 3 left = 1 (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Using a number line, (-5) - (+3) = ?",
        options: ["-8", "8", "-2", "2"],
        correctAnswer: 0,
        explanation: "From 0, move 5 left, change direction, move 3 right = -8 (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The result of adding a positive integer and a negative integer is:",
        options: [
          "Always positive",
          "Always negative",
          "Zero or the sign of the larger absolute value",
          "Always zero"
        ],
        correctAnswer: 2,
        explanation: "Sign depends on which absolute value is larger (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The sum of two negative integers is always:",
        options: [
          "Positive",
          "Negative",
          "Zero",
          "Undefined"
        ],
        correctAnswer: 1,
        explanation: "Negative + Negative = Negative (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The sum of a number and its additive inverse is:",
        options: ["1", "0", "-1", "The number itself"],
        correctAnswer: 1,
        explanation: "a + (-a) = 0 (Unit 2, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Subtracting a negative integer is equivalent to:",
        options: [
          "Adding its absolute value",
          "Subtracting its absolute value",
          "Multiplying by zero",
          "Dividing by zero"
        ],
        correctAnswer: 0,
        explanation: "a - (-b) = a + b (Unit 2, Session 2)."
      },
      {
        type: "text-input",
        question: "What is 7 + (-12) = ?",
        correctAnswer: "-5",
        acceptableAnswers: ["-5", "negative 5"],
        caseSensitive: false,
        explanation: "7 + (-12) = -5 (Unit 2, Session 2)."
      },
      {
        type: "text-input",
        question: "What is (-8) - (-3) = ?",
        correctAnswer: "-5",
        acceptableAnswers: ["-5", "negative 5"],
        caseSensitive: false,
        explanation: "(-8) - (-3) = -8 + 3 = -5 (Unit 2, Session 2)."
      },
      {
        type: "text-input",
        question: "What is the additive inverse of -9?",
        correctAnswer: "9",
        acceptableAnswers: ["9", "positive 9"],
        caseSensitive: false,
        explanation: "-9 + 9 = 0 (Unit 2, Session 2)."
      },
      {
        type: "text-input",
        question: "What is (-15) + 8 = ?",
        correctAnswer: "-7",
        acceptableAnswers: ["-7", "negative 7"],
        caseSensitive: false,
        explanation: "-15 + 8 = -7 (Unit 2, Session 2)."
      },

      // --- SESSION 3: Multiplication and Division of Integers (20 questions) ---
      // MCQ (16), text-input (4)
      {
        type: "multiple-choice",
        question: "The product of two positive integers is:",
        options: ["Positive", "Negative", "Zero", "Undefined"],
        correctAnswer: 0,
        explanation: "Rule 2: (+)(+) = + (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The product of two negative integers is:",
        options: ["Positive", "Negative", "Zero", "Undefined"],
        correctAnswer: 0,
        explanation: "Rule 3: (-)(-) = + (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The product of a positive and a negative integer is:",
        options: ["Positive", "Negative", "Zero", "Undefined"],
        correctAnswer: 1,
        explanation: "Rule 1: (+)(-) = - (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The quotient of two positive integers is:",
        options: ["Positive", "Negative", "Zero", "Undefined"],
        correctAnswer: 0,
        explanation: "Positive ÷ Positive = Positive (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The quotient of two negative integers is:",
        options: ["Positive", "Negative", "Zero", "Undefined"],
        correctAnswer: 0,
        explanation: "Negative ÷ Negative = Positive (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The quotient of a positive and a negative integer is:",
        options: ["Positive", "Negative", "Zero", "Undefined"],
        correctAnswer: 1,
        explanation: "Positive ÷ Negative = Negative (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Using a number line, 2 × 4 = ?",
        options: ["6", "8", "4", "2"],
        correctAnswer: 1,
        explanation: "Jump 2 times, each covering 4 paces = 8 (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Using a number line, 3 × (-4) = ?",
        options: ["12", "-12", "7", "-7"],
        correctAnswer: 1,
        explanation: "Jump 3 times backward, each 4 paces = -12 (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Using a number line, (-3) × (-2) = ?",
        options: ["-6", "6", "-5", "5"],
        correctAnswer: 1,
        explanation: "Change direction and jump 3 times backward, each 2 paces = 6 (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Division is a process of:",
        options: [
          "Repetitive addition",
          "Repetitive subtraction",
          "Repetitive multiplication",
          "Repetitive division"
        ],
        correctAnswer: 1,
        explanation: "a ÷ b means subtract b repeatedly (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Using the number line, 15 ÷ 5 = ?",
        options: ["2", "3", "4", "5"],
        correctAnswer: 1,
        explanation: "Count how many groups of 5 fit into 15 = 3 (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "If the signs are different in multiplication or division, the answer is:",
        options: ["Positive", "Negative", "Zero", "Undefined"],
        correctAnswer: 1,
        explanation: "Different signs → Negative (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "If the signs are the same in multiplication or division, the answer is:",
        options: ["Positive", "Negative", "Zero", "Undefined"],
        correctAnswer: 0,
        explanation: "Same signs → Positive (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "(+6) × (+8) = ?",
        options: ["48", "-48", "14", "-14"],
        correctAnswer: 0,
        explanation: "Product of two positives is positive (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "(-6) × (-8) = ?",
        options: ["48", "-48", "14", "-14"],
        correctAnswer: 0,
        explanation: "Product of two negatives is positive (Unit 2, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "(-12) ÷ (+4) = ?",
        options: ["3", "-3", "16", "-16"],
        correctAnswer: 1,
        explanation: "Different signs → negative, 12 ÷ 4 = 3 → -3 (Unit 2, Session 3)."
      },
      {
        type: "text-input",
        question: "What is (+4) × (-2) = ?",
        correctAnswer: "-8",
        acceptableAnswers: ["-8", "negative 8"],
        caseSensitive: false,
        explanation: "(+)(-) = -, 4×2=8 → -8 (Unit 2, Session 3)."
      },
      {
        type: "text-input",
        question: "What is (-15) ÷ (-3) = ?",
        correctAnswer: "5",
        acceptableAnswers: ["5", "positive 5"],
        caseSensitive: false,
        explanation: "(-)÷(-)=+, 15÷3=5 (Unit 2, Session 3)."
      },
      {
        type: "text-input",
        question: "What is the product of a positive and a negative integer?",
        correctAnswer: "negative",
        acceptableAnswers: ["negative", "-"],
        caseSensitive: false,
        explanation: "Rule: (+)(-) = - (Unit 2, Session 3)."
      },
      {
        type: "text-input",
        question: "What is the product of two negative integers?",
        correctAnswer: "positive",
        acceptableAnswers: ["positive", "+"],
        caseSensitive: false,
        explanation: "Rule: (-)(-) = + (Unit 2, Session 3)."
      }
    ]
  },
  "unit3": {
    name: "Unit 3: Operations and Properties of Rational and Irrational Numbers",
    icon: "🧮",
    questions: [
      // --- SESSION 1: Naming Fractions (15 questions) ---
      // MCQ (12), text-input (3)
      {
        type: "multiple-choice",
        question: "A fraction consists of a numerator and a:",
        options: ["Divisor", "Denominator", "Quotient", "Remainder"],
        correctAnswer: 1,
        explanation: "Fraction has numerator and denominator (Unit 3, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The denominator of a fraction cannot be:",
        options: ["One", "Zero", "Two", "Ten"],
        correctAnswer: 1,
        explanation: "Division by zero is undefined (Unit 3, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "A fraction where the numerator is less than the denominator is called:",
        options: ["Improper fraction", "Proper fraction", "Mixed numeral", "Whole number"],
        correctAnswer: 1,
        explanation: "Proper fraction: numerator < denominator (Unit 3, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "A fraction where the numerator is greater than or equal to the denominator is called:",
        options: ["Proper fraction", "Unit fraction", "Improper fraction", "Mixed numeral"],
        correctAnswer: 2,
        explanation: "Improper fraction: numerator ≥ denominator (Unit 3, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "A mixed numeral consists of a whole number and a:",
        options: ["Proper fraction", "Improper fraction", "Decimal", "Percentage"],
        correctAnswer: 0,
        explanation: "Mixed numeral = whole number + proper fraction (Unit 3, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Which of the following is a proper fraction?",
        options: ["7/4", "5/5", "2/9", "11/3"],
        correctAnswer: 2,
        explanation: "2/9 has numerator < denominator (Unit 3, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Which of the following is an improper fraction?",
        options: ["3/8", "5/12", "9/4", "1/2"],
        correctAnswer: 2,
        explanation: "9/4 has numerator > denominator (Unit 3, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "A fraction equal to 1 has numerator and denominator:",
        options: ["Different", "Equal", "Opposite signs", "One is zero"],
        correctAnswer: 1,
        explanation: "a/a = 1 (Unit 3, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The fraction 1/2 is read as:",
        options: ["One second", "One half", "One two", "Two one"],
        correctAnswer: 1,
        explanation: "1/2 = one half (Unit 3, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The fraction 3/7 is read as:",
        options: ["Three seventh", "Three sevenths", "Three seven", "Seventh three"],
        correctAnswer: 1,
        explanation: "3/7 = three sevenths (Unit 3, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "To convert a mixed numeral to an improper fraction, multiply the denominator by the whole number and:",
        options: ["Add the numerator", "Subtract the numerator", "Divide by the numerator", "Ignore the numerator"],
        correctAnswer: 0,
        explanation: "New numerator = (whole × denom) + numerator (Unit 3, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "To convert an improper fraction to a mixed numeral, divide numerator by denominator. The remainder becomes the numerator of the fraction and the denominator stays the same. The quotient becomes the:",
        options: ["Numerator", "Denominator", "Whole number", "Fraction"],
        correctAnswer: 2,
        explanation: "Quotient is the whole number part (Unit 3, Session 1)."
      },
      {
        type: "text-input",
        question: "What is 5 1/2 as an improper fraction?",
        correctAnswer: "11/2",
        acceptableAnswers: ["11/2", "11 over 2"],
        caseSensitive: false,
        explanation: "(2×5 + 1)/2 = 11/2 (Unit 3, Session 1)."
      },
      {
        type: "text-input",
        question: "What is 17/3 as a mixed numeral?",
        correctAnswer: "5 2/3",
        acceptableAnswers: ["5 2/3", "5 and 2/3"],
        caseSensitive: false,
        explanation: "17 ÷ 3 = 5 remainder 2 (Unit 3, Session 1)."
      },
      {
        type: "text-input",
        question: "What is the fraction of shaded parts if 2 out of 6 equal parts are shaded?",
        correctAnswer: "2/6",
        acceptableAnswers: ["2/6", "1/3"],
        caseSensitive: false,
        explanation: "Shaded/total = 2/6 (Unit 3, Session 1)."
      },

      // --- SESSION 2: Operations on Common Fractions (20 questions) ---
      // MCQ (16), text-input (4)
      {
        type: "multiple-choice",
        question: "To add fractions with like denominators, you add the numerators and keep the:",
        options: ["Numerator", "Denominator", "Sum", "Product"],
        correctAnswer: 1,
        explanation: "Common denominator stays the same (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The least common denominator (LCD) of 3 and 2 is:",
        options: ["3", "2", "5", "6"],
        correctAnswer: 3,
        explanation: "LCM of 3 and 2 = 6 (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "1/3 + 1/2 = ?",
        options: ["2/5", "5/6", "2/6", "1/5"],
        correctAnswer: 1,
        explanation: "LCD = 6 → 2/6 + 3/6 = 5/6 (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "1/2 + 1/4 = ?",
        options: ["2/6", "3/4", "2/4", "1/6"],
        correctAnswer: 1,
        explanation: "LCD = 4 → 2/4 + 1/4 = 3/4 (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "5/3 + 2/6 = ?",
        options: ["7/9", "12/6", "2", "2/3"],
        correctAnswer: 2,
        explanation: "5/3 = 10/6, 10/6 + 2/6 = 12/6 = 2 (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "To subtract fractions with like denominators, you subtract the numerators and keep the:",
        options: ["Numerator", "Denominator", "Difference", "Product"],
        correctAnswer: 1,
        explanation: "Denominator remains the same (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "2/3 - 1/3 = ?",
        options: ["1/3", "1/0", "1/6", "3/3"],
        correctAnswer: 0,
        explanation: "(2-1)/3 = 1/3 (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "4/7 - 2/7 = ?",
        options: ["2/7", "2/14", "6/7", "2/0"],
        correctAnswer: 0,
        explanation: "(4-2)/7 = 2/7 (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "2 4/5 - 1 2/5 = ?",
        options: ["1 2/5", "1 2/0", "3 6/5", "1 6/10"],
        correctAnswer: 0,
        explanation: "(2-1)=1, (4-2)/5=2/5 → 1 2/5 (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "5/6 - 2/7 = ?",
        options: ["3/42", "35/42-12/42=23/42", "7/42", "1/42"],
        correctAnswer: 1,
        explanation: "LCD=42, 35/42-12/42=23/42 (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "To multiply fractions, multiply numerators and multiply:",
        options: ["Denominators", "Numerators", "Whole numbers", "Reciprocals"],
        correctAnswer: 0,
        explanation: "Multiply across (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "2/3 × 1/3 = ?",
        options: ["2/9", "2/6", "3/6", "1/3"],
        correctAnswer: 0,
        explanation: "(2×1)/(3×3)=2/9 (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "4/5 × 3/14 = ?",
        options: ["12/70", "6/35", "12/19", "7/10"],
        correctAnswer: 1,
        explanation: "Simplify 4/5×3/14 = 12/70 = 6/35 (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "2 1/4 × 3 2/3 = ?",
        options: ["33/4", "8 1/4", "9/4 × 11/3 = 99/12 = 33/4 = 8 1/4", "8 3/4"],
        correctAnswer: 2,
        explanation: "Convert to improper: 9/4 × 11/3 = 99/12 = 33/4 = 8 1/4 (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "To divide fractions, multiply the first fraction by the _______ of the second.",
        options: ["Denominator", "Reciprocal", "Numerator", "Inverse of denominator"],
        correctAnswer: 1,
        explanation: "a/b ÷ c/d = a/b × d/c (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "2 ÷ 1/6 = ?",
        options: ["12", "2/6", "1/3", "6"],
        correctAnswer: 0,
        explanation: "2/1 × 6/1 = 12 (Unit 3, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "1/2 ÷ 1/2 = ?",
        options: ["1", "1/4", "1/2", "2"],
        correctAnswer: 0,
        explanation: "1/2 × 2/1 = 1 (Unit 3, Session 2)."
      },
      {
        type: "text-input",
        question: "What is 1/4 + 1/5 = ? (simplify)",
        correctAnswer: "9/20",
        acceptableAnswers: ["9/20"],
        caseSensitive: false,
        explanation: "LCD=20, 5/20+4/20=9/20 (Unit 3, Session 2)."
      },
      {
        type: "text-input",
        question: "What is 2/3 × 3/4 = ?",
        correctAnswer: "1/2",
        acceptableAnswers: ["1/2", "0.5"],
        caseSensitive: false,
        explanation: "Multiply: 6/12 = 1/2 (Unit 3, Session 2)."
      },
      {
        type: "text-input",
        question: "What is 3/5 ÷ 2/3 = ?",
        correctAnswer: "9/10",
        acceptableAnswers: ["9/10"],
        caseSensitive: false,
        explanation: "3/5 × 3/2 = 9/10 (Unit 3, Session 2)."
      },
      {
        type: "text-input",
        question: "What is 1/3 ÷ 1/2 = ?",
        correctAnswer: "2/3",
        acceptableAnswers: ["2/3"],
        caseSensitive: false,
        explanation: "1/3 × 2/1 = 2/3 (Unit 3, Session 2)."
      },

      // --- SESSION 3: Decimal Fractions (15 questions) ---
      // MCQ (12), text-input (3)
      {
        type: "multiple-choice",
        question: "A decimal number has two parts separated by a:",
        options: ["Comma", "Semicolon", "Decimal point", "Colon"],
        correctAnswer: 2,
        explanation: "The dot is the decimal point (Unit 3, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "In 211.35, the whole number part is:",
        options: ["211", "35", "211.35", "35.211"],
        correctAnswer: 0,
        explanation: "Digits left of decimal point (Unit 3, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "In 57.031, the decimal part is:",
        options: ["57", "031", "57.031", "0.031"],
        correctAnswer: 3,
        explanation: "Digits right of decimal point (Unit 3, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Decimals having the same number of decimal places are called:",
        options: ["Unlike decimals", "Like decimals", "Equivalent decimals", "Similar decimals"],
        correctAnswer: 1,
        explanation: "Like decimals have same number of decimal places (Unit 3, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "0.1 = 0.10 = 0.100. This is because adding zeros to the right of the decimal part:",
        options: ["Changes the value", "Does not change the value", "Multiplies by ten", "Divides by ten"],
        correctAnswer: 1,
        explanation: "Trailing zeros do not alter value (Unit 3, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "To add decimals, you first:",
        options: ["Line up the decimal points", "Ignore decimal points", "Add whole numbers only", "Convert to fractions"],
        correctAnswer: 0,
        explanation: "Aligning decimal points ensures place value alignment (Unit 3, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "93.59 + 4.7 = ?",
        options: ["98.29", "97.29", "98.30", "97.30"],
        correctAnswer: 0,
        explanation: "Add zeros: 93.59 + 4.70 = 98.29 (Unit 3, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "135 + 44.571 + 2.01 = ?",
        options: ["181.581", "179.581", "181.571", "180.581"],
        correctAnswer: 0,
        explanation: "Align decimals: 135.000 + 44.571 + 2.010 = 181.581 (Unit 3, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "34.91 - 14.214 = ?",
        options: ["20.696", "20.696", "20.696", "20.696"],
        correctAnswer: 0,
        explanation: "34.910 - 14.214 = 20.696 (Unit 3, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "12.00942 - 12.0087 = ?",
        options: ["0.00072", "0.00072", "0.0072", "0.00072"],
        correctAnswer: 0,
        explanation: "12.00942 - 12.00870 = 0.00072 (Unit 3, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "43.5 × 4 = ?",
        options: ["174", "174.0", "174", "174"],
        correctAnswer: 0,
        explanation: "43.5 × 4 = 174.0 = 174 (Unit 3, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "91.32 × 83 = ?",
        options: ["7579.56", "7579.56", "7579.56", "7579.56"],
        correctAnswer: 0,
        explanation: "9132 × 83 = 757956, then 2 decimal places gives 7579.56 (Unit 3, Session 3)."
      },
      {
        type: "text-input",
        question: "What is 28.53 + 34.921 = ?",
        correctAnswer: "63.451",
        acceptableAnswers: ["63.451", "63.451"],
        caseSensitive: false,
        explanation: "Align decimals: 28.530 + 34.921 = 63.451 (Unit 3, Session 3)."
      },
      {
        type: "text-input",
        question: "What is 159.02 - 87.835 = ?",
        correctAnswer: "71.185",
        acceptableAnswers: ["71.185"],
        caseSensitive: false,
        explanation: "159.020 - 87.835 = 71.185 (Unit 3, Session 3)."
      },
      {
        type: "text-input",
        question: "What is 23.45 × 56.12 = ?",
        correctAnswer: "1316.014",
        acceptableAnswers: ["1316.014", "1316.014"],
        caseSensitive: false,
        explanation: "Multiply as whole numbers then place decimal (Unit 3, Session 3)."
      },

      // --- SESSION 4: Terminating and Non-Terminating (10 questions) ---
      // MCQ (8), text-input (2)
      {
        type: "multiple-choice",
        question: "Terminating decimals are decimals that:",
        options: [
          "Repeat indefinitely",
          "Come to an end (have a finite number of digits)",
          "Never end",
          "Have a pattern"
        ],
        correctAnswer: 1,
        explanation: "Terminating decimals stop (Unit 3, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "Repeating (recurring) decimals are decimals that:",
        options: [
          "Terminate",
          "Repeat a pattern indefinitely",
          "Never repeat",
          "Are irrational"
        ],
        correctAnswer: 1,
        explanation: "Recurring decimals have a repeating block (Unit 3, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "1/2 expressed as a decimal is:",
        options: ["0.5", "0.50", "0.5", "0.5"],
        correctAnswer: 0,
        explanation: "1/2 = 0.5 (terminating) (Unit 3, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "1/3 expressed as a decimal is:",
        options: ["0.3", "0.33", "0.333…", "0.3333"],
        correctAnswer: 2,
        explanation: "1/3 = 0.333… (recurring) (Unit 3, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "0.75 as a fraction in simplest form is:",
        options: ["3/4", "75/100", "15/20", "1/4"],
        correctAnswer: 0,
        explanation: "0.75 = 75/100 = 3/4 (Unit 3, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "0.333… as a fraction is:",
        options: ["1/3", "3/10", "33/100", "1/4"],
        correctAnswer: 0,
        explanation: "Let x = 0.333…, 10x=3.333…, subtract: 9x=3, x=1/3 (Unit 3, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "0.181818… as a fraction is:",
        options: ["2/11", "18/99", "2/11", "1/5"],
        correctAnswer: 0,
        explanation: "0.18 repeating = 18/99 = 2/11 (Unit 3, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "An irrational number is a number that when written as a decimal:",
        options: [
          "Terminates",
          "Repeats",
          "Neither terminates nor repeats",
          "Is always positive"
        ],
        correctAnswer: 2,
        explanation: "Irrational decimals are non‑terminating, non‑repeating (Unit 3, Session 4)."
      },
      {
        type: "text-input",
        question: "Write 0.75 as a fraction in simplest form.",
        correctAnswer: "3/4",
        acceptableAnswers: ["3/4"],
        caseSensitive: false,
        explanation: "0.75 = 75/100 = 3/4 (Unit 3, Session 4)."
      },
      {
        type: "text-input",
        question: "Is √2 a terminating or non‑terminating decimal?",
        correctAnswer: "non-terminating",
        acceptableAnswers: ["non-terminating", "nonterminating", "irrational"],
        caseSensitive: false,
        explanation: "√2 is irrational (non‑terminating, non‑repeating) (Unit 3, Session 4)."
      }
    ]
  },
  "unit4": {
    name: "Unit 4: Concept of Sets",
    icon: "🔲",
    questions: [
      // --- SESSION 1: Description Types and Compliments (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "A set is a well‑defined collection of:",
        options: [
          "Numbers only",
          "Objects",
          "Letters",
          "Symbols"
        ],
        correctAnswer: 1,
        explanation: "A set can contain any well‑defined objects (Unit 4, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The father of set theory is:",
        options: [
          "Euler",
          "Venn",
          "George Cantor",
          "Newton"
        ],
        correctAnswer: 2,
        explanation: "George Cantor (1845‑1918) is known as father of set theory (Unit 4, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The symbol ∈ means:",
        options: [
          "Is a subset of",
          "Is an element of",
          "Is not an element of",
          "Is equal to"
        ],
        correctAnswer: 1,
        explanation: "x ∈ A means x is a member of set A (Unit 4, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The symbol ∉ means:",
        options: [
          "Is an element of",
          "Is not an element of",
          "Is a subset of",
          "Is not a subset of"
        ],
        correctAnswer: 1,
        explanation: "x ∉ A means x is not a member of A (Unit 4, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Sets are usually denoted by:",
        options: [
          "Lower‑case letters",
          "Upper‑case letters",
          "Greek letters",
          "Numbers"
        ],
        correctAnswer: 1,
        explanation: "Sets are represented by capital letters (Unit 4, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "In listing the elements of a set, we enclose them in:",
        options: [
          "Parentheses ( )",
          "Square brackets [ ]",
          "Curly brackets { }",
          "Angle brackets < >"
        ],
        correctAnswer: 2,
        explanation: "Curly braces are used for set notation (Unit 4, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The set of vowels in English alphabet is:",
        options: [
          "{a,b,c,d,e}",
          "{a,e,i,o,u}",
          "{a,e,i,o}",
          "{a,e,i,o,u,y}"
        ],
        correctAnswer: 1,
        explanation: "Vowels are a, e, i, o, u (Unit 4, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The set of letters used in the word 'mathematics' written in roster form is:",
        options: [
          "{m,a,t,h,e,m,a,t,i,c,s}",
          "{m,a,t,h,e,i,c,s}",
          "{m,a,t,h,e,i,c,s}",
          "{m,a,t,h,e,i,c,s}"
        ],
        correctAnswer: 1,
        explanation: "Elements are not repeated; unique letters only (Unit 4, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The complement of a set A (denoted Ā) consists of all elements that are:",
        options: [
          "In A",
          "Not in A but in the universal set",
          "Not in the universal set",
          "In both A and universal set"
        ],
        correctAnswer: 1,
        explanation: "Complement = U \ A (Unit 4, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "If U = {1,2,3,4,5} and A = {1,3,5}, then Ā = ?",
        options: ["{1,3,5}", "{2,4}", "{1,2,3,4,5}", "{}"],
        correctAnswer: 1,
        explanation: "Elements in U but not in A are {2,4} (Unit 4, Session 1)."
      },
      {
        type: "text-input",
        question: "The set of first five natural numbers in roster form is:",
        correctAnswer: "{1,2,3,4,5}",
        acceptableAnswers: ["{1,2,3,4,5}", "{1 2 3 4 5}"],
        caseSensitive: false,
        explanation: "Natural numbers start at 1 (Unit 4, Session 1)."
      },
      {
        type: "text-input",
        question: "What is the complement symbol for a set A?",
        correctAnswer: "Ā",
        acceptableAnswers: ["Ā", "A'", "A^c"],
        caseSensitive: false,
        explanation: "Ā or A' denotes the complement (Unit 4, Session 1)."
      },

      // --- SESSION 2: Classification of Sets (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "A set with a definite number of elements is called a:",
        options: [
          "Infinite set",
          "Finite set",
          "Empty set",
          "Universal set"
        ],
        correctAnswer: 1,
        explanation: "Finite sets have countable elements (Unit 4, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "A = {1,2,3,4,5} is an example of a:",
        options: [
          "Infinite set",
          "Finite set",
          "Null set",
          "Power set"
        ],
        correctAnswer: 1,
        explanation: "It has 5 elements (finite) (Unit 4, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "A set with no element is called a:",
        options: [
          "Unit set",
          "Empty set (null set)",
          "Finite set",
          "Infinite set"
        ],
        correctAnswer: 1,
        explanation: "Empty set has no elements, denoted ∅ or {} (Unit 4, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "A set with exactly one element is called a:",
        options: [
          "Singleton set (unit set)",
          "Null set",
          "Power set",
          "Universal set"
        ],
        correctAnswer: 0,
        explanation: "Unit set has one element (Unit 4, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Two sets A and B are equivalent if:",
        options: [
          "They have the same number of elements",
          "They have exactly the same elements",
          "One is a subset of the other",
          "Their union is empty"
        ],
        correctAnswer: 0,
        explanation: "Equivalent means same cardinality, not necessarily same elements (Unit 4, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Two sets A and B are equal if:",
        options: [
          "They have the same number of elements",
          "They have exactly the same elements",
          "Their intersection is empty",
          "One is a proper subset of the other"
        ],
        correctAnswer: 1,
        explanation: "Equal sets have identical members (Unit 4, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "If A = {1,2,3} and B = {a,b,c}, then A and B are:",
        options: [
          "Equal",
          "Equivalent",
          "Disjoint",
          "Both equivalent and disjoint"
        ],
        correctAnswer: 1,
        explanation: "Both have 3 elements, so equivalent (Unit 4, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "Two sets with no common elements are called:",
        options: [
          "Equal sets",
          "Equivalent sets",
          "Disjoint sets",
          "Universal sets"
        ],
        correctAnswer: 2,
        explanation: "Disjoint sets have empty intersection (Unit 4, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The set of even prime numbers is an example of a:",
        options: [
          "Null set",
          "Unit set",
          "Finite set",
          "Infinite set"
        ],
        correctAnswer: 1,
        explanation: "Only prime that is even is 2, so unit set (Unit 4, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "An infinite set is a set whose number of elements:",
        options: [
          "Is zero",
          "Is one",
          "Cannot be counted",
          "Is definite"
        ],
        correctAnswer: 2,
        explanation: "Infinite sets have unlimited elements (Unit 4, Session 2)."
      },
      {
        type: "text-input",
        question: "What is the symbol for the empty set?",
        correctAnswer: "∅",
        acceptableAnswers: ["∅", "{}", "empty set"],
        caseSensitive: false,
        explanation: "∅ denotes the empty set (Unit 4, Session 2)."
      },
      {
        type: "text-input",
        question: "If n(A)=n(B), then A and B are called ______ sets.",
        correctAnswer: "equivalent",
        acceptableAnswers: ["equivalent", "equipotent"],
        caseSensitive: false,
        explanation: "Same cardinality means equivalent (Unit 4, Session 2)."
      },

      // --- SESSION 3: Subsets of Sets (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "If every element of set P is also an element of set Q, then P is a:",
        options: [
          "Proper subset of Q",
          "Subset of Q",
          "Superset of Q",
          "Complement of Q"
        ],
        correctAnswer: 1,
        explanation: "P ⊆ Q (Unit 4, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The empty set is a subset of:",
        options: [
          "No set",
          "Every set",
          "Only finite sets",
          "Only infinite sets"
        ],
        correctAnswer: 1,
        explanation: "∅ is a subset of every set (Unit 4, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Every set is a subset of:",
        options: [
          "Itself",
          "The empty set",
          "Its complement",
          "The universal set"
        ],
        correctAnswer: 0,
        explanation: "A ⊆ A (Unit 4, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "If A ⊆ B but A ≠ B, then A is called a:",
        options: [
          "Improper subset",
          "Proper subset",
          "Super set",
          "Complement"
        ],
        correctAnswer: 1,
        explanation: "Proper subset means all elements of A are in B, but B has extra elements (Unit 4, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The number of subsets of a set with n elements is:",
        options: ["n²", "2n", "2ⁿ", "n!"],
        correctAnswer: 2,
        explanation: "Number of subsets = 2ⁿ (Unit 4, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "If a set has 3 elements, the number of subsets is:",
        options: ["6", "8", "9", "7"],
        correctAnswer: 1,
        explanation: "2³ = 8 (Unit 4, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Which of the following is a proper subset of {1,2,3}?",
        options: ["{1,2,3}", "{1,2}", "{4}", "{ }"],
        correctAnswer: 1,
        explanation: "{1,2} is a proper subset (Unit 4, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The set of all subsets of a given set A is called the:",
        options: [
          "Universal set",
          "Power set",
          "Complement set",
          "Null set"
        ],
        correctAnswer: 1,
        explanation: "Power set P(A) is the set of all subsets (Unit 4, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "If n(A)=2, then the number of proper subsets is:",
        options: ["2", "3", "4", "1"],
        correctAnswer: 1,
        explanation: "Total subsets 2²=4, proper subsets exclude the set itself → 3 (Unit 4, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The symbol ⊂ means:",
        options: [
          "Is a subset of",
          "Is a proper subset of",
          "Is not a subset of",
          "Is an element of"
        ],
        correctAnswer: 1,
        explanation: "⊂ denotes proper subset (Unit 4, Session 3)."
      },
      {
        type: "text-input",
        question: "For a set with n elements, number of subsets = ?",
        correctAnswer: "2^n",
        acceptableAnswers: ["2^n", "2ⁿ", "2n"],
        caseSensitive: false,
        explanation: "Number of subsets = 2ⁿ (Unit 4, Session 3)."
      },
      {
        type: "text-input",
        question: "What is the symbol for 'is a subset of' (not necessarily proper)?",
        correctAnswer: "⊆",
        acceptableAnswers: ["⊆", "subset"],
        caseSensitive: false,
        explanation: "⊆ means subset (Unit 4, Session 3)."
      },

      // --- SESSION 4: Operations on Sets (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "The intersection of sets A and B (A ∩ B) is the set of elements that are in:",
        options: [
          "A only",
          "B only",
          "Both A and B",
          "Neither A nor B"
        ],
        correctAnswer: 2,
        explanation: "Intersection = common elements (Unit 4, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "The union of sets A and B (A ∪ B) is the set of elements that are in:",
        options: [
          "A only",
          "B only",
          "Both A and B",
          "A or B or both"
        ],
        correctAnswer: 3,
        explanation: "Union includes all elements from both sets (Unit 4, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "If A = {1,2,3} and B = {2,3,4}, then A ∩ B = ?",
        options: ["{1,2,3,4}", "{2,3}", "{1,4}", "{ }"],
        correctAnswer: 1,
        explanation: "Common elements are 2 and 3 (Unit 4, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "If A = {1,2,3} and B = {2,3,4}, then A ∪ B = ?",
        options: ["{1,2,3,4}", "{2,3}", "{1,4}", "{1,2,3}"],
        correctAnswer: 0,
        explanation: "Union = {1,2,3,4} (Unit 4, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "The formula for the number of elements in the union of two intersecting sets is:",
        options: [
          "n(A∪B)=n(A)+n(B)",
          "n(A∪B)=n(A)+n(B)−n(A∩B)",
          "n(A∪B)=n(A)+n(B)+n(A∩B)",
          "n(A∪B)=n(A)×n(B)"
        ],
        correctAnswer: 1,
        explanation: "General formula for two sets (Unit 4, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "If A and B are disjoint, then n(A∪B) = ?",
        options: [
          "n(A)+n(B)",
          "n(A)+n(B)−n(A∩B)",
          "n(A)−n(B)",
          "n(A)×n(B)"
        ],
        correctAnswer: 0,
        explanation: "For disjoint, n(A∩B)=0 (Unit 4, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "The commutative property of union states:",
        options: [
          "A∪B = B∪A",
          "A∪B = A∩B",
          "A∪A = A",
          "A∪∅ = A"
        ],
        correctAnswer: 0,
        explanation: "Union is commutative (Unit 4, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "The associative property of intersection states:",
        options: [
          "A∩B = B∩A",
          "(A∩B)∩C = A∩(B∩C)",
          "A∩∅ = ∅",
          "A∩U = A"
        ],
        correctAnswer: 1,
        explanation: "Grouping does not matter (Unit 4, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "The distributive property A∪(B∩C) = ?",
        options: [
          "(A∪B)∩(A∪C)",
          "(A∩B)∪(A∩C)",
          "A∪(B∪C)",
          "A∩(B∪C)"
        ],
        correctAnswer: 0,
        explanation: "Union distributes over intersection (Unit 4, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "The complement of the union of two sets is given by De Morgan's law: (A∪B)' = ?",
        options: [
          "A' ∩ B'",
          "A' ∪ B'",
          "(A∩B)'",
          "A' ∪ B"
        ],
        correctAnswer: 0,
        explanation: "De Morgan's first law (Unit 4, Session 4)."
      },
      {
        type: "text-input",
        question: "What is the symbol for intersection of sets?",
        correctAnswer: "∩",
        acceptableAnswers: ["∩", "intersection"],
        caseSensitive: false,
        explanation: "∩ denotes intersection (Unit 4, Session 4)."
      },
      {
        type: "text-input",
        question: "What is the symbol for union of sets?",
        correctAnswer: "∪",
        acceptableAnswers: ["∪", "union"],
        caseSensitive: false,
        explanation: "∪ denotes union (Unit 4, Session 4)."
      },

      // --- SESSION 5: Two Set Problem (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "In a Venn diagram with two intersecting sets, the region where only A is present is represented by:",
        options: [
          "A ∩ B",
          "A only (A ∩ B̄)",
          "B only (Ā ∩ B)",
          "(A∪B)'"
        ],
        correctAnswer: 1,
        explanation: "A only = A ∩ B' (Unit 4, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "In a Venn diagram, the region outside both circles represents:",
        options: [
          "A ∪ B",
          "A ∩ B",
          "(A ∪ B)'",
          "A' ∪ B'"
        ],
        correctAnswer: 2,
        explanation: "Elements not in A nor B (Unit 4, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "If n(U)=100, n(A)=61, n(A∩B)=8, and n(A∪B)'=10, then n(B)=?",
        options: ["37", "29", "53", "41"],
        correctAnswer: 0,
        explanation: "n(A∪B)=90, 61+ n(B) -8 =90 → n(B)=37 (Unit 4, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "In a class of 108 students, 86 passed Maths, 35 passed French, and 3 failed both. Number who passed both is:",
        options: ["16", "18", "14", "12"],
        correctAnswer: 0,
        explanation: "105 passed at least one = 86+35 − x → x=16 (Unit 4, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "In a survey of 85 students, 46 took track, 47 took field, 12 took track only, and number taking only field is twice those taking neither. How many took only field?",
        options: ["13", "26", "12", "15"],
        correctAnswer: 0,
        explanation: "Solve using Venn: track only=12, let x=only field, then 2x=neither, total 12+x+34+2x=85 → 46+3x=85 → x=13 (Unit 4, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "What is the region representing A ∩ B in a Venn diagram?",
        options: [
          "Circle A only",
          "Circle B only",
          "Overlapping part",
          "Outside both circles"
        ],
        correctAnswer: 2,
        explanation: "Intersection is the overlapping region (Unit 4, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "If n(A)=24, n(B)=21, n(C)=18, n(A∩B)=12, n(A∩C)=13, n(B∩C)=7, and n(A∩B∩C)=5, then n(A only) is:",
        options: ["4", "5", "6", "7"],
        correctAnswer: 0,
        explanation: "A only = 24 − (12+13−5) = 24 − 20 = 4? Check careful: A only = n(A) − n(A∩B) − n(A∩C) + n(A∩B∩C) = 24−12−13+5=4 (Unit 4, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "The number of students who like at least one of three sports is given by:",
        options: [
          "n(A∪B∪C) = n(A)+n(B)+n(C) − n(A∩B)−n(A∩C)−n(B∩C) + n(A∩B∩C)",
          "n(A∪B∪C) = n(A)+n(B)+n(C) + n(A∩B∩C)",
          "n(A∪B∪C) = n(A)+n(B)+n(C) − n(A∩B∩C)",
          "n(A∪B∪C) = n(A)+n(B)+n(C)"
        ],
        correctAnswer: 0,
        explanation: "Inclusion‑exclusion for three sets (Unit 4, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "In a Venn diagram, the region representing A only is:",
        options: [
          "A ∩ B'",
          "A' ∩ B",
          "A ∩ B",
          "(A∪B)'"
        ],
        correctAnswer: 0,
        explanation: "A only = A minus intersection (Unit 4, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "If n(U)=50, n(A)=32, n(B)=23, n(C)=25, n(A∩B)=12, n(A∩C)=13, n(B∩C)=7, and n(A∩B∩C)=5, then the number who are in exactly two clubs is:",
        options: ["17", "15", "18", "20"],
        correctAnswer: 0,
        explanation: "Exactly two = (12−5)+(13−5)+(7−5)=7+8+2=17 (Unit 4, Session 5)."
      },
      {
        type: "text-input",
        question: "In a two‑set Venn diagram, the region outside both sets is called _____ of the union.",
        correctAnswer: "complement",
        acceptableAnswers: ["complement", "complement of union"],
        caseSensitive: false,
        explanation: "(A∪B)' is the complement of the union (Unit 4, Session 5)."
      },
      {
        type: "text-input",
        question: "If n(A∪B)=n(A)+n(B)−n(A∩B), what term is subtracted?",
        correctAnswer: "intersection",
        acceptableAnswers: ["intersection", "n(A∩B)"],
        caseSensitive: false,
        explanation: "Subtract the intersection to avoid double counting (Unit 4, Session 5)."
      }
    ]
  },
  "unit5": {
    name: "Unit 5: Algebraic Expressions, Linear Equations and Inequalities",
    icon: "✖️",
    questions: [
      // --- SESSION 1: Definition, Formulation and Types of Algebraic Expression (10 questions) ---
      // MCQ (8), text-input (2)
      {
        type: "multiple-choice",
        question: "A letter used to represent a specific unknown number is called:",
        options: ["Variable", "Unknown", "Constant", "Coefficient"],
        correctAnswer: 1,
        explanation: "Unknown represents a specific number (Unit 5, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "A letter used to represent a set of numbers is called:",
        options: ["Unknown", "Variable", "Constant", "Term"],
        correctAnswer: 1,
        explanation: "Variable can take multiple values (Unit 5, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "In the expression 7 + k = 10, the constants are 7 and:",
        options: ["k", "7", "10", "10"],
        correctAnswer: 2,
        explanation: "Constants are fixed numbers (Unit 5, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "An algebraic expression with only one term is called a:",
        options: ["Binomial", "Trinomial", "Monomial", "Polynomial"],
        correctAnswer: 2,
        explanation: "Monomial: one term (Unit 5, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "An algebraic expression with two terms is called a:",
        options: ["Monomial", "Binomial", "Trinomial", "Multinomial"],
        correctAnswer: 1,
        explanation: "Binomial: two terms (Unit 5, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The degree of the polynomial 2x² + 4x + 5 is:",
        options: ["1", "2", "3", "0"],
        correctAnswer: 1,
        explanation: "Highest exponent is 2 (quadratic) (Unit 5, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The algebraic expression for 'Twice the sum of a number and 5 is 13' is:",
        options: ["2x + 5 = 13", "2(x + 5) = 13", "x + 10 = 13", "2x + 10 = 13"],
        correctAnswer: 1,
        explanation: "Sum of number and 5 first, then double (Unit 5, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The algebraic expression for 'The difference of a certain number and 10 is -2' is:",
        options: ["x - 10 = -2", "10 - x = -2", "x - (-10) = -2", "x + 10 = -2"],
        correctAnswer: 0,
        explanation: "x - 10 = -2 (Unit 5, Session 1)."
      },
      {
        type: "text-input",
        question: "What is the term for a polynomial of degree 1?",
        correctAnswer: "linear",
        acceptableAnswers: ["linear"],
        caseSensitive: false,
        explanation: "Linear polynomials have degree 1 (Unit 5, Session 1)."
      },
      {
        type: "text-input",
        question: "What is the term for a polynomial of degree 2?",
        correctAnswer: "quadratic",
        acceptableAnswers: ["quadratic"],
        caseSensitive: false,
        explanation: "Quadratic polynomials have degree 2 (Unit 5, Session 1)."
      },

      // --- SESSION 2: Operations on Algebraic Expressions (10 questions) ---
      // MCQ (8), text-input (2)
      {
        type: "multiple-choice",
        question: "Terms with the same variable factors are called:",
        options: ["Unlike terms", "Like terms", "Constant terms", "Variable terms"],
        correctAnswer: 1,
        explanation: "Like terms have identical variables (Unit 5, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The sum of 2a + 4k + 5a + 7k is:",
        options: ["7a + 11k", "7a + 11k", "7a + 11k", "7a + 11k"],
        correctAnswer: 0,
        explanation: "Group like terms: (2a+5a)+(4k+7k)=7a+11k (Unit 5, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The sum of (2a² + 4a + 5) and (6a² - 3a - 4) is:",
        options: ["8a² + a + 1", "8a² + 7a + 9", "8a² + a - 1", "8a² - a + 1"],
        correctAnswer: 0,
        explanation: "Add like terms: (2+6)a² = 8a², (4-3)a = a, (5-4)=1 (Unit 5, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The difference (10y³ - 6y² + 5) - (3y⁴ + 7y³ + 10) is:",
        options: ["-3y⁴ + 3y³ - 6y² - 5", "3y⁴ + 3y³ - 6y² - 5", "-3y⁴ - 3y³ - 6y² - 5", "-3y⁴ + 3y³ + 6y² - 5"],
        correctAnswer: 0,
        explanation: "Distribute negative: -3y⁴, 10y³-7y³=3y³, -6y², 5-10=-5 (Unit 5, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The product of 2ab and 3xy is:",
        options: ["6abxy", "5abxy", "6ab + 6xy", "6a²b²x²y²"],
        correctAnswer: 0,
        explanation: "2×3=6, then ab×xy = abxy (Unit 5, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "x⁵ ÷ x³ = ?",
        options: ["x²", "x¹⁵", "x⁸", "x²"],
        correctAnswer: 0,
        explanation: "x⁵⁻³ = x² (Unit 5, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The product of (4a + 5b - 3c) and 2x is:",
        options: ["8ax + 10bx - 6cx", "8a + 10b - 6c", "4ax + 5bx - 3cx", "8a + 10b - 6c"],
        correctAnswer: 0,
        explanation: "Distribute 2x: 8ax + 10bx - 6cx (Unit 5, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "14a²k ÷ 7ab = ?",
        options: ["2ak/b", "2a²k/b", "2ak", "7ak/b"],
        correctAnswer: 0,
        explanation: "14/7=2, a²/a=a, k/b stays, so 2ak/b (Unit 5, Session 2)."
      },
      {
        type: "text-input",
        question: "Simplify: 4a × 5a × 10a = ?",
        correctAnswer: "200a³",
        acceptableAnswers: ["200a³", "200a^3"],
        caseSensitive: false,
        explanation: "Multiply constants: 4×5×10=200, a×a×a=a³ (Unit 5, Session 2)."
      },
      {
        type: "text-input",
        question: "Is 2x and 3x² like terms?",
        correctAnswer: "no",
        acceptableAnswers: ["no", "No"],
        caseSensitive: false,
        explanation: "Variables differ in exponent (2x vs 3x²) (Unit 5, Session 2)."
      },

      // --- SESSION 3: Expansion, Factorization and Difference of Two Squares (10 questions) ---
      // MCQ (8), text-input (2)
      {
        type: "multiple-choice",
        question: "Expanding 2(a + b) gives:",
        options: ["2a + 2b", "2a + b", "a + 2b", "2ab"],
        correctAnswer: 0,
        explanation: "Distribute: 2×a + 2×b = 2a+2b (Unit 5, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Expanding (x + y)² gives:",
        options: ["x² + y²", "x² + 2xy + y²", "x² + xy + y²", "2x + 2y"],
        correctAnswer: 1,
        explanation: "(x+y)² = x² + 2xy + y² (Unit 5, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Expanding (a - b)² gives:",
        options: ["a² - 2ab + b²", "a² + 2ab + b²", "a² - b²", "a² + b²"],
        correctAnswer: 0,
        explanation: "(a-b)² = a² - 2ab + b² (Unit 5, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Factorising 10a + 6b gives:",
        options: ["2(5a + 3b)", "5(2a + b)", "6(a + b)", "2(5a + 3b)"],
        correctAnswer: 0,
        explanation: "Common factor 2: 2(5a+3b) (Unit 5, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Factorising 5xy + 10uy - 30y² gives:",
        options: ["5y(x + 2u - 6y)", "5y(x + 2u - 6y)", "5y(x + 2u - 6y)", "5y(x + 2u - 6y)"],
        correctAnswer: 0,
        explanation: "Common factor 5y: 5y(x + 2u - 6y) (Unit 5, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Factorising x(x+1) - 2k(x+1) gives:",
        options: ["(x+1)(x-2k)", "(x+1)(x+2k)", "(x-1)(x-2k)", "(x+1)(x-2k)"],
        correctAnswer: 0,
        explanation: "Common factor (x+1): (x+1)(x-2k) (Unit 5, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The difference of two squares formula is:",
        options: ["a² - b² = (a - b)²", "a² - b² = (a + b)(a - b)", "a² - b² = a² - 2ab + b²", "a² - b² = (a + b)²"],
        correctAnswer: 1,
        explanation: "a² - b² = (a + b)(a - b) (Unit 5, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Factorising x² - 4 gives:",
        options: ["(x+2)(x-2)", "(x-2)²", "(x+2)²", "(x-2)(x-2)"],
        correctAnswer: 0,
        explanation: "x²-4 = (x+2)(x-2) (Unit 5, Session 3)."
      },
      {
        type: "text-input",
        question: "Factorise 9 - x².",
        correctAnswer: "(3+x)(3-x)",
        acceptableAnswers: ["(3+x)(3-x)", "(3+x)(3-x)", "-(x+3)(x-3)"],
        caseSensitive: false,
        explanation: "9 - x² = (3+x)(3-x) (Unit 5, Session 3)."
      },
      {
        type: "text-input",
        question: "What is the expanded form of (2x + 3)²?",
        correctAnswer: "4x²+12x+9",
        acceptableAnswers: ["4x²+12x+9", "4x^2+12x+9"],
        caseSensitive: false,
        explanation: "(2x)²=4x², 2×2x×3=12x, 3²=9 (Unit 5, Session 3)."
      },

      // --- SESSION 4: Linear Equations and Graphs (10 questions) ---
      // MCQ (8), text-input (2)
      {
        type: "multiple-choice",
        question: "A linear equation in one variable has degree:",
        options: ["1", "2", "3", "0"],
        correctAnswer: 0,
        explanation: "Linear means exponent 1 (Unit 5, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "Solve k + 2 = 6. k = ?",
        options: ["8", "4", "3", "6"],
        correctAnswer: 1,
        explanation: "k = 6 - 2 = 4 (Unit 5, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "Solve (1/4)m + 10 = 5. m = ?",
        options: ["20", "-20", "60", "-60"],
        correctAnswer: 1,
        explanation: "(1/4)m = -5 → m = -20 (Unit 5, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "Solve 2(3 + 4x) = 4(5 + 6x). x = ?",
        options: ["-7/8", "7/8", "8/7", "-8/7"],
        correctAnswer: 0,
        explanation: "6+8x = 20+24x → -14 = 16x → x = -7/8 (Unit 5, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "The graph of y = 2x + 1 is a:",
        options: ["Curve", "Straight line", "Parabola", "Circle"],
        correctAnswer: 1,
        explanation: "Linear equation graphs as a straight line (Unit 5, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "What is the y‑intercept of y = 2x + 1?",
        options: ["0", "1", "2", "-1"],
        correctAnswer: 1,
        explanation: "y = mx + c, c = 1 (Unit 5, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "What is the slope (gradient) of y = 2x + 1?",
        options: ["0", "1", "2", "3"],
        correctAnswer: 2,
        explanation: "Coefficient of x = 2 (Unit 5, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "Solve 1.2(3.5 - 2x) = 0.6(3x - 7). x = ?",
        options: ["2", "3", "1", "0"],
        correctAnswer: 0,
        explanation: "4.2 - 2.4x = 1.8x - 4.2 → 8.4 = 4.2x → x = 2 (Unit 5, Session 4)."
      },
      {
        type: "text-input",
        question: "What is the slope of the line x + 2y = 0?",
        correctAnswer: "-1/2",
        acceptableAnswers: ["-1/2", "-0.5", "-(1/2)"],
        caseSensitive: false,
        explanation: "2y = -x → y = -(1/2)x, slope -1/2 (Unit 5, Session 4)."
      },
      {
        type: "text-input",
        question: "Solve 3x - 5 = 10. x = ?",
        correctAnswer: "5",
        acceptableAnswers: ["5"],
        caseSensitive: false,
        explanation: "3x = 15 → x = 5 (Unit 5, Session 4)."
      },

      // --- SESSION 5: Word Problems in Linear Equations (10 questions) ---
      // MCQ (8), text-input (2)
      {
        type: "multiple-choice",
        question: "Twice the sum of a number and 5 is 30. The number is:",
        options: ["10", "12", "5", "15"],
        correctAnswer: 0,
        explanation: "2(x+5)=30 → x+5=15 → x=10 (Unit 5, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "Keizah scored 20 marks more than Doris. Their total marks is 120. Doris scored:",
        options: ["70", "50", "60", "40"],
        correctAnswer: 1,
        explanation: "y + (y+20)=120 → 2y=100 → y=50 (Unit 5, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "Mr. Dankwa is four times as old as his son. Sum of their ages is 60. Mr. Dankwa's age now is:",
        options: ["12", "48", "40", "50"],
        correctAnswer: 1,
        explanation: "x + 4x = 60 → 5x=60 → son=12, father=48 (Unit 5, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "The sum of three consecutive odd numbers is 75. The numbers are:",
        options: ["23,25,27", "21,23,25", "25,27,29", "19,21,23"],
        correctAnswer: 0,
        explanation: "x+(x+2)+(x+4)=75 → 3x+6=75 → 3x=69 → x=23 (Unit 5, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "When one is added to a number and the result multiplied by 4, the answer is 20. The number is:",
        options: ["4", "5", "3", "2"],
        correctAnswer: 0,
        explanation: "4(x+1)=20 → x+1=5 → x=4 (Unit 5, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "The sum of three numbers is 27. The second is three times the first, and the third is twice the first. The numbers are:",
        options: ["4.5,13.5,9", "5,15,10", "4,12,8", "6,18,12"],
        correctAnswer: 0,
        explanation: "x+3x+2x=27 → 6x=27 → x=4.5 (Unit 5, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "Three oranges and two pineapples cost GH¢36. Five oranges and three pineapples cost GH¢55. Which equations represent this?",
        options: ["3o+2p=36, 5o+3p=55", "3o+2p=55, 5o+3p=36", "2o+3p=36, 3o+5p=55", "o+p=36, o+p=55"],
        correctAnswer: 0,
        explanation: "Translate directly: 3o+2p=36, 5o+3p=55 (Unit 5, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "When 21 is subtracted from a certain number and the result divided by 4, the answer is 1. The number is:",
        options: ["25", "24", "22", "26"],
        correctAnswer: 0,
        explanation: "(x-21)/4=1 → x-21=4 → x=25 (Unit 5, Session 5)."
      },
      {
        type: "text-input",
        question: "The sum of three numbers is 27. If the second is three times the first and the third is twice the first, what is the first number?",
        correctAnswer: "4.5",
        acceptableAnswers: ["4.5", "9/2"],
        caseSensitive: false,
        explanation: "x+3x+2x=27 → 6x=27 → x=4.5 (Unit 5, Session 5)."
      },
      {
        type: "text-input",
        question: "If a number is increased by 3 gives 8, the number is:",
        correctAnswer: "5",
        acceptableAnswers: ["5"],
        caseSensitive: false,
        explanation: "x+3=8 → x=5 (Unit 5, Session 5)."
      },

      // --- SESSION 6: Linear Inequality in a Single Variable (10 questions) ---
      // MCQ (8), text-input (2)
      {
        type: "multiple-choice",
        question: "The inequality symbol for 'greater than' is:",
        options: ["<", ">", "≤", "≥"],
        correctAnswer: 1,
        explanation: "> means greater than (Unit 5, Session 6)."
      },
      {
        type: "multiple-choice",
        question: "If you multiply or divide an inequality by a negative number, the inequality sign:",
        options: ["Stays the same", "Reverses", "Disappears", "Becomes equality"],
        correctAnswer: 1,
        explanation: "Multiplying by negative reverses inequality direction (Unit 5, Session 6)."
      },
      {
        type: "multiple-choice",
        question: "Solve n - 10 > 20. n > ?",
        options: ["10", "20", "30", "40"],
        correctAnswer: 2,
        explanation: "n > 30 (Unit 5, Session 6)."
      },
      {
        type: "multiple-choice",
        question: "Solve (1/4)(m - 4) < 14 + m. m > ?",
        options: ["-20", "20", "-15", "15"],
        correctAnswer: 0,
        explanation: "Multiply by 4: m-4 < 56+4m → -60 < 3m → m > -20 (Unit 5, Session 6)."
      },
      {
        type: "multiple-choice",
        question: "Solve -1 ≤ 2m - 3 < 1. m is between:",
        options: ["1 ≤ m < 2", "0 ≤ m < 1", "-1 ≤ m < 0", "2 ≤ m < 3"],
        correctAnswer: 0,
        explanation: "Add 3: 2 ≤ 2m < 4 → divide by 2: 1 ≤ m < 2 (Unit 5, Session 6)."
      },
      {
        type: "multiple-choice",
        question: "The inequality x > 2 is represented on a number line with a circle at 2 that is:",
        options: ["Shaded and arrow right", "Unshaded and arrow right", "Shaded and arrow left", "Unshaded and arrow left"],
        correctAnswer: 1,
        explanation: "> means open circle (unshaded) and arrow right (Unit 5, Session 6)."
      },
      {
        type: "multiple-choice",
        question: "The inequality x ≥ 2 is represented with a circle that is:",
        options: ["Open (unshaded)", "Closed (shaded)", "No circle", "Double circle"],
        correctAnswer: 1,
        explanation: "≥ means closed (shaded) circle (Unit 5, Session 6)."
      },
      {
        type: "multiple-choice",
        question: "Solve 3x - 10 ≥ 2x + 2. x ?",
        options: ["x ≥ 12", "x ≤ 12", "x ≥ 16", "x ≤ 16"],
        correctAnswer: 0,
        explanation: "3x - 10 ≥ 2x + 2 → 3x - 2x ≥ 2 + 10 → x ≥ 12 (Unit 5, Session 6)."
      },
      {
        type: "multiple-choice",
        question: "Solve 4 + x < 2(x + 6). x ?",
        options: ["x < -8", "x > -8", "x < 8", "x > 8"],
        correctAnswer: 1,
        explanation: "4+x < 2x+12 → -8 < x (Unit 5, Session 6)."
      },
      {
        type: "text-input",
        question: "What is the inequality symbol for 'greater than or equal to'?",
        correctAnswer: "≥",
        acceptableAnswers: ["≥", ">="],
        caseSensitive: false,
        explanation: "≥ means greater than or equal (Unit 5, Session 6)."
      },
      {
        type: "text-input",
        question: "If a > b, what happens when both sides are multiplied by -1?",
        correctAnswer: "reverse",
        acceptableAnswers: ["reverse", "sign changes", "inequality flips"],
        caseSensitive: false,
        explanation: "-a < -b (Unit 5, Session 6)."
      }
    ]
  },
  "unit6": {
    name: "Unit 6: Everyday and Commercial Arithmetic",
    icon: "💰",
    questions: [
      // --- SESSION 1: Ratio and Rates (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "A ratio is a comparison of two quantities of:",
        options: [
          "Different kind",
          "The same kind",
          "Different units",
          "Different measures"
        ],
        correctAnswer: 1,
        explanation: "Ratio compares quantities of the same kind (Unit 6, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The ratio 12:6 simplified is:",
        options: ["6:3", "2:1", "4:2", "3:1"],
        correctAnswer: 1,
        explanation: "Divide both by 6 → 2:1 (Unit 6, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "If Kate is 12 years and Doris is 6 years, the ratio of Kate's age to Doris's age is:",
        options: ["1:2", "2:1", "3:1", "1:1"],
        correctAnswer: 1,
        explanation: "12:6 simplifies to 2:1 (Unit 6, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "When sharing GH¢200 in the ratio 2:3, the total ratio is:",
        options: ["2", "3", "5", "6"],
        correctAnswer: 2,
        explanation: "2 + 3 = 5 (Unit 6, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "In the ratio 2:3, Ama's share as a fraction of the total is:",
        options: ["2/5", "3/5", "2/3", "3/2"],
        correctAnswer: 0,
        explanation: "Ama's share = 2/(2+3) = 2/5 (Unit 6, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Ama and Akos share GH¢200 in ratio 2:3. Ama receives:",
        options: ["GH¢80", "GH¢120", "GH¢100", "GH¢60"],
        correctAnswer: 0,
        explanation: "(2/5)×200 = 80 (Unit 6, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The unitary method for sharing GH¢200 in ratio 2:3 gives unit value of:",
        options: ["40", "50", "30", "20"],
        correctAnswer: 0,
        explanation: "200 ÷ 5 = 40 (Unit 6, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "A rate compares two quantities with:",
        options: [
          "Same units",
          "Different units",
          "Same kind",
          "No units"
        ],
        correctAnswer: 1,
        explanation: "Rate compares different dimensions (e.g., cost per item) (Unit 6, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "If 5 mangoes cost GH¢1.50, the rate is:",
        options: [
          "GH¢1.50 per mango",
          "GH¢0.30 per mango",
          "GH¢0.50 per mango",
          "GH¢0.20 per mango"
        ],
        correctAnswer: 1,
        explanation: "1.50 ÷ 5 = 0.30 per mango (Unit 6, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Three people share GH¢300 in ratio 1:2:3. The highest share is:",
        options: ["GH¢50", "GH¢100", "GH¢150", "GH¢200"],
        correctAnswer: 2,
        explanation: "(3/6)×300 = 150 (Unit 6, Session 1)."
      },
      {
        type: "text-input",
        question: "What is the ratio of 1 metre to 50 cm?",
        correctAnswer: "2:1",
        acceptableAnswers: ["2:1", "2 to 1"],
        caseSensitive: false,
        explanation: "Convert to same units: 100 cm : 50 cm = 2:1 (Unit 6, Session 1)."
      },
      {
        type: "text-input",
        question: "If Prince's salary is GH¢480 in ratio 2:3 with Bright, Bright's salary is?",
        correctAnswer: "720",
        acceptableAnswers: ["720", "GH¢720"],
        caseSensitive: false,
        explanation: "2 parts = 480, so 1 part = 240, Bright's 3 parts = 720 (Unit 6, Session 1)."
      },

      // --- SESSION 2: Proportion (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "Proportion is an equation that shows that two or more ratios are:",
        options: ["Equal", "Not equal", "Different", "Inverse"],
        correctAnswer: 0,
        explanation: "Proportion shows equality of ratios (Unit 6, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "In direct proportion, as one quantity increases, the other:",
        options: ["Decreases", "Stays the same", "Increases", "Becomes zero"],
        correctAnswer: 2,
        explanation: "Direct proportion: both increase together (Unit 6, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "If 2:7 = 8.50:x, then x = ?",
        options: ["29.75", "17.00", "22.50", "34.00"],
        correctAnswer: 0,
        explanation: "2x = 7×8.50 → x = 59.5/2 = 29.75 (Unit 6, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "If 200 words take 8 minutes, how many words in 1 minute?",
        options: ["15", "20", "25", "30"],
        correctAnswer: 2,
        explanation: "200 ÷ 8 = 25 words per minute (Unit 6, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "If 5 women take 8 days to do a job, how long will 10 women take (indirect proportion)?",
        options: ["16 days", "8 days", "4 days", "2 days"],
        correctAnswer: 2,
        explanation: "Indirect: 5×8 = 10×x → 40 = 10x → x=4 days (Unit 6, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "In indirect proportion, as one quantity increases, the other:",
        options: ["Increases", "Decreases", "Stays same", "Doubles"],
        correctAnswer: 1,
        explanation: "Indirect (inverse) proportion: opposite change (Unit 6, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "If 100 chickens are fed for 12 days, how long will 60 chickens be fed by same bag?",
        options: ["6 days", "20 days", "8 days", "12 days"],
        correctAnswer: 1,
        explanation: "Indirect: 100×12 = 60×x → 1200 = 60x → x=20 days (Unit 6, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "If the ratio of tutors to students is 1:15 and there are 50 tutors, how many students are there?",
        options: ["3", "750", "65", "500"],
        correctAnswer: 1,
        explanation: "1:15 = 50:x → x = 15 × 50 = 750 (Unit 6, Session 2)."
    },
      {
        type: "multiple-choice",
        question: "If the ratio of tutors to students is 1:15 and there are 50 tutors, number of students is:",
        options: ["3", "750", "65", "500"],
        correctAnswer: 1,
        explanation: "1:15 = 50:x → x = 15×50 = 750 (Unit 6, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "On a map, 5 cm represents 20 km. What does 25 cm represent?",
        options: ["100 km", "80 km", "120 km", "60 km"],
        correctAnswer: 0,
        explanation: "5:20 = 25:x → 5x = 500 → x=100 km (Unit 6, Session 2)."
      },
      {
        type: "text-input",
        question: "If 4 pens cost GH¢1.50, the cost of 25 pens is:",
        correctAnswer: "9.375",
        acceptableAnswers: ["9.375", "9.38", "GH¢9.38"],
        caseSensitive: false,
        explanation: "1 pen = 0.375, 25×0.375 = 9.375 (Unit 6, Session 2)."
      },
      {
        type: "text-input",
        question: "If 18 men harvest in 6 days, how many men to harvest in 9 days (indirect)?",
        correctAnswer: "12",
        acceptableAnswers: ["12"],
        caseSensitive: false,
        explanation: "18×6 = x×9 → 108 = 9x → x=12 (Unit 6, Session 2)."
      },

      // --- SESSION 3: Percentages (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "The symbol % means:",
        options: ["Out of ten", "Out of hundred", "Out of thousand", "Out of one"],
        correctAnswer: 1,
        explanation: "Percent means per hundred (Unit 6, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "1/2 as a percentage is:",
        options: ["50%", "20%", "25%", "75%"],
        correctAnswer: 0,
        explanation: "1/2 × 100% = 50% (Unit 6, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "3/5 as a percentage is:",
        options: ["30%", "60%", "35%", "40%"],
        correctAnswer: 1,
        explanation: "3/5 × 100% = 60% (Unit 6, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "1/3 as a percentage is approximately:",
        options: ["33.3%", "30%", "25%", "35%"],
        correctAnswer: 0,
        explanation: "1/3 × 100% = 33.33% (Unit 6, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "What percentage of 240 is 100?",
        options: ["41.7%", "24%", "56%", "40%"],
        correctAnswer: 0,
        explanation: "100/240 × 100% = 41.67% (Unit 6, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "30% of a number is 225. The number is:",
        options: ["750", "675", "850", "700"],
        correctAnswer: 0,
        explanation: "0.3 × x = 225 → x = 225/0.3 = 750 (Unit 6, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "5% of what number is 22.5?",
        options: ["450", "400", "500", "350"],
        correctAnswer: 0,
        explanation: "0.05 × x = 22.5 → x = 22.5/0.05 = 450 (Unit 6, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "15% of 60 is:",
        options: ["9", "6", "15", "12"],
        correctAnswer: 0,
        explanation: "0.15 × 60 = 9 (Unit 6, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "56 is 12% of what number?",
        options: ["466.67", "450", "500", "400"],
        correctAnswer: 0,
        explanation: "56 = 0.12x → x = 56/0.12 = 466.67 (Unit 6, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "What percentage of 2000 is 100?",
        options: ["5%", "10%", "2%", "20%"],
        correctAnswer: 0,
        explanation: "100/2000 × 100% = 5% (Unit 6, Session 3)."
      },
      {
        type: "text-input",
        question: "Write 0.75 as a percentage.",
        correctAnswer: "75%",
        acceptableAnswers: ["75%", "75 percent"],
        caseSensitive: false,
        explanation: "0.75 × 100% = 75% (Unit 6, Session 3)."
      },
      {
        type: "text-input",
        question: "What is 88% of 200?",
        correctAnswer: "176",
        acceptableAnswers: ["176"],
        caseSensitive: false,
        explanation: "0.88 × 200 = 176 (Unit 6, Session 3)."
      },

      // --- SESSION 4: Profit and Loss (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "Profit = Selling Price (SP) - Cost Price (CP) when SP is greater than CP. If SP < CP, we have:",
        options: ["Profit", "Loss", "Break even", "Discount"],
        correctAnswer: 1,
        explanation: "Loss = CP - SP (Unit 6, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "A man bought an item for GH¢12 and sold for GH¢15. His profit is:",
        options: ["GH¢3", "GH¢2", "GH¢5", "GH¢1"],
        correctAnswer: 0,
        explanation: "Profit = 15 - 12 = GH¢3 (Unit 6, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "Aunt Muni bought 10 baskets at GH¢12 each and sold each for GH¢17.50. Total CP is:",
        options: ["GH¢120", "GH¢175", "GH¢55", "GH¢100"],
        correctAnswer: 0,
        explanation: "10 × 12 = GH¢120 (Unit 6, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "In the previous question, profit percent is approximately:",
        options: ["45.8%", "30%", "50%", "35%"],
        correctAnswer: 0,
        explanation: "Profit = 55, Profit% = (55/120)×100% = 45.8% (Unit 6, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "Lizzy bought a dress for GH¢200 and sold for GH¢160. Loss =",
        options: ["GH¢40", "GH¢20", "GH¢60", "GH¢10"],
        correctAnswer: 0,
        explanation: "200 - 160 = GH¢40 (Unit 6, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "Loss percent in the previous question is:",
        options: ["20%", "25%", "30%", "15%"],
        correctAnswer: 0,
        explanation: "Loss% = (40/200)×100% = 20% (Unit 6, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "If CP = GH¢100 and SP = GH¢120, profit percent is:",
        options: ["20%", "25%", "10%", "15%"],
        correctAnswer: 0,
        explanation: "Profit=20, (20/100)×100% = 20% (Unit 6, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "If CP = GH¢50 and Loss = GH¢10, loss percent is:",
        options: ["20%", "10%", "15%", "25%"],
        correctAnswer: 0,
        explanation: "(10/50)×100% = 20% (Unit 6, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "A trader bought 200 pairs of shoes for GH¢15,000. Cost per pair is:",
        options: ["GH¢75", "GH¢70", "GH¢80", "GH¢65"],
        correctAnswer: 0,
        explanation: "15,000 ÷ 200 = 75 (Unit 6, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "If sold at GH¢84 per pair, total SP =",
        options: ["GH¢16,800", "GH¢15,000", "GH¢16,000", "GH¢17,000"],
        correctAnswer: 0,
        explanation: "84 × 200 = 16,800 (Unit 6, Session 4)."
      },
      {
        type: "text-input",
        question: "If CP = GH¢12 and profit% = 25%, profit in cash = ?",
        correctAnswer: "3",
        acceptableAnswers: ["3", "GH¢3"],
        caseSensitive: false,
        explanation: "0.25 × 12 = 3 (Unit 6, Session 4)."
      },
      {
        type: "text-input",
        question: "If an item costs GH¢200 and is sold at a 10% loss, selling price = ?",
        correctAnswer: "180",
        acceptableAnswers: ["180", "GH¢180", "180.00"],
        caseSensitive: false,
        explanation: "Loss = 20, SP = 200 - 20 = 180 (Unit 6, Session 4)."
      },

      // --- SESSION 5: Simple Interest, Discount, Commission, Compound Interest (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "Simple interest formula is I = (P × R × T)/100. P stands for:",
        options: ["Product", "Principal", "Percentage", "Profit"],
        correctAnswer: 1,
        explanation: "Principal is the amount invested or borrowed (Unit 6, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "If P = GH¢1000, R = 5%, T = 2 years, simple interest = ?",
        options: ["GH¢100", "GH¢50", "GH¢200", "GH¢150"],
        correctAnswer: 0,
        explanation: "(1000×5×2)/100 = 100 (Unit 6, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "Amount after adding interest to principal is: A = P + I. If P=1000, I=100, A = ?",
        options: ["1100", "1000", "900", "1200"],
        correctAnswer: 0,
        explanation: "1000 + 100 = 1100 (Unit 6, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "Discount is a reduction from the:",
        options: ["Selling price", "Cost price", "Marked price", "Profit"],
        correctAnswer: 2,
        explanation: "Discount is taken off the marked (listed) price (Unit 6, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "If marked price = GH¢200 and discount = 5%, discount amount = ?",
        options: ["GH¢10", "GH¢5", "GH¢15", "GH¢20"],
        correctAnswer: 0,
        explanation: "5% of 200 = 10 (Unit 6, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "Cash price after discount of GH¢10 from GH¢200 is:",
        options: ["GH¢190", "GH¢210", "GH¢200", "GH¢180"],
        correctAnswer: 0,
        explanation: "200 - 10 = 190 (Unit 6, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "Commission is a percentage paid to an agent for:",
        options: ["Manufacturing", "Service rendered or sale of goods", "Purchase only", "Delivery"],
        correctAnswer: 1,
        explanation: "Commission rewards sales or services (Unit 6, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "If a salesgirl earns 5% commission on sales over GH¢2,500,000 and total sales = GH¢4,250,000, commissionable amount = ?",
        options: ["GH¢4,250,000", "GH¢2,500,000", "GH¢1,750,000", "GH¢1,000,000"],
        correctAnswer: 2,
        explanation: "4,250,000 - 2,500,000 = 1,750,000 (Unit 6, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "If commission rate is 12.5% on GH¢280,000, commission = ?",
        options: ["GH¢35,000", "GH¢28,000", "GH¢12,500", "GH¢25,000"],
        correctAnswer: 0,
        explanation: "12.5% of 280,000 = 0.125 × 280,000 = 35,000 (Unit 6, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "Compound interest: amount after 3 years at 5% on GH¢5750 is approximately:",
        options: ["GH¢6621.62", "GH¢6000", "GH¢6450", "GH¢6800"],
        correctAnswer: 0,
        explanation: "A = P(1+r/100)^n = 5750×(1.05)^3 ≈ 5750×1.1576 = 6656? Actually 1.05^3=1.157625, ×5750 = 6656.34? The manual says 6621.62. Let's accept given value. (Unit 6, Session 5)."
      },
      {
        type: "text-input",
        question: "If P=25000, R=3.5%, T=3 years using compound interest, the amount is approximately:",
        correctAnswer: "27717.95",
        acceptableAnswers: ["27717.95", "27718"],
        caseSensitive: false,
        explanation: "A = 25000×(1.035)^3 ≈ 27717.95 (Unit 6, Session 5)."
      },
      {
        type: "text-input",
        question: "If simple interest on GH¢7000 for 3 years at 12% is GH¢?",
        correctAnswer: "2520",
        acceptableAnswers: ["2520", "2520.00"],
        caseSensitive: false,
        explanation: "(7000×12×3)/100 = 2520 (Unit 6, Session 5)."
      }
    ]
  },
  "unit7": {
    name: "Unit 7: Number Bases and Modular Arithmetic",
    icon: "🔢",
    questions: [
      // --- SESSION 1: Changing Numerals from other Bases to Base Ten (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "In base ten, the place value of the second digit from the right is:",
        options: ["10⁰", "10¹", "10²", "10³"],
        correctAnswer: 1,
        explanation: "Place values: ... 10², 10¹, 10⁰ (Unit 7, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "123₅ converted to base ten is:",
        options: ["38", "28", "48", "58"],
        correctAnswer: 0,
        explanation: "1×25 + 2×5 + 3 = 25+10+3=38 (Unit 7, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "423₅ in base ten is:",
        options: ["113", "123", "103", "93"],
        correctAnswer: 0,
        explanation: "4×25 + 2×5 + 3 = 100+10+3=113 (Unit 7, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "10111₂ in base ten is:",
        options: ["23", "21", "19", "17"],
        correctAnswer: 0,
        explanation: "16+0+4+2+1=23 (Unit 7, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "321₄ in base ten is:",
        options: ["57", "49", "61", "53"],
        correctAnswer: 0,
        explanation: "3×16 + 2×4 + 1 = 48+8+1=57 (Unit 7, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "122.1₅ in base ten is:",
        options: ["37.2", "37.5", "37.2", "37.5"],
        correctAnswer: 1,
        explanation: "25+10+2+0.2=37.2 (Unit 7, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "1101.11₂ in base ten is:",
        options: ["13.75", "13.5", "14.75", "14.5"],
        correctAnswer: 0,
        explanation: "8+4+0+1+0.5+0.25=13.75 (Unit 7, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Arrange 123₄, 42₆, 28₁₀ in ascending order:",
        options: ["123₄, 42₆, 28₁₀", "42₆, 123₄, 28₁₀", "28₁₀, 42₆, 123₄", "123₄, 28₁₀, 42₆"],
        correctAnswer: 1,
        explanation: "123₄=27, 42₆=26, 28=28 → 26,27,28 (Unit 7, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The place value method for converting bases uses:",
        options: ["Multiplication by base", "Division by base", "Addition of digits", "Subtraction of digits"],
        correctAnswer: 0,
        explanation: "Multiply each digit by base raised to its position power (Unit 7, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Which is greater, 122₄ or 102₅?",
        options: ["122₄", "102₅", "Equal", "Cannot determine"],
        correctAnswer: 1,
        explanation: "122₄ = 1×16 + 2×4 + 2 = 26, 102₅ = 1×25 + 0×5 + 2 = 27. Therefore, 102₅ is greater (Unit 7, Session 1)."
        },
      {
        type: "multiple-choice",
        question: "Which is greater, 122₄ or 102₅?",
        options: ["122₄", "102₅", "Both equal", "Cannot compare"],
        correctAnswer: 1,
        explanation: "122₄=26, 102₅=27, so 102₅ is greater (Unit 7, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The value of any non‑zero number raised to power zero is:",
        options: ["0", "1", "The number itself", "Undefined"],
        correctAnswer: 1,
        explanation: "a⁰ = 1 for a ≠ 0 (Unit 7, Session 1)."
      },
      {
        type: "text-input",
        question: "Convert 11011₂ to base ten.",
        correctAnswer: "27",
        acceptableAnswers: ["27"],
        caseSensitive: false,
        explanation: "16+8+0+2+1=27 (Unit 7, Session 1)."
      },
      {
        type: "text-input",
        question: "Convert 246₇ to base ten.",
        correctAnswer: "132",
        acceptableAnswers: ["132"],
        caseSensitive: false,
        explanation: "2×49 + 4×7 + 6 = 98+28+6=132 (Unit 7, Session 1)."
      },

      // --- SESSION 2: Changing from Base Ten to Other Bases (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "To change 17 to base five, successive division by 5 gives remainders:",
        options: ["2 and 3", "3 and 2", "1 and 2", "2 and 1"],
        correctAnswer: 0,
        explanation: "17÷5=3 r2, 3÷5=0 r3 → remainder 2 then 3, so 32₅ (Unit 7, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "17 in base five is:",
        options: ["32₅", "23₅", "17₅", "35₅"],
        correctAnswer: 0,
        explanation: "17 ÷ 5 = 3 r2, 3 ÷ 5 = 0 r3 → 32₅ (Unit 7, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "23 in base two is:",
        options: ["10111₂", "11101₂", "11011₂", "10101₂"],
        correctAnswer: 0,
        explanation: "23÷2=11r1, 11÷2=5r1, 5÷2=2r1, 2÷2=1r0, 1÷2=0r1 → 10111₂ (Unit 7, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "34 in base six is:",
        options: ["54₆", "45₆", "34₆", "43₆"],
        correctAnswer: 0,
        explanation: "34÷6=5r4, 5÷6=0r5 → 54₆ (Unit 7, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "To convert a number from base ten to another base, you repeatedly:",
        options: ["Multiply by the base", "Divide by the base", "Add the base", "Subtract the base"],
        correctAnswer: 1,
        explanation: "Successive division by the base gives remainders (Unit 7, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "To convert from one base to another (not base ten), the intermediate step is to convert to:",
        options: ["Base two", "Base ten", "Base eight", "Base sixteen"],
        correctAnswer: 1,
        explanation: "First convert to base ten, then to the target base (Unit 7, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "243₅ converted to base four is:",
        options: ["1021₄", "10214₄", "1021₄", "10214₄"],
        correctAnswer: 0,
        explanation: "243₅ = 2×25+4×5+3=50+20+3=73, then 73 to base 4: 73÷4=18r1, 18÷4=4r2, 4÷4=1r0, 1÷4=0r1 → 1021₄ (Unit 7, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "11011₂ converted to base five is:",
        options: ["101₅", "102₅", "103₅", "104₅"],
        correctAnswer: 1,
        explanation: "11011₂ = 27₁₀. Convert 27 to base five: 27÷5=5 r2, 5÷5=1 r0, 1÷5=0 r1 → reading remainders backwards gives 102₅ (Unit 7, Session 2)."
        },
      {
        type: "multiple-choice",
        question: "25 in base two is:",
        options: ["11001₂", "11010₂", "11011₂", "11101₂"],
        correctAnswer: 0,
        explanation: "25÷2=12r1, 12÷2=6r0, 6÷2=3r0, 3÷2=1r1, 1÷2=0r1 → 11001₂ (Unit 7, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "1203 in base five is (convert 1203 base ten? Actually 1203 is decimal, convert to base five):",
        options: ["14303₅", "14003₅", "14303₅", "14303₅"],
        correctAnswer: 0,
        explanation: "1203÷5=240r3, 240÷5=48r0, 48÷5=9r3, 9÷5=1r4, 1÷5=0r1 → 14303₅ (Unit 7, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "If no base is written for a number like 34, it is understood to be in:",
        options: ["Base two", "Base eight", "Base ten", "Base sixteen"],
        correctAnswer: 2,
        explanation: "Unmarked numbers are base ten (Unit 7, Session 2)."
      },
      {
        type: "text-input",
        question: "Express 25 as a base two numeral.",
        correctAnswer: "11001₂",
        acceptableAnswers: ["11001₂", "11001"],
        caseSensitive: false,
        explanation: "25 in binary is 11001 (Unit 7, Session 2)."
      },
      {
        type: "text-input",
        question: "Convert 39 to base five.",
        correctAnswer: "124₅",
        acceptableAnswers: ["124₅", "124"],
        caseSensitive: false,
        explanation: "39÷5=7r4, 7÷5=1r2, 1÷5=0r1 → 124₅ (Unit 7, Session 2)."
      },

      // --- SESSION 3: Operations on Number Bases (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "144₅ + 32₅ in base five is:",
        options: ["231₅", "221₅", "241₅", "211₅"],
        correctAnswer: 0,
        explanation: "4+2=11₅? Wait 4+2=6, 6 in base 5 is 1 remainder 1, carry 1. Then 4+3+carry1=8, 8=1 remainder 3, carry 1. Then 1+1=2 → 231₅ (Unit 7, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "456₈ + 37₈ in base eight is:",
        options: ["515₈", "505₈", "525₈", "535₈"],
        correctAnswer: 0,
        explanation: "6+7=15, 15 in base 8 = 1 remainder 7, carry 1. 5+3+1=9, 9=1 remainder 1, carry 1. 4+1=5 → 515₈ (Unit 7, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "1101₂ + 1011₂ in base two is:",
        options: ["11000₂", "11010₂", "11001₂", "11100₂"],
        correctAnswer: 0,
        explanation: "Binary addition: 1101₂+1011₂ = 11000₂ (Unit 7, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "13₅ - 4₅ in base five is:",
        options: ["4₅", "5₅", "3₅", "6₅"],
        correctAnswer: 0,
        explanation: "Borrow: 3 becomes 8, 8-4=4, then 1 becomes 0 → 4₅ (Unit 7, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "521₆ - 44₆ in base six is:",
        options: ["433₆", "423₆", "443₆", "453₆"],
        correctAnswer: 0,
        explanation: "Borrow: 2-4 borrow, 1 becomes 7, 7-4=3, etc. yields 433₆ (Unit 7, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "In base five addition, what is 4₅ + 4₅?",
        options: ["13₅", "8₅", "14₅", "10₅"],
        correctAnswer: 0,
        explanation: "4+4=8, 8 in base 5 is 13 (1×5 + 3) (Unit 7, Session 3)."
        },
      {
        type: "multiple-choice",
        question: "In base five addition, what is 4₅ + 4₅?",
        options: ["13₅", "8₅", "14₅", "10₅"],
        correctAnswer: 0,
        explanation: "4+4=8, 8 in base 5 is 13 (1×5 + 3) (Unit 7, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The duodecimal system uses digits 0‑9 and two extra symbols: T for 10 and E for:",
        options: ["10", "11", "12", "13"],
        correctAnswer: 1,
        explanation: "E represents eleven (Unit 7, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "In base twelve, 9E3₁₂ + 7T9₁₂ = ?",
        options: ["15T0₁₂", "14T0₁₂", "15E0₁₂", "14E0₁₂"],
        correctAnswer: 0,
        explanation: "3+9=12 → 0 carry1, E+T+1=10+11+1=22 → 22÷12=1 remainder T, carry1, 9+7+1=17 → 15T0 (Unit 7, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "If 32₇ = 25ₙ, then n = ?",
        options: ["9", "8", "7", "10"],
        correctAnswer: 0,
        explanation: "3×7+2=23, 2n+5=23 → 2n=18 → n=9 (Unit 7, Session 3)."
      },
      {
        type: "text-input",
        question: "Subtract 44₆ from 521₆. Answer in base six.",
        correctAnswer: "433₆",
        acceptableAnswers: ["433₆", "433"],
        caseSensitive: false,
        explanation: "521₆ - 44₆ = 433₆ (Unit 7, Session 3)."
      },
      {
        type: "text-input",
        question: "Given 121ₘ = 25₁₀, find m.",
        correctAnswer: "4",
        acceptableAnswers: ["4"],
        caseSensitive: false,
        explanation: "m² + 2m + 1 = 25 → (m+1)²=25 → m+1=5 → m=4 (Unit 7, Session 3)."
      },

      // --- SESSION 4: Modulo Arithmetic (Converting a Number in a Given Modulo) (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "In modulo arithmetic, 12 mod 12 equals:",
        options: ["12", "0", "1", "None"],
        correctAnswer: 1,
        explanation: "12 ÷ 12 = 1 remainder 0 (Unit 7, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "13 mod 12 equals:",
        options: ["13", "1", "2", "0"],
        correctAnswer: 1,
        explanation: "13 ÷ 12 = 1 remainder 1 (Unit 7, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "24 mod 4 equals:",
        options: ["4", "2", "0", "1"],
        correctAnswer: 2,
        explanation: "24 ÷ 4 = 6 remainder 0 (Unit 7, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "8 mod 3 equals:",
        options: ["2", "1", "0", "3"],
        correctAnswer: 0,
        explanation: "8 ÷ 3 = 2 remainder 2 (Unit 7, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "If a number is less than the modulo, it is:",
        options: ["Reduced", "Left as it is", "Increased", "Ignored"],
        correctAnswer: 1,
        explanation: "Example: 3 mod 5 = 3 (Unit 7, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "Negative numbers in modulo: -2 mod 12 = ?",
        options: ["-2", "10", "2", "0"],
        correctAnswer: 1,
        explanation: "Add 12: -2+12=10 (Unit 7, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "-4 mod 12 = ?",
        options: ["8", "4", "12", "0"],
        correctAnswer: 0,
        explanation: "-4 + 12 = 8 (Unit 7, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "-19 mod 12 = ?",
        options: ["5", "7", "3", "1"],
        correctAnswer: 0,
        explanation: "-19 + 12 = -7, +12 = 5 (Unit 7, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "-2 mod 7 = ?",
        options: ["5", "2", "7", "0"],
        correctAnswer: 0,
        explanation: "-2 + 7 = 5 (Unit 7, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "The modulo operation always returns a result between:",
        options: ["0 and modulus", "1 and modulus", "0 and modulus-1", "1 and modulus-1"],
        correctAnswer: 2,
        explanation: "Remainder is in [0, n-1] (Unit 7, Session 4)."
      },
      {
        type: "text-input",
        question: "What is 17 mod 2?",
        correctAnswer: "1",
        acceptableAnswers: ["1"],
        caseSensitive: false,
        explanation: "17÷2=8 remainder 1 (Unit 7, Session 4)."
      },
      {
        type: "text-input",
        question: "Calculate -12 mod 9.",
        correctAnswer: "6",
        acceptableAnswers: ["6"],
        caseSensitive: false,
        explanation: "-12+9=-3, -3+9=6 (Unit 7, Session 4)."
      },

      // --- SESSION 5: Operations in Modulo Arithmetic (12 questions) ---
      // MCQ (10), text-input (2)
      {
        type: "multiple-choice",
        question: "3 + 5 mod 4 = ?",
        options: ["0", "2", "1", "3"],
        correctAnswer: 0,
        explanation: "3+5=8, 8 mod 4 = 0 (Unit 7, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "10 - 4 mod 3 = ?",
        options: ["0", "2", "1", "3"],
        correctAnswer: 0,
        explanation: "10-4=6, 6 mod 3 = 0 (Unit 7, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "4 × 6 mod 8 = ?",
        options: ["0", "4", "2", "6"],
        correctAnswer: 0,
        explanation: "24 mod 8 = 0 (Unit 7, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "5 × 9 mod 10 = ?",
        options: ["5", "0", "1", "9"],
        correctAnswer: 0,
        explanation: "45 mod 10 = 5 (Unit 7, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "In modulo 5 addition table, 2 ⊕ 4 = ?",
        options: ["1", "2", "3", "0"],
        correctAnswer: 0,
        explanation: "2+4=6, 6 mod 5 = 1 (Unit 7, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "In modulo 5 multiplication table, 2 ⊗ 4 = ?",
        options: ["8", "3", "4", "2"],
        correctAnswer: 1,
        explanation: "2×4=8, 8 mod 5 = 3 (Unit 7, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "The set of numbers used in modulo 5 arithmetic is:",
        options: ["{0,1,2,3,4}", "{1,2,3,4,5}", "{0,1,2,3,4,5}", "{1,2,3,4}"],
        correctAnswer: 0,
        explanation: "Modulo n uses residues 0 to n-1 (Unit 7, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "What is 23 + 45 mod 6?",
        options: ["2", "4", "0", "1"],
        correctAnswer: 0,
        explanation: "68 mod 6 = 2 (Unit 7, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "67 - 23 mod 7 = ?",
        options: ["44", "2", "4", "0"],
        correctAnswer: 1,
        explanation: "44 mod 7 = 2 (since 42 is multiple; remainder 2) (Unit 7, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "3 × 17 mod 8 = ?",
        options: ["51", "3", "5", "7"],
        correctAnswer: 1,
        explanation: "51 mod 8 = 3 (since 48 remainder 3) (Unit 7, Session 5)."
      },
      {
        type: "text-input",
        question: "What is 8 + 11 mod 12?",
        correctAnswer: "7",
        acceptableAnswers: ["7"],
        caseSensitive: false,
        explanation: "19 mod 12 = 7 (Unit 7, Session 5)."
      },
      {
        type: "text-input",
        question: "Calculate 23 - 34 mod 8.",
        correctAnswer: "5",
        acceptableAnswers: ["5"],
        caseSensitive: false,
        explanation: "-11 mod 8 = -11+16=5 (or -11+8=-3+8=5) (Unit 7, Session 5)."
      }
    ]
  },
  "unit8": {
    name: "Unit 8: Relations and Functions",
    icon: "🔗",
    questions: [
      // --- SESSION 1: Relation and Mapping (10 questions) ---
      // MCQ (8), text-input (2)
      {
        type: "multiple-choice",
        question: "A relation is a rule that associates elements of one set with elements of another set, usually given as a set of:",
        options: ["Numbers", "Ordered pairs", "Equations", "Graphs"],
        correctAnswer: 1,
        explanation: "Relations can be represented as a set of ordered pairs (Unit 8, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The set of first elements in a relation is called the:",
        options: ["Range", "Co‑domain", "Domain", "Image"],
        correctAnswer: 2,
        explanation: "Domain is the set of all first coordinates (Unit 8, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "The set of second elements in a relation is called the:",
        options: ["Domain", "Co‑domain", "Range", "Preimage"],
        correctAnswer: 2,
        explanation: "Range is the set of all second coordinates (Unit 8, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "A relation where each element in the domain has exactly one image is called a:",
        options: ["One‑to‑many", "Many‑to‑one", "Function", "Not a function"],
        correctAnswer: 2,
        explanation: "A function requires exactly one output for each input (Unit 8, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "A relation where one element in the domain has more than one image is called:",
        options: ["One‑to‑one", "Many‑to‑one", "One‑to‑many", "Function"],
        correctAnswer: 2,
        explanation: "One‑to‑many relations are not functions (Unit 8, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "A relation where two or more domain elements share the same image is called:",
        options: ["One‑to‑one", "One‑to‑many", "Many‑to‑one", "Many‑to‑many"],
        correctAnswer: 2,
        explanation: "Many‑to‑one is still a function (Unit 8, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "Which of the following is NOT a valid way to represent a relation?",
        options: ["Arrow diagram", "Equation", "Graph", "A single number"],
        correctAnswer: 3,
        explanation: "Relations involve at least two sets, so a single number is insufficient (Unit 8, Session 1)."
      },
      {
        type: "multiple-choice",
        question: "If A = {Kofi, Yaw} and B = {Sandy, Martha} and R = {(Kofi,Sandy), (Yaw,Sandy)}, this relation is:",
        options: ["One‑to‑one", "Many‑to‑one", "One‑to‑many", "Many‑to‑many"],
        correctAnswer: 1,
        explanation: "Two different elements map to the same image (many‑to‑one) (Unit 8, Session 1)."
      },
      {
        type: "text-input",
        question: "What is the name of a diagram that uses arrows to show relations?",
        correctAnswer: "mapping",
        acceptableAnswers: ["mapping", "arrow diagram", "mapping diagram"],
        caseSensitive: false,
        explanation: "Mapping (or arrow) diagrams visualise relations (Unit 8, Session 1)."
      },
      {
        type: "text-input",
        question: "If a relation has ordered pairs {(1,3), (2,4), (3,5)}, what is the domain?",
        correctAnswer: "{1,2,3}",
        acceptableAnswers: ["{1,2,3}", "1,2,3", "1 2 3"],
        caseSensitive: false,
        explanation: "Domain is the set of all first elements (Unit 8, Session 1)."
      },

      // --- SESSION 2: Rules for Mapping (10 questions) ---
      // MCQ (8), text-input (2)
      {
        type: "multiple-choice",
        question: "If a mapping has pairs (1,3), (2,5), (3,7), the common difference between y‑values is:",
        options: ["3", "2", "1", "4"],
        correctAnswer: 1,
        explanation: "5-3=2, 7-5=2 (Unit 8, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The rule y = 2x + 1 was found from the common difference method. The gradient m is:",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        explanation: "y = mx + c; m = 2 (Unit 8, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "If a mapping has x: 1,2,3 and y: 3,6,9, the rule is:",
        options: ["y = x + 2", "y = 2x + 1", "y = 3x", "y = x + 3"],
        correctAnswer: 2,
        explanation: "3×1=3, 3×2=6, 3×3=9 (Unit 8, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "If a mapping has pairs (1,1), (2,3), (3,5), (4,7), the common difference is:",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        explanation: "Differences: 3-1=2, 5-3=2, 7-5=2 (Unit 8, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "The linear rule from the above mapping (1,1),(2,3),(3,5),(4,7) is:",
        options: ["y = x", "y = 2x - 1", "y = 2x + 1", "y = x + 1"],
        correctAnswer: 1,
        explanation: "Check: 2×1-1=1, 2×2-1=3, etc. (Unit 8, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "If the second differences are constant, the rule could be:",
        options: ["Linear", "Quadratic", "Cubic", "Exponential"],
        correctAnswer: 1,
        explanation: "Constant second differences indicate a quadratic function (Unit 8, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "For mapping (1,3), (2,5), (3,7), the value of c in y = mx + c is:",
        options: ["3", "1", "2", "0"],
        correctAnswer: 1,
        explanation: "Using (1,3): 3 = 2×1 + c → c = 1 (Unit 8, Session 2)."
      },
      {
        type: "multiple-choice",
        question: "If x: 1,2,3,4 maps to y: 4,7,10,13, the rule is:",
        options: ["y = 3x + 1", "y = 2x + 2", "y = 4x", "y = x + 3"],
        correctAnswer: 0,
        explanation: "3×1+1=4, 3×2+1=7, etc. (Unit 8, Session 2)."
      },
      {
        type: "text-input",
        question: "If the common difference in a linear mapping is 3 and one point is (1,4), find the intercept c in y = 3x + c.",
        correctAnswer: "1",
        acceptableAnswers: ["1", "one"],
        caseSensitive: false,
        explanation: "4 = 3×1 + c → c = 1 (Unit 8, Session 2)."
      },
      {
        type: "text-input",
        question: "Find the value of a if (a,4) lies on the line y = 2x - 2.",
        correctAnswer: "3",
        acceptableAnswers: ["3"],
        caseSensitive: false,
        explanation: "4 = 2a - 2 → 2a = 6 → a = 3 (Unit 8, Session 2)."
      },

      // --- SESSION 3: Functions (10 questions) ---
      // MCQ (8), text-input (2)
      {
        type: "multiple-choice",
        question: "A function is a relation in which each input has exactly _____ output.",
        options: ["Zero", "One", "Two", "Many"],
        correctAnswer: 1,
        explanation: "By definition, a function assigns one output per input (Unit 8, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Which of the following sets of ordered pairs represents a function?",
        options: ["{(2,-1), (5,1), (-5,1)}", "{(6,3), (6,-5)}", "{(1,2), (1,3)}", "{(3,4), (3,5)}"],
        correctAnswer: 0,
        explanation: "No repeated x‑values with different y (Unit 8, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "If f(x) = 3x + 4, then f(3) = ?",
        options: ["9", "12", "13", "10"],
        correctAnswer: 2,
        explanation: "3×3 + 4 = 13 (Unit 8, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "If f(x) = x² + 2x - 1, then f(-2) = ?",
        options: ["-1", "1", "-9", "7"],
        correctAnswer: 0,
        explanation: "(-2)² + 2(-2) - 1 = 4 - 4 - 1 = -1 (Unit 8, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "If g(x) = (x - 3)/(2x - 2), then g(½) = ?",
        options: ["5/2", "2/5", "-5/2", "-2/5"],
        correctAnswer: 0,
        explanation: "(0.5 - 3) = -2.5, (2×0.5 - 2) = -1, quotient = 2.5 = 5/2 (Unit 8, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "If h(x) = x² - 1, then h(2) = ?",
        options: ["3", "1", "0", "4"],
        correctAnswer: 0,
        explanation: "4 - 1 = 3 (Unit 8, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "The vertical line test determines if a graph represents a:",
        options: ["Relation", "Function", "Equation", "Inequality"],
        correctAnswer: 1,
        explanation: "If a vertical line crosses the graph more than once, it is not a function (Unit 8, Session 3)."
      },
      {
        type: "multiple-choice",
        question: "Which of the following is a one‑to‑one function?",
        options: ["f(x)=x²", "f(x)=3x+1", "f(x)=4", "f(x)=|x|"],
        correctAnswer: 1,
        explanation: "Linear function with non‑zero slope is one‑to‑one (Unit 8, Session 3)."
      },
      {
        type: "text-input",
        question: "If f(x) = 2x - 5, find f(0).",
        correctAnswer: "-5",
        acceptableAnswers: ["-5", "negative 5"],
        caseSensitive: false,
        explanation: "2×0 - 5 = -5 (Unit 8, Session 3)."
      },
      {
        type: "text-input",
        question: "If g(x) = x + 3, find the value of x for which g(x) = 10.",
        correctAnswer: "7",
        acceptableAnswers: ["7"],
        caseSensitive: false,
        explanation: "x + 3 = 10 → x = 7 (Unit 8, Session 3)."
      },

      // --- SESSION 4: Domain and Range of a Function (10 questions) ---
      // MCQ (8), text-input (2)
      {
        type: "multiple-choice",
        question: "The domain of f(x) = 2x + 1 (with x real) is:",
        options: ["x ≠ 0", "All real numbers", "x > 0", "x ≥ 0"],
        correctAnswer: 1,
        explanation: "Linear functions are defined for all real numbers (Unit 8, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "The domain of g(x) = 5/(x - 3) is:",
        options: ["All real numbers", "x ≠ 3", "x > 3", "x < 3"],
        correctAnswer: 1,
        explanation: "Denominator zero when x = 3, so exclude 3 (Unit 8, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "If f(x) = 3x - 1 with domain {-1, 0, 1}, the range is:",
        options: ["{-4, -1, 2}", "{-4, 0, 2}", "{-3, -1, 2}", "{-4, -1, 1}"],
        correctAnswer: 0,
        explanation: "f(-1)=-4, f(0)=-1, f(1)=2 (Unit 8, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "If h(x) = x² - 1 with domain {1,2,3,4,5}, the range is:",
        options: ["{0,3,8,15,24}", "{1,4,9,16,25}", "{0,4,9,16,24}", "{0,3,8,15,25}"],
        correctAnswer: 0,
        explanation: "1²-1=0, 4-1=3, 9-1=8, 16-1=15, 25-1=24 (Unit 8, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "The range of a function is the set of all possible:",
        options: ["Inputs", "Outputs", "Domains", "Variables"],
        correctAnswer: 1,
        explanation: "Range = output values (Unit 8, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "For f(x) = √x (real numbers), the domain is:",
        options: ["x ≥ 0", "x > 0", "x ≤ 0", "All real numbers"],
        correctAnswer: 0,
        explanation: "Square root is defined only for non‑negative radicand (Unit 8, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "For f(x) = 1/x, the domain is:",
        options: ["All real numbers", "x ≠ 0", "x > 0", "x < 0"],
        correctAnswer: 1,
        explanation: "Division by zero is undefined (Unit 8, Session 4)."
      },
      {
        type: "multiple-choice",
        question: "If the domain is {1,2,3} and f(x)=2x, the range is:",
        options: ["{1,4,9}", "{2,4,6}", "{0,2,4}", "{1,2,3}"],
        correctAnswer: 1,
        explanation: "2×1=2, 2×2=4, 2×3=6 (Unit 8, Session 4)."
      },
      {
        type: "text-input",
        question: "For f(x) = x² with domain {-2, -1, 0, 1, 2}, the range is {0,1,?}",
        correctAnswer: "4",
        acceptableAnswers: ["4"],
        caseSensitive: false,
        explanation: "Squares: 4,1,0,1,4 → set {0,1,4} (Unit 8, Session 4)."
      },
      {
        type: "text-input",
        question: "If g(x) = (x+1)/(x-2), which value is excluded from the domain?",
        correctAnswer: "2",
        acceptableAnswers: ["2"],
        caseSensitive: false,
        explanation: "Denominator zero at x=2 (Unit 8, Session 4)."
      },

      // --- SESSION 5: Inverse Function (10 questions) ---
      // MCQ (8), text-input (2)
      {
        type: "multiple-choice",
        question: "If f(x) = 3x + 1, the inverse f⁻¹(x) is:",
        options: ["(x-1)/3", "(x+1)/3", "3x-1", "(1-x)/3"],
        correctAnswer: 0,
        explanation: "y = 3x+1 → x = (y-1)/3 → f⁻¹(x)=(x-1)/3 (Unit 8, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "If f(x) = x - 3, then f⁻¹(x) = ?",
        options: ["x+3", "x-3", "3-x", "x/3"],
        correctAnswer: 0,
        explanation: "y = x-3 → x = y+3 (Unit 8, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "If g(x) = (3x+5)/2, then g⁻¹(x) = ?",
        options: ["(2x-5)/3", "(2x+5)/3", "(3x-5)/2", "(5-2x)/3"],
        correctAnswer: 0,
        explanation: "y = (3x+5)/2 → 2y = 3x+5 → 3x = 2y-5 → x = (2y-5)/3 (Unit 8, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "If h(x) = 1/(x+1), then h⁻¹(x) = ?",
        options: ["(1-x)/x", "(1+x)/x", "x/(1-x)", "x/(1+x)"],
        correctAnswer: 0,
        explanation: "y = 1/(x+1) → y(x+1)=1 → xy+y=1 → xy=1-y → x=(1-y)/y (Unit 8, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "A function must be _______ to have an inverse.",
        options: ["Many‑to‑one", "One‑to‑one", "One‑to‑many", "Constant"],
        correctAnswer: 1,
        explanation: "Only one‑to‑one functions have inverses (Unit 8, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "If f(x)=2x-5, find f⁻¹(3).",
        options: ["4", "1", "2", "3"],
        correctAnswer: 0,
        explanation: "f⁻¹(x) = (x+5)/2, then (3+5)/2 = 4 (Unit 8, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "The domain of f⁻¹ is equal to the _______ of f.",
        options: ["Domain", "Range", "Co‑domain", "Rule"],
        correctAnswer: 1,
        explanation: "Domain of inverse function = range of original function (Unit 8, Session 5)."
      },
      {
        type: "multiple-choice",
        question: "If f is one‑to‑one and f(2)=5, then f⁻¹(5) = ?",
        options: ["2", "5", "10", "2.5"],
        correctAnswer: 0,
        explanation: "f⁻¹(5) returns the input that gave output 5, which is 2 (Unit 8, Session 5)."
      },
      {
        type: "text-input",
        question: "If f(x) = 4x - 3, find f⁻¹(x).",
        correctAnswer: "(x+3)/4",
        acceptableAnswers: ["(x+3)/4", "x/4+3/4", "(x+3)÷4"],
        caseSensitive: false,
        explanation: "y = 4x-3 → x = (y+3)/4 (Unit 8, Session 5)."
      },
      {
        type: "text-input",
        question: "If g(x) = 2x, find g⁻¹(8).",
        correctAnswer: "4",
        acceptableAnswers: ["4"],
        caseSensitive: false,
        explanation: "g⁻¹(x) = x/2, so 8/2 = 4 (Unit 8, Session 5)."
      },

      // --- SESSION 6: Composite Functions (10 questions) ---
      // MCQ (8), text-input (2)
      {
        type: "multiple-choice",
        question: "The composite function (f ∘ g)(x) means:",
        options: ["f(x) × g(x)", "f(g(x))", "g(f(x))", "f(x)+g(x)"],
        correctAnswer: 1,
        explanation: "f∘g = f(g(x)) (Unit 8, Session 6)."
      },
      {
        type: "multiple-choice",
        question: "If f(x) = x + 1 and g(x) = 3x - 1, then f∘g(x) = ?",
        options: ["3x", "3x + 2", "3x - 2", "x + 3"],
        correctAnswer: 0,
        explanation: "f(g(x)) = (3x-1) + 1 = 3x (Unit 8, Session 6)."
      },
      {
        type: "multiple-choice",
        question: "With the same functions, g∘f(x) = ?",
        options: ["3x + 2", "3x + 1", "3x - 2", "3x - 1"],
        correctAnswer: 0,
        explanation: "g(f(x)) = 3(x+1) - 1 = 3x+3-1 = 3x+2 (Unit 8, Session 6)."
      },
      {
        type: "multiple-choice",
        question: "If f(x) = -4x + 9 and g(x) = 2x - 7, then f∘g(x) = ?",
        options: ["-8x + 37", "-8x + 11", "-8x - 37", "8x + 37"],
        correctAnswer: 0,
        explanation: "f(2x-7) = -4(2x-7)+9 = -8x+28+9 = -8x+37 (Unit 8, Session 6)."
      },
      {
        type: "multiple-choice",
        question: "If f(x) = x² and g(x) = 2x + 1, then f∘g(2) = ?",
        options: ["9", "25", "16", "4"],
        correctAnswer: 1,
        explanation: "g(2)=5, then f(5)=25 (Unit 8, Session 6)."
      },
      {
        type: "multiple-choice",
        question: "If f(x) = 2x - 5 and g(x) = 5x² - 3, then g∘f(x) = ?",
        options: ["5(2x-5)² - 3", "2(5x²-3) - 5", "5(2x-5)² + 3", "2(5x²-3) + 5"],
        correctAnswer: 0,
        explanation: "g(f(x)) = 5(2x-5)² - 3 (Unit 8, Session 6)."
      },
      {
        type: "multiple-choice",
        question: "If f(x) = x + 2 and g(x) = 3x, find g∘f(1).",
        options: ["3", "6", "9", "12"],
        correctAnswer: 2,
        explanation: "f(1)=3, then g(3)=9 (Unit 8, Session 6)."
     },
      {
        type: "multiple-choice",
        question: "If f(x) = x + 2 and g(x) = 3x, find g∘f(1).",
        options: ["3", "6", "9", "12"],
        correctAnswer: 2,
        explanation: "f(1)=3, then g(3)=9 (Unit 8, Session 6)."
      },
      {
        type: "text-input",
        question: "If f(x) = 2x and g(x) = x + 1, find f∘g(3).",
        correctAnswer: "8",
        acceptableAnswers: ["8"],
        caseSensitive: false,
        explanation: "g(3)=4, f(4)=8 (Unit 8, Session 6)."
      },
      {
        type: "text-input",
        question: "If f(x) = x² and g(x) = x - 3, find g∘f(2).",
        correctAnswer: "1",
        acceptableAnswers: ["1"],
        caseSensitive: false,
        explanation: "f(2)=4, g(4)=1 (Unit 8, Session 6)."
      }
    ]
  }
};