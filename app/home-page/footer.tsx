import Image from "next/image";
import Link from "next/link";
import Balancer from "react-wrap-balancer";

import { Section, Container } from "../../components/craft";
import Logo from "@/public/logo.svg";

export default function Footer() {
  return (
    <footer className="not-prose border-t">
      <Section>
        <Container className="grid gap-6">
          <div className="grid gap-6">
            <Link href="/">
              <h3 className="sr-only">mealmate.</h3>
              <Image
                src={Logo}
                alt="Logo"
                width={120}
                height={27.27}
                className="transition-all hover:opacity-75 dark:invert"
              ></Image>
            </Link>
            <p>
              <Balancer>
                Smart food management for the modern kitchen. Made during TigerHacks 2024 by:
              </Balancer>
            </p>
            <div className="mb-6 flex flex-col gap-4 text-sm text-muted-foreground underline underline-offset-4 md:mb-0 md:flex-row">
              <Link href="https://www.linkedin.com/in/shibampokhrel/">Shibam Pokhrel</Link>
              <Link href="https://www.linkedin.com/in/prabeen-giri-2a8403203/">Prabeen Giri</Link>
              <Link href="/https://www.linkedin.com/in/rjaswal1634/-policy">Rahul Chaudhari</Link>
            </div>
            <p className="text-muted-foreground">
              ©{" "}
              <a href="https://github.com/rjaswal1634/tiger_hacks.git">Github Repo</a>
              . All rights reserved. 2024-present.
            </p>
          </div>
        </Container>
      </Section>
    </footer>
  );
}
