// Question answer variation generator for MathQuest
// Creates multiple correct answer variations to prevent single-answer memorization

export interface AnswerVariation {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export class QuestionVariationGenerator {
  // Generate multiple choice variations for a given question
  static generateMultipleChoiceVariations(
    correctAnswer: string,
    questionType: string,
    difficulty: number = 1
  ): AnswerVariation[] {
    const allVariations: AnswerVariation[] = [];
    
    // Generate multiple correct answer variations
    const correctVariations = this.generateCorrectAnswerVariations(correctAnswer, questionType);
    
    // 1. Pick ONE correct variation randomly to be 'THE' correct answer for this MCQ instance
    const selectedCorrect = this.shuffleArray(correctVariations)[0];
    
    allVariations.push({
      text: selectedCorrect,
      isCorrect: true,
      explanation: this.getExplanation(correctAnswer, questionType)
    });
    
    // 2. Generate distractors
    const distractors = this.generateDistractors(correctAnswer, questionType, difficulty);
    
    // Ensure distractors don't include ANY of the correct variations
    const filteredDistractors = distractors.filter(d => !correctVariations.includes(d));
    
    // 3. Add up to 3 distractors to make it 4 options total
    filteredDistractors.slice(0, 3).forEach(distractor => {
      allVariations.push({
        text: distractor,
        isCorrect: false,
        explanation: this.getWrongAnswerExplanation(distractor, correctAnswer)
      });
    });
    
    // Shuffle and return
    return this.shuffleArray(allVariations);
  }
  
  // Generate multiple correct answer variations
  private static generateCorrectAnswerVariations(
    correctAnswer: string,
    questionType: string
  ): string[] {
    // Keep it simple: only the original correct answer should be shown as an option
    // unless it's a very specific case.
    return [correctAnswer.trim()];
  }
  
