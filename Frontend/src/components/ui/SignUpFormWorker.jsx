import { GalleryVerticalEnd } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { NavLink } from "react-router-dom";

const categories = [
  "Plumber",
  "Electrician",
  "TV",
  "Fridge",
  "AC",
  "Washing-Machine",
  "Laptop",
];

export function SignUpFormWorker({ className, handleSubmit, ...props }) {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleCheckboxChange = (value) => {
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };



  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = {
            fullName: formData.get("fullName"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            address: formData.get("address"),
            password: formData.get("password"),
            yearOfExperience: Number(formData.get("yearOfExperience")),
            workingCategory: selectedCategories,
          };
          handleSubmit(data);
        }}>
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
              Already have an account?{" "} <NavLink to="/worker/login"  className="underline">Login</NavLink>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" type="text" placeholder="" required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="" required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" type="text" placeholder="" required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="Password" placeholder="" required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="yearOfExperience">Year Of Experience</Label>
              <Input
                id="yearOfExperience"
                name="yearOfExperience"
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
                      name="category"
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCheckboxChange(category)}
                    />
                    <label htmlFor={category} className="text-sm ">
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
