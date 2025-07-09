import React from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    name: "Electrician",
    image:
      "https://cdn-icons-png.flaticon.com/512/2965/2965567.png",
  },
  {
    name: "TV",
    image:
      "https://cdn-icons-png.flaticon.com/512/3095/3095026.png",
  },
  {
    name: "Fridge",
    image:
      "https://cdn-icons-png.flaticon.com/512/1137/1137067.png",
  },
  {
    name: "AC",
    image:
      "https://cdn-icons-png.flaticon.com/512/1986/1986852.png",
  },
  {
    name: "Washing-Machine",
    image:
      "https://cdn-icons-png.flaticon.com/512/2922/2922553.png",
  },
  {
    name: "Laptop",
    image:
      "https://cdn-icons-png.flaticon.com/512/865/865808.png",
  },
  {
    name: "Plumber",
    image:
      "https://cdn-icons-png.flaticon.com/512/1046/1046842.png",
  },
];

const SelectCategory = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/customer/auth/select-category/${category}/more-info`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
        Select a Service Category
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
        {categories.map(({ name, image }) => (
          <div
            key={name}
            onClick={() => handleCategoryClick(name)}
            className="cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="p-6 flex flex-col items-center justify-center">
              <img
                src={image}
                alt={name}
                className="h-24 w-24 object-contain mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-700">{name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectCategory;
