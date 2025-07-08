import { GalleryVerticalEnd } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const categories = [
  "plumber",
  "electrician",
  "tv",
  "fridge",
  "ac",
  "washing machine",
  "laptop",
];

export function SignUpFormWorker({ className, ...props }) {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleCheckboxChange = (value) => {
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Selected Categories:", selectedCategories);
    // send selectedCategories to your backend
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to KARIGAR</h1>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" type="text" placeholder="" required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="text" placeholder="" required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="address">Address</Label>
              <Input id="address" type="text" placeholder="" required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="Password" placeholder="" required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="yearOfExperience">Year Of Experience</Label>
              <Input
                id="yearOfExperience"
                type="number"
                placeholder=""
                required
              />
            </div>
            <div className="grid gap-3">
              <Label>Categories you serve</Label>
              <div className="grid gap-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCheckboxChange(category)}
                    />
                    <label htmlFor={category} className="text-sm capitalize">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
