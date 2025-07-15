import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

export default function WorkerLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="absolute top-6 left-6 text-2xl font-bold text-primary">
        Karigar
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary">Welcome, Worker</h1>
        <p className="text-lg text-muted-foreground mt-2">Find jobs and manage your service requests</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xs">
        <Button
          variant="secondary"
          size="xl"
          onClick={() => navigate("/worker/login")}
          className="flex-1  text-lg font-semibold py-3 rounded-xl shadow  transition"
        >
          Login
        </Button>

        <Button
          size="xl"
          onClick={() => navigate("/worker/signup")}
          className="flex-1  text-lg font-semibold py-3 rounded-xl shadow  transition"
        >
          Signup
        </Button>
      </div>

      <div className="mt-10 text-sm text-muted-foreground text-center">
        <p>✓ Verified customer requests</p>
        <p>✓ Earn through secure wallet system</p>
        <p>✓ Live tracking and quote options</p>
      </div>
    </div>
  );
}
