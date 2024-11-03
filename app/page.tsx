import Feature from "@/app/home-page/features"
import Hero from "@/app/home-page/hero"
// import { SmartFridgeDashboard } from "@/app/user-home/page"
import { useUser } from "@auth0/nextjs-auth0/client"
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
