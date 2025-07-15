import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export default function MainLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="absolute top-6 left-6 text-2xl font-bold text-primary">
        Karigar
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary">Welcome to Karigar</h1>
        <p className="text-lg text-muted-foreground mt-2">Connecting customers with trusted local professionals</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
        <Button
          variant="secondary"
          size="xl"
          onClick={() => navigate("/worker")}
          className="flex-1  text-lg font-semibold py-4 rounded-xl shadow  transition"
        >
          I am a Worker
        </Button>

        <Button
          size="xl"
          onClick={() => navigate("/customer")}
          className="flex-1  text-lg font-semibold py-4 rounded-xl shadow  transition"
        >
          I am a Customer
        </Button>
      </div>

      <div className="mt-10 text-sm text-muted-foreground text-center">
        <p>✓ Simple onboarding for both roles</p>
        <p>✓ Real-time job tracking</p>
        <p>✓ Secure payments & verified services</p>
      </div>
    </div>
  );
}
