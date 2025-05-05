import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <section className="flex flex-col items-center justify-center py-20 flex-1">
      <div className="container text-center">
        <div className="mx-auto flex max-w-screen-lg flex-col gap-6">
          <h1 className="text-3xl font-extrabold lg:text-6xl">
            A(nother) Task Management App
          </h1>
          <p className="text-balance text-muted-foreground lg:text-lg">
            A task management app that helps you keep track of your tasks and
            get things done. Its simple, easy to use, and free. This is a display of my ability to create a task management app using Next.js, Tailwind CSS, and Firebase.
          </p>
        </div>
        <Link href="/auth/login">
          <Button size="lg" className="mt-10">
            Get Started
          </Button>
        </Link>
      </div>
    </section>
  );
};