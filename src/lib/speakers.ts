export type Speaker = {
  slug: "maria-corominas" | "paulo-reis" | "samanta";
  time: string;
  name: string;
  role: string;
  title: string;
  order: number;
};

export const speakers: Speaker[] = [
  {
    slug: "maria-corominas",
    time: "10:15",
    name: "Maria Corominas",
    role: "CEO FI Group",
    title: "Título da intervenção",
    order: 0,
  },
  {
    slug: "paulo-reis",
    time: "10:15",
    name: "Paulo Reis",
    role: "Diretor Geral, FI Group Portugal",
    title: "Título da intervenção",
    order: 1,
  },
  {
    slug: "samanta",
    time: "10:15",
    name: "Samanta",
    role: "Intervenção sobre pessoas e colaboradores em Portugal",
    title: "Título da intervenção",
    order: 2,
  },
];

export function getSpeaker(slug: string) {
  return speakers.find((speaker) => speaker.slug === slug);
}
