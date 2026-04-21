import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["Common scams here?", "Is it safe at night?", "Best transport from airport?", "Cultural don'ts?"];

export const TripChat = ({ trip }: { trip: any }) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/safewander-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: next,
          context: {
            destination: trip.destination,
            country: trip.country,
            profile: trip.traveller_profile,
            brief_summary: trip.brief?.summary,
          },
        }),
      });

      if (resp.status === 429) { toast.error("Rate limit reached. Try again shortly."); setStreaming(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted."); setStreaming(false); return; }
      if (!resp.ok || !resp.body) { toast.error("Chat failed"); setStreaming(false); return; }

      let assistantSoFar = "";
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":") || !line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf; break;
          }
        }
      }
    } catch (e: any) {
      toast.error(e?.message || "Chat failed");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-[28rem] flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-coral shadow-soft">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </span>
            <p className="text-sm text-muted-foreground">Ask about scams, transport, weather or anything safety-related.</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border bg-background px-2.5 py-1 text-xs hover:bg-primary-soft hover:text-primary transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
              ${m.role === "user" ? "bg-gradient-coral text-primary-foreground" : "bg-muted text-foreground"}`}>
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5">
                  <ReactMarkdown>{m.content || "..."}</ReactMarkdown>
                </div>
              ) : m.content}
            </div>
          </div>
        ))}
        {streaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start"><div className="rounded-2xl bg-muted px-3.5 py-2.5"><Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /></div></div>
        )}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about safety..." disabled={streaming} />
        <Button type="submit" disabled={streaming || !input.trim()} size="icon" className="bg-gradient-coral border-0 shadow-soft">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