  // Find factors of a number
  private static findFactors(n: number): [number, number][] {
    const factors: [number, number][] = [];
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        factors.push([i, n / i]);
      }
    }
    return factors;
  }
  
  // Generate distractors based on question type and difficulty
  private static generateDistractors(
    correctAnswer: string,
    questionType: string,
    difficulty: number
  ): string[] {
    const distractors: string[] = [];
    
    // Parse correct answer if it's a number
    const correctNum = parseFloat(correctAnswer);
    
    if (!isNaN(correctNum)) {
      // Mathematical distractors
      if (questionType.includes('addition') || questionType.includes('plus')) {
        distractors.push(
          (correctNum + 1).toString(),
          (correctNum - 1).toString(),
          (correctNum + 10).toString(),
          (correctNum - 10).toString()
        );
      } else if (questionType.includes('subtraction') || questionType.includes('minus')) {
        distractors.push(
          (correctNum + 1).toString(),
          (correctNum - 1).toString(),
          (correctNum + 5).toString(),
          (correctNum - 5).toString()
        );
      } else if (questionType.includes('multiplication') || questionType.includes('times')) {
        distractors.push(
          (correctNum + correctNum).toString(),
          (correctNum - correctNum/2).toString(),
          (correctNum * 2).toString(),
          (correctNum / 2).toString()
        );
      } else if (questionType.includes('division') || questionType.includes('divide')) {
        distractors.push(
          (correctNum + 1).toString(),
          (correctNum - 1).toString(),
          (correctNum * 2).toString(),
          (correctNum / 2).toString()
        );
      } else {
        // General mathematical distractors
        distractors.push(
          (correctNum + 1).toString(),
          (correctNum - 1).toString(),
          (correctNum + 2).toString(),
          (correctNum - 2).toString()
        );
      }
    } else {
      // Non-numerical distractors
      distractors.push(
        'Not sure',
        'None of the above',
        'Cannot determine',
        'Insufficient information'
      );
    }
    
    // Filter out duplicates and the correct answer
    return distractors
      .filter(d => d !== correctAnswer)
      .filter((d, i, arr) => arr.indexOf(d) === i)
      .slice(0, 3); // Maximum 3 distractors
  }
  
  // Generate explanation for correct answer
  private static getExplanation(correctAnswer: string, questionType: string): string {
    const explanations: Record<string, string> = {
      'addition': 'Qo\'shish amalini to\'g\'ri bajardingiz. Sonlarni yig\'indisi to\'g\'ri javob.',
      'subtraction': 'Ayirish amalini to\'g\'ri bajardingiz. Birinchi sondan ikkinchisini ayirish kerak.',
      'multiplication': 'Ko\'paytirish amalini to\'g\'ri bajardingiz. Sonlarni ko\'paytmasi to\'g\'ri javob.',
      'division': 'Bo\'lish amalini to\'g\'ri bajardingiz. Birinchi sonni ikkinchisiga bo\'lish kerak.',
      'fraction': 'Kasrni to\'g\'ri aniqladingiz. Qismning qiymatini hisoblash to\'g\'ri.',
      'geometry': 'Geometriya masalasini to\'g\'ri yechdingiz. Shaklning xususiyatlarini bilish kerak.',
      'pattern': 'Naqshni to\'g\'ri aniqladingiz. Ketma-ketlikdagi qonuniyatni topdingiz.',
      'time': 'Vaqtni to\'g\'ri o\'qidingiz. Soat va minutlarni to\'g\'ri hisoblash.',
      'comparison': 'Solishtirishni to\'g\'ri bajardingiz. Sonlarning kattalik yoki kichikligini aniqladingiz.'
    };
    
    // Find matching explanation
    for (const [key, explanation] of Object.entries(explanations)) {
      if (questionType.toLowerCase().includes(key)) {
        return explanation;
      }
    }
    
    return 'To\'g\'ri javob! Hisobingiz to\'g\'ri chiqdi.';
  }
  
  // Generate explanation for wrong answers
  private static getWrongAnswerExplanation(wrongAnswer: string, correctAnswer: string): string {
    const wrongNum = parseFloat(wrongAnswer);
    const correctNum = parseFloat(correctAnswer);
    
    if (!isNaN(wrongNum) && !isNaN(correctNum)) {
      const difference = Math.abs(wrongNum - correctNum);
      
      if (difference === 1) {
        return 'Javobingiz birlikka farq qiladi. Qayta hisoblang.';
      } else if (difference <= 5) {
        return 'Javobingiz yaqin, lekin to\'g\'ri emas. Ehtiyot bo\'ling.';
      } else if (difference <= 10) {
        return 'Javobingizdan uzoqda. Hisoblashni tekshiring.';
      } else {
        return 'Javobingiz noto\'g\'ri. Boshqa usulni sinab ko\'ring.';
      }
    }
    
    return 'Bu javob noto\'g\'ri. Qayta o\'ylab ko\'ring.';
  }
  
  // Shuffle array using Fisher-Yates algorithm
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Generate equation builder variations
  static generateEquationVariations(
    correctAnswer: string,
    questionText: string
  ): AnswerVariation[] {
    const variations: AnswerVariation[] = [];
    
    // Always include the original correct answer
    variations.push({
      text: correctAnswer,
      isCorrect: true,
      explanation: 'Asl tenglama to\'g\'ri'
    });
    
    // Parse the equation
    const parts = correctAnswer.split(',').map(p => p.trim());
    
    if (parts.length === 2) {
      // Simple equation like "5,3" for 5 + 3 = 8
      const [num1, num2] = parts.map(parseFloat);
      
      if (!isNaN(num1) && !isNaN(num2)) {
        // Generate variations with commutative property if applicable
        if (questionText.includes('+') || questionText.includes('×')) {
          const commutativeAnswer = `${num2},${num1}`;
          if (commutativeAnswer !== correctAnswer) {
            variations.push({
              text: commutativeAnswer,
              isCorrect: true,
              explanation: 'Almashtirish xossasi: a + b = b + a'
            });
          }
        }
        
        // Generate close variations
        const variations_num = [
          [num1 + 1, num2],
          [num1 - 1, num2],
          [num1, num2 + 1],
          [num1, num2 - 1]
        ];
        
        variations_num.forEach(([v1, v2]) => {
          if (v1 > 0 && v2 > 0) {
            const wrongAnswer = `${v1},${v2}`;
            if (wrongAnswer !== correctAnswer) {
              variations.push({
                text: wrongAnswer,
                isCorrect: false,
                explanation: 'Bu tenglikni to\'g\'ri qilmaydi. Qayta hisoblang.'
              });
            }
          }
        });
      }
    }
    
    return this.shuffleArray(variations);
  }
  
  // Generate drag and drop variations
  static generateDragDropVariations(
    correctAnswer: string,
    options: string[],
    questionText: string
  ): AnswerVariation[] {
    const variations: AnswerVariation[] = [];
    const correctItems = correctAnswer.split(',').map(i => i.trim());
    
    // 1. Add ALL permutations of the correct items for selection mode
    // (since order shouldn't matter for selection)
    const isSelection = correctItems.length < options.length;
    
    if (isSelection) {
      const perms = this.getPermutations(correctItems);
      perms.forEach(p => {
        variations.push({
          text: p.join(','),
          isCorrect: true,
          explanation: 'To\'g\'ri tanlov!'
        });
      });

      // Generate wrong variations (extra items)
      const extraItems = options.filter(item => !correctItems.includes(item));
      extraItems.forEach(extraItem => {
        const wrongSelection = [...correctItems, extraItem];
        variations.push({
          text: wrongSelection.join(','),
          isCorrect: false,
          explanation: 'Qo\'shimcha element tanladingiz. Faqat to\'g\'ri javoblarni tanlang.'
        });
      });
      
      // Generate wrong variations (missing items)
      correctItems.forEach(missingItem => {
        const wrongSelection = correctItems.filter(item => item !== missingItem);
        if (wrongSelection.length > 0) {
          variations.push({
            text: wrongSelection.join(','),
            isCorrect: false,
            explanation: 'Ba\'zi elementlarni tanlamadingiz. Barcha to\'g\'ri javoblarni tanlang.'
          });
        }
      });
    } else {
      // Ordering question - add the original correct answer
      variations.push({
        text: correctAnswer,
        isCorrect: true,
        explanation: 'To\'g\'ri tartib!'
      });

      // Generate wrong orders by swapping adjacent elements
      for (let i = 0; i < correctItems.length - 1; i++) {
        const wrongOrder = [...correctItems];
        [wrongOrder[i], wrongOrder[i + 1]] = [wrongOrder[i + 1], wrongOrder[i]];
        
        if (wrongOrder.join(',') !== correctAnswer) {
          variations.push({
            text: wrongOrder.join(','),
            isCorrect: false,
            explanation: 'Tartib noto\'g\'ri. Elementlarni to\'g\'ri tartibda joylashtiring.'
          });
        }
      }
    }
    
    return this.shuffleArray(variations);
  }

  // Helper to get permutations
  private static getPermutations<T>(arr: T[]): T[][] {
    if (arr.length <= 1) return [arr];
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      const subPerms = this.getPermutations(rest);
      for (const p of subPerms) {
        result.push([arr[i], ...p]);
      }
    }
    return result;
  }
}

