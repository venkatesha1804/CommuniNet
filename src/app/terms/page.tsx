import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="font-serif text-3xl font-bold text-maroon mb-2">Terms of Service</h1>
                <p className="text-muted-foreground mb-8">Last Updated: October 2024</p>

                <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gold/10 space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Agreement to Terms</h2>
                        <p>
                            By accessing or using our website, you agree to be bound by these Terms of Service and our Privacy Policy.
                            If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. Community Guidelines</h2>
                        <p className="mb-2">Users must adhere to the following community standards:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Respect all members of the community.</li>
                            <li>Do not post fake or misleading information.</li>
                            <li>Do not use the platform for unauthorized commercial solicitation outside of the Business Directory.</li>
                            <li>Keep political and controversial discussions off the platform.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. User Accounts</h2>
                        <p>
                            You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
                            Only members of the CommuNet community are eligible for full membership access.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Intellectual Property</h2>
                        <p>
                            The service and its original content, features, and functionality are and will remain the exclusive property of CommuNet Community Portal and its licensors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Termination</h2>
                        <p>
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
