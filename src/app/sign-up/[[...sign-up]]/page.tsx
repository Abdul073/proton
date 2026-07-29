import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />
      
      <div className="relative z-10">
        <SignUp appearance={{
          variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#09090b',
          }
        }} />
      </div>
    </div>
  );
}
