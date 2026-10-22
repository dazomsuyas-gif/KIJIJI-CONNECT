export type LearningLevelId = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'NATIVE'

export type LearningLevel = {
  id: LearningLevelId
  name: string
  band: string
  description: string
  goal: string
  objective: string
  phrase: string
  translation: string
  pronunciation: string
  grammar: string
  scenario: string
  answerIndex: number
}

type LearningLanguage = {
  id: string
  name: string
  standard: string
  speechLocale: string
  levels: LearningLevel[]
}

export const learningLevels: Omit<LearningLevel, 'objective' | 'phrase' | 'translation' | 'pronunciation' | 'grammar' | 'scenario' | 'answerIndex'>[] = [
  {
    id: 'A1',
    name: 'Foundation',
    band: 'Level 1 · CEFR A1',
    description: 'Use familiar expressions and introduce yourself.',
    goal: 'Introduce yourself and exchange essential information.',
  },
  {
    id: 'A2',
    name: 'Elementary',
    band: 'Level 2 · CEFR A2',
    description: 'Handle routine everyday exchanges.',
    goal: 'Describe familiar needs, places and daily activities.',
  },
  {
    id: 'B1',
    name: 'Intermediate',
    band: 'Level 3 · CEFR B1',
    description: 'Manage common situations independently.',
    goal: 'Explain experiences and plans in connected language.',
  },
  {
    id: 'B2',
    name: 'Upper intermediate',
    band: 'Level 4 · CEFR B2',
    description: 'Discuss a wide range of topics with confidence.',
    goal: 'Present a clear view and support it with reasons.',
  },
  {
    id: 'C1',
    name: 'Advanced',
    band: 'Level 5 · CEFR C1',
    description: 'Use language flexibly for complex work and study.',
    goal: 'Present nuanced proposals and qualify conclusions.',
  },
  {
    id: 'C2',
    name: 'Proficient',
    band: 'Level 6 · CEFR C2',
    description: 'Understand and express precise, subtle meaning.',
    goal: 'Compare interpretations and express fine distinctions.',
  },
  {
    id: 'NATIVE',
    name: 'Native & beyond',
    band: 'Level 7 · Native extension',
    description: 'Explore register, culture, rhetoric and regional variation.',
    goal: 'Adapt communication to audience, context and regional usage.',
  },
]

