export type Card = {
  pt: string;
  en: string;
  example_pt: string;
  example_en: string;
};

export type Deck = {
  id: string;
  title: string;
  description: string;
  cards: Card[];
};

export const starterDecks: Deck[] = [
  {
    id: "basics",
    title: "Portuguese Basics",
    description: "Essential beginner words and phrases.",
    cards: [
      {
        pt: "comer",
        en: "to eat",
        example_pt: "Vou comer agora.",
        example_en: "I am going to eat now.",
      },
      {
        pt: "beber",
        en: "to drink",
        example_pt: "Quero beber água.",
        example_en: "I want to drink water.",
      },
      {
        pt: "casa",
        en: "house",
        example_pt: "Estou em casa.",
        example_en: "I am at home.",
      },
    ],
  },
  {
    id: "travel",
    title: "Travel",
    description: "Useful travel words for Portugal.",
    cards: [
      {
        pt: "comboio",
        en: "train",
        example_pt: "O comboio chega às oito.",
        example_en: "The train arrives at eight.",
      },
      {
        pt: "bilhete",
        en: "ticket",
        example_pt: "Quero comprar um bilhete.",
        example_en: "I want to buy a ticket.",
      },
      {
        pt: "aeroporto",
        en: "airport",
        example_pt: "O aeroporto é longe?",
        example_en: "Is the airport far?",
      },
    ],
  },
  {
    id: "food",
    title: "Food",
    description: "Common food and café vocabulary.",
    cards: [
      {
        pt: "pão",
        en: "bread",
        example_pt: "Quero pão com manteiga.",
        example_en: "I want bread with butter.",
      },
      {
        pt: "água",
        en: "water",
        example_pt: "Pode trazer água, por favor?",
        example_en: "Can you bring water, please?",
      },
      {
        pt: "café",
        en: "coffee",
        example_pt: "Eu bebo café de manhã.",
        example_en: "I drink coffee in the morning.",
      },
    ],
  },
];