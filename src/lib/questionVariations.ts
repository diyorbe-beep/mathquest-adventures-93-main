// MathQuest uchun savol javob variantlari generatori
// Bitta javobni yodlashdan oldini olish uchun bir nechta to'g'ri javob variantlarini yaratadi

export interface AnswerVariation {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export class QuestionVariationGenerator {
  // Berilgan savol uchun ko'p tanlov variantlarini yaratish
  static generateMultipleChoiceVariations(
    correctAnswer: string,
    questionType: string,
    difficulty: number = 1
  ): AnswerVariation[] {
    const allVariations: AnswerVariation[] = [];
    
    // Bir nechta to'g'ri javob variantlarini yaratish
    const correctVariations = this.generateCorrectAnswerVariations(correctAnswer, questionType);
    
    // 1. Bu KT uchun 'ASOSIY' to'g'ri javob sifatida BIRTA to'g'ri variantni tasodiy tanlash
    const selectedCorrect = this.shuffleArray(correctVariations)[0];
    
    allVariations.push({
      text: selectedCorrect,
      isCorrect: true,
      explanation: this.getExplanation(correctAnswer, questionType)
    });
    
    // 2. Chalg'ituvchi javoblarni yaratish
    const distractors = this.generateDistractors(correctAnswer, questionType, difficulty);
    
    // Chalg'ituvchilar hech qanday to'g'ri variantlarni o'z ichiga olmasligini ta'minlash
    const filteredDistractors = distractors.filter(d => !correctVariations.includes(d));
    
    // 3. Jami 4 variant bo'lishi uchun 3 tagacha chalg'ituvchi qo'shish
    filteredDistractors.slice(0, 3).forEach(distractor => {
      allVariations.push({
        text: distractor,
        isCorrect: false,
        explanation: this.getWrongAnswerExplanation(distractor, correctAnswer)
      });
    });
    
    // Aralashtirib qaytarish
    return this.shuffleArray(allVariations);
  }
  
  // Bir nechta to'g'ri javob variantlarini yaratish
  private static generateCorrectAnswerVariations(
    correctAnswer: string,
    _questionType: string
  ): string[] {
    // Sodda saqlang: variant sifatida faqat asl to'g'ri javob ko'rsatilishi kerak
    // Agar bu juda aniq holat bo'lmasa.
    return [correctAnswer.trim()];
  }
  
  // Sonning bo'luvchilarini topish
  private static findFactors(n: number): [number, number][] {
    const factors: [number, number][] = [];
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        factors.push([i, n / i]);
      }
    }
    return factors;
  }
  
  // Savol turi va qiyinchilikka asoslangan chalg'ituvchilarni yaratish
  private static generateDistractors(
    correctAnswer: string,
    questionType: string,
    _difficulty: number
  ): string[] {
    const distractors: string[] = [];
    
    // To'g'ri javobni raqam bo'lsa tahlil qilish
    const correctNum = parseFloat(correctAnswer);
    
    if (!isNaN(correctNum)) {
      // Matematik chalg'ituvchilar
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
        'Bilmaysiz',
        'Yuqoridagilarning hech biri',
        'Aniqlab bo\'lmaydi',
        'Ma\'lumot yetarli emas'
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
    
    // Mos keladigan izohni topish
    for (const [key, explanation] of Object.entries(explanations)) {
      if (questionType.toLowerCase().includes(key)) {
        return explanation;
      }
    }
    
    return 'To\'g\'ri javob! Hisobingiz to\'g\'ri chiqdi.';
  }
  
  // Noto'g'ri javoblar uchun izoh yaratish
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
  
  // Fisher-Yates algoritmi yordamida massivni aralashtirish
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Tenglik quruvchi variantlarini yaratish
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
  
  // Tortib va tashlab tashlash variantlarini yaratish
  static generateDragDropVariations(
    correctAnswer: string,
    options: string[],
    _questionText: string
  ): AnswerVariation[] {
    const variations: AnswerVariation[] = [];
    const correctItems = correctAnswer.split(',').map(i => i.trim());
    
    // 1. Tanlash rejimi uchun to'g'ri elementlarning BARCHASI permutatsiyasini qo'shing
    // (tartib muhim emasligi uchun)
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

      // Noto'g'ri variantlarni yaratish (qo'shimcha elementlar)
      const extraItems = options.filter(item => !correctItems.includes(item));
      extraItems.forEach(extraItem => {
        const wrongSelection = [...correctItems, extraItem];
        variations.push({
          text: wrongSelection.join(','),
          isCorrect: false,
          explanation: 'Qo\'shimcha element tanladingiz. Faqat to\'g\'ri javoblarni tanlang.'
        });
      });
      
      // Noto'g'ri variantlarni yaratish (yo'qolgan elementlar)
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
      // Tartiblash savoli - asl to'g'ri javobni qo'shish
      variations.push({
        text: correctAnswer,
        isCorrect: true,
        explanation: 'To\'g\'ri tartib!'
      });

      // Qo'shni elementlarni almashtirib noto'g'ri tartiblar yaratish
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

  // Permutatsiyalarni olish uchun yordamchi funksiya
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

// Savollarga variantlarni qo'llash uchun yordamchi funksiya
export const applyQuestionVariations = (
  questions: any[],
  _variationSeed?: string
): any[] => {
  return questions.map(question => {
    const questionType = question.question_type || 'multiple_choice';
    const correctAnswer = question.correct_answer;
    const options = question.options || [];
    const questionText = question.question_text;
    
    let variations: AnswerVariation[] = [];
    
    // Savol turiga asoslangan variantlarni yaratish
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
    
    // Variantlarni savolga qo'llash
    const updatedQuestion = {
      ...question,
      variations,
      hasVariations: variations.length > 1
    };

    // Ko'p tanlov uchun variantlarni aralashtirib variantlarni almashtirish
    if (questionType === 'multiple_choice' && variations.length > 0) {
      updatedQuestion.options = variations.map(v => v.text);
    }

    return updatedQuestion;
  });
};