const courseContent: Record<string, Omit<LearningLevel, 'id' | 'name' | 'band' | 'description' | 'goal'>[]> = {
  english: [
    { objective: 'Introduce yourself using a greeting and your name.', phrase: 'Hello, my name is Amina.', translation: 'A friendly greeting and self-introduction.', pronunciation: 'heh-LOH, my name iz ah-MEE-nah', grammar: 'Use “my name is + name” to introduce yourself.', scenario: 'Meeting a new classmate or customer.', answerIndex: 1 },
    { objective: 'Ask for a simple detail politely.', phrase: 'Could you tell me where the bus station is?', translation: 'A polite question asking for a familiar place.', pronunciation: 'kud yoo tel mee wair thuh bus stay-shun iz', grammar: 'Use “Could you tell me …?” for a polite request.', scenario: 'Asking for directions in town.', answerIndex: 2 },
    { objective: 'Describe a past experience and future plan.', phrase: 'I visited the market yesterday, and I am going again tomorrow.', translation: 'A past visit followed by a future plan.', pronunciation: 'I viz-it-id thuh mar-kit yes-ter-day', grammar: 'Use a past verb for yesterday and “going to” for a plan.', scenario: 'Sharing plans with a traveller.', answerIndex: 0 },
    { objective: 'Support an opinion with a reason.', phrase: 'The earlier departure is more convenient because it avoids traffic.', translation: 'A preference supported by a practical reason.', pronunciation: 'thuh er-lee-er dee-par-cher iz mor kun-vee-nee-ent', grammar: 'Use “because” to introduce a reason.', scenario: 'Comparing two travel options.', answerIndex: 1 },
    { objective: 'Qualify a recommendation in a formal discussion.', phrase: 'The proposal is promising, provided that delivery dates are confirmed.', translation: 'A qualified positive view with a clear condition.', pronunciation: 'thuh pruh-poh-zul iz prom-uh-sing', grammar: 'Use “provided that” to set a formal condition.', scenario: 'Reviewing a business proposal.', answerIndex: 2 },
    { objective: 'Distinguish a precise concession from a conclusion.', phrase: 'While the estimate is compelling, it should not be mistaken for a confirmed fare.', translation: 'A careful concession followed by a precise warning.', pronunciation: 'wile thee es-tuh-mit iz kum-pel-ing', grammar: 'Use “while” to set up a contrast.', scenario: 'Explaining how to read an indicative price.', answerIndex: 0 },
    { objective: 'Adapt a nuanced expression to audience, register and context.', phrase: 'We can certainly accommodate that preference, subject to the final itinerary.', translation: 'A courteous assurance that remains conditional on confirmation.', pronunciation: 'wee can sir-tin-lee uh-kom-uh-dayt that pref-er-ens', grammar: 'Use “subject to” for a concise formal qualification.', scenario: 'Explaining options without promising unconfirmed services.', answerIndex: 1 },
  ],
  french: [
    { objective: 'Greet someone and introduce yourself.', phrase: 'Bonjour, je m’appelle Amina.', translation: 'Hello, my name is Amina.', pronunciation: 'bohn-zhoor, zhuh mah-pel ah-mee-nah', grammar: 'Use “Je m’appelle + name” to say your name.', scenario: 'Meeting a French-speaking customer.', answerIndex: 2 },
    { objective: 'Make a polite request for familiar information.', phrase: 'Pouvez-vous m’indiquer où se trouve la gare routière ?', translation: 'Could you tell me where the bus station is?', pronunciation: 'poo-vay voo man-dee-kay oo suh troov lah gar roo-tee-air', grammar: '“Pouvez-vous … ?” is a polite question form.', scenario: 'Asking how to reach the bus station.', answerIndex: 0 },
    { objective: 'Describe a past outing and a future plan.', phrase: 'J’ai visité le marché hier et j’y retourne demain.', translation: 'I visited the market yesterday and I am returning tomorrow.', pronunciation: 'zhay vee-zee-tay luh mar-shay ee-air', grammar: 'Use passé composé for a completed visit; “demain” marks the plan.', scenario: 'Telling a visitor about your itinerary.', answerIndex: 1 },
    { objective: 'Explain a preference and provide a reason.', phrase: 'Le départ plus tôt est plus pratique parce qu’il évite les embouteillages.', translation: 'The earlier departure is more convenient because it avoids traffic.', pronunciation: 'luh day-par plew toh ay plew pra-teek', grammar: '“Parce que” introduces a reason.', scenario: 'Comparing departure times.', answerIndex: 2 },
    { objective: 'Make a nuanced professional recommendation.', phrase: 'La proposition est prometteuse, à condition que les dates de livraison soient confirmées.', translation: 'The proposal is promising, provided the delivery dates are confirmed.', pronunciation: 'lah pro-poh-zee-syon ay pro-met-tooz', grammar: '“À condition que” introduces a formal condition.', scenario: 'Reviewing a supplier proposal.', answerIndex: 0 },
    { objective: 'Concede a point while expressing a careful distinction.', phrase: 'Bien que l’estimation soit intéressante, il ne faut pas la confondre avec un tarif confirmé.', translation: 'Although the estimate is appealing, do not confuse it with a confirmed fare.', pronunciation: 'byan kuh les-tee-ma-syon swa an-tay-ray-sant', grammar: '“Bien que” introduces a concession.', scenario: 'Explaining an indicative trip estimate.', answerIndex: 1 },
    { objective: 'Adjust formal language to register, audience and cultural context.', phrase: 'Nous pouvons tout à fait tenir compte de cette préférence, sous réserve de l’itinéraire définitif.', translation: 'We can certainly accommodate that preference, subject to the final itinerary.', pronunciation: 'noo poo-vohn too tah fay tuh-neer kont duh set pray-fay-rans', grammar: '“Sous réserve de” adds a measured formal qualification.', scenario: 'Offering a tailored itinerary without promising unconfirmed services.', answerIndex: 2 },
  ],
  swahili: [
    { objective: 'Greet a person and introduce yourself.', phrase: 'Habari, jina langu ni Amina.', translation: 'Hello, my name is Amina.', pronunciation: 'ha-BA-ri, JI-na LA-ngu ni a-MI-na', grammar: 'Use “jina langu ni + name” to introduce yourself.', scenario: 'Greeting a new customer in Arusha.', answerIndex: 0 },
    { objective: 'Ask politely for familiar information.', phrase: 'Tafadhali, kituo cha basi kiko wapi?', translation: 'Please, where is the bus station?', pronunciation: 'ta-fa-DHA-li, ki-tu-o cha ba-si ki-ko wa-pi', grammar: '“Tafadhali” makes a request polite; “wapi” asks where.', scenario: 'Asking where to board a bus.', answerIndex: 1 },
    { objective: 'Describe a past event and a future plan.', phrase: 'Nilitembelea soko jana, nami nitarudi kesho.', translation: 'I visited the market yesterday, and I will return tomorrow.', pronunciation: 'ni-li-tem-be-le-a so-ko ja-na', grammar: '“Jana” marks the past; “nita-” marks a future action.', scenario: 'Sharing a recent market visit.', answerIndex: 2 },
    { objective: 'State a preference and support it with a reason.', phrase: 'Kuondoka mapema ni bora kwa sababu huepusha foleni.', translation: 'Leaving early is better because it avoids traffic.', pronunciation: 'ku-on-do-ka ma-pe-ma ni bo-ra', grammar: '“Kwa sababu” introduces a reason.', scenario: 'Choosing a departure time with a travel group.', answerIndex: 0 },
    { objective: 'Make a careful professional recommendation with a condition.', phrase: 'Pendekezo linafaa, mradi tarehe za usafirishaji zithibitishwe.', translation: 'The proposal is suitable, provided the delivery dates are confirmed.', pronunciation: 'pen-de-ke-zo li-na-fa-a', grammar: '“Mradi” introduces a condition.', scenario: 'Discussing delivery terms with a supplier.', answerIndex: 1 },
    { objective: 'Acknowledge a point while separating an estimate from a confirmed fare.', phrase: 'Ingawa makadirio yanavutia, hayapaswi kuchukuliwa kuwa nauli iliyothibitishwa.', translation: 'Although the estimate is appealing, it should not be treated as a confirmed fare.', pronunciation: 'in-ga-wa ma-ka-di-ri-o ya-na-vu-ti-a', grammar: '“Ingawa” introduces a concession.', scenario: 'Clarifying that a sample travel price is not a confirmed booking.', answerIndex: 2 },
    { objective: 'Adapt register and culturally aware language to a specific audience.', phrase: 'Tunaweza kuzingatia upendeleo huo, kutegemea ratiba ya mwisho.', translation: 'We can take that preference into account, subject to the final itinerary.', pronunciation: 'tu-na-we-za ku-zi-nga-ti-a u-pen-de-le-o hu-o', grammar: '“Kutegemea” introduces a clear qualification.', scenario: 'Tailoring a trip plan without guaranteeing unverified services.', answerIndex: 0 },
  ],
  mandarin: [
    { objective: 'Greet someone and introduce yourself.', phrase: '你好，我叫阿米娜。', translation: 'Hello, my name is Amina.', pronunciation: 'Nǐ hǎo, wǒ jiào Āmǐnà.', grammar: '“我叫 + name” is a standard way to give your name.', scenario: 'Meeting a Mandarin-speaking guest.', answerIndex: 1 },
    { objective: 'Ask politely for familiar information.', phrase: '请问，汽车站在哪里？', translation: 'Excuse me, where is the bus station?', pronunciation: 'Qǐngwèn, qìchēzhàn zài nǎlǐ?', grammar: '“请问” is a polite way to start a question.', scenario: 'Asking for the bus station.', answerIndex: 2 },
    { objective: 'Describe a past experience and a future plan.', phrase: '我昨天去了市场，明天还会再去。', translation: 'I went to the market yesterday, and I will go again tomorrow.', pronunciation: 'Wǒ zuótiān qù le shìchǎng, míngtiān hái huì zài qù.', grammar: 'Time words such as 昨天 and 明天 help locate events in time.', scenario: 'Sharing your market plans.', answerIndex: 0 },
    { objective: 'Compare options and support a preference with a reason.', phrase: '早点出发更方便，因为可以避开交通拥堵。', translation: 'Leaving earlier is more convenient because you can avoid traffic.', pronunciation: 'Zǎodiǎn chūfā gèng fāngbiàn, yīnwèi kěyǐ bìkāi jiāotōng yōngdǔ.', grammar: '“因为” introduces a reason.', scenario: 'Comparing travel departure times.', answerIndex: 1 },
    { objective: 'Make a nuanced recommendation conditional on confirmation.', phrase: '这个方案很有前景，前提是确认交货日期。', translation: 'The proposal is promising, provided the delivery dates are confirmed.', pronunciation: 'Zhège fāng’àn hěn yǒu qiánjǐng, qiántí shì quèrèn jiāohuò rìqī.', grammar: '“前提是” introduces a necessary condition.', scenario: 'Reviewing a delivery proposal.', answerIndex: 2 },
    { objective: 'Concede one aspect while distinguishing an estimate from a confirmed fare.', phrase: '虽然这个估价很有吸引力，但不应把它当作已确认的票价。', translation: 'Although this estimate is appealing, it should not be treated as a confirmed fare.', pronunciation: 'Suīrán zhège gūjià hěn yǒu xīyǐnlì, dàn bù yīng bǎ tā dàngzuò yǐ quèrèn de piàojià.', grammar: '“虽然…但是…” frames a contrast or concession.', scenario: 'Explaining a sample price without promising availability.', answerIndex: 0 },
    { objective: 'Adapt register and audience, and carefully qualify an assurance.', phrase: '我们可以充分考虑这一偏好，但须以最终行程为准。', translation: 'We can fully consider this preference, subject to the final itinerary.', pronunciation: 'Wǒmen kěyǐ chōngfèn kǎolǜ zhè yī piānhào, dàn xū yǐ zuìzhōng xíngchéng wéi zhǔn.', grammar: '“但须以…为准” makes a formal qualification clear.', scenario: 'Customising a trip plan without guaranteeing unverified services.', answerIndex: 1 },
  ],
}

