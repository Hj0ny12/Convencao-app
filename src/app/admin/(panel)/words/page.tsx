import { WordCloudLive } from "@/components/words/word-cloud-live";

export default function AdminWordsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Palavras</h1>
      <WordCloudLive showTotal />
    </div>
  );
}
