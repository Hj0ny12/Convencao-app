"use client";

import { useQuery } from "convex/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { useDeviceId } from "@/lib/anonymous-device";
import { QuestionForm } from "@/components/questions/question-form";
import { QuestionList } from "@/components/questions/question-list";
import { SpeakerTabs } from "@/components/questions/speaker-tabs";

const DEFAULT_SLUG = "maria-corominas";

export function QuestionsScreen() {
  const speakers = useQuery(api.speakers.list);
  const deviceId = useDeviceId();
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const requested = params.get("speaker");
  const active =
    speakers?.find((speaker) => speaker.slug === requested)?.slug ??
    DEFAULT_SLUG;
  const questions = useQuery(api.questions.listBySpeaker, {
    speakerSlug: active,
    deviceId: deviceId ?? undefined,
  });

  if (speakers === undefined || questions === undefined) {
    return <p className="pt-4">A carregar…</p>;
  }

  const speaker = speakers.find((item) => item.slug === active) ?? speakers[0];
  if (!speaker) return <p className="pt-4">A carregar…</p>;

  const firstName = speaker.name.split(" ")[0] ?? speaker.name;
  const mine = questions.some((question) => question.isMine);

  function onChange(slug: string) {
    const next = new URLSearchParams(params.toString());
    next.set("speaker", slug);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <SpeakerTabs speakers={speakers} value={speaker.slug} onChange={onChange} />
      {speaker.sessionStatus === "VOTING" ? (
        <p>Esta intervenção já não aceita perguntas. Ainda podes votar.</p>
      ) : null}
      {speaker.sessionStatus === "FINISHED" ? (
        <p>Esta intervenção está encerrada.</p>
      ) : null}
      {speaker.sessionStatus === "OPEN" && mine ? (
        <div className="flex flex-col gap-2">
          <p>Pergunta enviada.</p>
          <p>Agora ajuda a escolher o que deve chegar ao palco.</p>
        </div>
      ) : null}
      {speaker.sessionStatus === "OPEN" && !mine ? (
        <QuestionForm
          speakerName={speaker.name}
          speakerSlug={speaker.slug}
          deviceId={deviceId}
        />
      ) : null}
      {questions.length === 0 && speaker.sessionStatus === "OPEN" ? (
        <QuestionList firstName={firstName} questions={[]} />
      ) : null}
      {questions.length > 0 ? (
        <QuestionList firstName={firstName} questions={questions} />
      ) : null}
    </div>
  );
}
