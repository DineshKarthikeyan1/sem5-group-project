// Transaction parsing utility for voice input
export class TransactionParser {
  constructor() {
    // Common keywords for different categories
    this.categories = {
      "Food & Drinks": [
        "coffee",
        "restaurant",
        "food",
        "lunch",
        "dinner",
        "breakfast",
        "starbucks",
        "mcdonalds",
        "pizza",
        "burger",
        "drink",
        "bar",
        "grocery",
        "groceries",
        "supermarket",
        "cafe",
      ],
      Transportation: [
        "gas",
        "fuel",
        "uber",
        "lyft",
        "taxi",
        "bus",
        "train",
        "metro",
        "parking",
        "car",
        "vehicle",
        "transport",
        "flight",
        "airline",
      ],
      Shopping: [
        "shopping",
        "store",
        "mall",
        "amazon",
        "online",
        "clothes",
        "clothing",
        "shoes",
        "electronics",
        "book",
        "gift",
      ],
      Entertainment: [
        "movie",
        "cinema",
        "theater",
        "concert",
        "game",
        "netflix",
        "spotify",
        "entertainment",
        "fun",
        "hobby",
      ],
      Healthcare: [
        "doctor",
        "hospital",
        "pharmacy",
        "medicine",
        "health",
        "dental",
        "medical",
        "clinic",
      ],
      Utilities: [
        "electricity",
        "water",
        "gas bill",
        "internet",
        "phone",
        "utility",
        "bill",
        "rent",
        "mortgage",
      ],
      Income: [
        "salary",
        "wage",
        "income",
        "received",
        "earned",
        "bonus",
        "freelance",
        "payment",
        "refund",
        "cashback",
      ],
    };

    // Income indicators
    this.incomeKeywords = [
      "received",
      "earned",
      "got",
      "income",
      "salary",
      "wage",
      "bonus",
      "freelance",
      "payment",
      "refund",
      "cashback",
      "deposit",
      "transfer in",
    ];

    // Expense indicators
    this.expenseKeywords = [
      "spent",
      "paid",
      "bought",
      "purchased",
      "cost",
      "charged",
      "bill",
      "expense",
      "withdraw",
      "transfer out",
    ];
  }

  // Parse voice input into transaction data (supports multiple transactions)
  parseTransaction(text) {
    const transactions = this.parseMultipleTransactions(text);

    // For backward compatibility, return the first transaction if only one
    if (transactions.length === 1) {
      return transactions[0];
    }

    // If multiple transactions, return an array
    return transactions;
  }

  // Parse multiple transactions from a single voice input
  parseMultipleTransactions(text) {
    const transactions = [];

    // Split text by common conjunctions that separate transactions
    const separators =
      /\s+and\s+(?=.*\$)|,\s*and\s+(?=.*\$)|,\s+(?=.*\$)|;\s*(?=.*\$)/gi;
    const segments = text.split(separators);

    // If no separators found, treat as single transaction
    if (segments.length === 1) {
      const transaction = this.parseSingleTransaction(text);
      if (transaction.amount !== 0) {
        transactions.push(transaction);
      }
      return transactions;
    }

    // Process each segment
    segments.forEach((segment, index) => {
      const trimmedSegment = segment.trim();
      if (!trimmedSegment) return;

      // For segments after the first, we might need to add context
      let processedSegment = trimmedSegment;

      // If segment doesn't start with "I", add context from previous patterns
      if (
        index > 0 &&
        !processedSegment
          .toLowerCase()
          .match(/^(i\s+)?(spent|received|earned|got|paid|bought)/)
      ) {
        // Check if it looks like an income or expense based on keywords
        const lowerSegment = processedSegment.toLowerCase();
        if (
          this.incomeKeywords.some((keyword) => lowerSegment.includes(keyword))
        ) {
          processedSegment = `I received ${processedSegment}`;
        } else {
          processedSegment = `I spent ${processedSegment}`;
        }
      }

      const transaction = this.parseSingleTransaction(processedSegment);
      if (transaction.amount !== 0) {
        // Add unique ID for each transaction
        transaction.id = Date.now() + index;
        transactions.push(transaction);
      }
    });

    return transactions;
  }

  // Parse a single transaction from text
  parseSingleTransaction(text) {
    const lowerText = text.toLowerCase();

    // Extract amount
    const amount = this.extractAmount(text);

    // Determine transaction type
    const type = this.determineType(lowerText);

    // Extract category
    const category = this.extractCategory(lowerText, type);

    // Extract description (clean up the text)
    const description = this.extractDescription(text);

    // Create transaction object
    return {
      id: Date.now(),
      description: description,
      amount: type === "income" ? Math.abs(amount) : -Math.abs(amount),
      category: category,
      date: new Date().toISOString().split("T")[0],
      type: type,
      source: "voice",
    };
  }

