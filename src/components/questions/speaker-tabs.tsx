import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SpeakerTab = {
  slug: string;
  name: string;
};

export function SpeakerTabs({
  speakers,
  value,
  onChange,
}: {
  speakers: SpeakerTab[];
  value: string;
  onChange: (slug: string) => void;
}) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList className="grid h-auto w-full grid-cols-3">
        {speakers.map((speaker) => (
          <TabsTrigger
            key={speaker.slug}
            value={speaker.slug}
            className="min-h-11"
          >
            {speaker.name.split(" ")[0]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