const stageMisconceptions = [
  'A useful reminder: understanding one phrase alone does not prove mastery of the whole level.',
  'A useful reminder: an unverified sample price is not a confirmed reservation.',
  'A useful reminder: match your register and level of certainty to the situation.',
]

export const languageCourses: LearningLanguage[] = Object.entries(courseContent).map(([id, levels]) => {
  const names: Record<string, { name: string; standard: string; speechLocale: string }> = {
    english: { name: 'English', standard: 'CEFR learning objectives', speechLocale: 'en-GB' },
    french: { name: 'French', standard: 'CEFR learning objectives', speechLocale: 'fr-FR' },
    swahili: { name: 'Kiswahili', standard: 'CEFR-informed practical pathway', speechLocale: 'sw-TZ' },
    mandarin: { name: 'Mandarin Chinese', standard: 'CEFR-informed learning objectives', speechLocale: 'zh-CN' },
  }
  const language = names[id]

  return {
    id,
    ...language,
    levels: levels.map((content, index) => ({
      ...learningLevels[index],
      ...content,
      grammar: `${content.grammar} ${stageMisconceptions[index % stageMisconceptions.length]}`,
    })),
  }
})

export function createLevelAssessment(level: LearningLevel): { prompt: string; options: string[]; answerIndex: number }[] {
  const distractorTranslation = level.grammar.includes('estimate')
    ? 'A confirmed booking with guaranteed availability.'
    : 'A casual phrase for an unrelated situation.'
  const otherObjectives = [
    'Introduce yourself using a basic greeting.',
    'Ask for a routine detail politely.',
    'Compare familiar options and give a reason.',
  ].filter((objective) => objective !== level.objective)
  const answerIndex = level.answerIndex

  const arrange = (correct: string, firstDistractor: string, secondDistractor: string) => {
    const answers = [firstDistractor, secondDistractor]
    answers.splice(answerIndex, 0, correct)
    return { options: answers, answerIndex }
  }

  const phraseQuestion = arrange(
    level.translation,
    distractorTranslation,
    'The phrase has the opposite meaning.',
  )
  const objectiveQuestion = arrange(
    level.objective,
    otherObjectives[0] ?? 'Practise an unrelated skill.',
    otherObjectives[1] ?? 'Memorize a phrase without using it.',
  )
  const contextQuestion = arrange(
    level.scenario,
    'Making an unrelated promise without checking details.',
    'Using the expression without considering the listener.',
  )

  return [
    { prompt: `What is the best meaning of “${level.phrase}”?`, ...phraseQuestion },
    { prompt: 'Which ability does this lesson practise?', ...objectiveQuestion },
    { prompt: 'In which situation would this expression be most useful?', ...contextQuestion },
  ]
}
