// React and Next.js
import React from "react";

// Layout Components
import { Section, Container } from "@/components/craft";
import Balancer from "react-wrap-balancer";

// Icons
import { Coins } from "lucide-react";

type FeatureText = {
  icon: JSX.Element;
  title: string;
  description: string;
};

const featureText: FeatureText[] = [
  {
    icon: <Coins className="h-6 w-6" />,
    title: "Smart Food Management",
    description:
      "Effortlessly manage ingredients with our smart fridge scanner, which detects what's available and alerts you when supplies are running low.",
  },
  {
    icon: <Coins className="h-6 w-6" />,
    title: "Personalized Recipes",
    description:
      "Receive recipe ideas tailored to what you have on hand and aligned with your dietary preferences, making every meal enjoyable and nutritious.",
  },
  {
    icon: <Coins className="h-6 w-6" />,
    title: "Timely Meal Reminders",
    description:
      "Plan your meals around your schedule and get reminders to keep you fueled throughout your busy day.",
  },
];

const Feature = () => {
  return (
    <Section className="border-b">
      <Container className="not-prose">
        <div className="flex flex-col gap-6">
          <h3 className="text-4xl">
            <Balancer>
              Features of mealmate.
            </Balancer>
          </h3>

          <div className="mt-6 grid gap-6 md:mt-12 md:grid-cols-3">
            {featureText.map(({ icon, title, description }, index) => (
              <div className="flex flex-col gap-4" key={index}>
                {icon}
                <h4 className="text-xl text-primary">{title}</h4>
                <p className="text-base opacity-75">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Feature;
