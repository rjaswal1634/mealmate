import Feature from "@/app/home-page/features"
import Hero from "@/app/home-page/hero"
<<<<<<< HEAD
=======
// import { SmartFridgeDashboard } from "@/app/user-home/page"
import { useUser } from "@auth0/nextjs-auth0/client"
>>>>>>> 8f07f48043f46a986078e04a03d98704423c53fc
import { Container, Main, Section } from "@/components/craft" // Update this import to the correct path
import Footer from "@/app/home-page/footer"

export default function Page() {
  return (
    <Main className="main-container">
      <Section>
        <Container>
          <Hero />
          <Feature />
          <Footer />
        </Container>
      </Section>
    </Main>
  )
}