// Utility function to apply variations to questions
export const applyQuestionVariations = (
  questions: any[],
  variationSeed?: string
): any[] => {
  return questions.map(question => {
    const questionType = question.question_type || 'multiple_choice';
    const correctAnswer = question.correct_answer;
    const options = question.options || [];
    const questionText = question.question_text;
    
    let variations: AnswerVariation[] = [];
    
    // Generate variations based on question type
    if (questionType === 'multiple_choice' || questionType === 'type_answer') {
      variations = QuestionVariationGenerator.generateMultipleChoiceVariations(
        correctAnswer,
        questionText,
        question.difficulty
      );
    } else if (questionType === 'equation_builder') {
      variations = QuestionVariationGenerator.generateEquationVariations(
        correctAnswer,
        questionText
      );
    } else if (questionType === 'drag_drop') {
      variations = QuestionVariationGenerator.generateDragDropVariations(
        correctAnswer,
        options,
        questionText
      );
    }
    
    // Apply variations to question
    const updatedQuestion = {
      ...question,
      variations,
      hasVariations: variations.length > 1
    };

    // For multiple choice, override the options with the shuffled variations
    if (questionType === 'multiple_choice' && variations.length > 0) {
      updatedQuestion.options = variations.map(v => v.text);
    }

    return updatedQuestion;
  });
};
