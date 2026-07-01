import { Chat } from "@/components/Chat";
import { Workspace } from "@/components/workspace/Workspace";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex h-screen w-full max-w-3xl flex-col bg-white px-16 py-32 dark:bg-black">
        <Workspace />
        <div className="text-field">{}</div>
      </main>
    </div>
  );
}
