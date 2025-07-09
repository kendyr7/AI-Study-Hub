import { BrainCircuit } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-semibold text-lg">
      <div className="p-2 bg-primary/20 rounded-lg">
        <BrainCircuit className="h-6 w-6 text-primary" />
      </div>
      <span className="font-headline text-xl">AI Study Hub</span>
    </div>
  );
}
