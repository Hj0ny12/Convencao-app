import { WordForm } from "@/components/words/word-form";

export default function WordsPage() {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h1 className="text-2xl font-semibold">1 Palavra</h1>
      <WordForm />
    </div>
  );
}