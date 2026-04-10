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
    const variations: AnswerVariation[] = [];
    
    // Always include the correct answer
    variations.push({
      text: correctAnswer,
      isCorrect: true,
      explanation: this.getExplanation(correctAnswer, questionType)
    });
    
    // Generate distractors based on question type
    const distractors = this.generateDistractors(correctAnswer, questionType, difficulty);
    
    // Add distractors
    distractors.forEach(distractor => {
      variations.push({
        text: distractor,
        isCorrect: false,
        explanation: this.getWrongAnswerExplanation(distractor, correctAnswer)
      });
    });
    
    // Shuffle and return
    return this.shuffleArray(variations);
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
    
    // Parse the equation
    const parts = correctAnswer.split(',').map(p => p.trim());
    
    if (parts.length === 2) {
      // Simple equation like "5,3" for 5 + 3 = 8
      const [num1, num2] = parts.map(parseFloat);
      
      if (!isNaN(num1) && !isNaN(num2)) {
        // Generate variations with commutative property if applicable
        if (questionText.includes('+') || questionText.includes('×')) {
          variations.push({
            text: `${num2},${num1}`,
            isCorrect: true,
            explanation: 'Almashtirish xossasi: a + b = b + a'
          });
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
            variations.push({
              text: `${v1},${v2}`,
              isCorrect: false,
              explanation: 'Bu tenglikni to\'g\'ri qilmaydi. Qayta hisoblang.'
            });
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
    
    // Check if it's a selection or ordering question
    const isSelection = correctAnswer.split(',').length < options.length;
    
    if (isSelection) {
      // Selection question - generate different combinations
      const correctItems = correctAnswer.split(',').map(i => i.trim());
      const allItems = [...options];
      
      // Generate variations with one extra item
      const extraItems = allItems.filter(item => !correctItems.includes(item));
      
      extraItems.forEach(extraItem => {
        const wrongSelection = [...correctItems, extraItem];
        variations.push({
          text: wrongSelection.join(','),
          isCorrect: false,
          explanation: 'Qo\'shimcha element tanladingiz. Faqat to\'g\'ri javoblarni tanlang.'
        });
      });
      
      // Generate variations with missing item
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
      // Ordering question - generate different orders
      const correctOrder = correctAnswer.split(',').map(i => i.trim());
      
      // Generate variations by swapping adjacent elements
      for (let i = 0; i < correctOrder.length - 1; i++) {
        const wrongOrder = [...correctOrder];
        [wrongOrder[i], wrongOrder[i + 1]] = [wrongOrder[i + 1], wrongOrder[i]];
        
        variations.push({
          text: wrongOrder.join(','),
          isCorrect: false,
          explanation: 'Tartib noto\'g\'ri. Elementlarni to\'g\'ri tartibda joylashtiring.'
        });
      }
    }
    
    return this.shuffleArray(variations);
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
    return {
      ...question,
      variations,
      hasVariations: variations.length > 1
    };
  });
};
