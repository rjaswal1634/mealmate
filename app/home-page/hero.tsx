"use client";
// React and Next.js imports
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Third-party library imports
import Balancer from "react-wrap-balancer";
import { LogOut, User } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";

// Local component imports
import { Section, Container } from "@/components/craft";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/modetoggle"; // Adjust the path as necessary

// Asset imports
import Logo from "/public/logo.svg"; // Updated import for logo

const Hero = () => {
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        // If the user is logged in, redirect to the SmartFridgeDashboard page
        if (user) {
            router.push("/user-home");
        }
    }, [user, router]);

    return (
        <Section>
            <header className="flex justify-between items-center p-4">
                <div className="flex items-center space-x-4">
                    <Image src={Logo} width={200} height={100} alt="Company Logo" className="dark:invert" />
                </div>
                <div className="flex items-center space-x-4">
                    <ModeToggle />
                    
                </div>
            </header>
            <Container className="flex flex-col items-center text-center">
                <h1 className="!mb-0">
                    <Balancer>
                    Meal planning made easy with mealmate.
                    </Balancer>
                </h1>
                <h3 className="text-muted-foreground">
                    <Balancer>
                    mealmate. is here to simplify meal planning and ingredient tracking. Using AI and smart fridge technology, mealmate tailors recipes to what you have at home, helps you avoid waste, and keeps track of dietary restrictions for everyone in your household.
                    </Balancer>
                </h3>
                <div className="not-prose mt-6 flex gap-2 md:mt-12">
                {user ? (
                        <Button variant="ghost" asChild>
                            <a href="/api/auth/logout">
                                <LogOut className="mr-2" />
                                Logout
                            </a>
                        </Button>
                    ) : (
                        <Button  asChild>
                            <a href="/api/auth/login">
                                <User className="mr-2" />
                                Get Started
                            </a>
                        </Button>
                    )}
                </div>
            </Container>
        </Section>
    );
};

export default Hero;
