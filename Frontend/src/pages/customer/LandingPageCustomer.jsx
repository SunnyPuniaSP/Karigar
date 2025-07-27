import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import logo from "../../assets/logo2.png";

export default function CustomerLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="absolute top-0 left-6">
        <img src={logo} className="w-40" />
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary">Welcome, Customer</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Hire skilled professionals for your needs
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xs">
        <Button
          variant="secondary"
          size="xl"
          onClick={() => navigate("/customer/login")}
          className="flex-1  text-lg font-semibold py-3 rounded-xl shadow  transition"
        >
          Login
        </Button>

        <Button
          size="xl"
          onClick={() => navigate("/customer/signup")}
          className="flex-1  text-lg font-semibold py-3 rounded-xl shadow transition"
        >
          Signup
        </Button>
      </div>

      <div className="mt-10 text-sm text-muted-foreground text-center">
        <p>✓ Discover local verified experts</p>
        <p>✓ Get real-time updates on jobs</p>
        <p>✓ Safe payments, clear pricing</p>
      </div>
    </div>
  );
}
