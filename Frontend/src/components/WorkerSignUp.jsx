import React from "react";
import { SignUpFormWorker } from "./ui/SignUpFormWorker";
const WorkerSignUp = () => {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpFormWorker/>
      </div>
    </div>
  );
};

export default WorkerSignUp;
