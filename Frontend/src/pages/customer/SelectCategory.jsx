import React from "react";
import { useNavigate } from "react-router-dom";
import ac from "../../assets/air-conditioner.png";
import electrician from "../../assets/electrical-service.png";
import plumber from "../../assets/faucet.png";
import laptop from "../../assets/laptop.png";
import washingMachine from "../../assets/laundry-machine.png";
import tv from "../../assets/monitor.png";
import fridge from "../../assets/fridge.png";
import carpenter from "../../assets/carpenter.png";

const categories = [
  {
    name: "Electrician",
    image: electrician,
  },
  {
    name: "TV",
    image: tv,
  },
  {
    name: "Fridge",
    image: fridge,
  },
  {
    name: "AC",
    image: ac,
  },
  {
    name: "Washing-Machine",
    image: washingMachine,
  },
  {
    name: "Laptop",
    image: laptop,
  },
  {
    name: "Plumber",
    image: plumber,
  },
  {
    name: "Carpenter",
    image: carpenter,
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