  // Extract monetary amount from text
  extractAmount(text) {
    // Look for various amount patterns
    const patterns = [
      /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, // $123.45 or $1,234.56
      /(\d+(?:,\d{3})*(?:\.\d{2})?) dollars?/gi, // 123.45 dollars
      /(\d+(?:,\d{3})*(?:\.\d{2})?) bucks?/gi, // 123.45 bucks
      /(\d+(?:,\d{3})*(?:\.\d{2})?)/g, // Just numbers
    ];

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        // Take the first match and remove commas
        const amountStr = matches[0][1].replace(/,/g, "");
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }

    return 0;
  }

  // Determine if transaction is income or expense
  determineType(lowerText) {
    // Check for income keywords
    const hasIncomeKeyword = this.incomeKeywords.some((keyword) =>
      lowerText.includes(keyword)
    );

    // Check for expense keywords
    const hasExpenseKeyword = this.expenseKeywords.some((keyword) =>
      lowerText.includes(keyword)
    );

    // If both or neither, use context clues
    if (hasIncomeKeyword && !hasExpenseKeyword) {
      return "income";
    } else if (hasExpenseKeyword && !hasIncomeKeyword) {
      return "expense";
    } else {
      // Default logic: if it mentions receiving/earning, it's income
      if (
        lowerText.includes("received") ||
        lowerText.includes("earned") ||
        lowerText.includes("got paid") ||
        lowerText.includes("salary")
      ) {
        return "income";
      }
      // Otherwise, assume expense
      return "expense";
    }
  }

  // Extract category based on keywords
  extractCategory(lowerText, type) {
    if (type === "income") {
      return "Income";
    }

    // Check each category for matching keywords
    for (const [category, keywords] of Object.entries(this.categories)) {
      if (category === "Income") continue; // Skip income category for expenses

      const hasKeyword = keywords.some((keyword) =>
        lowerText.includes(keyword.toLowerCase())
      );

      if (hasKeyword) {
        return category;
      }
    }

    return "Other";
  }

  // Clean up and extract description
  extractDescription(text) {
    // Remove common filler words and clean up
    let description = text.trim();

    // Remove leading phrases like "I spent", "I paid", etc.
    const leadingPhrases = [
      /^i\s+(spent|paid|bought|purchased|got|received|earned)\s+/i,
      /^(spent|paid|bought|purchased|got|received|earned)\s+/i,
    ];

    for (const phrase of leadingPhrases) {
      description = description.replace(phrase, "");
    }

    // Capitalize first letter
    description = description.charAt(0).toUpperCase() + description.slice(1);

    return description || "Voice transaction";
  }

  // Get suggestions for improving voice input
  getSuggestions() {
    return [
      // Single transaction examples
      "Single: 'I spent $15 on coffee at Starbucks'",
      "Single: 'I received $500 salary payment'",
      "Single: 'Paid $45 for gas at Shell station'",

      // Multiple transaction examples
      "Multiple: 'I spent $15 on coffee and received $500 salary'",
      "Multiple: 'I paid $50 for groceries and $20 for gas'",
      "Multiple: 'Bought lunch for $12, and got $100 bonus'",
      "Multiple: 'I spent $25 at Starbucks, $40 on groceries, and received $200 freelance payment'",
    ];
  }

  // Validate parsed transaction(s)
  validateTransaction(transaction) {
    // Handle array of transactions
    if (Array.isArray(transaction)) {
      const results = transaction.map((t, index) =>
        this.validateSingleTransaction(t, index)
      );
      const allErrors = results.flatMap((r) => r.errors);

      return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        results: results,
      };
    }

    // Handle single transaction
    return this.validateSingleTransaction(transaction);
  }

  // Validate a single transaction
  validateSingleTransaction(transaction, index = null) {
    const errors = [];
    const prefix = index !== null ? `Transaction ${index + 1}: ` : "";

    if (!transaction.amount || transaction.amount === 0) {
      errors.push(
        `${prefix}Could not detect amount. Please mention a dollar amount.`
      );
    }

    if (!transaction.description || transaction.description.length < 3) {
      errors.push(
        `${prefix}Description is too short. Please provide more details.`
      );
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }
}

export default new TransactionParser();
